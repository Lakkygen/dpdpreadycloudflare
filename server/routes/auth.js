import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import pool from '../database/db.js';

const router = Router();

// GET /api/auth/me – current user profile (synced with DB)
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT id, email, full_name, plan, stripe_customer_id, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: rows[0] });
  })
);

// POST /api/auth/sync – upsert user from Supabase (called after login)
router.post(
  '/sync',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id, email, full_name } = req.user;
    const { rows } = await pool.query(
      `INSERT INTO users (id, email, full_name, plan)
       VALUES ($1, $2, $3, 'free')
       ON CONFLICT (id) DO UPDATE
         SET email = EXCLUDED.email,
             full_name = EXCLUDED.full_name,
             updated_at = now()
       RETURNING *`,
      [id, email, full_name]
    );
    res.json({ user: rows[0] });
  })
);

export default router;
