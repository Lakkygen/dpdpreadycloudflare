import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

/**
 * Verify JWT from Authorization header.
 * Attaches decoded payload to req.user.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;   // { id, email, plan, ... }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional auth – does not reject, but attaches user if token valid.
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // ignore
    }
  }
  next();
}

/**
 * Enforce a minimum plan requirement.
 * Usage: requirePlan('pro')
 */
export function requirePlan(...allowedPlans) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedPlans.includes(req.user.plan?.name)) {
      return res.status(403).json({
        error: `This feature requires one of the following plans: ${allowedPlans.join(', ')}`,
      });
    }
    next();
  };
}

/**
 * Enforce scan limit based on user's plan (must be called after requireAuth).
 * This middleware checks the current scan count against the plan limit.
 * It requires a database – we’ll integrate later, but the structure is ready.
 */
export async function checkScanLimit(req, res, next) {
  // Placeholder: implement with DB query.
  // Example:
  // const count = await db.getScanCountThisMonth(req.user.id);
  // const limit = req.user.plan?.scanLimit ?? 0;
  // if (count >= limit) return res.status(403).json({ error: 'Scan limit reached' });
  next();
}
