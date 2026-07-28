import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const startupLog = [];
let serverReady = false;

// Basic middleware (always works)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Diagnostic endpoint (no imports needed)
app.get('/api/debug', (req, res) => {
  res.json({
    status: serverReady ? 'OK' : 'DEGRADED',
    startupLog,
    env: {
      node_env: process.env.NODE_ENV,
      has_db_url: !!process.env.DATABASE_URL,
      has_openrouter: !!process.env.OPENROUTER_API_KEY,
      port: process.env.PORT || 3000,
    }
  });
});

// Try loading everything else safely
async function init() {
  try {
    // Load DB
    try {
      const { default: pool } = await import('./database/db.js');
      startupLog.push('db: OK');
      
      app.get('/api/test-db', async (req, res) => {
        try {
          const { rows } = await pool.query('SELECT NOW() as time');
          res.json({ ok: true, db_time: rows[0].time });
        } catch (err) {
          res.status(500).json({ ok: false, error: err.message });
        }
      });
    } catch (err) {
      startupLog.push(`db: FAIL - ${err.message}`);
    }

    // Load middleware
    try {
      const { errorHandler } = await import('./middleware/errorHandler.js');
      startupLog.push('errorHandler: OK');
      app.use(errorHandler);
    } catch (err) {
      startupLog.push(`errorHandler: FAIL - ${err.message}`);
    }

    // Load routes one by one
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

    serverReady = true;
  } catch (err) {
    startupLog.push(`init: FAIL - ${err.message}`);
  }

  // Static files (after API routes)
  app.use(express.static('dist'));
  
  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'dist' });
  });
}

// Start server immediately
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
  // Run init after server starts
  init().then(() => {
    console.log('Init complete:', startupLog);
  });
});
