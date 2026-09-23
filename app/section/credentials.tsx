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
import * as SecureStore from 'expo-secure-store';
import { Shield, Eye, EyeOff, ExternalLink } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useProjects } from '@/contexts/ProjectContext';
import { FormField } from '@/components/FormField';
import { SectionHeader } from '@/components/SectionHeader';
import { AnimatedPressable } from '@/components/AnimatedPressable';

export default function CredentialsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProject, updateSection } = useProjects();
  const project = getProject(projectId);

  const [appleId, setAppleId] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [teamId, setTeamId] = useState('');
  const [apiKeyId, setApiKeyId] = useState('');
  const [issuerId, setIssuerId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project?.sections.credentials.data) {
      const d = project.sections.credentials.data;
      setAppleId((d.appleId as string) || '');
      setTeamId((d.teamId as string) || '');
      setApiKeyId((d.apiKeyId as string) || '');
      setIssuerId((d.issuerId as string) || '');
    }
    // Load secure data
    SecureStore.getItemAsync(`credentials_${projectId}_password`).then(val => {
      if (val) setAppPassword(val);
    });
  }, [projectId]);

  const handleSave = async () => {
    console.log('[Credentials] Save button pressed for project:', projectId);
    if (!appleId.trim()) {
      Alert.alert('Missing field', 'Apple ID is required');
      return;
    }
    setSaving(true);
    try {
      // Store password securely
      if (appPassword) {
        await SecureStore.setItemAsync(`credentials_${projectId}_password`, appPassword);
        console.log('[Credentials] App-specific password saved to SecureStore');
      }
      const isComplete = !!(appleId && teamId);
      await updateSection(projectId, 'credentials', {
        status: isComplete ? 'complete' : 'in_progress',
        data: { appleId, teamId, apiKeyId, issuerId },
        completedAt: isComplete ? new Date().toISOString() : undefined,
      });
      console.log('[Credentials] Section saved, status:', isComplete ? 'complete' : 'in_progress');
      router.back();
    } catch (e) {
      console.error('[Credentials] Save failed:', e);
      Alert.alert('Save failed', 'Could not save credentials. Please try again.');
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
        <SectionHeader
          icon="🔐"
          title="Credentials"
          subtitle="Your App Store Connect login details, stored securely on-device"
        />

        <View style={styles.form}>
          <FormField
            label="Apple ID"
            required
            placeholder="developer@example.com"
            value={appleId}
            onChangeText={setAppleId}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.passwordField}>
            <FormField
              label="App-Specific Password"
              placeholder="xxxx-xxxx-xxxx-xxxx"
              value={appPassword}
              onChangeText={setAppPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              hint="Generate at appleid.apple.com → Security → App-Specific Passwords"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => {
                console.log('[Credentials] Toggle password visibility');
                setShowPassword(!showPassword);
              }}
            >
              {showPassword
                ? <EyeOff size={18} color={COLORS.textSecondary} strokeWidth={2} />
                : <Eye size={18} color={COLORS.textSecondary} strokeWidth={2} />
              }
            </TouchableOpacity>
          </View>

          <FormField
            label="Team ID"
            required
            placeholder="ABC123XYZ"
            value={teamId}
            onChangeText={setTeamId}
            autoCapitalize="characters"
            autoCorrect={false}
            monospace
            hint="Found in App Store Connect → Membership"
          />

          <View style={styles.divider}>
            <Text style={styles.dividerLabel}>Optional — API Key (for automation)</Text>
          </View>

          <FormField
            label="API Key ID"
            placeholder="XXXXXXXXXX"
            value={apiKeyId}
            onChangeText={setApiKeyId}
            autoCapitalize="characters"
            autoCorrect={false}
            monospace
          />

          <FormField
            label="Issuer ID"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={issuerId}
            onChangeText={setIssuerId}
            autoCapitalize="none"
            autoCorrect={false}
            monospace
          />

          <View style={styles.filePickerPlaceholder}>
            <Text style={styles.filePickerLabel}>Private Key (.p8 file)</Text>
            <AnimatedPressable
              onPress={() => {
                console.log('[Credentials] File picker tapped (placeholder)');
                Alert.alert('File Picker', 'In a full implementation, this would open the document picker to select your .p8 private key file.');
              }}
              style={styles.filePickerButton}
            >
              <Text style={styles.filePickerButtonText}>Choose .p8 file</Text>
            </AnimatedPressable>
          </View>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Shield size={16} color={COLORS.accent} strokeWidth={2} />
          <Text style={styles.securityText}>
            Credentials are stored securely on your device using iOS Keychain (SecureStore). They are never transmitted to any server.
          </Text>
        </View>

        <AnimatedPressable
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save credentials'}</Text>
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 0,
  },
  form: {
    padding: 20,
    gap: 20,
  },
  passwordField: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    bottom: 13,
    padding: 4,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 16,
  },
  dividerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filePickerPlaceholder: {
    gap: 8,
  },
  filePickerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  filePickerButton: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  filePickerButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  securityNote: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginHorizontal: 20,
    backgroundColor: COLORS.accentMuted,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  saveButton: {
    margin: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
