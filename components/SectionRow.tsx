import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChevronRight, Check, AlertCircle, Circle } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { SectionStatus } from '@/contexts/ProjectContext';

interface SectionRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  status: SectionStatus;
  onPress: () => void;
  index?: number;
}

function StatusIcon({ status }: { status: SectionStatus }) {
  if (status === 'complete') {
    return (
      <View style={[styles.statusIcon, { backgroundColor: COLORS.accentMuted }]}>
        <Check size={12} color={COLORS.accent} strokeWidth={2.5} />
      </View>
    );
  }
  if (status === 'in_progress') {
    return (
      <View style={[styles.statusIcon, { backgroundColor: COLORS.primaryMuted }]}>
        <AlertCircle size={12} color={COLORS.primary} strokeWidth={2.5} />
      </View>
    );
  }
  return (
    <View style={[styles.statusIcon, { backgroundColor: COLORS.surfaceElevated }]}>
      <Circle size={12} color={COLORS.textTertiary} strokeWidth={2} />
    </View>
  );
}

export function SectionRow({ icon, title, subtitle, status, onPress }: SectionRowProps) {
  return (
    <AnimatedPressable onPress={onPress} style={styles.row}>
      <View style={styles.iconContainer}>
        <Text style={styles.emoji}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <StatusIcon status={status} />
      <ChevronRight size={16} color={COLORS.textTertiary} strokeWidth={2} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: COLORS.surface,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
