import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSentimentStore } from '../hooks/useSentimentStore';
import { addToWatchlist } from '../services/firebase';
import { scoreToColor, formatScore, biasLabel, confidenceInt } from '../services/utils';
import { ScoreBadge, VelocityPill, Card } from '../components/SharedComponents';
import { SentimentResult } from '../types';

export default function AssetDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { results } = useSentimentStore();
  const [showJson, setShowJson] = useState(false);
  const [added, setAdded] = useState(false);

  const result: SentimentResult | null =
    params.id
      ? results.find(r => r.id === params.id) || null
      : params.ticker
      ? results.find(r => r.asset_identity.ticker === params.ticker) || {
          id: 'param',
          asset_identity: { ticker: params.ticker as string, region: params.region as string, sector: params.sector as string },
          sentiment_engine: { score: parseFloat(params.score as string || '0'), velocity: 'medium', confidence: '60%' },
          macro_logic: { summary: 'No detailed analysis available. Run the News Analyzer for full insights.', cross_impact: 'Go to News tab to analyze this instrument.', red_flags: [] },
          meta: { event_type: 'Cyclical', honesty_check: 'N/A', source_weight: 1, source_label: 'Heatmap seed', weighted_score: parseFloat(params.score as string || '0'), analyzed_at: new Date().toISOString() },
          raw_text: '',
        }
      : null;

  if (!result) return (
    <View style={styles.center}>
      <Text style={styles.notFound}>Asset not found</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backLink}>← Go back</Text>
      </TouchableOpacity>
    </View>
  );

  const { asset_identity: ai, sentiment_engine: se, macro_logic: ml, meta } = result;
  const c = scoreToColor(se.score);
  const confInt = confidenceInt(se.confidence);

  async function handleAddWatchlist() {
    if (!ai.ticker || ai.ticker === 'NULL') {
      Alert.alert('Cannot add', 'Ticker is NULL — not enough data to track this asset.');
      return;
    }
    try {
      await addToWatchlist({ ticker: ai.ticker, region: ai.region, sector: ai.sector, score: se.score, addedAt: new Date().toISOString() });
      setAdded(true);
      Alert.alert('Added', `${ai.ticker} added to your watchlist.`);
    } catch {
      Alert.alert('Error', 'Could not add to watchlist. Check Firebase config.');
    }
  }

  const bars = Array.from({ length: 12 }, () => Math.max(-1, Math.min(1, se.score + (Math.random() - 0.5) * 0.4)));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Hero card */}
        <View style={[styles.hero, { backgroundColor: c.bg, borderColor: c.border }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.heroTicker, { color: c.text }]}>{ai.ticker || 'NULL'}</Text>
              <Text style={[styles.heroSub, { color: c.text }]}>{ai.sector} · {ai.region}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.heroScore, { color: c.text }]}>{formatScore(se.score)}</Text>
              <Text style={[styles.heroSub, { color: c.text }]}>{biasLabel(se.score)}</Text>
            </View>
          </View>
          <View style={styles.gaugeTrack}>
            <View style={[styles.gaugeFill, { width: `${((se.score + 1) / 2) * 100}%` }]} />
            <View style={[styles.gaugeNeedle, { left: `${((se.score + 1) / 2) * 100}%` as any }]} />
          </View>
          <View style={styles.heroFooter}>
            <VelocityPill velocity={se.velocity} />
            <Text style={[styles.heroSub, { color: c.text }]}>Confidence: {se.confidence}</Text>
          </View>
        </View>

        {/* Sparkline */}
        <Card>
          <Text style={styles.sectionLabel}>SENTIMENT SIMULATION</Text>
          <View style={styles.sparkline}>
            {bars.map((b, i) => {
              const bc = scoreToColor(b);
              return (
                <View key={i} style={styles.sparkCol}>
                  <View style={[styles.sparkBar, { height: Math.abs(b) * 40 + 5, backgroundColor: bc.bg, borderColor: bc.border, borderWidth: 0.5 }]} />
                </View>
              );
            })}
          </View>
          <Text style={styles.sparkNote}>Simulated variance — run fresh analysis for live data</Text>
        </Card>

        {/* Confidence */}
        <Card>
          <Text style={styles.sectionLabel}>ANALYSIS CONFIDENCE</Text>
          <View style={styles.confTrack}>
            <View style={[styles.confFill, { width: `${confInt}%`, backgroundColor: confInt > 70 ? '#0F6E56' : confInt > 40 ? '#EF9F27' : '#E24B4A' }]} />
          </View>
          <Text style={styles.confLabel}>{se.confidence} — {confInt > 70 ? 'High clarity' : confInt > 40 ? 'Moderate clarity' : 'Low clarity — treat with caution'}</Text>
        </Card>

        {/* Summary */}
        <Card>
          <Text style={styles.sectionLabel}>TECHNICAL SUMMARY</Text>
          <Text style={styles.bodyText}>{ml.summary}</Text>
        </Card>

        {/* Cross impact */}
        <Card>
          <Text style={styles.sectionLabel}>CROSS-MARKET IMPACT</Text>
          <Text style={styles.bodyText}>{ml.cross_impact}</Text>
        </Card>

        {/* Red flags */}
        {ml.red_flags.length > 0 && (
          <Card>
            <Text style={styles.sectionLabel}>RED FLAGS</Text>
            {ml.red_flags.map((flag, i) => (
              <View key={i} style={styles.flag}>
                <View style={styles.flagDot} />
                <Text style={styles.bodyText}>{flag}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Meta */}
        <Card>
          <Text style={styles.sectionLabel}>ANALYSIS META</Text>
          {[
            { k: 'Event type',     v: meta.event_type },
            { k: 'Source',         v: meta.source_label },
            { k: 'Source weight',  v: `${meta.source_weight}×` },
            { k: 'Weighted score', v: formatScore(meta.weighted_score) },
            { k: 'Honesty check',  v: meta.honesty_check },
          ].map((row, i) => (
            <View key={row.k} style={[styles.metaRow, i > 0 && styles.borderTop]}>
              <Text style={styles.metaKey}>{row.k}</Text>
              <Text style={styles.metaVal} numberOfLines={2}>{row.v}</Text>
            </View>
          ))}
        </Card>

        {/* JSON */}
        <TouchableOpacity style={styles.jsonToggle} onPress={() => setShowJson(!showJson)}>
          <Text style={styles.jsonToggleText}>{showJson ? 'Hide' : 'Show'} Raw JSON Output</Text>
        </TouchableOpacity>
        {showJson && (
          <View style={styles.jsonBox}>
            <ScrollView horizontal>
              <Text style={styles.jsonText}>{JSON.stringify(result, null, 2)}</Text>
            </ScrollView>
          </View>
        )}

        {/* Watchlist button */}
        <TouchableOpacity
          style={[styles.watchBtn, added && styles.watchBtnAdded]}
          onPress={handleAddWatchlist}
          disabled={added}
        >
          <Text style={styles.watchBtnText}>{added ? '✓ Added to Watchlist' : '+ Add to Watchlist'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  scroll: { padding: 16, paddingBottom: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 16, color: '#888780' },
  backLink: { fontSize: 14, color: '#378ADD', marginTop: 8 },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 14, color: '#888780' },
  hero: { borderRadius: 16, borderWidth: 0.5, padding: 16, marginBottom: 12 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  heroTicker: { fontSize: 28, fontWeight: '800' },
  heroScore: { fontSize: 28, fontWeight: '700' },
  heroSub: { fontSize: 12, marginTop: 2, opacity: 0.8 },
  gaugeTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 4, overflow: 'hidden', position: 'relative', marginBottom: 12 },
  gaugeFill: { height: '100%', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 4 },
  gaugeNeedle: { position: 'absolute', top: -4, width: 4, height: 16, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 2, transform: [{ translateX: -2 }] },
  heroFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLabel: { fontSize: 10, fontWeight: '600', color: '#888780', letterSpacing: 0.8, marginBottom: 8 },
  sparkline: { flexDirection: 'row', alignItems: 'flex-end', height: 50, gap: 3, marginBottom: 6 },
  sparkCol: { flex: 1, height: 50, justifyContent: 'flex-end' },
  sparkBar: { width: '100%', borderRadius: 3 },
  sparkNote: { fontSize: 10, color: '#B4B2A9', textAlign: 'center' },
  confTrack: { height: 8, backgroundColor: '#F1EFE8', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  confFill: { height: '100%', borderRadius: 4 },
  confLabel: { fontSize: 12, color: '#5F5E5A' },
  bodyText: { fontSize: 13, color: '#1A1917', lineHeight: 20, flex: 1 },
  flag: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  flagDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E24B4A', marginTop: 7 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  borderTop: { borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.06)' },
  metaKey: { fontSize: 12, color: '#888780', flex: 1 },
  metaVal: { fontSize: 12, color: '#1A1917', flex: 2, textAlign: 'right' },
  jsonToggle: { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.15)', borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginBottom: 10 },
  jsonToggleText: { fontSize: 13, color: '#888780' },
  jsonBox: { backgroundColor: '#1A1917', borderRadius: 10, padding: 12, marginBottom: 12 },
  jsonText: { fontSize: 11, color: '#5DCAA5', fontFamily: 'monospace', lineHeight: 17 },
  watchBtn: { backgroundColor: '#1A1917', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  watchBtnAdded: { backgroundColor: '#0F6E56' },
  watchBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});