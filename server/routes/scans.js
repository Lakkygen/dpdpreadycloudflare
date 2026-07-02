import express from 'express';
import { requireAuth, checkScanLimit } from '../middleware/auth.js';
import { calculateScore } from '../../src/utils/scoreCaculator.js'; // note: rename to scoreCalculator if needed
import pool from '../database/db.js';

const router = express.Router();

// All scan routes require authentication
router.use(requireAuth);
router.use(checkScanLimit);

// Start a new scan
router.post('/', async (req, res, next) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    // Your existing logic to scan the URL
    // For demonstration, we'll compute a mock score
    const score = await calculateScore(url);
    // Save to database
    const result = await pool.query(
      'INSERT INTO scans (user_id, url, score, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [req.user.id, url, score]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Get user's scan history
router.get('/', async (req, res, next) => {
  try {
    const results = await pool.query(
      'SELECT * FROM scans WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(results.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
