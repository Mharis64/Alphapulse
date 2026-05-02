import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SOURCE_OPTIONS } from '../../constants';
import { analyzeNewsText } from '../../services/claude';
import { saveSentimentResult } from '../../services/firebase';
import { useSentimentStore } from '../../hooks/useSentimentStore';
import { ScoreBadge, VelocityPill, Card, EmptyState } from '../../components/SharedComponents';
import { timeAgo, formatScore } from '../../services/utils';

export default function NewsScreen() {
  const router = useRouter();
  const { results, addResult } = useSentimentStore();
  const [text, setText] = useState('');
  const [sourceIdx, setSourceIdx] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const selectedSource = SOURCE_OPTIONS[sourceIdx];

  async function handleAnalyze() {
    if (!text.trim()) { Alert.alert('Input required', 'Please paste news text to analyze.'); return; }
    setLoading(true);
    try {
      const result = await analyzeNewsText(text.trim(), selectedSource.weight, selectedSource.label);
      addResult(result);
      await saveSentimentResult(result).catch(() => {});
      setText('');
      Alert.alert('Analysis complete', `Ticker: ${result.asset_identity.ticker || 'NULL'}\nScore: ${formatScore(result.sentiment_engine.score)}`);
    } catch (e: any) {
      Alert.alert('Analysis failed', e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>News Analyzer</Text>
          <Text style={styles.subtitle}>Paste any international news text</Text>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.label}>RAW NEWS TEXT (any language)</Text>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="e.g. ECB signals rate pause amid weakening PMI data..."
            placeholderTextColor="#B4B2A9"
            value={text}
            onChangeText={setText}
            textAlignVertical="top"
          />

          <Text style={[styles.label, { marginTop: 12 }]}>SOURCE CREDIBILITY</Text>
          <TouchableOpacity style={styles.sourcePicker} onPress={() => setShowPicker(!showPicker)}>
            <View>
              <Text style={styles.sourceLabel}>{selectedSource.label}</Text>
              <Text style={styles.sourceWeight}>{selectedSource.weight}× weight multiplier</Text>
            </View>
            <Text style={styles.chevron}>{showPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showPicker && (
            <View style={styles.dropdown}>
              {SOURCE_OPTIONS.map((s, i) => (
                <TouchableOpacity
                  key={s.label}
                  style={[styles.option, i === sourceIdx && styles.optionActive]}
                  onPress={() => { setSourceIdx(i); setShowPicker(false); }}
                >
                  <Text style={[styles.optionLabel, i === sourceIdx && styles.optionLabelActive]}>{s.label}</Text>
                  <Text style={[styles.optionWeight, i === sourceIdx && styles.optionLabelActive]}>{s.weight}×</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleAnalyze} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Analyze with Claude AI ↗</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.feedTitle}>RECENT ANALYSES</Text>
        {results.length === 0
          ? <EmptyState message="No analyses yet — paste news text above" />
          : results.map(r => (
            <Card key={r.id} onPress={() => router.push({ pathname: '/asset-detail', params: { id: r.id } })}>
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.ticker}>{r.asset_identity.ticker || 'NULL'}</Text>
                  <Text style={styles.meta}>{r.asset_identity.sector} · {r.asset_identity.region}</Text>
                </View>
                <ScoreBadge score={r.sentiment_engine.score} />
              </View>
              <Text style={styles.summary} numberOfLines={2}>{r.macro_logic.summary}</Text>
              <View style={styles.footer}>
                <VelocityPill velocity={r.sentiment_engine.velocity} />
                <Text style={styles.time}>{timeAgo(r.meta.analyzed_at)} · {r.meta.source_label}</Text>
              </View>
            </Card>
          ))
        }
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1917' },
  subtitle: { fontSize: 13, color: '#888780', marginTop: 2 },
  inputCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)', padding: 14, marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '600', color: '#888780', letterSpacing: 0.8, marginBottom: 6 },
  textArea: { backgroundColor: '#F8F7F4', borderRadius: 10, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)', padding: 10, fontSize: 13, color: '#1A1917', minHeight: 100 },
  sourcePicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8F7F4', borderRadius: 10, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)', padding: 10 },
  sourceLabel: { fontSize: 13, fontWeight: '600', color: '#1A1917' },
  sourceWeight: { fontSize: 11, color: '#888780', marginTop: 2 },
  chevron: { fontSize: 12, color: '#888780' },
  dropdown: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)', marginTop: 4, overflow: 'hidden' },
  option: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  optionActive: { backgroundColor: '#EAF3DE' },
  optionLabel: { fontSize: 13, color: '#1A1917' },
  optionLabelActive: { color: '#3B6D11', fontWeight: '600' },
  optionWeight: { fontSize: 13, color: '#888780' },
  btn: { backgroundColor: '#1A1917', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 12 },
  btnDisabled: { backgroundColor: '#B4B2A9' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  feedTitle: { fontSize: 10, fontWeight: '600', color: '#888780', letterSpacing: 0.8, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  ticker: { fontSize: 16, fontWeight: '700', color: '#1A1917' },
  meta: { fontSize: 11, color: '#888780', marginTop: 2 },
  summary: { fontSize: 12, color: '#5F5E5A', lineHeight: 17, marginBottom: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { fontSize: 11, color: '#B4B2A9' },
});