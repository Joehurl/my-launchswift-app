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
import { Plus, Trash2, ShoppingCart, Sparkles } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useProjects } from '@/contexts/ProjectContext';
import { FormField } from '@/components/FormField';
import { SectionHeader } from '@/components/SectionHeader';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { AIChatSheet } from '@/components/AIChatSheet';
import { Toast, useToast } from '@/components/Toast';

interface IAP {
  id: string;
  productId: string;
  type: 'consumable' | 'non_consumable' | 'non_renewing';
  referenceName: string;
  price: string;
  displayName: string;
  description: string;
}

const IAP_TYPES = [
  { key: 'consumable', label: 'Consumable', desc: 'Can be purchased multiple times' },
  { key: 'non_consumable', label: 'Non-Consumable', desc: 'Purchased once, permanent' },
  { key: 'non_renewing', label: 'Non-Renewing Subscription', desc: 'Fixed duration, manual renewal' },
] as const;

const PRICES = ['$0.99', '$1.99', '$2.99', '$4.99', '$9.99', '$14.99', '$19.99', '$29.99', '$49.99', '$99.99'];

function IAPForm({ onAdd, onCancel }: { onAdd: (iap: IAP) => void; onCancel: () => void }) {
  const [productId, setProductId] = useState('');
  const [type, setType] = useState<IAP['type']>('consumable');
  const [referenceName, setReferenceName] = useState('');
  const [price, setPrice] = useState('$0.99');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    console.log('[IAP] Add IAP button pressed, productId:', productId);
    if (!productId || !referenceName || !displayName) {
      Alert.alert('Missing fields', 'Product ID, reference name, and display name are required');
      return;
    }
    onAdd({ id: Date.now().toString(), productId, type, referenceName, price, displayName, description });
  };

  return (
    <View style={styles.iapForm}>
      <Text style={styles.formTitle}>New In-App Purchase</Text>
      <FormField label="Product ID" required placeholder="com.app.coins_100" value={productId} onChangeText={setProductId} autoCapitalize="none" monospace />
      <FormField label="Reference Name" required placeholder="100 Coins Pack" value={referenceName} onChangeText={setReferenceName} />
      <View style={styles.typeSection}>
        <Text style={styles.typeLabel}>Type</Text>
        {IAP_TYPES.map(t => (
          <AnimatedPressable
            key={t.key}
            onPress={() => {
              console.log('[IAP] Type selected:', t.key);
              setType(t.key);
            }}
            style={[styles.typeOption, type === t.key && styles.typeOptionActive]}
          >
            <View style={[styles.radioOuter, type === t.key && styles.radioOuterActive]}>
              {type === t.key && <View style={styles.radioInner} />}
            </View>
            <View style={styles.typeText}>
              <Text style={[styles.typeOptionLabel, type === t.key && styles.typeOptionLabelActive]}>{t.label}</Text>
              <Text style={styles.typeOptionDesc}>{t.desc}</Text>
            </View>
          </AnimatedPressable>
        ))}
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.typeLabel}>Price</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.priceChips}>
          {PRICES.map(p => (
            <AnimatedPressable key={p} onPress={() => setPrice(p)} style={[styles.priceChip, price === p && styles.priceChipActive]}>
              <Text style={[styles.priceChipText, price === p && styles.priceChipTextActive]}>{p}</Text>
            </AnimatedPressable>
          ))}
        </ScrollView>
      </View>
      <FormField label="Display Name" required placeholder="100 Coins" value={displayName} onChangeText={setDisplayName} maxChars={30} />
      <FormField label="Description" placeholder="Get 100 coins to spend in the app" value={description} onChangeText={setDescription} maxChars={45} />
      <View style={styles.formButtons}>
        <AnimatedPressable onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </AnimatedPressable>
        <AnimatedPressable onPress={handleAdd} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add IAP</Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const TYPE_LABELS: Record<IAP['type'], string> = {
  consumable: 'Consumable',
  non_consumable: 'Non-Consumable',
  non_renewing: 'Non-Renewing',
};

export default function IAPScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProject, updateSection } = useProjects();
  const project = getProject(projectId);
  const { visible: toastVisible, message: toastMessage, type: toastType, showToast } = useToast();
  const [aiChatVisible, setAIChatVisible] = useState(false);

  const [iaps, setIaps] = useState<IAP[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = project?.sections.iap.data;
    if (d?.iaps) setIaps(d.iaps as IAP[]);
  }, [projectId]);

  const handleAdd = (iap: IAP) => {
    console.log('[IAP] New IAP added:', iap.productId);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIaps(prev => [...prev, iap]);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    console.log('[IAP] Delete IAP pressed:', id);
    Alert.alert('Delete IAP', 'Remove this in-app purchase?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIaps(prev => prev.filter(i => i.id !== id));
        }
      },
    ]);
  };

  const handleSave = async () => {
    console.log('[IAP] Save button pressed, IAP count:', iaps.length);
    setSaving(true);
    try {
      await updateSection(projectId, 'iap', {
        status: iaps.length > 0 ? 'complete' : 'empty',
        data: { iaps },
        completedAt: iaps.length > 0 ? new Date().toISOString() : undefined,
      });
      showToast('✓ Saved');
      setTimeout(() => router.back(), 400);
    } catch (e) {
      console.error('[IAP] Save failed:', e);
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
        <SectionHeader icon="🛒" title="In-App Purchases" subtitle="Consumables, non-consumables, and non-renewing subscriptions" />

        <View style={styles.content}>
          {iaps.length === 0 && !showForm ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <ShoppingCart size={28} color={COLORS.textTertiary} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No in-app purchases</Text>
              <Text style={styles.emptyDesc}>Add consumables, non-consumables, or non-renewing subscriptions</Text>
            </View>
          ) : (
            <View style={styles.iapList}>
              {iaps.map(iap => (
                <View key={iap.id} style={styles.iapCard}>
                  <View style={styles.iapCardContent}>
                    <View style={styles.iapCardHeader}>
                      <Text style={styles.iapProductId} numberOfLines={1}>{iap.productId}</Text>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>{TYPE_LABELS[iap.type]}</Text>
                      </View>
                    </View>
                    <Text style={styles.iapDisplayName}>{iap.displayName}</Text>
                    <Text style={styles.iapPrice}>{iap.price}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(iap.id)}
                    style={styles.deleteButton}
                    accessibilityLabel="Delete IAP"
                  >
                    <Trash2 size={16} color={COLORS.danger} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {showForm ? (
            <IAPForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
          ) : (
            <AnimatedPressable
              onPress={() => {
                console.log('[IAP] Add IAP button pressed');
                setShowForm(true);
              }}
              style={styles.addIapButton}
            >
              <Plus size={18} color={COLORS.primary} strokeWidth={2.5} />
              <Text style={styles.addIapButtonText}>Add in-app purchase</Text>
            </AnimatedPressable>
          )}
        </View>

        <AnimatedPressable
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save IAPs'}</Text>
        </AnimatedPressable>
      </ScrollView>

      <AnimatedPressable
        onPress={() => {
          console.log('[IAP] AI Chat button pressed');
          setAIChatVisible(true);
        }}
        style={styles.aiFloatingButton}
      >
        <Sparkles size={22} color="#fff" strokeWidth={2} />
      </AnimatedPressable>

      <AIChatSheet
        visible={aiChatVisible}
        onClose={() => setAIChatVisible(false)}
        context={{ section: 'iap', projectName: project?.name ?? 'Your App' }}
        suggestedQuestions={[
          'Consumable vs non-consumable — what\'s the difference?',
          'How should I price my IAPs?',
          'What is a subscription group?',
          'Do I need a Restore Purchases button?',
        ]}
      />
      <Toast visible={toastVisible} message={toastMessage} type={toastType} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40, gap: 0 },
  content: { padding: 20, gap: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyIcon: { width: 60, height: 60, borderRadius: 16, backgroundColor: COLORS.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  emptyDesc: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', maxWidth: 260, lineHeight: 18 },
  iapList: { gap: 10 },
  iapCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  iapCardContent: { flex: 1, gap: 4 },
  iapCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iapProductId: { flex: 1, fontSize: 13, color: COLORS.textSecondary, fontFamily: 'SpaceMono' },
  typeBadge: { backgroundColor: COLORS.primaryMuted, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  typeBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase' },
  iapDisplayName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  iapPrice: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
  deleteButton: { padding: 8 },
  addIapButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.surfaceSecondary, borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  addIapButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
  iapForm: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 16 },
  formTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  typeSection: { gap: 8 },
  typeLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 0.3, textTransform: 'uppercase' },
  typeOption: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: COLORS.surfaceSecondary, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  typeOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryMuted },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: COLORS.primary },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  typeText: { flex: 1 },
  typeOptionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  typeOptionLabelActive: { color: COLORS.primary },
  typeOptionDesc: { fontSize: 11, color: COLORS.textSecondary },
  priceRow: { gap: 8 },
  priceChips: { gap: 8, paddingVertical: 2 },
  priceChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.surfaceSecondary, borderWidth: 1, borderColor: COLORS.border },
  priceChipActive: { backgroundColor: COLORS.primaryMuted, borderColor: COLORS.primary },
  priceChipText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  priceChipTextActive: { color: COLORS.primary, fontWeight: '600' },
  formButtons: { flexDirection: 'row', gap: 10 },
  cancelButton: { flex: 1, backgroundColor: COLORS.surfaceSecondary, borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  addButton: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  addButtonText: { fontSize: 14, fontWeight: '700', color: '#fff' },
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
