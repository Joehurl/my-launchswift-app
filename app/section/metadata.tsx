import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useProjects } from '@/contexts/ProjectContext';
import { FormField } from '@/components/FormField';
import { SectionHeader } from '@/components/SectionHeader';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { AIChatSheet } from '@/components/AIChatSheet';
import { Toast, useToast } from '@/components/Toast';
import { generateAppStoreCopy } from '@/utils/aiChat';



export default function MetadataScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProject, updateSection } = useProjects();
  const project = getProject(projectId);
  const { visible: toastVisible, message: toastMessage, type: toastType, showToast } = useToast();
  const [aiChatVisible, setAIChatVisible] = useState(false);

  const [description, setDescription] = useState('');
  const [promoText, setPromoText] = useState('');
  const [keywords, setKeywords] = useState('');
  const [whatsNew, setWhatsNew] = useState('');
  const [supportUrl, setSupportUrl] = useState('');
  const [marketingUrl, setMarketingUrl] = useState('');
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [generatingWhatsNew, setGeneratingWhatsNew] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [hasGeneratedAll, setHasGeneratedAll] = useState(false);
  const [saving, setSaving] = useState(false);

  const projectName = project?.name ?? 'Your App';
  const appCategory = (project?.sections.appInfo.data?.category as string) ?? '';

  useEffect(() => {
    const d = project?.sections.metadata.data;
    if (d) {
      setDescription((d.description as string) || '');
      setPromoText((d.promoText as string) || '');
      setKeywords((d.keywords as string) || '');
      setWhatsNew((d.whatsNew as string) || '');
      setSupportUrl((d.supportUrl as string) || '');
      setMarketingUrl((d.marketingUrl as string) || '');
    }
  }, [projectId]);

  const handleGenerateDescription = () => {
    console.log('[Metadata] AI Generate description button pressed for:', projectName);
    setGeneratingDesc(true);
    setTimeout(() => {
      const copy = generateAppStoreCopy({ section: 'metadata', projectName, appCategory });
      setDescription(copy.description);
      setGeneratingDesc(false);
      console.log('[Metadata] AI description generated for:', projectName);
    }, 1500);
  };

  const handleGenerateWhatsNew = () => {
    console.log('[Metadata] AI Generate whats new button pressed for:', projectName);
    setGeneratingWhatsNew(true);
    setTimeout(() => {
      const copy = generateAppStoreCopy({ section: 'metadata', projectName, appCategory });
      setWhatsNew(copy.whatsNew);
      setGeneratingWhatsNew(false);
      console.log('[Metadata] AI whats new generated for:', projectName);
    }, 1500);
  };

  const handleGenerateAllCopy = () => {
    console.log('[Metadata] Generate All Copy button pressed for:', projectName, 'category:', appCategory);
    setGeneratingAll(true);
    setTimeout(() => {
      const copy = generateAppStoreCopy({ section: 'metadata', projectName, appCategory });
      setDescription(copy.description);
      setPromoText(copy.promotionalText);
      setKeywords(copy.keywords);
      setWhatsNew(copy.whatsNew);
      setGeneratingAll(false);
      setHasGeneratedAll(true);
      console.log('[Metadata] All copy generated for:', projectName);
      showToast('✓ Copy generated! Review and customize each field.');
    }, 1500);
  };

  const handleSave = async () => {
    console.log('[Metadata] Save button pressed for project:', projectId);
    setSaving(true);
    try {
      const isComplete = !!(description && keywords && supportUrl);
      await updateSection(projectId, 'metadata', {
        status: isComplete ? 'complete' : 'in_progress',
        data: { description, promoText, keywords, whatsNew, supportUrl, marketingUrl },
        completedAt: isComplete ? new Date().toISOString() : undefined,
      });
      console.log('[Metadata] Saved, status:', isComplete ? 'complete' : 'in_progress');
      showToast('✓ Saved');
      setTimeout(() => router.back(), 400);
    } catch (e) {
      console.error('[Metadata] Save failed:', e);
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

        <SectionHeader icon="📝" title="Description & Metadata" subtitle="App Store listing copy and keywords" />

        <View style={styles.generateAllContainer}>
          <AnimatedPressable
            onPress={handleGenerateAllCopy}
            disabled={generatingAll}
            style={styles.generateAllButton}
          >
            {generatingAll
              ? <ActivityIndicator size="small" color={COLORS.primary} />
              : <Sparkles size={18} color={COLORS.primary} strokeWidth={2} />
            }
            <Text style={styles.generateAllText}>
              {generatingAll ? 'Generating...' : hasGeneratedAll ? `✓ Regenerate Copy` : `Generate All Copy for ${projectName}`}
            </Text>
          </AnimatedPressable>
        </View>

        <View style={styles.form}>
          {/* Description */}
          <View style={styles.aiFieldContainer}>
            <View style={styles.aiFieldHeader}>
              <Text style={styles.fieldLabel}>App Description <Text style={styles.required}>*</Text></Text>
              <AnimatedPressable
                onPress={handleGenerateDescription}
                disabled={generatingDesc}
                style={styles.aiButton}
              >
                {generatingDesc
                  ? <ActivityIndicator size="small" color={COLORS.primary} />
                  : <Sparkles size={14} color={COLORS.primary} strokeWidth={2} />
                }
                <Text style={styles.aiButtonText}>{generatingDesc ? 'Generating...' : 'AI Generate'}</Text>
              </AnimatedPressable>
            </View>
            <FormField
              label=""
              placeholder="Describe your app to potential users..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={8}
              maxChars={4000}
              style={styles.multilineInput}
            />
          </View>

          <FormField
            label="Promotional Text"
            placeholder="A short promotional message (appears above description)"
            value={promoText}
            onChangeText={setPromoText}
            maxChars={170}
            multiline
            numberOfLines={3}
            style={styles.multilineInput}
          />

          <FormField
            label="Keywords"
            required
            placeholder="photo, editor, filter, camera, retouch"
            value={keywords}
            onChangeText={setKeywords}
            maxChars={100}
            hint="Comma-separated. 100 character total limit."
          />

          {/* What's New */}
          <View style={styles.aiFieldContainer}>
            <View style={styles.aiFieldHeader}>
              <Text style={styles.fieldLabel}>What's New in This Version</Text>
              <AnimatedPressable
                onPress={handleGenerateWhatsNew}
                disabled={generatingWhatsNew}
                style={styles.aiButton}
              >
                {generatingWhatsNew
                  ? <ActivityIndicator size="small" color={COLORS.primary} />
                  : <Sparkles size={14} color={COLORS.primary} strokeWidth={2} />
                }
                <Text style={styles.aiButtonText}>{generatingWhatsNew ? 'Generating...' : 'AI Generate'}</Text>
              </AnimatedPressable>
            </View>
            <FormField
              label=""
              placeholder="Describe what changed in this version..."
              value={whatsNew}
              onChangeText={setWhatsNew}
              multiline
              numberOfLines={5}
              maxChars={4000}
              style={styles.multilineInput}
            />
          </View>

          <FormField
            label="Support URL"
            required
            placeholder="https://yourapp.com/support"
            value={supportUrl}
            onChangeText={setSupportUrl}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <FormField
            label="Marketing URL (optional)"
            placeholder="https://yourapp.com"
            value={marketingUrl}
            onChangeText={setMarketingUrl}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <AnimatedPressable
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save metadata'}</Text>
        </AnimatedPressable>
      </ScrollView>

      {/* Floating AI Button */}
      <AnimatedPressable
        onPress={() => {
          console.log('[Metadata] AI Chat button pressed');
          setAIChatVisible(true);
        }}
        style={styles.aiFloatingButton}
      >
        <Sparkles size={22} color="#fff" strokeWidth={2} />
      </AnimatedPressable>

      <AIChatSheet
        visible={aiChatVisible}
        onClose={() => setAIChatVisible(false)}
        context={{ section: 'metadata', projectName: project?.name ?? 'Your App' }}
        suggestedQuestions={[
          'How do I write a great description?',
          'What are the best keyword strategies?',
          'What is promotional text used for?',
          'How long should my description be?',
        ]}
      />

      <Toast visible={toastVisible} message={toastMessage} type={toastType} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40, gap: 0 },
  generateAllContainer: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 0 },
  generateAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 4,
  },
  generateAllText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  form: { padding: 20, gap: 20 },
  aiFieldContainer: { gap: 8 },
  aiFieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 0.3, textTransform: 'uppercase' },
  required: { color: COLORS.danger },
  aiButton: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.primaryMuted, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  aiButtonText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  multilineInput: { minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },
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
