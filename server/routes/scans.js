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

    // FIX: issue.passed (boolean) → status string
    const finalChecks = aiResult.issues.map(issue => ({
      checkId: issue.checkId,
      title: issue.title,
      status: issue.passed ? "passed" : "failed",
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
