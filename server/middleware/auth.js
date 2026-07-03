import { createClient } from '@supabase/supabase-js';
import pool from '../database/db.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw error;
    req.user = { id: user.id, email: user.email, ...user };
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ✅ Fully implemented checkScanLimit
export async function checkScanLimit(req, res, next) {
  try {
    // Get user's plan
    const userResult = await pool.query(
      'SELECT plan FROM users WHERE id = $1',
      [req.user.id]
    );
    const plan = userResult.rows[0]?.plan || 'free';
    const limits = { free: 10, pro: 100, business: 500, agency: 1000 };
    const limit = limits[plan] || 10;

    // Count scans this month using the database function
    const countResult = await pool.query(
      'SELECT get_user_monthly_scans($1) AS scan_count',
      [req.user.id]
    );
    const count = parseInt(countResult.rows[0]?.scan_count || 0);

    if (count >= limit) {
      return res.status(429).json({
        error: `Monthly scan limit (${limit}) reached. Upgrade your plan for more scans.`
      });
    }
    next();
  } catch (err) {
    next(err);
  }
}
