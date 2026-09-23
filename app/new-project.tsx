import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { useProjects } from '@/contexts/ProjectContext';
import { FormField } from '@/components/FormField';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Check } from 'lucide-react-native';

const ICON_COLORS = [
  '#2F81F7', // Blue
  '#3FB950', // Green
  '#F85149', // Red
  '#D29922', // Amber
  '#A371F7', // Purple
  '#39D353', // Bright green
];

const PLATFORMS = [
  { key: 'ios', label: 'iOS only', desc: 'iPhone' },
  { key: 'ios_ipad', label: 'iOS + iPadOS', desc: 'iPhone & iPad' },
  { key: 'universal', label: 'Universal', desc: 'All Apple platforms' },
] as const;

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}

export default function NewProjectScreen() {
  const router = useRouter();
  const { addProject } = useProjects();

  const [appName, setAppName] = useState('');
  const [bundleId, setBundleId] = useState('');
  const [iconColor, setIconColor] = useState(ICON_COLORS[0]);
  const [platform, setPlatform] = useState<'ios' | 'ios_ipad' | 'universal'>('ios');
  const [saving, setSaving] = useState(false);

  const initials = getInitials(appName);

  const handleCreate = async () => {
    console.log('[NewProject] Create project button pressed:', appName, bundleId);
    if (!appName.trim()) {
      Alert.alert('Missing field', 'App name is required');
      return;
    }
    if (!bundleId.trim()) {
      Alert.alert('Missing field', 'Bundle ID is required');
      return;
    }
    if (!bundleId.includes('.')) {
      Alert.alert('Invalid bundle ID', 'Bundle ID must be in reverse domain format (e.g. com.company.app)');
      return;
    }
    setSaving(true);
    try {
      const project = await addProject({ name: appName.trim(), bundleId: bundleId.trim(), iconColor, platform });
      console.log('[NewProject] Project created:', project.id);
      router.dismiss();
      router.push(`/project/${project.id}`);
    } catch (e) {
      console.error('[NewProject] Create failed:', e);
      Alert.alert('Error', 'Could not create project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New Project</Text>
        <TouchableOpacity
          onPress={() => {
            console.log('[NewProject] Cancel button pressed');
            router.dismiss();
          }}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Icon Preview */}
        <View style={styles.iconPreview}>
          <View style={[styles.iconCircle, { backgroundColor: iconColor }]}>
            <Text style={styles.iconInitials}>{initials}</Text>
          </View>
          <Text style={styles.iconPreviewLabel}>App icon preview</Text>
        </View>

        <View style={styles.form}>
          <FormField
            label="App Name"
            required
            placeholder="My Awesome App"
            value={appName}
            onChangeText={setAppName}
            maxChars={30}
            autoFocus
          />

          <FormField
            label="Bundle ID"
            required
            placeholder="com.company.appname"
            value={bundleId}
            onChangeText={setBundleId}
            autoCapitalize="none"
            autoCorrect={false}
            monospace
            hint="Reverse domain format (e.g. com.yourcompany.appname)"
          />

          {/* Icon Color */}
          <View style={styles.colorSection}>
            <Text style={styles.colorLabel}>Icon Color</Text>
            <View style={styles.colorRow}>
              {ICON_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  onPress={() => {
                    console.log('[NewProject] Icon color selected:', color);
                    setIconColor(color);
                  }}
                  style={[styles.colorSwatch, { backgroundColor: color }]}
                >
                  {iconColor === color && (
                    <Check size={14} color="#fff" strokeWidth={3} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Platform */}
          <View style={styles.platformSection}>
            <Text style={styles.platformLabel}>Platform</Text>
            <View style={styles.platformOptions}>
              {PLATFORMS.map(p => (
                <AnimatedPressable
                  key={p.key}
                  onPress={() => {
                    console.log('[NewProject] Platform selected:', p.key);
                    setPlatform(p.key);
                  }}
                  style={[styles.platformOption, platform === p.key && styles.platformOptionActive]}
                >
                  <View style={[styles.radioOuter, platform === p.key && styles.radioOuterActive]}>
                    {platform === p.key && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.platformText}>
                    <Text style={[styles.platformOptionLabel, platform === p.key && styles.platformOptionLabelActive]}>
                      {p.label}
                    </Text>
                    <Text style={styles.platformOptionDesc}>{p.desc}</Text>
                  </View>
                </AnimatedPressable>
              ))}
            </View>
          </View>
        </View>

        <AnimatedPressable
          onPress={handleCreate}
          disabled={saving}
          style={[styles.createButton, saving && styles.createButtonDisabled]}
        >
          <Text style={styles.createButtonText}>{saving ? 'Creating...' : 'Create project'}</Text>
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, letterSpacing: -0.3 },
  cancelButton: { padding: 4 },
  cancelText: { fontSize: 16, color: COLORS.primary },
  scrollContent: { paddingBottom: 40, gap: 0 },
  iconPreview: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  iconInitials: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  iconPreviewLabel: { fontSize: 13, color: COLORS.textTertiary },
  form: { paddingHorizontal: 20, gap: 20 },
  colorSection: { gap: 10 },
  colorLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3 },
  colorRow: { flexDirection: 'row', gap: 12 },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformSection: { gap: 10 },
  platformLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3 },
  platformOptions: { gap: 8 },
  platformOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  platformOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryMuted },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  platformText: { flex: 1, gap: 2 },
  platformOptionLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  platformOptionLabelActive: { color: COLORS.primary },
  platformOptionDesc: { fontSize: 12, color: COLORS.textSecondary },
  createButton: { margin: 20, marginTop: 28, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  createButtonDisabled: { opacity: 0.5 },
  createButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
