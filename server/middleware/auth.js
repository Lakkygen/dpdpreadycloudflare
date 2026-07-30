import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import pool from '../database/db.js';

const JWT_SECRET = process.env.JWT_SECRET;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  // 1. Try custom JWT first
  if (JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        plan: decoded.plan || 'free',
      };
      return next();
    } catch {
      // Not a valid JWT — fall through to Supabase
    }
  }

  // 2. Try Supabase
  if (supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const dbResult = await pool.query(
        'SELECT plan FROM users WHERE id = $1',
        [user.id]
      );
      req.user = {
        id: user.id,
        email: user.email,
        plan: dbResult.rows[0]?.plan || 'free',
      };
      return next();
    } catch {
      return res.status(401).json({ error: 'Auth failed' });
    }
  }

  return res.status(401).json({ error: 'Invalid token' });
}

export async function checkScanLimit(req, res, next) {
  if (!req.user) return next();

  try {
    const { rows } = await pool.query(
      'SELECT get_user_monthly_scans($1) AS count',
      [req.user.id]
    );
    const scansUsed = parseInt(rows[0]?.count || 0);
    const scanLimit = { free: 10, pro: 100, business: 500, agency: 1000 }[req.user.plan] || 10;

    if (scansUsed >= scanLimit) {
      return res.status(429).json({ error: 'Monthly scan limit reached' });
    }
    next();
  } catch (err) {
    next(err);
  }
}
