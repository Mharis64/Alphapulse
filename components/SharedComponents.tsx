import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scoreToColor, formatScore } from '../services/utils';

// ── Score Badge ──────────────────────────────────────────────────────────────
interface ScoreBadgeProps { score: number; size?: 'sm' | 'md' | 'lg'; }

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const c = scoreToColor(score);
  const fontSize = size === 'sm' ? 11 : size === 'lg' ? 18 : 13;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.badgeText, { color: c.text, fontSize }]}>
        {formatScore(score)}
      </Text>
    </View>
  );
}

// ── Section Header ───────────────────────────────────────────────────────────
interface SectionHeaderProps { title: string; right?: React.ReactNode; }

export function SectionHeader({ title, right }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {right}
    </View>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; style?: object; onPress?: () => void; }

export function Card({ children, style, onPress }: CardProps) {
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.75}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── Velocity Pill ────────────────────────────────────────────────────────────
export function VelocityPill({ velocity }: { velocity: string }) {
  const color = velocity === 'high' ? '#E24B4A' : velocity === 'medium' ? '#EF9F27' : '#378ADD';
  const bg = velocity === 'high' ? '#FCEBEB' : velocity === 'medium' ? '#FAEEDA' : '#E6F1FB';
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color }]}>{velocity} velocity</Text>
    </View>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    alignSelf: 'flex-start',
  },
  badgeText: { fontWeight: '600' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '600', color: '#888780',
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 14,
    marginBottom: 10,
  },
  pill: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, alignSelf: 'flex-start',
  },
  pillText: { fontSize: 11, fontWeight: '500' },
  empty: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: { color: '#888780', fontSize: 14 },
});
