export interface AssetIdentity {
  ticker: string | null;
  region: string;
  sector: string;
}

export interface SentimentEngine {
  score: number;
  velocity: 'low' | 'medium' | 'high';
  confidence: string;
}

export interface MacroLogic {
  summary: string;
  cross_impact: string;
  red_flags: string[];
}

export interface AnalysisMeta {
  event_type: 'Cyclical' | 'Structural';
  honesty_check: string;
  source_weight: number;
  source_label: string;
  weighted_score: number;
  analyzed_at: string;
}

export interface SentimentResult {
  id: string;
  asset_identity: AssetIdentity;
  sentiment_engine: SentimentEngine;
  macro_logic: MacroLogic;
  meta: AnalysisMeta;
  raw_text: string;
}

export interface WatchlistItem {
  id: string;
  ticker: string;
  region: string;
  sector: string;
  score: number;
  addedAt: string;
}

export interface SourceOption {
  label: string;
  weight: number;
}

export interface HeatmapCell {
  ticker: string;
  region: string;
  sector: string;
  score: number;
}