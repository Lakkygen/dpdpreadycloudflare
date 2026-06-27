import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import pool from '../database/db.js';

const router = Router();

// GET /api/users/profile – own profile
router.get(
  '/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT id, email, full_name, plan, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!rows.length) throw new ApiError(404, 'User not found');
    res.json({ user: rows[0] });
  })
);

// PATCH /api/users/profile – update profile
router.patch(
  '/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { full_name } = req.body;
    if (!full_name) throw new ApiError(400, 'full_name is required');
    const { rows } = await pool.query(
      `UPDATE users SET full_name = $1 WHERE id = $2 RETURNING id, email, full_name, plan`,
      [full_name, req.user.id]
    );
    if (!rows.length) throw new ApiError(404, 'User not found');
    res.json({ user: rows[0] });
  })
);

// GET /api/users/usage – scan count this month
router.get(
  '/usage',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT get_user_monthly_scans($1) AS scans_this_month`,
      [req.user.id]
    );
    res.json({ scansThisMonth: rows[0]?.scans_this_month || 0 });
  })
);

export default router;
