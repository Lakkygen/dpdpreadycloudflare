import { Router } from 'express';
import { requireAuth, checkScanLimit } from '../middleware/auth.js';
import { scanLimiter } from '../middleware/rateLimit.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import { crawlWebsite, runChecks } from '../services/scanner.js';
import { analyseWithAI } from '../services/aiAnalysis.js';
import pool from '../database/db.js';
import { calculateOverallScore } from '../../src/utils/scoreCalculator.js'; // Note: server imports client util (ok for full‑stack)

const router = Router();

// All scan routes require auth + scan rate limiter
router.use(requireAuth);
router.use(scanLimiter);

// POST /api/scans – start new scan
router.post(
  '/',
  checkScanLimit,   // optional: uncomment when ready
  asyncHandler(async (req, res) => {
    const { url } = req.body;
    if (!url) throw new ApiError(400, 'URL is required');

    // 1. Create scan record (pending)
    const { rows: [scan] } = await pool.query(
      `INSERT INTO scans (user_id, url, status) VALUES ($1, $2, 'pending') RETURNING *`,
      [req.user.id, url]
    );

    // 2. Process scan asynchronously (non‑blocking)
    processScan(scan.id, url).catch(console.error);

    res.status(201).json({ scanId: scan.id, status: 'pending' });
  })
);

// GET /api/scans – scan history
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { rows: scans } = await pool.query(
      `SELECT id, url, status, overall_score, created_at, updated_at
       FROM scans
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const { rows: [{ count }] } = await pool.query(
      `SELECT COUNT(*) FROM scans WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({ scans, total: Number(count), page: Number(page), limit: Number(limit) });
  })
);

// GET /api/scans/:id/status – poll scan progress
router.get(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const { rows: [scan] } = await pool.query(
      `SELECT id, status FROM scans WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!scan) throw new ApiError(404, 'Scan not found');
    // Simple progress mapping
    const progressMap = { pending: 0, crawling: 30, analysing: 70, completed: 100, failed: 100 };
    res.json({ status: scan.status, progress: progressMap[scan.status] || 0 });
  })
);

// GET /api/scans/:id – full scan results
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rows: [scan] } = await pool.query(
      `SELECT * FROM scans WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!scan) throw new ApiError(404, 'Scan not found');
    res.json({ scan });
  })
);

// POST /api/scans/:id/rescan – re‑run scan
router.post(
  '/:id/rescan',
  asyncHandler(async (req, res) => {
    const { rows: [scan] } = await pool.query(
      `SELECT url FROM scans WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!scan) throw new ApiError(404, 'Scan not found');

    // Create a new scan record
    const { rows: [newScan] } = await pool.query(
      `INSERT INTO scans (user_id, url, status) VALUES ($1, $2, 'pending') RETURNING *`,
      [req.user.id, scan.url]
    );
    processScan(newScan.id, scan.url).catch(console.error);
    res.json({ scanId: newScan.id, status: 'pending' });
  })
);

// PATCH /api/scans/:id/monitor – toggle monitoring
router.patch(
  '/:id/monitor',
  asyncHandler(async (req, res) => {
    const { monitoring } = req.body;
    const { rows: [scan] } = await pool.query(
      `UPDATE scans SET monitoring = $1 WHERE id = $2 AND user_id = $3 RETURNING id, monitoring`,
      [Boolean(monitoring), req.params.id, req.user.id]
    );
    if (!scan) throw new ApiError(404, 'Scan not found');
    res.json({ monitoring: scan.monitoring });
  })
);

// DELETE /api/scans/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rowCount } = await pool.query(
      `DELETE FROM scans WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (rowCount === 0) throw new ApiError(404, 'Scan not found');
    res.json({ deleted: true });
  })
);

// ---------------------------------------------------------------
// Background scan processor
// ---------------------------------------------------------------
async function processScan(scanId, url) {
  try {
    // Crawling
    await pool.query(`UPDATE scans SET status = 'crawling' WHERE id = $1`, [scanId]);
    const crawledData = await crawlWebsite(url);

    // Heuristic checks
    const heuristicResults = runChecks(crawledData);

    // Analysing (with AI)
    await pool.query(`UPDATE scans SET status = 'analysing' WHERE id = $1`, [scanId]);
    const aiResult = await analyseWithAI(crawledData, heuristicResults);

    // Merge AI issues with heuristic scores
    const finalChecks = aiResult.issues.map(issue => ({
      checkId: issue.checkId,
      title: issue.title,
      status: issue.status,
      severity: issue.severity,
      description: issue.description || '',
      suggestedFix: issue.suggestedFix || '',
    }));

    const overallScore = aiResult.overallScore;
    const confidence = aiResult.confidence;

    await pool.query(
      `UPDATE scans
       SET status = 'completed',
           overall_score = $1,
           ai_confidence = $2,
           results_json = $3
       WHERE id = $4`,
      [overallScore, confidence, JSON.stringify({ checks: finalChecks, aiAnalysis: aiResult }), scanId]
    );
  } catch (err) {
    console.error(`Scan ${scanId} failed:`, err.message);
    await pool.query(
      `UPDATE scans SET status = 'failed', results_json = $1 WHERE id = $2`,
      [JSON.stringify({ error: err.message }), scanId]
    );
  }
}

export default router;
