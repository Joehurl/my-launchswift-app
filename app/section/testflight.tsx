import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  LayoutAnimation,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, Trash2, Users } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useProjects } from '@/contexts/ProjectContext';
import { FormField } from '@/components/FormField';
import { SectionHeader } from '@/components/SectionHeader';
import { AnimatedPressable } from '@/components/AnimatedPressable';

interface BetaGroup {
  id: string;
  name: string;
  testerCount: number;
}

export default function TestFlightScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProject, updateSection } = useProjects();
  const project = getProject(projectId);

  const [betaDescription, setBetaDescription] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [whatToTest, setWhatToTest] = useState('');
  const [buildNotes, setBuildNotes] = useState('');
  const [groups, setGroups] = useState<BetaGroup[]>([]);
  const [testerEmails, setTesterEmails] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newTesterEmail, setNewTesterEmail] = useState('');
  const [showGroupInput, setShowGroupInput] = useState(false);
  const [showTesterInput, setShowTesterInput] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = project?.sections.testflight.data;
    if (d) {
      setBetaDescription((d.betaDescription as string) || '');
      setFeedbackEmail((d.feedbackEmail as string) || '');
      setWhatToTest((d.whatToTest as string) || '');
      setBuildNotes((d.buildNotes as string) || '');
      setGroups((d.groups as BetaGroup[]) || []);
      setTesterEmails((d.testerEmails as string[]) || []);
    }
  }, [projectId]);

  const handleAddGroup = () => {
    console.log('[TestFlight] Add group pressed:', newGroupName);
    if (!newGroupName.trim()) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setGroups(prev => [...prev, { id: Date.now().toString(), name: newGroupName.trim(), testerCount: 0 }]);
    setNewGroupName('');
    setShowGroupInput(false);
  };

  const handleAddTester = () => {
    console.log('[TestFlight] Add tester pressed:', newTesterEmail);
    if (!newTesterEmail.trim() || !newTesterEmail.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address');
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTesterEmails(prev => [...prev, newTesterEmail.trim()]);
    setNewTesterEmail('');
    setShowTesterInput(false);
  };

  const handleDeleteGroup = (id: string) => {
    console.log('[TestFlight] Delete group:', id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  const handleDeleteTester = (email: string) => {
    console.log('[TestFlight] Delete tester:', email);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTesterEmails(prev => prev.filter(e => e !== email));
  };

  const handleSave = async () => {
    console.log('[TestFlight] Save pressed for project:', projectId);
    setSaving(true);
    try {
      const isComplete = !!(betaDescription && feedbackEmail && whatToTest);
      await updateSection(projectId, 'testflight', {
        status: isComplete ? 'complete' : 'in_progress',
        data: { betaDescription, feedbackEmail, whatToTest, buildNotes, groups, testerEmails },
        completedAt: isComplete ? new Date().toISOString() : undefined,
      });
      console.log('[TestFlight] Saved, status:', isComplete ? 'complete' : 'in_progress');
      router.back();
    } catch (e) {
      console.error('[TestFlight] Save failed:', e);
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
        <SectionHeader icon="🧪" title="TestFlight Setup" subtitle="Configure beta testing before App Store submission" />

        <View style={styles.form}>
          <FormField
            label="Beta App Description"
            required
            placeholder="Describe your app for beta testers..."
            value={betaDescription}
            onChangeText={setBetaDescription}
            multiline
            numberOfLines={4}
            style={styles.multiline}
          />
          <FormField
            label="Feedback Email"
            required
            placeholder="beta@yourapp.com"
            value={feedbackEmail}
            onChangeText={setFeedbackEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormField
            label="What to Test"
            required
            placeholder="Focus on the new onboarding flow, especially the photo import feature..."
            value={whatToTest}
            onChangeText={setWhatToTest}
            multiline
            numberOfLines={4}
            style={styles.multiline}
          />
          <FormField
            label="Build Notes"
            placeholder="What changed in this build..."
            value={buildNotes}
            onChangeText={setBuildNotes}
            multiline
            numberOfLines={3}
            style={styles.multiline}
          />

          {/* Beta Groups */}
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Beta Groups</Text>
              <AnimatedPressable
                onPress={() => {
                  console.log('[TestFlight] Add group button pressed');
                  setShowGroupInput(true);
                }}
                style={styles.listAddButton}
              >
                <Plus size={14} color={COLORS.primary} strokeWidth={2.5} />
                <Text style={styles.listAddButtonText}>Add group</Text>
              </AnimatedPressable>
            </View>
            {groups.map(group => (
              <View key={group.id} style={styles.listItem}>
                <Users size={16} color={COLORS.textSecondary} strokeWidth={2} />
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemLabel}>{group.name}</Text>
                  <Text style={styles.listItemMeta}>{group.testerCount} testers · Invite link pending</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteGroup(group.id)} accessibilityLabel="Delete group">
                  <Trash2 size={14} color={COLORS.danger} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            ))}
            {showGroupInput && (
              <View style={styles.inlineInput}>
                <FormField label="" placeholder="Group name (e.g. Internal Testers)" value={newGroupName} onChangeText={setNewGroupName} />
                <View style={styles.inlineButtons}>
                  <AnimatedPressable onPress={() => setShowGroupInput(false)} style={styles.inlineCancelBtn}>
                    <Text style={styles.inlineCancelText}>Cancel</Text>
                  </AnimatedPressable>
                  <AnimatedPressable onPress={handleAddGroup} style={styles.inlineAddBtn}>
                    <Text style={styles.inlineAddText}>Add group</Text>
                  </AnimatedPressable>
                </View>
              </View>
            )}
          </View>

          {/* Tester Emails */}
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Individual Testers</Text>
              <AnimatedPressable
                onPress={() => {
                  console.log('[TestFlight] Add tester button pressed');
                  setShowTesterInput(true);
                }}
                style={styles.listAddButton}
              >
                <Plus size={14} color={COLORS.primary} strokeWidth={2.5} />
                <Text style={styles.listAddButtonText}>Add tester</Text>
              </AnimatedPressable>
            </View>
            {testerEmails.map(email => (
              <View key={email} style={styles.listItem}>
                <View style={styles.emailDot} />
                <Text style={styles.listItemLabel}>{email}</Text>
                <TouchableOpacity onPress={() => handleDeleteTester(email)} accessibilityLabel="Remove tester">
                  <Trash2 size={14} color={COLORS.danger} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            ))}
            {showTesterInput && (
              <View style={styles.inlineInput}>
                <FormField label="" placeholder="tester@example.com" value={newTesterEmail} onChangeText={setNewTesterEmail} keyboardType="email-address" autoCapitalize="none" />
                <View style={styles.inlineButtons}>
                  <AnimatedPressable onPress={() => setShowTesterInput(false)} style={styles.inlineCancelBtn}>
                    <Text style={styles.inlineCancelText}>Cancel</Text>
                  </AnimatedPressable>
                  <AnimatedPressable onPress={handleAddTester} style={styles.inlineAddBtn}>
                    <Text style={styles.inlineAddText}>Add tester</Text>
                  </AnimatedPressable>
                </View>
              </View>
            )}
          </View>
        </View>

        <AnimatedPressable
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save TestFlight setup'}</Text>
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40, gap: 0 },
  form: { padding: 20, gap: 20 },
  multiline: { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 },
  listSection: { gap: 10 },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  listTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3 },
  listAddButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primaryMuted, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  listAddButtonText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  listItemContent: { flex: 1, gap: 2 },
  listItemLabel: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  listItemMeta: { fontSize: 12, color: COLORS.textSecondary },
  emailDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  inlineInput: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  inlineButtons: { flexDirection: 'row', gap: 8 },
  inlineCancelBtn: { flex: 1, backgroundColor: COLORS.surfaceSecondary, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  inlineCancelText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  inlineAddBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  inlineAddText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  saveButton: { margin: 20, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
