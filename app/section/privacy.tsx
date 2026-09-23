import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Sparkles, Info, ShoppingCart } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useProjects } from '@/contexts/ProjectContext';
import { FormField } from '@/components/FormField';
import { SectionHeader } from '@/components/SectionHeader';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { AIChatSheet } from '@/components/AIChatSheet';
import { Toast, useToast } from '@/components/Toast';

const DATA_TYPES = [
  { key: 'location', label: 'Location', desc: 'Precise or coarse location data' },
  { key: 'contacts', label: 'Contacts', desc: 'Names, addresses, phone numbers' },
  { key: 'photos', label: 'Photos or Videos', desc: 'User photo library access' },
  { key: 'usageData', label: 'Usage Data', desc: 'App interactions and feature usage' },
  { key: 'diagnostics', label: 'Diagnostics', desc: 'Crash logs and performance data' },
  { key: 'identifiers', label: 'Identifiers', desc: 'Device ID, advertising ID' },
  { key: 'purchases', label: 'Purchases', desc: 'Purchase history & subscription status (RevenueCat)' },
  { key: 'browsing', label: 'Browsing History', desc: 'Web browsing history' },
];

const PURPOSES = ['App Functionality', 'Analytics', "Developer's Advertising", 'Third-Party Advertising', 'Product Personalization', 'Other Purposes'];

export default function PrivacyScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProject, updateSection } = useProjects();
  const project = getProject(projectId);

  const { visible: toastVisible, message: toastMessage, type: toastType, showToast } = useToast();
  const [aiChatVisible, setAIChatVisible] = useState(false);
  const [privacyUrl, setPrivacyUrl] = useState('');
  const [collectsData, setCollectsData] = useState(false);
  const [enabledTypes, setEnabledTypes] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = project?.sections.privacy.data;
    if (d) {
      setPrivacyUrl((d.privacyUrl as string) || '');
      setCollectsData((d.collectsData as boolean) || false);
      setEnabledTypes((d.enabledTypes as Record<string, boolean>) || {});
    }
  }, [projectId]);

  const toggleType = (key: string) => {
    console.log(`[Privacy] Data type toggled: ${key}`);
    setEnabledTypes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUseTemplate = () => {
    console.log('[Privacy] Use LaunchSwift Template pressed');
    setPrivacyUrl('https://josephhurley.com/launchswift/privacy');
    setCollectsData(false);
    setEnabledTypes({});
    showToast('Template applied — enable Purchases if using RevenueCat');
  };

  const handleSave = async () => {
    console.log('[Privacy] Save button pressed for project:', projectId);
    setSaving(true);
    try {
      const isComplete = !!privacyUrl;
      await updateSection(projectId, 'privacy', {
        status: isComplete ? 'complete' : 'in_progress',
        data: { privacyUrl, collectsData, enabledTypes },
        completedAt: isComplete ? new Date().toISOString() : undefined,
      });
      console.log('[Privacy] Saved, status:', isComplete ? 'complete' : 'in_progress');
      showToast('✓ Saved');
      setTimeout(() => router.back(), 400);
    } catch (e) {
      console.error('[Privacy] Save failed:', e);
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
        keyboardShouldPersistTaps="handled"
      >
        <SectionHeader icon="🔒" title="Privacy Policy" subtitle="Required privacy information for App Store submission" />

        {/* LaunchSwift Privacy Template card */}
        <View style={styles.templateCard}>
          <View style={styles.templateCardHeader}>
            <View style={styles.templateIconWrap}>
              <Info size={16} color={COLORS.primary} strokeWidth={2} />
            </View>
            <Text style={styles.templateCardTitle}>LaunchSwift Privacy Template</Text>
          </View>
          <Text style={styles.templateCardBody}>
            Based on LaunchSwift's own privacy setup, here's a recommended starting point for apps with no backend and RevenueCat subscriptions.
          </Text>
          <Text style={styles.templateCardNote}>
            If you use RevenueCat, enable the "Purchases" data type below after applying.
          </Text>
          <AnimatedPressable onPress={handleUseTemplate} style={styles.templateButton}>
            <Text style={styles.templateButtonText}>Use LaunchSwift Template</Text>
          </AnimatedPressable>
        </View>

        <View style={styles.form}>
          <FormField
            label="Privacy Policy URL"
            required
            placeholder="https://yourapp.com/privacy"
            value={privacyUrl}
            onChangeText={setPrivacyUrl}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            hint="Must be a publicly accessible URL"
          />

          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleLabel}>App Collects Data</Text>
              <Text style={styles.toggleDesc}>Does your app collect any user data?</Text>
            </View>
            <Switch
              value={collectsData}
              onValueChange={val => {
                console.log('[Privacy] Collects data toggle:', val);
                setCollectsData(val);
              }}
              trackColor={{ false: COLORS.surfaceElevated, true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>

          {collectsData && (
            <View style={styles.dataTypesSection}>
              <Text style={styles.sectionLabel}>Data Types Collected</Text>
              <View style={styles.dataTypesList}>
                {DATA_TYPES.map((type, i) => (
                  <React.Fragment key={type.key}>
                    {i > 0 && <View style={styles.divider} />}
                    <View style={styles.dataTypeRow}>
                      <View style={styles.dataTypeText}>
                        <View style={styles.dataTypeLabelRow}>
                          {type.key === 'purchases' && (
                            <ShoppingCart size={13} color={COLORS.primary} strokeWidth={2} style={styles.purchasesIcon} />
                          )}
                          <Text style={styles.dataTypeLabel}>{type.label}</Text>
                        </View>
                        <Text style={styles.dataTypeDesc}>{type.desc}</Text>
                        {type.key === 'purchases' && (
                          <View style={styles.purchasesNote}>
                            <Info size={11} color={COLORS.textTertiary} strokeWidth={2} />
                            <Text style={styles.purchasesNoteText}>
                              Required if you use RevenueCat, StoreKit, or any payment processor.
                            </Text>
                          </View>
                        )}
                      </View>
                      <Switch
                        value={!!enabledTypes[type.key]}
                        onValueChange={() => toggleType(type.key)}
                        trackColor={{ false: COLORS.surfaceElevated, true: COLORS.primary }}
                        thumbColor="#fff"
                      />
                    </View>
                    {enabledTypes[type.key] && (
                      <View style={styles.purposeRow}>
                        <Text style={styles.purposeLabel}>Purpose:</Text>
                        <View style={styles.purposeChips}>
                          {PURPOSES.slice(0, 3).map(p => (
                            <View key={p} style={styles.purposeChip}>
                              <Text style={styles.purposeChipText}>{p}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* App Store Privacy Nutrition Label info card */}
        <View style={styles.nutritionCard}>
          <View style={styles.nutritionCardHeader}>
            <View style={styles.nutritionIconWrap}>
              <Info size={16} color={COLORS.warning} strokeWidth={2} />
            </View>
            <Text style={styles.nutritionCardTitle}>App Store Privacy Nutrition Label</Text>
          </View>
          <Text style={styles.nutritionCardBody}>
            Apple requires you to declare all data types your app collects in App Store Connect under "App Privacy".
          </Text>
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionBullet}>•</Text>
            <Text style={styles.nutritionRowText}>
              <Text style={styles.nutritionBold}>RevenueCat only, no backend:</Text>
              {' '}Select "Purchases" → "App Functionality" only.
            </Text>
          </View>
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionBullet}>•</Text>
            <Text style={styles.nutritionRowText}>
              <Text style={styles.nutritionBold}>Everything else:</Text>
              {' '}Not Collected.
            </Text>
          </View>
        </View>

        <AnimatedPressable
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save privacy info'}</Text>
        </AnimatedPressable>
      </ScrollView>

      <AnimatedPressable
        onPress={() => {
          console.log('[Privacy] AI Chat button pressed');
          setAIChatVisible(true);
        }}
        style={styles.aiFloatingButton}
      >
        <Sparkles size={22} color="#fff" strokeWidth={2} />
      </AnimatedPressable>

      <AIChatSheet
        visible={aiChatVisible}
        onClose={() => setAIChatVisible(false)}
        context={{ section: 'privacy', projectName: project?.name ?? 'Your App' }}
        suggestedQuestions={[
          'Do I need a privacy policy?',
          'What data does Apple consider collected?',
          'How do third-party SDKs affect my privacy label?',
        ]}
      />
      <Toast visible={toastVisible} message={toastMessage} type={toastType} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40, gap: 0 },
  form: { padding: 20, gap: 20 },

  // Template card
  templateCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    padding: 16,
    gap: 10,
  },
  templateCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  templateIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateCardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  templateCardBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  templateCardNote: { fontSize: 12, color: COLORS.primary, lineHeight: 17 },
  templateButton: {
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  templateButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },

  // Form fields
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  toggleText: { flex: 1, gap: 2 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  toggleDesc: { fontSize: 12, color: COLORS.textSecondary },
  dataTypesSection: { gap: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8 },
  dataTypesList: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  dataTypeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  dataTypeText: { flex: 1, gap: 2 },
  dataTypeLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  purchasesIcon: { marginTop: 1 },
  dataTypeLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  dataTypeDesc: { fontSize: 12, color: COLORS.textSecondary },
  purchasesNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginTop: 4 },
  purchasesNoteText: { fontSize: 11, color: COLORS.textTertiary, lineHeight: 15, flex: 1 },
  divider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: 14 },
  purposeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 14, paddingBottom: 12 },
  purposeLabel: { fontSize: 12, color: COLORS.textTertiary, paddingTop: 3 },
  purposeChips: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  purposeChip: { backgroundColor: COLORS.primaryMuted, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  purposeChipText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },

  // Nutrition label card
  nutritionCard: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
    padding: 16,
    gap: 10,
  },
  nutritionCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nutritionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.warningMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionCardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  nutritionCardBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  nutritionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  nutritionBullet: { fontSize: 13, color: COLORS.textTertiary, lineHeight: 19 },
  nutritionRowText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, flex: 1 },
  nutritionBold: { fontWeight: '700', color: COLORS.text },

  // Save button
  saveButton: { margin: 20, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // AI floating button
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
