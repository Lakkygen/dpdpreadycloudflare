import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import pool from '../database/db.js';
import { generatePDF } from '../services/pdfGenerator.js';
import { buildReportData } from '../services/reportGenerator.js';

const router = Router();
router.use(requireAuth);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { scanId } = req.body;
    if (!scanId) throw new ApiError(400, 'scanId required');

    const { rows: [scan] } = await pool.query(
      `SELECT id, url, overall_score, status, results_json, created_at 
       FROM scans WHERE id = $1 AND user_id = $2`,
      [scanId, req.user.id]
    );
    if (!scan) throw new ApiError(404, 'Scan not found');
    if (scan.status !== 'completed') throw new ApiError(400, 'Scan not completed yet');

    const { rows: [report] } = await pool.query(
      `INSERT INTO reports (scan_id, user_id, status) VALUES ($1, $2, 'pending') RETURNING id`,
      [scanId, req.user.id]
    );

    const reportData = buildReportData(scan);
    const pdfBuffer = await generatePDF(reportData);
    const pdfBase64 = pdfBuffer.toString('base64');

    await pool.query(
      `UPDATE reports SET status = 'ready', report_data = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify({ ...reportData, pdfBase64 }), report.id]
    );

    res.json({ reportId: report.id, status: 'ready' });
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT r.id, r.scan_id, r.status, r.created_at, s.url, s.overall_score
       FROM reports r
       JOIN scans s ON r.scan_id = s.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json({ reports: rows });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT r.*, s.url, s.overall_score, s.results_json
       FROM reports r
       JOIN scans s ON r.scan_id = s.id
       WHERE r.id = $1 AND r.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) throw new ApiError(404, 'Report not found');
    res.json({ report: rows[0] });
  })
);

router.get(
  '/:id/download',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      'SELECT report_data FROM reports WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!rows.length) throw new ApiError(404, 'Report not found');

    const reportData = JSON.parse(rows[0].report_data || '{}');
    if (!reportData.pdfBase64) throw new ApiError(404, 'PDF not available');

    const pdfBuffer = Buffer.from(reportData.pdfBase64, 'base64');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="dpdp-report-${req.params.id}.pdf"`);
    res.send(pdfBuffer);
  })
);

export default router;
