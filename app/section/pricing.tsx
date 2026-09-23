import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { useProjects } from '@/contexts/ProjectContext';
import { SectionHeader } from '@/components/SectionHeader';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Check } from 'lucide-react-native';

const PRICE_TIERS = ['$0.99', '$1.99', '$2.99', '$4.99', '$9.99', '$14.99', '$19.99', '$29.99', '$49.99', '$99.99'];
const RELEASE_TYPES = [
  { key: 'automatic', label: 'Automatically release', desc: 'Released as soon as approved' },
  { key: 'manual', label: 'Manually release', desc: 'You control when it goes live' },
  { key: 'scheduled', label: 'Scheduled release', desc: 'Set a specific date and time' },
];

export default function PricingScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProject, updateSection } = useProjects();
  const project = getProject(projectId);

  const [priceTier, setPriceTier] = useState<'free' | 'paid'>('free');
  const [selectedPrice, setSelectedPrice] = useState('$0.99');
  const [releaseType, setReleaseType] = useState('automatic');
  const [allCountries, setAllCountries] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = project?.sections.pricing.data;
    if (d) {
      setPriceTier((d.priceTier as 'free' | 'paid') || 'free');
      setSelectedPrice((d.price as string) || '$0.99');
      setReleaseType((d.releaseType as string) || 'automatic');
      setAllCountries(d.allCountries !== false);
    }
  }, [projectId]);

  const handleSave = async () => {
    console.log('[Pricing] Save button pressed for project:', projectId);
    setSaving(true);
    try {
      await updateSection(projectId, 'pricing', {
        status: 'complete',
        data: { priceTier, price: priceTier === 'paid' ? selectedPrice : 'Free', releaseType, allCountries },
        completedAt: new Date().toISOString(),
      });
      console.log('[Pricing] Saved successfully');
      router.back();
    } catch (e) {
      console.error('[Pricing] Save failed:', e);
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
        <SectionHeader icon="💰" title="Pricing & Availability" subtitle="Set your app's price, release strategy, and territories" />

        <View style={styles.form}>
          {/* Price Tier */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Price Tier</Text>
            <View style={styles.segmentedControl}>
              {(['free', 'paid'] as const).map(tier => (
                <AnimatedPressable
                  key={tier}
                  onPress={() => {
                    console.log('[Pricing] Price tier selected:', tier);
                    setPriceTier(tier);
                  }}
                  style={[styles.segment, priceTier === tier && styles.segmentActive]}
                >
                  <Text style={[styles.segmentText, priceTier === tier && styles.segmentTextActive]}>
                    {tier === 'free' ? 'Free' : 'Paid'}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
          </View>

          {/* Price Picker */}
          {priceTier === 'paid' && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Price</Text>
              <View style={styles.priceGrid}>
                {PRICE_TIERS.map(price => (
                  <AnimatedPressable
                    key={price}
                    onPress={() => {
                      console.log('[Pricing] Price selected:', price);
                      setSelectedPrice(price);
                    }}
                    style={[styles.priceChip, selectedPrice === price && styles.priceChipActive]}
                  >
                    <Text style={[styles.priceChipText, selectedPrice === price && styles.priceChipTextActive]}>
                      {price}
                    </Text>
                    {selectedPrice === price && (
                      <Check size={12} color={COLORS.primary} strokeWidth={2.5} />
                    )}
                  </AnimatedPressable>
                ))}
              </View>
            </View>
          )}

          {/* Release Type */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Release Date</Text>
            <View style={styles.releaseOptions}>
              {RELEASE_TYPES.map(type => (
                <AnimatedPressable
                  key={type.key}
                  onPress={() => {
                    console.log('[Pricing] Release type selected:', type.key);
                    setReleaseType(type.key);
                  }}
                  style={[styles.releaseOption, releaseType === type.key && styles.releaseOptionActive]}
                >
                  <View style={[styles.radioOuter, releaseType === type.key && styles.radioOuterActive]}>
                    {releaseType === type.key && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.releaseOptionText}>
                    <Text style={[styles.releaseOptionLabel, releaseType === type.key && styles.releaseOptionLabelActive]}>
                      {type.label}
                    </Text>
                    <Text style={styles.releaseOptionDesc}>{type.desc}</Text>
                  </View>
                </AnimatedPressable>
              ))}
            </View>
          </View>

          {/* Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Availability</Text>
            <View style={styles.availabilityRow}>
              <View style={styles.availabilityText}>
                <Text style={styles.availabilityLabel}>All Countries & Regions</Text>
                <Text style={styles.availabilityDesc}>Make your app available worldwide</Text>
              </View>
              <Switch
                value={allCountries}
                onValueChange={val => {
                  console.log('[Pricing] All countries toggle:', val);
                  setAllCountries(val);
                }}
                trackColor={{ false: COLORS.surfaceElevated, true: COLORS.primary }}
                thumbColor="#fff"
              />
            </View>
            {!allCountries && (
              <View style={styles.countryNote}>
                <Text style={styles.countryNoteText}>
                  In a full implementation, you would select specific countries from a list of 175+ territories.
                </Text>
              </View>
            )}
          </View>
        </View>

        <AnimatedPressable
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save pricing'}</Text>
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40, gap: 0 },
  form: { padding: 20, gap: 24 },
  section: { gap: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 0.3, textTransform: 'uppercase' },
  segmentedControl: { flexDirection: 'row', backgroundColor: COLORS.surfaceSecondary, borderRadius: 10, padding: 3, borderWidth: 1, borderColor: COLORS.border },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentActive: { backgroundColor: COLORS.primary },
  segmentText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  segmentTextActive: { color: '#fff' },
  priceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  priceChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: COLORS.surfaceSecondary, borderWidth: 1, borderColor: COLORS.border },
  priceChipActive: { backgroundColor: COLORS.primaryMuted, borderColor: COLORS.primary },
  priceChipText: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  priceChipTextActive: { color: COLORS.primary, fontWeight: '600' },
  releaseOptions: { gap: 8 },
  releaseOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  releaseOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryMuted },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  releaseOptionText: { flex: 1, gap: 2 },
  releaseOptionLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  releaseOptionLabelActive: { color: COLORS.primary },
  releaseOptionDesc: { fontSize: 12, color: COLORS.textSecondary },
  availabilityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  availabilityText: { flex: 1, gap: 2 },
  availabilityLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  availabilityDesc: { fontSize: 12, color: COLORS.textSecondary },
  countryNote: { backgroundColor: COLORS.warningMuted, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.warning + '30' },
  countryNoteText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  saveButton: { margin: 20, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
