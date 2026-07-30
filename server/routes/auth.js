import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import pool from '../database/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn('[AUTH] JWT_SECRET not set. Custom register/login will fail.');
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, plan: user.plan || 'free' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ─── Register ───
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO users (email, full_name, password_hash, plan, created_at, updated_at)
     VALUES ($1, $2, $3, 'free', NOW(), NOW())
     RETURNING id, email, full_name, plan, created_at`,
    [email, full_name || null, hash]
  );

  const user = result.rows[0];
  const token = signToken(user);
  res.status(201).json({ user, token, message: 'Account created' });
}));

// ─── Login ───
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash || '');
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken(user);
  const { password_hash, ...safeUser } = user;
  res.json({ user: safeUser, token, message: 'Login successful' });
}));

// ─── Supabase Sync (keep for Supabase users) ───
router.post('/sync', requireAuth, asyncHandler(async (req, res) => {
  const { id, email, full_name } = req.user;
  if (!id || !email) {
    return res.status(400).json({ error: 'Incomplete user data' });
  }
  const result = await pool.query(
    `INSERT INTO users (id, email, full_name, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (id) DO UPDATE
     SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, updated_at = NOW()
     RETURNING *`,
    [id, email, full_name || null]
  );
  res.json(result.rows[0]);
}));

// ─── Me ───
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT id, email, full_name, plan, avatar_url, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(result.rows[0]);
}));

// ─── Profile (with limits) ───
router.get('/profile', requireAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT id, email, full_name, plan, stripe_customer_id, stripe_subscription_id
     FROM users WHERE id = $1`,
    [req.user.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = result.rows[0];
  const limits = { free: 10, pro: 100, business: 500, agency: 1000 };
  user.scanLimit = limits[user.plan] || 10;

  const countResult = await pool.query(
    'SELECT get_user_monthly_scans($1) AS scan_count',
    [req.user.id]
  );
  user.scansUsed = parseInt(countResult.rows[0]?.scan_count || 0);
  res.json(user);
}));

export default router;
