import { SentimentResult } from '../types';
import { SYSTEM_PROMPT } from '../constants';

// ⬇️ PASTE YOUR KEY HERE from https://aistudio.google.com/apikey
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function analyzeNewsText(
  rawText: string,
  sourceWeight: number,
  sourceLabel: string
): Promise<SentimentResult> {

  const fullPrompt = `${SYSTEM_PROMPT}

Analyze this news text. Source weight is ${sourceWeight} (${sourceLabel}):

${rawText}

IMPORTANT: Reply with ONLY the raw JSON object. No markdown. No backticks. No explanation.`;

  let response: Response;
  try {
    response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
        },
      }),
    });
  } catch (networkErr: any) {
    throw new Error(
      'Network error — if running on web, CORS is blocking the request. Run on Android/iOS instead: npx expo start --android'
    );
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!raw) throw new Error('Gemini returned empty response');

  const clean = raw
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  let parsed: any;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error(`JSON parse failed. Gemini returned: ${clean.slice(0, 200)}`);
  }

  // Inject runtime fields
  parsed.meta.source_weight  = sourceWeight;
  parsed.meta.source_label   = sourceLabel;
  parsed.meta.analyzed_at    = new Date().toISOString();
  parsed.meta.weighted_score = Math.max(
    -1, Math.min(1, parsed.sentiment_engine.score * sourceWeight)
  );
  parsed.raw_text = rawText;
  parsed.id       = Date.now().toString();

  return parsed as SentimentResult;
}