import { Router } from 'express';
import pool from '../database/db.js';
import { getAIMetrics } from '../services/aiAnalysis.js';

const router = Router();

router.get('/', async (req, res) => {
  const checks = {
    db: false,
    openrouter: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await pool.query('SELECT 1');
    checks.db = true;
  } catch {
    checks.db = false;
  }

  try {
    const orRes = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    });
    checks.openrouter = orRes.ok;
  } catch {
    checks.openrouter = false;
  }

  const healthy = checks.db && checks.openrouter;
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    checks,
  });
});

router.get('/metrics', (req, res) => {
  res.json({
    ai: getAIMetrics(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

export default router;
