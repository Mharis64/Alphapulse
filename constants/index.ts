import { SourceOption, HeatmapCell } from '../types';

export const SOURCE_OPTIONS: SourceOption[] = [
  { label: 'Wall Street Journal', weight: 3.0 },
  { label: 'Financial Times', weight: 2.5 },
  { label: 'Bloomberg / Reuters', weight: 2.0 },
  { label: 'Nikkei / Handelsblatt', weight: 1.5 },
  { label: 'Regional / General Press', weight: 1.0 },
  { label: 'Social / LinkedIn', weight: 0.3 },
];

export const SEED_HEATMAP: HeatmapCell[] = [
  { ticker: 'SPX',    region: 'US',     sector: 'Equity Index',  score: 0.42 },
  { ticker: 'NKY',    region: 'Japan',  sector: 'Equity Index',  score: -0.31 },
  { ticker: 'DAX',    region: 'Europe', sector: 'Equity Index',  score: 0.18 },
  { ticker: 'USDJPY', region: 'Asia',   sector: 'FX',            score: 0.55 },
  { ticker: 'EURUSD', region: 'Europe', sector: 'FX',            score: -0.12 },
  { ticker: 'XAUUSD', region: 'Global', sector: 'Commodity',     score: 0.67 },
  { ticker: 'BRENT',  region: 'Global', sector: 'Commodity',     score: -0.48 },
  { ticker: 'BTC',    region: 'Crypto', sector: 'Digital Asset', score: 0.22 },
  { ticker: 'TNX',    region: 'US',     sector: 'Fixed Income',  score: -0.09 },
  { ticker: 'GBPUSD', region: 'UK',     sector: 'FX',            score: 0.05 },
  { ticker: 'HSI',    region: 'HK',     sector: 'Equity Index',  score: -0.61 },
  { ticker: 'FTSE',   region: 'UK',     sector: 'Equity Index',  score: 0.14 },
];

export const COLORS = {
  strongBull: { bg: '#E1F5EE', text: '#0F6E56', border: '#5DCAA5' },
  mildBull:   { bg: '#EAF3DE', text: '#3B6D11', border: '#97C459' },
  neutral:    { bg: '#F1EFE8', text: '#5F5E5A', border: '#B4B2A9' },
  mildBear:   { bg: '#FAEEDA', text: '#854F0B', border: '#EF9F27' },
  strongBear: { bg: '#FCEBEB', text: '#A32D2D', border: '#F09595' },
};

export const GEMINI_MODEL = 'gemini-2.0-flash';

export const SYSTEM_PROMPT = `You are a Senior Global Macro Strategist and Quantitative Analyst. Analyze the provided news text and output ONLY a valid JSON object — no markdown, no explanation, no backticks.

Use this exact schema:
{
  "asset_identity": {
    "ticker": "string or NULL",
    "region": "string",
    "sector": "string"
  },
  "sentiment_engine": {
    "score": 0.0,
    "velocity": "low or medium or high",
    "confidence": "78%"
  },
  "macro_logic": {
    "summary": "Exactly 2 sentences of technical analysis.",
    "cross_impact": "How this affects related international assets.",
    "red_flags": ["risk one", "risk two", "risk three"]
  },
  "meta": {
    "event_type": "Cyclical or Structural",
    "honesty_check": "One sentence: does the headline match the underlying data?",
    "source_weight": 1.0,
    "source_label": "Source name",
    "weighted_score": 0.0,
    "analyzed_at": "ISO timestamp"
  }
}

Rules:
- score is a float between -1.0 (Bearish) and +1.0 (Bullish)
- NEVER use the words Buy, Sell, or Hold
- ticker must be a real exchange ticker if identifiable, otherwise NULL
- weighted_score = score * source_weight, clamped to [-1.0, 1.0]
- Output ONLY the JSON object. Nothing else.`;