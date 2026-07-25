import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import scanRoutes from './routes/scans.js';
import billingRoutes from './routes/billing.js';
import reportsRoutes from './routes/reports.js';
import usersRoutes from './routes/users.js';
import healthRoutes from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter, scanLimiter, authLimiter } from './middleware/rateLimit.js';
import pool from './database/db.js';

dotenv.config();

const app = express();

// Log startup for debugging
console.log('[STARTUP] NODE_ENV:', process.env.NODE_ENV);
console.log('[STARTUP] PORT:', process.env.PORT || 3000);
console.log('[STARTUP] Has DATABASE_URL:', !!process.env.DATABASE_URL);
console.log('[STARTUP] Has OPENROUTER_API_KEY:', !!process.env.OPENROUTER_API_KEY);

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.VITE_CLIENT_URL,
  'https://dpdpready.onrender.com',
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(compression());
app.use(morgan(':method :url :status :response-time ms'));

// Rate limits
app.use('/api', generalLimiter);
app.use('/api/scans', scanLimiter);
app.use('/api/auth', authLimiter);

// Stripe webhook needs raw body
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

// Regular body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Health & debug routes (no auth)
app.use('/api', healthRoutes);

app.get('/api/test-db', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW() as time, COUNT(*) as user_count FROM users');
    res.json({
      ok: true,
      db_time: rows[0].time,
      users: parseInt(rows[0].user_count),
      message: 'Database connected'
    });
  } catch (err) {
    console.error('[TEST-DB ERROR]', err);
    res.status(500).json({
      ok: false,
      error: err.message,
      hint: 'Did you run the SQL schema?'
    });
  }
});

app.post('/api/test-auth', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found. Please register first.' });
    }
    res.json({
      ok: true,
      user_exists: true,
      email: rows[0].email,
      plan: rows[0].plan
    });
  } catch (err) {
    console.error('[TEST-AUTH ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);

// Static files & SPA fallback
app.use(express.static('dist'));
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'dist' });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`[STARTUP] Server running on port ${PORT}`);
});

const shutdown = () => {
  console.log('[SHUTDOWN] Closing server...');
  server.close(() => {
    pool.end(() => process.exit(0));
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Catch unhandled errors so Render logs show them
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});
