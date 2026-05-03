import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, StatusBar, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchWatchlist, removeFromWatchlist } from '../../services/firebase';
import { WatchlistItem } from '../../types';
import { scoreToColor, formatScore, biasLabel, timeAgo } from '../../services/utils';
import { ScoreBadge, EmptyState } from '../../components/SharedComponents';
import { useSentimentStore } from '../../hooks/useSentimentStore';

export default function WatchlistScreen() {
  const router = useRouter();
  const { results } = useSentimentStore();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadWatchlist() {
    const items = await fetchWatchlist();
    setWatchlist(items);
  }

  useEffect(() => { loadWatchlist(); }, []);

  async function handleRemove(id: string, ticker: string) {
    Alert.alert('Remove', `Remove ${ticker} from watchlist?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        await removeFromWatchlist(id);
        setWatchlist(prev => prev.filter(w => w.id !== id));
      }},
    ]);
  }

  const enriched = watchlist.map(w => {
    const latest = results.find(r => r.asset_identity.ticker === w.ticker);
    return { ...w, score: latest ? latest.sentiment_engine.score : w.score };
  });

  const bulls = enriched.filter(e => e.score > 0.1).length;
  const bears = enriched.filter(e => e.score < -0.1).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadWatchlist(); setRefreshing(false); }} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Watchlist</Text>
          <Text style={styles.subtitle}>Your tracked instruments</Text>
        </View>

        {enriched.length > 0 && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>PORTFOLIO BIAS</Text>
            <View style={styles.summaryRow}>
              {[
                { n: bulls, label: 'Bullish', color: '#0F6E56' },
                { n: enriched.length - bulls - bears, label: 'Neutral', color: '#5F5E5A' },
                { n: bears, label: 'Bearish', color: '#A32D2D' },
              ].map((item, i) => (
                <React.Fragment key={item.label}>
                  {i > 0 && <View style={styles.divider} />}
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNum, { color: item.color }]}>{item.n}</Text>
                    <Text style={styles.summaryLabel}>{item.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {enriched.length === 0
          ? <EmptyState message="No assets tracked yet — analyze news and add from Asset Detail" />
          : enriched.map(item => {
            const c = scoreToColor(item.score);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.item}
                onPress={() => router.push({ pathname: '/asset-detail', params: { ticker: item.ticker, region: item.region, sector: item.sector, score: item.score.toString() } })}
                activeOpacity={0.75}
              >
                <View style={[styles.itemLeft, { borderLeftColor: c.border, borderLeftWidth: 3 }]}>
                  <Text style={styles.itemTicker}>{item.ticker}</Text>
                  <Text style={styles.itemMeta}>{item.sector} · {item.region}</Text>
                  <Text style={styles.itemTime}>Added {timeAgo(item.addedAt)}</Text>
                </View>
                <View style={styles.itemRight}>
                  <ScoreBadge score={item.score} />
                  <Text style={[styles.itemBias, { color: c.text }]}>{biasLabel(item.score)}</Text>
                  <TouchableOpacity onPress={() => handleRemove(item.id, item.ticker)}>
                    <Text style={styles.remove}>✕</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        }
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
  summary: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)', padding: 14, marginBottom: 16 },
  summaryTitle: { fontSize: 10, fontWeight: '600', color: '#888780', letterSpacing: 0.8, marginBottom: 10 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: 24, fontWeight: '700' },
  summaryLabel: { fontSize: 11, color: '#888780', marginTop: 2 },
  divider: { width: 0.5, height: 40, backgroundColor: 'rgba(0,0,0,0.1)' },
  item: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)', padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLeft: { flex: 1, paddingLeft: 10 },
  itemTicker: { fontSize: 17, fontWeight: '700', color: '#1A1917' },
  itemMeta: { fontSize: 12, color: '#888780', marginTop: 2 },
  itemTime: { fontSize: 11, color: '#B4B2A9', marginTop: 4 },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  itemBias: { fontSize: 11, fontWeight: '500', marginTop: 4 },
  remove: { fontSize: 12, color: '#B4B2A9', padding: 4 },
});