import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import pool from '../database/db.js';
import { generatePDF } from '../services/pdfGenerator.js';
import { buildReportData } from '../../src/utils/reportGenerator.js'; // import from shared utils

const router = Router();
router.use(requireAuth);

// POST /api/reports – generate report for a scan
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { scanId } = req.body;
    if (!scanId) throw new ApiError(400, 'scanId required');

    // Verify scan ownership
    const { rows: [scan] } = await pool.query(
      `SELECT id, url, overall_score, results_json FROM scans WHERE id = $1 AND user_id = $2`,
      [scanId, req.user.id]
    );
    if (!scan) throw new ApiError(404, 'Scan not found');
    if (scan.status !== 'completed') throw new ApiError(400, 'Scan not completed yet');

    // Create report record
    const { rows: [report] } = await pool.query(
      `INSERT INTO reports (scan_id, user_id, status) VALUES ($1, $2, 'pending') RETURNING *`,
      [scanId, req.user.id]
    );

    // Generate PDF in background
    generateReportAsync(report.id, scan).catch(console.error);

    res.status(201).json({ reportId: report.id, status: 'pending' });
  })
);

// GET /api/reports – list reports
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { rows: reports } = await pool.query(
      `SELECT r.id, r.scan_id, r.status, r.created_at, s.url
       FROM reports r
       LEFT JOIN scans s ON r.scan_id = s.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const { rows: [{ count }] } = await pool.query(
      `SELECT COUNT(*) FROM reports WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({ reports, total: Number(count), page: Number(page), limit: Number(limit) });
  })
);

// GET /api/reports/:id/status – poll generation status
router.get(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const { rows: [report] } = await pool.query(
      `SELECT id, status FROM reports WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!report) throw new ApiError(404, 'Report not found');
    res.json({ status: report.status });
  })
);

// GET /api/reports/:id/download – download PDF
router.get(
  '/:id/download',
  asyncHandler(async (req, res) => {
    const { rows: [report] } = await pool.query(
      `SELECT id, status, pdf_url, report_data FROM reports WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!report) throw new ApiError(404, 'Report not found');
    if (report.status !== 'ready') throw new ApiError(400, 'Report not ready yet');

    // For simplicity, we re‑generate PDF on demand from stored report_data
    // (Alternatively, store the PDF in blob storage and serve via signed URL)
    if (!report.report_data) throw new ApiError(500, 'Missing report data');

    const pdfBuffer = await generatePDF(report.report_data);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="dpdp-report-${report.scan_id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  })
);

// DELETE /api/reports/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rowCount } = await pool.query(
      `DELETE FROM reports WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (rowCount === 0) throw new ApiError(404, 'Report not found');
    res.json({ deleted: true });
  })
);

// Background PDF generation
async function generateReportAsync(reportId, scan) {
  try {
    await pool.query(`UPDATE reports SET status = 'generating' WHERE id = $1`, [reportId]);

    // Build structured data
    const reportData = buildReportData(scan, scan.url);
    const pdfBuffer = await generatePDF(reportData);

    // In a real app, upload pdfBuffer to cloud storage and save public URL
    // For now, we store the report_data and mark ready (download endpoint re-generates)
    await pool.query(
      `UPDATE reports
       SET status = 'ready', report_data = $1
       WHERE id = $2`,
      [JSON.stringify(reportData), reportId]
    );
  } catch (err) {
    await pool.query(
      `UPDATE reports SET status = 'failed' WHERE id = $1`,
      [reportId]
    );
  }
}

export default router;
