import { SentimentResult } from '../types';
import { SYSTEM_PROMPT } from '../constants';

// ⬇️ REPLACE THIS WITH YOUR KEY from https://aistudio.google.com/apikey
const GEMINI_API_KEY = 'AIzaSyDPJ7rW1w_bNgTeKKZGkTf9M96Mq9JvIEU';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function analyzeNewsText(
  rawText: string,
  sourceWeight: number,
  sourceLabel: string
): Promise<SentimentResult> {
  const prompt = `${SYSTEM_PROMPT}

Analyze this news text. Source weight is ${sourceWeight} (${sourceLabel}):

${rawText}`;

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000,
      }
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();

  // Extract text from Gemini response structure
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const clean = raw.replace(/```json|```/g, '').trim();

  let parsed: any;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error('Failed to parse Gemini response as JSON');
  }

  parsed.meta.source_weight  = sourceWeight;
  parsed.meta.source_label   = sourceLabel;
  parsed.meta.analyzed_at    = new Date().toISOString();
  parsed.meta.weighted_score = Math.max(-1, Math.min(1, parsed.sentiment_engine.score * sourceWeight));
  parsed.raw_text = rawText;
  parsed.id       = Date.now().toString();

  return parsed as SentimentResult;
}