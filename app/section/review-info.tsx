import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useProjects } from '@/contexts/ProjectContext';
import { FormField } from '@/components/FormField';
import { SectionHeader } from '@/components/SectionHeader';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { AIChatSheet } from '@/components/AIChatSheet';
import { Toast, useToast } from '@/components/Toast';

export default function ReviewInfoScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProject, updateSection } = useProjects();
  const project = getProject(projectId);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const { visible: toastVisible, message: toastMessage, type: toastType, showToast } = useToast();
  const [aiChatVisible, setAIChatVisible] = useState(false);
  const [demoUsername, setDemoUsername] = useState('');
  const [demoPassword, setDemoPassword] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = project?.sections.reviewInfo.data;
    if (d) {
      setFirstName((d.firstName as string) || '');
      setLastName((d.lastName as string) || '');
      setPhone((d.phone as string) || '');
      setEmail((d.email as string) || '');
      setDemoUsername((d.demoUsername as string) || '');
      setDemoPassword((d.demoPassword as string) || '');
      setReviewNotes((d.reviewNotes as string) || '');
    }
  }, [projectId]);

  const handleSave = async () => {
    console.log('[ReviewInfo] Save button pressed for project:', projectId);
    setSaving(true);
    try {
      const isComplete = !!(firstName && lastName && phone && email);
      await updateSection(projectId, 'reviewInfo', {
        status: isComplete ? 'complete' : 'in_progress',
        data: { firstName, lastName, phone, email, demoUsername, demoPassword, reviewNotes },
        completedAt: isComplete ? new Date().toISOString() : undefined,
      });
      console.log('[ReviewInfo] Saved, status:', isComplete ? 'complete' : 'in_progress');
      showToast('✓ Saved');
      setTimeout(() => router.back(), 400);
    } catch (e) {
      console.error('[ReviewInfo] Save failed:', e);
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
        <SectionHeader icon="📦" title="App Review Information" subtitle="Contact details and instructions for Apple's review team" />

        <View style={styles.form}>
          <Text style={styles.groupLabel}>Contact Information</Text>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormField label="First Name" required placeholder="John" value={firstName} onChangeText={setFirstName} />
            </View>
            <View style={styles.halfField}>
              <FormField label="Last Name" required placeholder="Doe" value={lastName} onChangeText={setLastName} />
            </View>
          </View>
          <FormField
            label="Phone Number"
            required
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <FormField
            label="Email Address"
            required
            placeholder="review@yourcompany.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.divider}>
            <Text style={styles.groupLabel}>Demo Account (if required)</Text>
          </View>
          <FormField
            label="Demo Username"
            placeholder="demo@example.com"
            value={demoUsername}
            onChangeText={setDemoUsername}
            autoCapitalize="none"
            hint="Provide if your app requires login to access features"
          />
          <FormField
            label="Demo Password"
            placeholder="••••••••"
            value={demoPassword}
            onChangeText={setDemoPassword}
            secureTextEntry
          />

          <View style={styles.divider}>
            <Text style={styles.groupLabel}>Review Notes</Text>
          </View>
          <FormField
            label="Notes for Reviewer"
            placeholder="Explain any special instructions, features to test, or context that helps the reviewer understand your app..."
            value={reviewNotes}
            onChangeText={setReviewNotes}
            multiline
            numberOfLines={5}
            style={styles.multilineInput}
            hint="Tip: Mention any features that require specific steps to access"
          />
        </View>

        <AnimatedPressable
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save review info'}</Text>
        </AnimatedPressable>
      </ScrollView>

      <AnimatedPressable
        onPress={() => {
          console.log('[ReviewInfo] AI Chat button pressed');
          setAIChatVisible(true);
        }}
        style={styles.aiFloatingButton}
      >
        <Sparkles size={22} color="#fff" strokeWidth={2} />
      </AnimatedPressable>

      <AIChatSheet
        visible={aiChatVisible}
        onClose={() => setAIChatVisible(false)}
        context={{ section: 'review-info', projectName: project?.name ?? 'Your App' }}
        suggestedQuestions={[
          'Do I need a demo account?',
          'What should I write in review notes?',
          'What happens if I don\'t provide credentials?',
        ]}
      />
      <Toast visible={toastVisible} message={toastMessage} type={toastType} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40, gap: 0 },
  form: { padding: 20, gap: 16 },
  groupLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8 },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  divider: { borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: 16, marginTop: 4 },
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
