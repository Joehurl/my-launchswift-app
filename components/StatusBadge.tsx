import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { SectionStatus } from '@/contexts/ProjectContext';

type BadgeVariant = SectionStatus | 'warning' | 'ready';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
}

const BADGE_CONFIG: Record<BadgeVariant, { bg: string; text: string; defaultLabel: string }> = {
  complete: { bg: COLORS.accentMuted, text: COLORS.accent, defaultLabel: 'Complete' },
  in_progress: { bg: COLORS.primaryMuted, text: COLORS.primary, defaultLabel: 'In Progress' },
  empty: { bg: COLORS.surfaceElevated, text: COLORS.textSecondary, defaultLabel: 'Not Started' },
  warning: { bg: COLORS.warningMuted, text: COLORS.warning, defaultLabel: 'Needs Attention' },
  ready: { bg: COLORS.accentMuted, text: COLORS.accent, defaultLabel: 'Ready to Submit' },
};

export function StatusBadge({ variant, label }: StatusBadgeProps) {
  const config = BADGE_CONFIG[variant] ?? BADGE_CONFIG.empty;
  const displayLabel = label ?? config.defaultLabel;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{displayLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
