import { CHECKS } from './scanner.js'; // ✅ added import

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Helper to compute a simple score from heuristic results
function calculateSimpleScore(heuristicResults) {
  const passed = heuristicResults.filter(h => h.passed).length;
  const total = heuristicResults.length || 1;
  return Math.round((passed / total) * 100);
}

export async function analyseWithAI(crawledData, heuristicResults = []) {
  // If no API key, fallback to heuristic-only
  if (!OPENROUTER_API_KEY) {
    console.warn('⚠️ OpenRouter API key not configured. Using heuristic results only.');
    const score = calculateSimpleScore(heuristicResults);
    return {
      issues: heuristicResults.map(r => ({
        ...r,
        title: CHECKS.find(c => c.id === r.checkId)?.label || r.checkId,
        description: 'AI analysis unavailable; review manually.',
        suggestedFix: 'Manual review required.'
      })),
      overallScore: score,
      confidence: 0.3,
    };
  }

  // Otherwise, call OpenRouter API
  // (keep your existing implementation here – the following is a placeholder)
  try {
    // ... your existing code that uses OPENROUTER_API_KEY ...
    // Example: fetch from OpenRouter, parse response, and return structured result
    // Must return an object with: { issues, overallScore, confidence }
    // Placeholder:
    return {
      issues: [],
      overallScore: 50,
      confidence: 0.8,
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    // Fallback to heuristic-only on error
    const score = calculateSimpleScore(heuristicResults);
    return {
      issues: heuristicResults.map(r => ({
        ...r,
        title: CHECKS.find(c => c.id === r.checkId)?.label || r.checkId,
        description: 'AI analysis failed; using heuristic results.',
        suggestedFix: 'Review manually.'
      })),
      overallScore: score,
      confidence: 0.2,
    };
  }
}
