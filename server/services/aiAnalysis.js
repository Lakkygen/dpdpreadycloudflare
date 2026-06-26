import axios from 'axios';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Analyse website content with AI and return structured findings.
 * @param {object} crawledData - from scanner.crawlWebsite()
 * @param {array} heuristicResults - optional, from scanner.runChecks()
 * @returns {object} { issues, overallScore, confidence }
 */
export async function analyseWithAI(crawledData, heuristicResults = []) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  const prompt = buildPrompt(crawledData, heuristicResults);

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a privacy compliance expert specialised in the Indian DPDP Act 2023. Analyse the provided website content and return a JSON object with "issues" array and "overallScore" number (0-100). Each issue must have: title, description, severity (critical/warning/info), status (passed/failed), checkId (one of: consentBanner, cookieConsent, dataRetention, thirdPartySharing, privacyPolicy, userRights), and suggestedFix (actionable fix in one sentence). Be concise and factual.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 1500,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 25000,
      }
    );

    const raw = response.data?.choices?.[0]?.message?.content;
    if (!raw) throw new Error('Empty AI response');

    // Extract JSON from the response (it may be wrapped in markdown)
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/({[\s\S]*})/);
    const jsonString = jsonMatch ? jsonMatch[1] : raw;
    const parsed = JSON.parse(jsonString);

    // Validate and normalise
    const issues = Array.isArray(parsed.issues) ? parsed.issues : [];
    const overallScore = typeof parsed.overallScore === 'number' ? parsed.overallScore : 50;

    // Attach confidence
    const confidence = estimateConfidence(issues, crawledData.bodyText.length);

    return { issues, overallScore, confidence };
  } catch (error) {
    console.error('AI analysis failed:', error.message);
    // Fallback to heuristic results if AI fails
    if (heuristicResults.length > 0) {
      const score = calculateSimpleScore(heuristicResults);
      return {
        issues: heuristicResults.map(r => ({
          ...r,
          title: CHECKS.find(c => c.id === r.checkId)?.label || r.checkId,
          description: '',
          suggestedFix: 'Unable to generate AI fix. Review manually.',
        })),
        overallScore: score,
        confidence: 0.5,
      };
    }
    throw error;
  }
}

function buildPrompt(crawledData, heuristicResults) {
  const { url, bodyText, links } = crawledData;
  const snippet = bodyText.slice(0, 4000); // limit tokens
  const policyLinks = links.filter(l => l.text.includes('privacy')).map(l => l.href).join(', ');

  return `Analyse the website "${url}" for compliance with India's Digital Personal Data Protection (DPDP) Act 2023.

Here is a text excerpt from the homepage:
---
${snippet}
---

Relevant privacy links found: ${policyLinks || 'none'}.

Heuristic checks already performed:
${heuristicResults.map(r => `- ${r.checkId}: ${r.status} (score ${r.score})`).join('\n')}

Based on this content, identify any missing or incomplete DPDP requirements and provide an overall compliance score (0-100).`;
}

function estimateConfidence(issues, textLength) {
  // Rough heuristic: more text analysed and more issues found = higher confidence
  const base = textLength > 2000 ? 0.8 : 0.6;
  const issueFactor = Math.min(issues.length / 6, 1);
  return Math.round((base + issueFactor * 0.2) * 100) / 100;
}

function calculateSimpleScore(results) {
  let weightedSum = 0;
  for (const r of results) {
    const weight = CHECKS.find(c => c.id === r.checkId)?.weight || 16;
    weightedSum += (r.score / 100) * weight;
  }
  return Math.round(weightedSum);
}
