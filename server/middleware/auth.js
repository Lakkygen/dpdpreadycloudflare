import { createClient } from '@supabase/supabase-js';
import pool from '../database/db.js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('[AUTH] URL present?', !!supabaseUrl);
console.log('[AUTH] Key present?', !!supabaseKey);

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function requireAuth(req, res, next) {
  if (!supabase) {
    console.error('[AUTH] Supabase client is null');
    return res.status(503).json({ error: 'Auth service not configured' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    console.error('[AUTH] No Bearer header');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  console.log('[AUTH] Token length:', token?.length);

  let user = null;

  // Method 1: Supabase client
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      console.error('[AUTH] getUser error:', error.message);
    } else {
      user = data.user;
      console.log('[AUTH] getUser success, user ID:', user?.id);
    }
  } catch (err) {
    console.error('[AUTH] getUser threw:', err.message);
  }

  // Method 2: Direct API fallback
  if (!user) {
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': supabaseKey,
        },
      });
      const data = await response.json();
      if (response.ok && data.id) {
        user = data;
        console.log('[AUTH] Direct API success, user ID:', user.id);
      } else {
        console.error('[AUTH] Direct API error:', data);
      }
    } catch (err) {
      console.error('[AUTH] Direct API threw:', err.message);
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = { id: user.id, email: user.email };
  next();
}

export async function checkScanLimit(req, res, next) {
  if (!req.user) return next();

  try {
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
