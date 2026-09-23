import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, X, AlertCircle, ChevronDown, ChevronUp, Rocket, Sparkles } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useProjects, AppProject } from '@/contexts/ProjectContext';
import { SectionHeader } from '@/components/SectionHeader';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { ProgressBar } from '@/components/ProgressBar';
import { AIChatSheet } from '@/components/AIChatSheet';

const SECTION_INFO: { key: keyof AppProject['sections']; icon: string; label: string; required: boolean }[] = [
  { key: 'credentials', icon: '🔐', label: 'App Store Connect Credentials', required: true },
  { key: 'appInfo', icon: '📱', label: 'App Information', required: true },
  { key: 'metadata', icon: '📝', label: 'Description & Metadata', required: true },
  { key: 'screenshots', icon: '🖼️', label: 'Screenshots & Previews', required: true },
  { key: 'pricing', icon: '💰', label: 'Pricing & Availability', required: true },
  { key: 'reviewInfo', icon: '📦', label: 'App Review Information', required: true },
  { key: 'privacy', icon: '🔒', label: 'Privacy Policy', required: true },
  { key: 'iap', icon: '🛒', label: 'In-App Purchases', required: false },
  { key: 'subscriptions', icon: '📋', label: 'Subscriptions', required: false },
  { key: 'testflight', icon: '🧪', label: 'TestFlight Setup', required: false },
  { key: 'ageRating', icon: '🏷️', label: 'Age Rating', required: true },
  { key: 'checklist', icon: '✅', label: 'Final Checklist', required: false },
];

const REJECTION_TIPS = [
  { title: 'Guideline 2.1 — App Completeness', desc: 'Ensure all features work and there are no placeholder content or broken links.' },
  { title: 'Guideline 4.0 — Design', desc: 'Apps must follow iOS Human Interface Guidelines. Avoid non-standard UI patterns.' },
  { title: 'Guideline 5.1.1 — Privacy', desc: 'Include a privacy policy and only request permissions you actually use.' },
  { title: 'Guideline 3.1.1 — In-App Purchases', desc: 'All digital goods must use Apple\'s IAP system. No external payment links.' },
  { title: 'Guideline 1.1 — Objectionable Content', desc: 'No content that is offensive, insensitive, or inappropriate for the age rating.' },
];

export default function ChecklistScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProject, updateSection } = useProjects();
  const project = getProject(projectId);

  const [showIssues, setShowIssues] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  if (!project) return null;

  const sections = SECTION_INFO.map(info => ({
    ...info,
    status: project.sections[info.key].status,
  }));

  const requiredSections = sections.filter(s => s.required);
  const completedRequired = requiredSections.filter(s => s.status === 'complete').length;
  const totalRequired = requiredSections.length;
  const allRequiredComplete = completedRequired === totalRequired;

  const incompleteSections = sections.filter(s => s.required && s.status !== 'complete');
  const progress = completedRequired / totalRequired;

  const handleSubmit = () => {
    console.log('[Checklist] Submit to App Store button pressed for project:', project.id);
    Alert.alert(
      'Submit to App Store',
      'In a full implementation, this would connect to the App Store Connect API and initiate the submission process for your app.',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const handleMarkComplete = async () => {
    console.log('[Checklist] Mark checklist complete pressed');
    await updateSection(projectId, 'checklist', {
      status: 'complete',
      data: { reviewedAt: new Date().toISOString() },
      completedAt: new Date().toISOString(),
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader icon="✅" title="Final Checklist" subtitle="Review all sections before submitting to App Store" />

        {/* Overall Score */}
        <Animated.View style={[styles.scoreCard, { opacity: fadeAnim }]}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>Readiness Score</Text>
            <Text style={[styles.scoreValue, { color: allRequiredComplete ? COLORS.accent : COLORS.primary }]}>
              {completedRequired}/{totalRequired}
            </Text>
          </View>
          <ProgressBar
            progress={progress}
            height={8}
            color={allRequiredComplete ? COLORS.accent : COLORS.primary}
          />
          <Text style={styles.scoreSubtext}>
            {allRequiredComplete
              ? '🎉 All required sections complete! Ready to submit.'
              : `${totalRequired - completedRequired} required section${totalRequired - completedRequired !== 1 ? 's' : ''} need attention`
            }
          </Text>
        </Animated.View>

        {/* Section Status List */}
        <View style={styles.sectionsList}>
          <Text style={styles.listTitle}>Section Status</Text>
          {sections.map((section, i) => (
            <React.Fragment key={section.key}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.sectionItem}>
                <Text style={styles.sectionEmoji}>{section.icon}</Text>
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionLabel} numberOfLines={1}>{section.label}</Text>
                  {section.required && <Text style={styles.requiredTag}>Required</Text>}
                </View>
                {section.status === 'complete' ? (
                  <View style={[styles.statusIcon, { backgroundColor: COLORS.accentMuted }]}>
                    <Check size={12} color={COLORS.accent} strokeWidth={2.5} />
                  </View>
                ) : section.status === 'in_progress' ? (
                  <View style={[styles.statusIcon, { backgroundColor: COLORS.warningMuted }]}>
                    <AlertCircle size={12} color={COLORS.warning} strokeWidth={2.5} />
                  </View>
                ) : (
                  <View style={[styles.statusIcon, { backgroundColor: section.required ? COLORS.dangerMuted : COLORS.surfaceElevated }]}>
                    <X size={12} color={section.required ? COLORS.danger : COLORS.textTertiary} strokeWidth={2.5} />
                  </View>
                )}
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Issues */}
        {incompleteSections.length > 0 && (
          <View style={styles.issuesCard}>
            <TouchableOpacity
              style={styles.issuesHeader}
              onPress={() => {
                console.log('[Checklist] Issues section toggled');
                setShowIssues(!showIssues);
              }}
            >
              <AlertCircle size={16} color={COLORS.danger} strokeWidth={2} />
              <Text style={styles.issuesTitle}>{incompleteSections.length} issue{incompleteSections.length !== 1 ? 's' : ''} to resolve</Text>
              {showIssues ? <ChevronUp size={16} color={COLORS.textSecondary} /> : <ChevronDown size={16} color={COLORS.textSecondary} />}
            </TouchableOpacity>
            {showIssues && (
              <View style={styles.issuesList}>
                {incompleteSections.map(s => (
                  <View key={s.key} style={styles.issueItem}>
                    <View style={styles.issueDot} />
                    <Text style={styles.issueText}>{s.label} is not complete</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Rejection Tips */}
        <View style={styles.tipsCard}>
          <TouchableOpacity
            style={styles.tipsHeader}
            onPress={() => {
              console.log('[Checklist] Tips section toggled');
              setShowTips(!showTips);
            }}
          >
            <Text style={styles.tipsTitle}>Common rejection reasons</Text>
            {showTips ? <ChevronUp size={16} color={COLORS.textSecondary} /> : <ChevronDown size={16} color={COLORS.textSecondary} />}
          </TouchableOpacity>
          {showTips && (
            <View style={styles.tipsList}>
              {REJECTION_TIPS.map((tip, i) => (
                <React.Fragment key={tip.title}>
                  {i > 0 && <View style={styles.divider} />}
                  <View style={styles.tipItem}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipDesc}>{tip.desc}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        {/* Mark Complete */}
        {project.sections.checklist.status !== 'complete' && (
          <AnimatedPressable onPress={handleMarkComplete} style={styles.markCompleteButton}>
            <Check size={16} color={COLORS.accent} strokeWidth={2.5} />
            <Text style={styles.markCompleteText}>Mark checklist as reviewed</Text>
          </AnimatedPressable>
        )}

        {/* Submit Button */}
        <AnimatedPressable
          onPress={handleSubmit}
          disabled={!allRequiredComplete}
          style={[styles.submitButton, !allRequiredComplete && styles.submitButtonDisabled]}
        >
          <Rocket size={20} color="#fff" strokeWidth={2} />
          <Text style={styles.submitButtonText}>Submit to App Store</Text>
        </AnimatedPressable>

        {!allRequiredComplete && (
          <Text style={styles.submitHint}>Complete all required sections to enable submission</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40, gap: 0 },
  scoreCard: {
    margin: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  scoreValue: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  scoreSubtext: { fontSize: 13, color: COLORS.textSecondary },
  sectionsList: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  listTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, padding: 14, paddingBottom: 8 },
  sectionItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  sectionEmoji: { fontSize: 16, width: 24, textAlign: 'center' },
  sectionContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionLabel: { flex: 1, fontSize: 14, color: COLORS.text },
  requiredTag: { fontSize: 10, fontWeight: '700', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 0.3 },
  statusIcon: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: 14 },
  issuesCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.dangerMuted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
    overflow: 'hidden',
    marginBottom: 16,
  },
  issuesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14 },
  issuesTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.danger },
  issuesList: { paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  issueItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  issueDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.danger },
  issueText: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  tipsCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  tipsTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  tipsList: {},
  tipItem: { paddingHorizontal: 14, paddingVertical: 12, gap: 4 },
  tipTitle: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  tipDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
  markCompleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: COLORS.accentMuted,
    borderRadius: 12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
  },
  markCompleteText: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  submitButtonDisabled: { opacity: 0.4 },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  submitHint: { fontSize: 13, color: COLORS.textTertiary, textAlign: 'center', marginTop: 8, marginHorizontal: 20 },
});
