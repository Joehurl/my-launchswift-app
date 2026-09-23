import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { useProjects } from '@/contexts/ProjectContext';
import { FormField } from '@/components/FormField';
import { SectionHeader } from '@/components/SectionHeader';
import { AnimatedPressable } from '@/components/AnimatedPressable';

const DATA_TYPES = [
  { key: 'location', label: 'Location', desc: 'Precise or coarse location data' },
  { key: 'contacts', label: 'Contacts', desc: 'Names, addresses, phone numbers' },
  { key: 'photos', label: 'Photos or Videos', desc: 'User photo library access' },
  { key: 'usageData', label: 'Usage Data', desc: 'App interactions and feature usage' },
  { key: 'diagnostics', label: 'Diagnostics', desc: 'Crash logs and performance data' },
  { key: 'identifiers', label: 'Identifiers', desc: 'Device ID, advertising ID' },
  { key: 'purchases', label: 'Purchases', desc: 'Purchase history' },
  { key: 'browsing', label: 'Browsing History', desc: 'Web browsing history' },
];

const PURPOSES = ['App Functionality', 'Analytics', 'Developer\'s Advertising', 'Third-Party Advertising', 'Product Personalization', 'Other Purposes'];

export default function PrivacyScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProject, updateSection } = useProjects();
  const project = getProject(projectId);

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
      router.back();
    } catch (e) {
      console.error('[Privacy] Save failed:', e);
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
                        <Text style={styles.dataTypeLabel}>{type.label}</Text>
                        <Text style={styles.dataTypeDesc}>{type.desc}</Text>
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

        <AnimatedPressable
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save privacy info'}</Text>
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40, gap: 0 },
  form: { padding: 20, gap: 20 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  toggleText: { flex: 1, gap: 2 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  toggleDesc: { fontSize: 12, color: COLORS.textSecondary },
  dataTypesSection: { gap: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8 },
  dataTypesList: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  dataTypeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  dataTypeText: { flex: 1, gap: 2 },
  dataTypeLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  dataTypeDesc: { fontSize: 12, color: COLORS.textSecondary },
  divider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: 14 },
  purposeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 14, paddingBottom: 12 },
  purposeLabel: { fontSize: 12, color: COLORS.textTertiary, paddingTop: 3 },
  purposeChips: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  purposeChip: { backgroundColor: COLORS.primaryMuted, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  purposeChipText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  saveButton: { margin: 20, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
