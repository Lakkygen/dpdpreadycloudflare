
import pool from '../database/db.js';
import { crawlWebsite, runChecks } from '../services/scanner.js';
import { analyseWithAI } from '../services/aiAnalysis.js';
import { ApiError } from '../middleware/errorHandler.js';

export async function createScan(req, res) {
  const { url } = req.body;
  if (!url) throw new ApiError(400, 'URL is required');

  const { rows: [scan] } = await pool.query(
    `INSERT INTO scans (user_id, url, status) VALUES ($1, $2, 'pending') RETURNING *`,
    [req.user.id, url]
  );

  // Fire and forget (in production, use a job queue)
  processScan(scan.id, url).catch(console.error);

  res.status(201).json({ scanId: scan.id, status: 'pending' });
}

// ... (other controller methods similar to what was in routes)
// I'll spare the repetition – the routes already contain the logic.
