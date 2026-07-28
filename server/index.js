import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
let startupErrors = [];
let loadedModules = [];

// Try loading each module and catch failures
async function loadModule(name, importPath) {
  try {
    const mod = await import(importPath);
    loadedModules.push(name);
    return mod;
  } catch (err) {
    startupErrors.push({ module: name, error: err.message, stack: err.stack });
    console.error(`[STARTUP FAIL] ${name}:`, err.message);
    return null;
  }
}

// Load all modules safely
const pool = await loadModule('db', './database/db.js');
const { errorHandler } = await loadModule('errorHandler', './middleware/errorHandler.js') || {};
const rateLimit = await loadModule('rateLimit', './middleware/rateLimit.js') || {};
const authRoutes = await loadModule('auth', './routes/auth.js');
const scanRoutes = await loadModule('scans', './routes/scans.js');
const billingRoutes = await loadModule('billing', './routes/billing.js');
const reportsRoutes = await loadModule('reports', './routes/reports.js');
const usersRoutes = await loadModule('users', './routes/users.js');
const healthRoutes = await loadModule('health', './routes/health.js');

// Basic middleware (always works)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Mount routes that loaded successfully
if (healthRoutes?.default) app.use('/api', healthRoutes.default);
if (authRoutes?.default) app.use('/api/auth', authRoutes.default);
if (scanRoutes?.default) app.use('/api/scans', scanRoutes.default);
if (billingRoutes?.default) app.use('/api/billing', billingRoutes.default);
if (reportsRoutes?.default) app.use('/api/reports', reportsRoutes.default);
if (usersRoutes?.default) app.use('/api/users', usersRoutes.default);

// Test DB route (only if pool loaded)
if (pool?.default) {
  app.get('/api/test-db', async (req, res) => {
    try {
      const { rows } = await pool.default.query('SELECT NOW() as time');
      res.json({ ok: true, db_time: rows[0].time });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });
}

// Diagnostic endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    status: startupErrors.length > 0 ? 'DEGRADED' : 'OK',
    loaded: loadedModules,
    errors: startupErrors.map(e => ({ module: e.module, error: e.error })),
    env: {
      node_env: process.env.NODE_ENV,
      has_db_url: !!process.env.DATABASE_URL,
      has_openrouter: !!process.env.OPENROUTER_API_KEY,
    }
  });
});

// Static files
app.use(express.static('dist'));

// SPA fallback (AFTER API routes)
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'dist' });
});

// Error handler
if (errorHandler) {
  app.use(errorHandler);
} else {
  app.use((err, req, res, next) => {
    console.error('[ERROR]', err);
    res.status(500).json({ error: 'Internal server error' });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[STARTUP] Port ${PORT} | Loaded: ${loadedModules.join(', ') || 'NONE'}`);
  if (startupErrors.length > 0) {
    console.log(`[STARTUP] Failures: ${startupErrors.map(e => e.module).join(', ')}`);
  }
});
