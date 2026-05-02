import { COLORS } from '../constants';

export function scoreToColor(score: number) {
  if (score > 0.4)  return COLORS.strongBull;
  if (score > 0.1)  return COLORS.mildBull;
  if (score > -0.1) return COLORS.neutral;
  if (score > -0.4) return COLORS.mildBear;
  return COLORS.strongBear;
}

export function formatScore(score: number): string {
  return score >= 0 ? `+${score.toFixed(2)}` : score.toFixed(2);
}

export function biasLabel(score: number): string {
  if (score > 0.1)  return 'Bullish Bias';
  if (score < -0.1) return 'Bearish Outlook';
  return 'Neutral';
}

export function velocityColor(v: string): string {
  if (v === 'high')   return '#E24B4A';
  if (v === 'medium') return '#EF9F27';
  return '#378ADD';
}

export function confidenceInt(conf: string): number {
  return parseInt(conf.replace('%', ''), 10) || 0;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}