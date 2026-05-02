import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SEED_HEATMAP } from '../../constants';
import { HeatmapCell } from '../../types';
import { scoreToColor, formatScore, biasLabel } from '../../services/utils';
import { useSentimentStore } from '../../hooks/useSentimentStore';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 48) / 3;

export default function HeatmapScreen() {
  const router = useRouter();
  const { results } = useSentimentStore();
  const [refreshing, setRefreshing] = useState(false);

  const heatmap: HeatmapCell[] = [...SEED_HEATMAP];
  results.forEach(r => {
    if (!r.asset_identity.ticker || r.asset_identity.ticker === 'NULL') return;
    const idx = heatmap.findIndex(h => h.ticker === r.asset_identity.ticker);
    if (idx >= 0) heatmap[idx].score = r.sentiment_engine.score;
    else heatmap.unshift({ ticker: r.asset_identity.ticker!, region: r.asset_identity.region, sector: r.asset_identity.sector, score: r.sentiment_engine.score });
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const avgScore = heatmap.reduce((a, c) => a + c.score, 0) / heatmap.length;
  const bulls = heatmap.filter(h => h.score > 0.1).length;
  const bears = heatmap.filter(h => h.score < -0.1).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Global Heatmap</Text>
          <Text style={styles.subtitle}>Live Sentiment Intelligence</Text>
        </View>

        <View style={styles.summaryRow}>
          {[
            { val: formatScore(avgScore), label: 'Avg Score', color: '#1A1917' },
            { val: bulls,  label: 'Bullish', color: '#0F6E56' },
            { val: bears,  label: 'Bearish', color: '#A32D2D' },
            { val: heatmap.length - bulls - bears, label: 'Neutral', color: '#5F5E5A' },
          ].map(item => (
            <View key={item.label} style={styles.summaryCard}>
              <Text style={[styles.summaryVal, { color: item.color }]}>{item.val}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          {heatmap.map((cell, i) => {
            const c = scoreToColor(cell.score);
            return (
              <TouchableOpacity
                key={`${cell.ticker}-${i}`}
                style={[styles.cell, { backgroundColor: c.bg, borderColor: c.border, width: CELL_SIZE, height: CELL_SIZE }]}
                onPress={() => router.push({ pathname: '/asset-detail', params: { ticker: cell.ticker, region: cell.region, sector: cell.sector, score: cell.score.toString() } })}
                activeOpacity={0.75}
              >
                <Text style={[styles.cellTicker, { color: c.text }]}>{cell.ticker}</Text>
                <Text style={[styles.cellScore,  { color: c.text }]}>{formatScore(cell.score)}</Text>
                <Text style={[styles.cellSector, { color: c.text }]} numberOfLines={1}>{cell.sector}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.biasCard}>
          <Text style={styles.biasTitle}>Market Bias</Text>
          <Text style={[styles.biasValue, { color: avgScore > 0.1 ? '#0F6E56' : avgScore < -0.1 ? '#A32D2D' : '#5F5E5A' }]}>
            {biasLabel(avgScore)}
          </Text>
          <Text style={styles.biasDesc}>
            Composite score across {heatmap.length} tracked instruments. {bulls} bullish bias, {bears} bearish outlook.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1917' },
  subtitle: { fontSize: 13, color: '#888780', marginTop: 2 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)',
    padding: 10, alignItems: 'center',
  },
  summaryVal: { fontSize: 18, fontWeight: '700' },
  summaryLabel: { fontSize: 10, color: '#888780', marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  cell: { borderRadius: 12, borderWidth: 0.5, padding: 10, justifyContent: 'center', alignItems: 'center' },
  cellTicker: { fontSize: 13, fontWeight: '700' },
  cellScore:  { fontSize: 16, fontWeight: '600', marginTop: 2 },
  cellSector: { fontSize: 9,  marginTop: 3, opacity: 0.8 },
  biasCard: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)', padding: 16,
  },
  biasTitle: { fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  biasValue: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  biasDesc:  { fontSize: 13, color: '#5F5E5A', lineHeight: 18 },
});