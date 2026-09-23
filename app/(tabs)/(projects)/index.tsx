import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Zap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/Colors';
import { useProjects } from '@/contexts/ProjectContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { ProjectCard } from '@/components/ProjectCard';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { LaunchSwiftIcon } from '@/components/LaunchSwiftIcon';

const FREE_PROJECT_LIMIT = 1;

function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonIcon} />
        <View style={styles.skeletonLines}>
          <View style={[styles.skeletonLine, { width: '60%' }]} />
          <View style={[styles.skeletonLine, { width: '40%', marginTop: 6 }]} />
        </View>
      </View>
      <View style={[styles.skeletonLine, { width: '100%', height: 4, marginTop: 8 }]} />
    </Animated.View>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 15, stiffness: 100 }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.emptyState, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.emptyIconContainer}>
        <LaunchSwiftIcon size={72} />
      </View>
      <Text style={styles.emptyTitle}>No projects yet</Text>
      <Text style={styles.emptySubtitle}>Add your first app to start tracking your App Store submission</Text>
      <AnimatedPressable onPress={onAdd} style={styles.emptyButton}>
        <Plus size={18} color="#fff" strokeWidth={2.5} />
        <Text style={styles.emptyButtonText}>Add your first app</Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function ProjectsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { projects, loading } = useProjects();
  const { isSubscribed } = useSubscription();

  const handleAddProject = () => {
    console.log('[Projects] Add project button pressed, project count:', projects.length, 'isSubscribed:', isSubscribed);
    if (!isSubscribed && projects.length >= FREE_PROJECT_LIMIT) {
      console.log('[Projects] Free limit reached — prompting upgrade');
      Alert.alert(
        'Upgrade to Pro',
        `Free accounts are limited to ${FREE_PROJECT_LIMIT} project. Upgrade to LaunchSwift Pro to manage unlimited apps.`,
        [
          { text: 'Not now', style: 'cancel' },
          {
            text: 'Go Pro',
            onPress: () => {
              console.log('[Projects] Upgrade alert: Go Pro pressed');
              router.push('/paywall');
            },
          },
        ]
      );
      return;
    }
    router.push('/new-project');
  };

  const handleProjectPress = (id: string, name: string) => {
    console.log(`[Projects] Project card pressed: ${name} (${id})`);
    router.push(`/project/${id}`);
  };

  const handleGoProPress = () => {
    console.log('[Projects] Go Pro header button pressed');
    router.push('/paywall');
  };

  const showGoPro = !isSubscribed;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerBrand}>
          <LaunchSwiftIcon size={40} />
          <View>
            <Text style={styles.headerTitle}>LaunchSwift</Text>
            <Text style={styles.headerSubtitle}>App Store submission assistant</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {showGoPro && (
            <TouchableOpacity
              onPress={handleGoProPress}
              style={styles.goProButton}
              activeOpacity={0.8}
            >
              <Zap size={13} color="#fff" strokeWidth={2.5} />
              <Text style={styles.goProButtonText}>Go Pro</Text>
            </TouchableOpacity>
          )}
          <AnimatedPressable onPress={handleAddProject} style={styles.addButton}>
            <Plus size={20} color="#fff" strokeWidth={2.5} />
          </AnimatedPressable>
        </View>
      </View>

      {/* Free tier limit banner */}
      {!isSubscribed && projects.length >= FREE_PROJECT_LIMIT && !loading && (
        <TouchableOpacity
          style={styles.limitBanner}
          onPress={() => {
            console.log('[Projects] Limit banner pressed');
            router.push('/paywall');
          }}
          activeOpacity={0.8}
        >
          <Zap size={14} color="#2F81F7" strokeWidth={2.5} />
          <Text style={styles.limitBannerText}>
            Free plan: 1 project limit.{' '}
            <Text style={styles.limitBannerLink}>Upgrade to Pro →</Text>
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : projects.length === 0 ? (
          <>
            <EmptyState onAdd={handleAddProject} />
            <Text style={styles.copyright}>© 2025 Joseph Hurley · LaunchSwift™</Text>
          </>
        ) : (
          <>
            <Text style={styles.sectionLabel}>{projects.length} {projects.length === 1 ? 'project' : 'projects'}</Text>
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onPress={() => handleProjectPress(project.id, project.name)}
              />
            ))}
            <Text style={styles.copyright}>© 2025 Joseph Hurley · LaunchSwift™</Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goProButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  goProButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(47,129,247,0.2)',
  },
  limitBannerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  limitBannerLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  skeletonCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  skeletonHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceElevated,
  },
  skeletonLines: {
    flex: 1,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceElevated,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  copyright: {
    color: COLORS.textTertiary,
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
