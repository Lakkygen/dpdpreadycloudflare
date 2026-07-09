import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import pool from '../database/db.js';

const router = express.Router();

router.post('/sync', requireAuth, async (req, res, next) => {
  const { id, email, full_name } = req.user;
  if (!id || !email) {
    return res.status(400).json({ error: 'Incomplete user data' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO users (id, email, full_name, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (id) DO UPDATE
       SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, updated_at = NOW()
       RETURNING *`,
      [id, email, full_name || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in local DB' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/profile', requireAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT id, email, full_name, plan, stripe_customer_id, stripe_subscription_id 
     FROM users WHERE id = $1`,
    [req.user.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found in local DB' });
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
