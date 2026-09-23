import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, Info } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useProjects } from '@/contexts/ProjectContext';
import { SectionHeader } from '@/components/SectionHeader';
import { AnimatedPressable } from '@/components/AnimatedPressable';

interface DeviceSize {
  label: string;
  required: boolean;
  aspectRatio: number;
  slots: number;
  dimensions: string;
}

const DEVICE_SIZES: DeviceSize[] = [
  { label: 'iPhone 6.9"', required: true, aspectRatio: 9 / 19.5, slots: 3, dimensions: '1320 × 2868 px' },
  { label: 'iPhone 6.5"', required: true, aspectRatio: 9 / 19.5, slots: 3, dimensions: '1242 × 2688 px' },
  { label: 'iPhone 5.5"', required: false, aspectRatio: 9 / 16, slots: 3, dimensions: '1242 × 2208 px' },
  { label: 'iPad Pro 13"', required: false, aspectRatio: 3 / 4, slots: 3, dimensions: '2048 × 2732 px' },
  { label: 'iPad Pro 11"', required: false, aspectRatio: 3 / 4, slots: 3, dimensions: '1668 × 2388 px' },
];

function ScreenshotSlot({ aspectRatio, onPress }: { aspectRatio: number; onPress: () => void }) {
  const width = 80;
  const height = width / aspectRatio;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.slot, { width, height }]}
    >
      <Plus size={20} color={COLORS.textTertiary} strokeWidth={2} />
      <Text style={styles.slotLabel}>Add</Text>
    </TouchableOpacity>
  );
}

function DeviceSection({ device }: { device: DeviceSize }) {
  const handleSlotPress = () => {
    console.log(`[Screenshots] Screenshot slot tapped for ${device.label}`);
    Alert.alert(
      'Add Screenshot',
      'In a full implementation, this would open the image picker to select a screenshot for this device size.',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  return (
    <View style={styles.deviceSection}>
      <View style={styles.deviceHeader}>
        <View style={styles.deviceTitleRow}>
          <Text style={styles.deviceLabel}>{device.label}</Text>
          {device.required && (
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredBadgeText}>Required</Text>
            </View>
          )}
        </View>
        <Text style={styles.deviceDimensions}>{device.dimensions}</Text>
      </View>
      <View style={styles.slotsRow}>
        {Array.from({ length: device.slots }).map((_, i) => (
          <ScreenshotSlot key={i} aspectRatio={device.aspectRatio} onPress={handleSlotPress} />
        ))}
      </View>
    </View>
  );
}

export default function ScreenshotsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { updateSection } = useProjects();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    console.log('[Screenshots] Save button pressed for project:', projectId);
    setSaving(true);
    try {
      await updateSection(projectId, 'screenshots', {
        status: 'in_progress',
        data: { uploaded: 0 },
      });
      router.back();
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
        <SectionHeader icon="🖼️" title="Screenshots & Previews" subtitle="Upload screenshots for all required device sizes" />

        {/* Requirements Card */}
        <View style={styles.requirementsCard}>
          <View style={styles.requirementsHeader}>
            <Info size={16} color={COLORS.primary} strokeWidth={2} />
            <Text style={styles.requirementsTitle}>Screenshot Requirements</Text>
          </View>
          <View style={styles.requirementsList}>
            {[
              'PNG or JPEG format (no alpha channel)',
              'Minimum 72 DPI resolution',
              'Must match exact device dimensions',
              'No rounded corners or device frames required',
              'Up to 10 screenshots per device size',
            ].map((req, i) => (
              <View key={i} style={styles.requirementItem}>
                <View style={styles.bullet} />
                <Text style={styles.requirementText}>{req}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Device Sections */}
        <View style={styles.devicesContainer}>
          {DEVICE_SIZES.map((device, i) => (
            <React.Fragment key={device.label}>
              {i > 0 && <View style={styles.divider} />}
              <DeviceSection device={device} />
            </React.Fragment>
          ))}
        </View>

        <AnimatedPressable
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save screenshots'}</Text>
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40, gap: 0 },
  requirementsCard: {
    margin: 20,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    gap: 10,
  },
  requirementsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  requirementsTitle: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  requirementsList: { gap: 6 },
  requirementItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.textSecondary, marginTop: 7 },
  requirementText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  devicesContainer: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  deviceSection: { padding: 16, gap: 12 },
  deviceHeader: { gap: 3 },
  deviceTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deviceLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  requiredBadge: { backgroundColor: COLORS.dangerMuted, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  requiredBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.danger, textTransform: 'uppercase', letterSpacing: 0.3 },
  deviceDimensions: { fontSize: 12, color: COLORS.textTertiary, fontFamily: 'SpaceMono' },
  slotsRow: { flexDirection: 'row', gap: 10 },
  slot: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    gap: 4,
  },
  slotLabel: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: 16 },
  saveButton: { margin: 20, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
