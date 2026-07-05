import { CHECKS } from './scanner.js';
import { clampNumber } from '../utils/validators.js';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

function calculateSimpleScore(heuristicResults = []) {
  if (!Array.isArray(heuristicResults) || heuristicResults.length === 0) return 0;

  const weighted = heuristicResults.reduce(
    (acc, result) => {
      const weight = Number(result.weight ?? 0);
      const score =
        typeof result.score === 'number'
          ? clampNumber(result.score, 0, 100)
          : result.passed === false
            ? 0
            : 100;

      acc.totalWeight += weight > 0 ? weight : 1;
      acc.totalPoints += (weight > 0 ? weight : 1) * score;
      return acc;
    },
    { totalWeight: 0, totalPoints: 0 }
  );

  if (!weighted.totalWeight) return 0;
  return Math.round(weighted.totalPoints / weighted.totalWeight);
}

function safeJsonParse(text) {
  if (!text) return null;

  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      try {
        return JSON.parse(cleaned.slice(first, last + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizeAiIssue(issue, heuristicResults) {
  const fallback = heuristicResults.find((entry) => entry.checkId === issue?.checkId);
  const checkMeta = CHECKS.find((check) => check.id === (issue?.checkId || fallback?.checkId));

  return {
    checkId: issue?.checkId || fallback?.checkId || checkMeta?.id || 'unknown',
    title: issue?.title || checkMeta?.label || fallback?.label || 'Compliance finding',
    description:
      issue?.description ||
      issue?.summary ||
      fallback?.details ||
      'Review this area manually.',
    suggestedFix:
      issue?.suggestedFix ||
      issue?.recommendation ||
      fallback?.suggestedFix ||
      'Add clear policy language and visible user controls.',
    passed:
      typeof issue?.passed === 'boolean'
        ? issue.passed
        : typeof fallback?.passed === 'boolean'
          ? fallback.passed
          : undefined,
    severity: issue?.severity || fallback?.severity || 'medium',
    evidence: issue?.evidence || fallback?.evidence || '',
    score:
      typeof issue?.score === 'number'
        ? clampNumber(issue.score, 0, 100)
        : typeof fallback?.score === 'number'
          ? clampNumber(fallback.score, 0, 100)
          : undefined
  };
}

function buildPrompt(crawledData, heuristicResults) {
  const concise = {
    url: crawledData?.url,
    finalUrl: crawledData?.finalUrl,
    title: crawledData?.title,
    bodyText: (crawledData?.bodyText || '').slice(0, 12000),
    metaTags: crawledData?.metaTags || {},
    links: (crawledData?.links || []).slice(0, 30),
    heuristicResults: heuristicResults.map((item) => ({
      checkId: item.checkId,
      label: item.label,
      status: item.status,
      score: item.score,
      severity: item.severity,
      evidence: item.evidence
    }))
  };

  return [
    'You are a privacy compliance analyst reviewing a website for India DPDP readiness.',
    'Return only valid JSON with this shape:',
    '{ "issues": [{ "checkId": "string", "title": "string", "description": "string", "suggestedFix": "string", "passed": true, "severity": "low|medium|high|critical", "evidence": "string", "score": 0 }], "overallScore": 0, "confidence": 0, "summary": "string" }',
    'The score must be 0-100 and confidence must be 0-1.',
    'Use concise, practical language.',
    '',
    JSON.stringify(concise, null, 2)
  ].join('\n');
}

export async function analyseWithAI(crawledData, heuristicResults = []) {
  const heuristicScore = calculateSimpleScore(heuristicResults);

  if (!OPENROUTER_API_KEY) {
    return {
      issues: heuristicResults.map((result) =>
        normalizeAiIssue(
          {
            ...result,
            description: 'AI analysis is not configured. Review this item manually.',
            suggestedFix: 'Configure OPENROUTER_API_KEY to enable full AI review.'
          },
          heuristicResults
        )
      ),
      overallScore: heuristicScore,
      confidence: 0.35,
      summary: 'Heuristic-only analysis because AI is unavailable.'
    };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
        'X-Title': 'DPDPready'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a strict privacy and compliance reviewer. Focus on visible website evidence only.'
          },
          {
            role: 'user',
            content: buildPrompt(crawledData, heuristicResults)
          }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter request failed (${response.status})`);
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content || '';
    const parsed = safeJsonParse(content);

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('AI response was not valid JSON.');
    }

    const issues = Array.isArray(parsed.issues)
      ? parsed.issues.map((issue) => normalizeAiIssue(issue, heuristicResults))
      : heuristicResults.map((issue) => normalizeAiIssue(issue, heuristicResults));

    const scoreFromAi =
      typeof parsed.overallScore === 'number'
        ? clampNumber(parsed.overallScore, 0, 100)
        : heuristicScore;

    const confidence =
      typeof parsed.confidence === 'number'
        ? clampNumber(parsed.confidence, 0, 1)
        : 0.7;

    return {
      issues,
      overallScore: scoreFromAi,
      confidence,
      summary:
        typeof parsed.summary === 'string' && parsed.summary.trim()
          ? parsed.summary.trim()
          : 'AI analysis completed successfully.'
    };
  } catch (error) {
    console.error('AI analysis failed:', error);

    return {
      issues: heuristicResults.map((result) =>
        normalizeAiIssue(
          {
            ...result,
            description: 'AI analysis failed. Using heuristic results instead.',
            suggestedFix: 'Review this area manually and re-run once AI is configured.'
          },
          heuristicResults
        )
      ),
      overallScore: heuristicScore,
      confidence: 0.2,
      summary: 'Fallback heuristic analysis after AI failure.'
    };
  }
}
