import { createClient } from '@supabase/supabase-js';
import pool from '../database/db.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[AUTH] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function requireAuth(req, res, next) {
  if (!supabase) {
    return res.status(503).json({ error: 'Auth service not configured' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = { id: user.id, email: user.email };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Auth failed' });
  }
}

export async function checkScanLimit(req, res, next) {
  if (!req.user) return next();

  try {
    // Auto-create user in local DB if missing (so FK constraints don't break)
    await pool.query(
      `INSERT INTO users (id, email, plan, created_at, updated_at)
       VALUES ($1, $2, 'free', NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [req.user.id, req.user.email]
    );

    const planResult = await pool.query(
      'SELECT plan FROM users WHERE id = $1',
      [req.user.id]
    );
    const plan = planResult.rows[0]?.plan || 'free';
    const scanLimit = { free: 10, pro: 100, business: 500, agency: 1000 }[plan] || 10;

    const { rows } = await pool.query(
      'SELECT get_user_monthly_scans($1) AS count',
      [req.user.id]
    );
    const scansUsed = parseInt(rows[0]?.count || 0);

    if (scansUsed >= scanLimit) {
      return res.status(429).json({ error: 'Monthly scan limit reached' });
    }
    next();
  } catch (err) {
    next(err);
  }
}
