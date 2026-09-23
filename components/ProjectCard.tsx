import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { AppProject } from '@/contexts/ProjectContext';
import { ProgressBar } from '@/components/ProgressBar';
import { StatusBadge } from '@/components/StatusBadge';
import { AnimatedPressable } from '@/components/AnimatedPressable';

interface ProjectCardProps {
  project: AppProject;
  onPress: () => void;
  index?: number;
}

function getCompletionInfo(project: AppProject) {
  const sections = Object.values(project.sections);
  const total = sections.length;
  const complete = sections.filter(s => s.status === 'complete').length;
  const inProgress = sections.filter(s => s.status === 'in_progress').length;
  return { total, complete, inProgress, progress: complete / total };
}

function getProjectStatus(project: AppProject): 'ready' | 'in_progress' | 'warning' {
  const { complete, total, inProgress } = getCompletionInfo(project);
  if (complete === total) return 'ready';
  if (inProgress > 0 || complete > 0) return 'in_progress';
  return 'warning';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

function formatRelativeTime(isoString: string) {
  const diff = Date.now() - new Date(isoString).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export function ProjectCard({ project, onPress, index = 0 }: ProjectCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay: index * 70, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay: index * 70, useNativeDriver: true }),
    ]).start();
  }, []);

  const { complete, total, progress } = getCompletionInfo(project);
  const status = getProjectStatus(project);
  const initials = getInitials(project.name);
  const relativeTime = formatRelativeTime(project.updatedAt);
  const completionText = `${complete}/${total} sections complete`;

  const statusVariant = status === 'ready' ? 'ready' : status === 'in_progress' ? 'in_progress' : 'warning';
  const statusLabel = status === 'ready' ? 'Ready to Submit' : status === 'in_progress' ? 'In Progress' : 'Needs Attention';

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <AnimatedPressable onPress={onPress} style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.iconPlaceholder, { backgroundColor: project.iconColor }]}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.appName} numberOfLines={1}>{project.name}</Text>
            <Text style={styles.bundleId} numberOfLines={1}>{project.bundleId}</Text>
          </View>
          <StatusBadge variant={statusVariant} label={statusLabel} />
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>{completionText}</Text>
            <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
          </View>
          <ProgressBar
            progress={progress}
            height={4}
            color={status === 'ready' ? COLORS.accent : COLORS.primary}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.timestamp}>Updated {relativeTime}</Text>
          <Text style={styles.platform}>{project.platform === 'ios' ? 'iOS' : project.platform === 'ios_ipad' ? 'iOS + iPadOS' : 'Universal'}</Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  initials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  bundleId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'SpaceMono',
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  platform: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
