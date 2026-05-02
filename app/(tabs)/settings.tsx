import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, StatusBar, Linking, Platform,
} from 'react-native';
import { SOURCE_OPTIONS } from '../../constants';
import { useSentimentStore } from '../../hooks/useSentimentStore';

export default function SettingsScreen() {
  const { results, clearResults } = useSentimentStore();
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Configure your intelligence engine</Text>
        </View>

        <Text style={styles.section}>SOURCE CREDIBILITY WEIGHTS</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>Multipliers applied to raw sentiment scores based on source tier.</Text>
          {SOURCE_OPTIONS.map((s, i) => (
            <View key={s.label} style={[styles.sourceRow, i > 0 && styles.borderTop]}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.sourceLabel}>{s.label}</Text>
                <View style={styles.bar}>
                  <View style={[styles.barFill, { width: `${(s.weight / 3) * 100}%` }]} />
                </View>
              </View>
              <View style={styles.weightBadge}>
                <Text style={styles.weightText}>{s.weight}×</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.section}>PREFERENCES</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Auto-save to Firebase</Text>
              <Text style={styles.toggleDesc}>Save each analysis to Firestore</Text>
            </View>
            <Switch value={autoSave} onValueChange={setAutoSave} trackColor={{ true: '#1A1917' }} />
          </View>
          <View style={[styles.toggleRow, styles.borderTop]}>
            <View>
              <Text style={styles.toggleLabel}>Push Notifications</Text>
              <Text style={styles.toggleDesc}>Alert on high-velocity signals</Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: '#1A1917' }} />
          </View>
        </View>

        <Text style={styles.section}>FIREBASE CONFIGURATION</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>
            Open <Text style={styles.code}>services/firebase.ts</Text> and replace the placeholder values with your Firebase project credentials.
          </Text>
          <TouchableOpacity style={styles.linkBtn} onPress={() => Linking.openURL('https://console.firebase.google.com')}>
            <Text style={styles.linkBtnText}>Open Firebase Console ↗</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.section}>CLAUDE API</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>
            Open <Text style={styles.code}>services/claude.ts</Text> and replace <Text style={styles.code}>YOUR_CLAUDE_API_KEY</Text> with your key.
          </Text>
          <TouchableOpacity style={styles.linkBtn} onPress={() => Linking.openURL('https://console.anthropic.com')}>
            <Text style={styles.linkBtnText}>Open Anthropic Console ↗</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.section}>LOCAL DATA</Text>
        <View style={styles.card}>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Cached analyses</Text>
            <Text style={styles.dataVal}>{results.length} results</Text>
          </View>
          <TouchableOpacity
            style={styles.dangerBtn}
            onPress={() => Alert.alert('Clear All Data', 'Remove all local analyses?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: clearResults },
            ])}
          >
            <Text style={styles.dangerText}>Clear Local Cache</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.section}>ABOUT</Text>
        <View style={styles.card}>
          {[
            { k: 'App version', v: '1.0.0' },
            { k: 'AI model', v: 'claude-sonnet-4' },
            { k: 'Architecture', v: 'Expo + Firebase + Claude' },
          ].map((row, i) => (
            <View key={row.k} style={[styles.dataRow, i > 0 && styles.borderTop]}>
              <Text style={styles.dataLabel}>{row.k}</Text>
              <Text style={styles.dataVal}>{row.v}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1917' },
  subtitle: { fontSize: 13, color: '#888780', marginTop: 2 },
  section: { fontSize: 10, fontWeight: '600', color: '#888780', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)', padding: 14 },
  cardDesc: { fontSize: 13, color: '#5F5E5A', lineHeight: 18, marginBottom: 10 },
  borderTop: { borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.06)' },
  sourceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  sourceLabel: { fontSize: 13, color: '#1A1917', marginBottom: 4 },
  bar: { height: 4, backgroundColor: '#F1EFE8', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#1A1917', borderRadius: 2 },
  weightBadge: { backgroundColor: '#F1EFE8', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  weightText: { fontSize: 12, fontWeight: '700', color: '#1A1917' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  toggleLabel: { fontSize: 14, color: '#1A1917', fontWeight: '500' },
  toggleDesc: { fontSize: 11, color: '#888780', marginTop: 2 },
  code: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, color: '#1A1917' },
  linkBtn: { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.15)', borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginTop: 4 },
  linkBtnText: { fontSize: 13, color: '#1A1917', fontWeight: '500' },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  dataLabel: { fontSize: 14, color: '#1A1917' },
  dataVal: { fontSize: 13, color: '#888780' },
  dangerBtn: { backgroundColor: '#FCEBEB', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 10 },
  dangerText: { fontSize: 13, color: '#A32D2D', fontWeight: '600' },
});