import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { useProjects } from '@/contexts/ProjectContext';
import { FormField } from '@/components/FormField';
import { SectionHeader } from '@/components/SectionHeader';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { AIChatSheet } from '@/components/AIChatSheet';
import { ChevronDown, Sparkles } from 'lucide-react-native';

const LANGUAGES = ['English (U.S.)', 'Spanish', 'French', 'German', 'Japanese', 'Chinese (Simplified)', 'Portuguese (Brazil)', 'Italian', 'Korean', 'Russian'];
const CATEGORIES = ['Books', 'Business', 'Developer Tools', 'Education', 'Entertainment', 'Finance', 'Food & Drink', 'Games', 'Graphics & Design', 'Health & Fitness', 'Lifestyle', 'Medical', 'Music', 'Navigation', 'News', 'Photo & Video', 'Productivity', 'Reference', 'Shopping', 'Social Networking', 'Sports', 'Travel', 'Utilities', 'Weather'];

interface PickerFieldProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (val: string) => void;
  placeholder?: string;
}

function PickerField({ label, value, options, onSelect, placeholder }: PickerFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={pickerStyles.container}>
      <Text style={pickerStyles.label}>{label}</Text>
      <TouchableOpacity
        style={pickerStyles.trigger}
        onPress={() => {
          console.log(`[AppInfo] Picker opened: ${label}`);
          setOpen(!open);
        }}
      >
        <Text style={[pickerStyles.triggerText, !value && pickerStyles.placeholder]}>
          {value || placeholder || 'Select...'}
        </Text>
        <ChevronDown size={16} color={COLORS.textSecondary} strokeWidth={2} />
      </TouchableOpacity>
      {open && (
        <View style={pickerStyles.dropdown}>
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
            {options.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[pickerStyles.option, value === opt && pickerStyles.optionActive]}
                onPress={() => {
                  console.log(`[AppInfo] Picker selected: ${opt}`);
                  onSelect(opt);
                  setOpen(false);
                }}
              >
                <Text style={[pickerStyles.optionText, value === opt && pickerStyles.optionTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 0.3, textTransform: 'uppercase' },
  trigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surfaceSecondary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.border },
  triggerText: { fontSize: 15, color: COLORS.text },
  placeholder: { color: COLORS.textTertiary },
  dropdown: { backgroundColor: COLORS.surfaceElevated, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginTop: 4 },
  option: { paddingHorizontal: 14, paddingVertical: 11 },
  optionActive: { backgroundColor: COLORS.primaryMuted },
  optionText: { fontSize: 14, color: COLORS.text },
  optionTextActive: { color: COLORS.primary, fontWeight: '600' },
});

export default function AppInfoScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProject, updateSection } = useProjects();
  const project = getProject(projectId);

  const [appName, setAppName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [bundleId, setBundleId] = useState('');
  const [sku, setSku] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState('');
  const [category, setCategory] = useState('');
  const [secondaryCategory, setSecondaryCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiChatVisible, setAIChatVisible] = useState(false);

  useEffect(() => {
    const d = project?.sections.appInfo.data;
    if (d) {
      setAppName((d.appName as string) || project?.name || '');
      setSubtitle((d.subtitle as string) || '');
      setBundleId((d.bundleId as string) || project?.bundleId || '');
      setSku((d.sku as string) || project?.bundleId || '');
      setPrimaryLanguage((d.primaryLanguage as string) || '');
      setCategory((d.category as string) || '');
      setSecondaryCategory((d.secondaryCategory as string) || '');
    } else if (project) {
      setAppName(project.name);
      setBundleId(project.bundleId);
      setSku(project.bundleId);
    }
  }, [projectId]);

  const handleSave = async () => {
    console.log('[AppInfo] Save button pressed for project:', projectId);
    if (!appName.trim()) {
      Alert.alert('Missing field', 'App name is required');
      return;
    }
    setSaving(true);
    try {
      const isComplete = !!(appName && bundleId && primaryLanguage && category);
      await updateSection(projectId, 'appInfo', {
        status: isComplete ? 'complete' : 'in_progress',
        data: { appName, subtitle, bundleId, sku, primaryLanguage, category, secondaryCategory },
        completedAt: isComplete ? new Date().toISOString() : undefined,
      });
      console.log('[AppInfo] Saved, status:', isComplete ? 'complete' : 'in_progress');
      router.back();
    } catch (e) {
      console.error('[AppInfo] Save failed:', e);
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
        <SectionHeader icon="📱" title="App Information" subtitle="Basic details about your app on the App Store" />

        <View style={styles.form}>
          <FormField
            label="App Name"
            required
            placeholder="My Awesome App"
            value={appName}
            onChangeText={setAppName}
            maxChars={30}
          />
          <FormField
            label="Subtitle"
            placeholder="A short tagline for your app"
            value={subtitle}
            onChangeText={setSubtitle}
            maxChars={30}
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
            hint="Must match your Xcode project bundle identifier"
          />
          <FormField
            label="SKU"
            placeholder="com.company.appname"
            value={sku}
            onChangeText={setSku}
            autoCapitalize="none"
            autoCorrect={false}
            monospace
            hint="Unique identifier for your records (auto-suggested from bundle ID)"
          />
          <PickerField
            label="Primary Language"
            value={primaryLanguage}
            options={LANGUAGES}
            onSelect={setPrimaryLanguage}
            placeholder="Select language..."
          />
          <PickerField
            label="Primary Category"
            value={category}
            options={CATEGORIES}
            onSelect={setCategory}
            placeholder="Select category..."
          />
          <PickerField
            label="Secondary Category (optional)"
            value={secondaryCategory}
            options={['None', ...CATEGORIES]}
            onSelect={val => setSecondaryCategory(val === 'None' ? '' : val)}
            placeholder="Select category..."
          />
        </View>

        <AnimatedPressable
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save app information'}</Text>
        </AnimatedPressable>
      </ScrollView>

      <AnimatedPressable
        onPress={() => {
          console.log('[AppInfo] AI Chat button pressed');
          setAIChatVisible(true);
        }}
        style={styles.aiFloatingButton}
      >
        <Sparkles size={22} color="#fff" strokeWidth={2} />
      </AnimatedPressable>

      <AIChatSheet
        visible={aiChatVisible}
        onClose={() => setAIChatVisible(false)}
        context={{ section: 'app-info', projectName: project?.name ?? 'Your App' }}
        suggestedQuestions={[
          'What should my app subtitle say?',
          'How do I find my bundle ID?',
          'Which category should I choose?',
          'What is a SKU?',
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40, gap: 0 },
  form: { padding: 20, gap: 20 },
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
