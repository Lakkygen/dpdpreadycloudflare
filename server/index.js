import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
let startupError = null;
let loadedRoutes = [];

try {
  const pool = (await import('./database/db.js')).default;
  loadedRoutes.push('db');

  const authRoutes = (await import('./routes/auth.js')).default;
  loadedRoutes.push('auth');

  const scanRoutes = (await import('./routes/scans.js')).default;
  loadedRoutes.push('scans');

  const billingRoutes = (await import('./routes/billing.js')).default;
  loadedRoutes.push('billing');

  const reportsRoutes = (await import('./routes/reports.js')).default;
  loadedRoutes.push('reports');

  const usersRoutes = (await import('./routes/users.js')).default;
  loadedRoutes.push('users');

  const healthRoutes = (await import('./routes/health.js')).default;
  loadedRoutes.push('health');

  const { errorHandler } = await import('./middleware/errorHandler.js');
  loadedRoutes.push('errorHandler');

  const { generalLimiter, scanLimiter, authLimiter } = await import('./middleware/rateLimit.js');
  loadedRoutes.push('rateLimit');

  const helmet = (await import('helmet')).default;
  const compression = (await import('compression')).default;
  const morgan = (await import('morgan')).default;
  const cors = (await import('cors')).default;

  const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.VITE_CLIENT_URL,
    'https://dpdpready.onrender.com',
    'http://localhost:5173',
    'http://localhost:4173',
  ].filter(Boolean);

  app.use(cors({ origin: (o, cb) => { if (!o || allowedOrigins.includes(o)) return cb(null, true); cb(new Error('CORS')); }, credentials: true }));
  app.use(helmet());
  app.use(compression());
  app.use(morgan('tiny'));

  app.use('/api', generalLimiter);
  app.use('/api/scans', scanLimiter);
  app.use('/api/auth', authLimiter);

  app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
  app.use(express.json({ limit: '2mb' }));

  app.use('/api', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/scans', scanRoutes);
  app.use('/api/billing', billingRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/users', usersRoutes);

  app.get('/api/test-db', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT NOW() as time');
      res.json({ ok: true, db_time: rows[0].time });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.use(express.static('dist'));
  app.get('*', (req, res) => res.sendFile('index.html', { root: 'dist' }));
  app.use(errorHandler);

} catch (err) {
  startupError = err;
  console.error('🔥 STARTUP CRASH:', err.message, err.stack);
}

// DEBUG ROUTE — shows exactly what crashed
app.get('/api/debug', (req, res) => {
  res.json({
    status: startupError ? 'CRASHED' : 'OK',
    loaded: loadedRoutes,
    error: startupError ? {
      message: startupError.message,
      stack: startupError.stack,
    } : null,
    env: {
      node_env: process.env.NODE_ENV,
      has_db_url: !!process.env.DATABASE_URL,
      has_openrouter_key: !!process.env.OPENROUTER_API_KEY,
    }
  });
});

// If crashed, all other API routes show the error
if (startupError) {
  app.use('/api/*', (req, res) => {
    res.status(503).json({
      error: 'Server crashed during startup',
      detail: startupError.message,
      loaded: loadedRoutes,
    });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Port ${PORT} | Status: ${startupError ? 'CRASHED' : 'OK'}`));
