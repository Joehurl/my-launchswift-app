import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useProjects } from '@/contexts/ProjectContext';
import { FormField } from '@/components/FormField';
import { SectionHeader } from '@/components/SectionHeader';
import { AnimatedPressable } from '@/components/AnimatedPressable';

const MOCK_DESCRIPTION = `Transform your photos into stunning masterpieces with PhotoEdit Pro — the most powerful photo editing app for iPhone.

Whether you're a professional photographer or just getting started, PhotoEdit Pro gives you the tools to create breathtaking images. With over 200 filters, advanced retouching tools, and a non-destructive editing workflow, your creativity has no limits.

KEY FEATURES:
• Professional-grade editing tools: curves, levels, HSL, and more
• 200+ handcrafted filters inspired by film photography
• Advanced portrait retouching with AI-powered skin smoothing
• RAW file support for maximum image quality
• Batch editing to process multiple photos at once
• Seamless iCloud sync across all your devices

Whether you're editing portraits, landscapes, or street photography, PhotoEdit Pro has everything you need to take your images to the next level.`;

const MOCK_WHATS_NEW = `Version 2.0 brings a completely redesigned editing interface with faster performance and new creative tools:

• New: AI-powered sky replacement
• New: Advanced color grading with LUT support  
• Improved: 3x faster export speeds
• Fixed: Stability improvements for iPhone 15 Pro
• Fixed: RAW import issues with certain camera models`;

const MOCK_PROMO = `The most powerful photo editor for iPhone. Professional tools, stunning filters, zero compromises.`;

const MOCK_KEYWORDS = `photo editor, filters, retouch, camera, RAW, portrait, landscape, vintage, film, professional`;

export default function MetadataScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProject, updateSection } = useProjects();
  const project = getProject(projectId);

  const [description, setDescription] = useState('');
  const [promoText, setPromoText] = useState('');
  const [keywords, setKeywords] = useState('');
  const [whatsNew, setWhatsNew] = useState('');
  const [supportUrl, setSupportUrl] = useState('');
  const [marketingUrl, setMarketingUrl] = useState('');
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [generatingWhatsNew, setGeneratingWhatsNew] = useState(false);
  const [saving, setSaving] = useState(false);

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
    console.log('[Metadata] AI Generate description button pressed');
    setGeneratingDesc(true);
    setTimeout(() => {
      setDescription(MOCK_DESCRIPTION);
      setGeneratingDesc(false);
      console.log('[Metadata] AI description generated (mock)');
    }, 1500);
  };

  const handleGenerateWhatsNew = () => {
    console.log('[Metadata] AI Generate whats new button pressed');
    setGeneratingWhatsNew(true);
    setTimeout(() => {
      setWhatsNew(MOCK_WHATS_NEW);
      setGeneratingWhatsNew(false);
      console.log('[Metadata] AI whats new generated (mock)');
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
      router.back();
    } catch (e) {
      console.error('[Metadata] Save failed:', e);
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40, gap: 0 },
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
});
