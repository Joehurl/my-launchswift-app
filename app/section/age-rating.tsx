import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useProjects } from '@/contexts/ProjectContext';
import { SectionHeader } from '@/components/SectionHeader';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { AIChatSheet } from '@/components/AIChatSheet';
import { Toast, useToast } from '@/components/Toast';

type FrequencyLevel = 'None' | 'Infrequent' | 'Frequent';
type BooleanLevel = 'No' | 'Yes';

interface ContentDescriptor {
  key: string;
  label: string;
  type: 'frequency' | 'boolean';
}

const CONTENT_DESCRIPTORS: ContentDescriptor[] = [
  { key: 'cartoonViolence', label: 'Cartoon or Fantasy Violence', type: 'frequency' },
  { key: 'realisticViolence', label: 'Realistic Violence', type: 'frequency' },
  { key: 'sexualContent', label: 'Sexual Content or Nudity', type: 'frequency' },
  { key: 'profanity', label: 'Profanity or Crude Humor', type: 'frequency' },
  { key: 'drugUse', label: 'Alcohol, Tobacco, or Drug Use', type: 'frequency' },
  { key: 'matureThemes', label: 'Mature/Suggestive Themes', type: 'frequency' },
  { key: 'horrorThemes', label: 'Horror/Fear Themes', type: 'frequency' },
  { key: 'medicalInfo', label: 'Medical/Treatment Information', type: 'boolean' },
  { key: 'gambling', label: 'Gambling', type: 'boolean' },
  { key: 'webAccess', label: 'Unrestricted Web Access', type: 'boolean' },
];

function calculateRating(values: Record<string, string>): string {
  const hasFrequent = Object.values(values).some(v => v === 'Frequent');
  const hasInfrequent = Object.values(values).some(v => v === 'Infrequent');
  const hasSensitive = values.sexualContent === 'Frequent' || values.realisticViolence === 'Frequent';
  const hasGambling = values.gambling === 'Yes';
  const hasMature = values.matureThemes === 'Frequent' || values.drugUse === 'Frequent';

  if (hasSensitive || hasGambling) return '17+';
  if (hasFrequent || hasMature) return '12+';
  if (hasInfrequent) return '9+';
  return '4+';
}

const RATING_COLORS: Record<string, string> = {
  '4+': COLORS.accent,
  '9+': COLORS.primary,
  '12+': COLORS.warning,
  '17+': COLORS.danger,
};

export default function AgeRatingScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProject, updateSection } = useProjects();
  const project = getProject(projectId);

  const { visible: toastVisible, message: toastMessage, type: toastType, showToast } = useToast();
  const [aiChatVisible, setAIChatVisible] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    CONTENT_DESCRIPTORS.forEach(d => {
      defaults[d.key] = d.type === 'frequency' ? 'None' : 'No';
    });
    return defaults;
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = project?.sections.ageRating.data;
    if (d?.values) setValues(d.values as Record<string, string>);
  }, [projectId]);

  const setFrequency = (key: string, level: FrequencyLevel) => {
    console.log(`[AgeRating] ${key} set to ${level}`);
    setValues(prev => ({ ...prev, [key]: level }));
  };

  const toggleBoolean = (key: string) => {
    const newVal = values[key] === 'Yes' ? 'No' : 'Yes';
    console.log(`[AgeRating] ${key} toggled to ${newVal}`);
    setValues(prev => ({ ...prev, [key]: newVal }));
  };

  const rating = calculateRating(values);
  const ratingColor = RATING_COLORS[rating] || COLORS.accent;

  const handleSave = async () => {
    console.log('[AgeRating] Save pressed, calculated rating:', rating);
    setSaving(true);
    try {
      await updateSection(projectId, 'ageRating', {
        status: 'complete',
        data: { values, rating },
        completedAt: new Date().toISOString(),
      });
      showToast('✓ Saved');
      setTimeout(() => router.back(), 400);
    } catch (e) {
      console.error('[AgeRating] Save failed:', e);
      showToast('Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader icon="🏷️" title="Age Rating" subtitle="Content descriptors determine your app's age rating" />

        {/* Rating Display */}
        <View style={[styles.ratingCard, { borderColor: ratingColor + '40' }]}>
          <View style={[styles.ratingBadge, { backgroundColor: ratingColor + '20' }]}>
            <Text style={[styles.ratingText, { color: ratingColor }]}>{rating}</Text>
          </View>
          <View style={styles.ratingInfo}>
            <Text style={styles.ratingTitle}>Calculated Age Rating</Text>
            <Text style={styles.ratingDesc}>Based on your content descriptors below</Text>
          </View>
        </View>

        {/* Content Descriptors */}
        <View style={styles.descriptorsCard}>
          {CONTENT_DESCRIPTORS.map((descriptor, i) => (
            <React.Fragment key={descriptor.key}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.descriptorRow}>
                <Text style={styles.descriptorLabel}>{descriptor.label}</Text>
                {descriptor.type === 'frequency' ? (
                  <View style={styles.frequencyButtons}>
                    {(['None', 'Infrequent', 'Frequent'] as FrequencyLevel[]).map(level => (
                      <TouchableOpacity
                        key={level}
                        onPress={() => setFrequency(descriptor.key, level)}
                        style={[
                          styles.freqButton,
                          values[descriptor.key] === level && styles.freqButtonActive,
                          level === 'Frequent' && values[descriptor.key] === level && styles.freqButtonDanger,
                        ]}
                      >
                        <Text style={[
                          styles.freqButtonText,
                          values[descriptor.key] === level && styles.freqButtonTextActive,
                          level === 'Frequent' && values[descriptor.key] === level && styles.freqButtonTextDanger,
                        ]}>
                          {level === 'Infrequent' ? 'Infreq.' : level}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Switch
                    value={values[descriptor.key] === 'Yes'}
                    onValueChange={() => toggleBoolean(descriptor.key)}
                    trackColor={{ false: COLORS.surfaceElevated, true: COLORS.primary }}
                    thumbColor="#fff"
                  />
                )}
              </View>
            </React.Fragment>
          ))}
        </View>

        <AnimatedPressable
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save age rating'}</Text>
        </AnimatedPressable>
      </ScrollView>

      <AnimatedPressable
        onPress={() => {
          console.log('[AgeRating] AI Chat button pressed');
          setAIChatVisible(true);
        }}
        style={styles.aiFloatingButton}
      >
        <Sparkles size={22} color="#fff" strokeWidth={2} />
      </AnimatedPressable>

      <AIChatSheet
        visible={aiChatVisible}
        onClose={() => setAIChatVisible(false)}
        context={{ section: 'age-rating', projectName: project?.name ?? 'Your App' }}
        suggestedQuestions={[
          'What age rating should I choose?',
          'What triggers a 17+ rating?',
          'How is the rating calculated?',
        ]}
      />
      <Toast visible={toastVisible} message={toastMessage} type={toastType} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40, gap: 0 },
  ratingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    margin: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  ratingBadge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  ratingInfo: { flex: 1, gap: 3 },
  ratingTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  ratingDesc: { fontSize: 13, color: COLORS.textSecondary },
  descriptorsCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  descriptorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 12,
  },
  descriptorLabel: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 18 },
  frequencyButtons: { flexDirection: 'row', gap: 4 },
  freqButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  freqButtonActive: { backgroundColor: COLORS.primaryMuted, borderColor: COLORS.primary },
  freqButtonDanger: { backgroundColor: COLORS.dangerMuted, borderColor: COLORS.danger },
  freqButtonText: { fontSize: 11, fontWeight: '600', color: COLORS.textTertiary },
  freqButtonTextActive: { color: COLORS.primary },
  freqButtonTextDanger: { color: COLORS.danger },
  divider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: 14 },
  saveButton: { margin: 20, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  aiFloatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
