import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/Colors';
import { useProjects, AppProject } from '@/contexts/ProjectContext';
import { SectionRow } from '@/components/SectionRow';
import { ProgressBar } from '@/components/ProgressBar';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Rocket, AlertCircle } from 'lucide-react-native';

const SECTIONS: {
  key: keyof AppProject['sections'];
  icon: string;
  title: string;
  route: string;
  getSubtitle: (data: Record<string, unknown>) => string;
}[] = [
  { key: 'credentials', icon: '🔐', title: 'App Store Connect Credentials', route: '/section/credentials', getSubtitle: (d) => d.appleId ? `Apple ID: ${d.appleId}` : 'Add your Apple credentials' },
  { key: 'appInfo', icon: '📱', title: 'App Information', route: '/section/app-info', getSubtitle: (d) => d.appName ? `${d.appName} · ${d.bundleId}` : 'Name, bundle ID, category' },
  { key: 'metadata', icon: '📝', title: 'Description & Metadata', route: '/section/metadata', getSubtitle: (d) => d.description ? 'Description, keywords, what\'s new' : 'App description, keywords, promo text' },
  { key: 'screenshots', icon: '🖼️', title: 'Screenshots & Previews', route: '/section/screenshots', getSubtitle: (d) => d.uploaded ? `${d.uploaded} screenshots uploaded` : 'All required device sizes' },
  { key: 'pricing', icon: '💰', title: 'Pricing & Availability', route: '/section/pricing', getSubtitle: (d) => d.priceTier ? `${d.priceTier === 'free' ? 'Free' : d.price as string} · ${d.releaseType as string || 'Automatic release'}` : 'Price tier, territories, release date' },
  { key: 'reviewInfo', icon: '📦', title: 'App Review Information', route: '/section/review-info', getSubtitle: (d) => d.email ? `Contact: ${d.email}` : 'Contact info, demo account, notes' },
  { key: 'privacy', icon: '🔒', title: 'Privacy Policy & Data Collection', route: '/section/privacy', getSubtitle: (d) => d.privacyUrl ? `URL: ${d.privacyUrl}` : 'Privacy URL, data types collected' },
  { key: 'iap', icon: '🛒', title: 'In-App Purchases', route: '/section/iap', getSubtitle: (d) => Array.isArray(d.iaps) ? `${(d.iaps as unknown[]).length} IAP${(d.iaps as unknown[]).length !== 1 ? 's' : ''} configured` : 'Consumables, non-consumables' },
  { key: 'subscriptions', icon: '📋', title: 'Subscriptions', route: '/section/subscriptions', getSubtitle: (d) => Array.isArray(d.groups) ? `${(d.groups as unknown[]).length} subscription group${(d.groups as unknown[]).length !== 1 ? 's' : ''}` : 'Subscription groups and pricing' },
  { key: 'testflight', icon: '🧪', title: 'TestFlight Setup', route: '/section/testflight', getSubtitle: (d) => d.feedbackEmail ? `Feedback: ${d.feedbackEmail}` : 'Beta groups, testers, build notes' },
  { key: 'ageRating', icon: '🏷️', title: 'Age Rating & Content', route: '/section/age-rating', getSubtitle: (d) => d.rating ? `Rated ${d.rating}` : 'Content descriptors, age rating' },
  { key: 'checklist', icon: '✅', title: 'Final Submission Checklist', route: '/section/checklist', getSubtitle: () => 'Review all sections before submitting' },
];

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getProject } = useProjects();
  const project = getProject(id);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  if (!project) {
    return (
      <View style={styles.notFound}>
        <AlertCircle size={40} color={COLORS.danger} strokeWidth={1.5} />
        <Text style={styles.notFoundText}>Project not found</Text>
      </View>
    );
  }

  const sections = Object.values(project.sections);
  const totalSections = sections.length;
  const completeSections = sections.filter(s => s.status === 'complete').length;
  const progress = completeSections / totalSections;
  const allComplete = completeSections === totalSections;
  const initials = getInitials(project.name);

  const handleSectionPress = (sectionKey: keyof AppProject['sections'], route: string) => {
    console.log(`[ProjectDetail] Section pressed: ${sectionKey} for project ${project.id}`);
    router.push({ pathname: route as never, params: { projectId: project.id } });
  };

  const handleSubmit = () => {
    console.log('[ProjectDetail] Submit to App Store button pressed for project:', project.id);
    Alert.alert(
      'Submit to App Store',
      'In a full implementation, this would connect to the App Store Connect API and initiate the submission process.',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: project.name }} />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Project Hero */}
          <View style={styles.hero}>
            <View style={[styles.heroIcon, { backgroundColor: project.iconColor }]}>
              <Text style={styles.heroInitials}>{initials}</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{project.name}</Text>
              <Text style={styles.heroBundleId} selectable>{project.bundleId}</Text>
              <Text style={styles.heroPlatform}>
                {project.platform === 'ios' ? 'iOS' : project.platform === 'ios_ipad' ? 'iOS + iPadOS' : 'Universal'}
              </Text>
            </View>
          </View>

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Submission Progress</Text>
              <Text style={styles.progressCount}>{completeSections}/{totalSections}</Text>
            </View>
            <ProgressBar
              progress={progress}
              height={6}
              color={allComplete ? COLORS.accent : COLORS.primary}
            />
            <Text style={styles.progressSubtext}>
              {allComplete ? '🎉 All sections complete! Ready to submit.' : `${totalSections - completeSections} sections remaining`}
            </Text>
          </View>

          {/* Sections */}
          <View style={styles.sectionsCard}>
            <Text style={styles.sectionsTitle}>Submission Sections</Text>
            {SECTIONS.map((section, index) => {
              const sectionData = project.sections[section.key];
              const subtitle = section.getSubtitle(sectionData.data);
              return (
                <React.Fragment key={section.key}>
                  {index > 0 && <View style={styles.divider} />}
                  <SectionRow
                    icon={section.icon}
                    title={section.title}
                    subtitle={subtitle}
                    status={sectionData.status}
                    onPress={() => handleSectionPress(section.key, section.route)}
                    index={index}
                  />
                </React.Fragment>
              );
            })}
          </View>

          {/* Submit Button */}
          <AnimatedPressable
            onPress={handleSubmit}
            disabled={!allComplete}
            style={[styles.submitButton, !allComplete && styles.submitButtonDisabled]}
          >
            <Rocket size={20} color="#fff" strokeWidth={2} />
            <Text style={styles.submitButtonText}>Submit to App Store</Text>
          </AnimatedPressable>

          {!allComplete && (
            <Text style={styles.submitHint}>Complete all sections to enable submission</Text>
          )}
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.background,
  },
  notFoundText: {
    fontSize: 17,
    color: COLORS.textSecondary,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  heroInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  heroInfo: {
    flex: 1,
    gap: 3,
  },
  heroName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  heroBundleId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'SpaceMono',
  },
  heroPlatform: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressCount: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  progressSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  sectionsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  sectionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: 64,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.2,
  },
  submitHint: {
    fontSize: 13,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: -8,
  },
});
