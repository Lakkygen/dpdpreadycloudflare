import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// CRASH CATCHER: Wrap everything in try/catch to expose the real error
let startupError = null;
try {
  const helmet = await import('helmet').catch(() => null);
  const compression = await import('compression').catch(() => null);
  const morgan = await import('morgan').catch(() => null);
  
  if (helmet?.default) app.use(helmet.default());
  if (compression?.default) app.use(compression.default());
  if (morgan?.default) app.use(morgan.default(':method :url :status :response-time ms'));

  const { default: pool } = await import('./database/db.js').catch(e => { throw new Error('DB import failed: ' + e.message); });
  
  const { default: healthRoutes } = await import('./routes/health.js').catch(e => { throw new Error('Health route import failed: ' + e.message); });
  const { default: authRoutes } = await import('./routes/auth.js').catch(e => { throw new Error('Auth route import failed: ' + e.message); });
  const { default: scanRoutes } = await import('./routes/scans.js').catch(e => { throw new Error('Scan route import failed: ' + e.message); });
  const { default: billingRoutes } = await import('./routes/billing.js').catch(e => { throw new Error('Billing route import failed: ' + e.message); });
  const { default: reportsRoutes } = await import('./routes/reports.js').catch(e => { throw new Error('Reports route import failed: ' + e.message); });
  const { default: usersRoutes } = await import('./routes/users.js').catch(e => { throw new Error('Users route import failed: ' + e.message); });
  const { errorHandler } = await import('./middleware/errorHandler.js').catch(e => { throw new Error('ErrorHandler import failed: ' + e.message); });
  const { generalLimiter, scanLimiter, authLimiter } = await import('./middleware/rateLimit.js').catch(e => { throw new Error('RateLimit import failed: ' + e.message); });

  const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.VITE_CLIENT_URL,
    'https://dpdpready.onrender.com',
    'https://dpdpready.onrender.com',
    'http://localhost:5173',
    'http://localhost:4173',
  ].filter(Boolean);

  app.use(cors({ origin: (origin, callback) => { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); callback(new Error('Not allowed by CORS')); }, credentials: true }));

  app.use('/api', generalLimiter);
  app.use('/api/scans', scanLimiter);
  app.use('/api/auth', authLimiter);

  app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/scans', scanRoutes);
  app.use('/api/billing', billingRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/users', usersRoutes);

  app.use(express.static('dist'));
  app.get('*', (req, res) => res.sendFile('index.html', { root: 'dist' }));
  app.use(errorHandler);

} catch (err) {
  startupError = err;
  console.error('🔥 STARTUP CRASH:', err);
}

// If startup failed, expose the error on EVERY route so you can see it
if (startupError) {
  app.use('*', (req, res) => {
    res.status(503).json({
      error: 'Server startup failed',
      detail: startupError.message,
      stack: process.env.NODE_ENV !== 'production' ? startupError.stack : undefined
    });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  if (startupError) {
    console.log(`Server running on port ${PORT} but in DEGRADED mode`);
  } else {
    console.log(`Server running on port ${PORT}`);
  }
});
