import express from 'express';
import { requireAuth, checkScanLimit } from '../middleware/auth.js';
import { performScan } from '../services/scanner.js';
import { calculateScore } from '../services/scoreCalculator.js';
import pool from '../database/db.js';

const router = express.Router();

router.use(requireAuth);
router.use(checkScanLimit);

router.post('/', async (req, res, next) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    const scanResult = await performScan(url);

    const result = await pool.query(
      `INSERT INTO scans (user_id, url, overall_score, status, results_json, created_at)
       VALUES ($1, $2, $3, 'completed', $4, NOW())
       RETURNING *`,
      [req.user.id, url, scanResult.overallScore, JSON.stringify(scanResult)]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

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

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM scans WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
