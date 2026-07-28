import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const startupLog = [];
let serverReady = false;

// Basic middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Diagnostic endpoint (always works)
app.get('/api/debug', (req, res) => {
  res.json({
    status: serverReady ? 'OK' : 'DEGRADED',
    startupLog,
    time: new Date().toISOString(),
    env: {
      node_env: process.env.NODE_ENV,
      has_db_url: !!process.env.DATABASE_URL,
      has_openrouter: !!process.env.OPENROUTER_API_KEY,
      port: process.env.PORT || 3000,
    }
  });
});

// Test DB endpoint (manual, no imports)
app.get('/api/test-db-manual', async (req, res) => {
  try {
    const { default: pool } = await import('./database/db.js');
    const { rows } = await pool.query('SELECT NOW() as time');
    res.json({ ok: true, db_time: rows[0].time });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Load everything else safely
async function init() {
  const routes = [
    { name: 'health', path: './routes/health.js', mount: '/api' },
    { name: 'auth', path: './routes/auth.js', mount: '/api/auth' },
    { name: 'scans', path: './routes/scans.js', mount: '/api/scans' },
    { name: 'billing', path: './routes/billing.js', mount: '/api/billing' },
    { name: 'reports', path: './routes/reports.js', mount: '/api/reports' },
    { name: 'users', path: './routes/users.js', mount: '/api/users' },
  ];

  for (const route of routes) {
    try {
      const mod = await import(route.path);
      if (mod.default) {
        app.use(route.mount, mod.default);
        startupLog.push(`${route.name}: OK`);
      } else {
        startupLog.push(`${route.name}: FAIL - no default export`);
      }
    } catch (err) {
      startupLog.push(`${route.name}: FAIL - ${err.message}`);
    }
  }

  // Error handler
  try {
    const { errorHandler } = await import('./middleware/errorHandler.js');
    app.use(errorHandler);
    startupLog.push('errorHandler: OK');
  } catch (err) {
    startupLog.push(`errorHandler: FAIL - ${err.message}`);
    app.use((err, req, res, next) => {
      console.error('[ERROR]', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  serverReady = true;

  // Static files (AFTER all API routes)
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'dist' });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[STARTUP] Server on port ${PORT}`);
  init().then(() => {
    console.log('[STARTUP] Init complete:', startupLog);
  }).catch(err => {
    console.error('[STARTUP] Init failed:', err);
  });
});
