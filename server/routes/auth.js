import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import pool from '../database/db.js';

const router = express.Router();

// Sync user data from Supabase to your public.users table
router.post('/sync', requireAuth, async (req, res, next) => {
  const { id, email, full_name } = req.user;
  if (!id || !email) {
    return res.status(400).json({ error: 'Incomplete user data' });
  }
  try {
    // Upsert user
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

// Get current user profile
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

export default router;
