import { CHECKS } from './scanner.js';

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

  // Actual OpenRouter API call
  try {
    // 1. Build a prompt from crawled data and heuristic results
    // 2. Call OpenRouter API (e.g., using fetch)
    // 3. Parse the response into the required structure
    // The response must return an object with:
    //   issues: [ { checkId, title, description, suggestedFix, passed?, ... } ]
    //   overallScore: number (0-100)
    //   confidence: number (0-1)

    // Placeholder – replace with your actual implementation
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a privacy compliance expert.' },
          { role: 'user', content: `Analyze this website for DPDP compliance: ${JSON.stringify(crawledData)}` }
        ],
      }),
    });
    const data = await response.json();
    // ... parse data and format as issues array, compute score, etc.
    // For now, return a mock result
    return {
      issues: [],
      overallScore: 70,
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
