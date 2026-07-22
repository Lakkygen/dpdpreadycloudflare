import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import scanRoutes from './routes/scans.js';
import billingRoutes from './routes/billing.js';
import reportsRoutes from './routes/reports.js';
import usersRoutes from './routes/users.js';
import healthRoutes from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

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
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, true); // Allow all origins for now
    },
    credentials: true,
  })
);

// Webhook route MUST be BEFORE express.json() - Stripe needs raw body
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

// Regular body parsing for all other routes
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check (no auth required)
app.use('/api', healthRoutes);

// DIAGNOSTIC: Test database connection
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
    res.status(500).json({ 
      ok: false, 
      error: err.message,
      hint: 'Did you run the SQL schema?'
    });
  }
});

// DIAGNOSTIC: Test auth endpoint (no login required)
app.post('/api/test-auth', async (req, res) => {
  try {
    console.log('TEST-AUTH hit:', req.body);
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Try to find user
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('TEST-AUTH user found:', rows.length > 0);
    
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
    console.error('TEST-AUTH error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);

// Serve static files from dist/
app.use(express.static('dist'));

// SPA fallback: serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'dist' });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
