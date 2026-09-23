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
import { Plus, Trash2, Layers } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useProjects } from '@/contexts/ProjectContext';
import { FormField } from '@/components/FormField';
import { SectionHeader } from '@/components/SectionHeader';
import { AnimatedPressable } from '@/components/AnimatedPressable';

interface SubscriptionProduct {
  id: string;
  duration: string;
  price: string;
  freeTrial: string;
  displayName: string;
  description: string;
}

interface SubscriptionGroup {
  id: string;
  name: string;
  products: SubscriptionProduct[];
}

const DURATIONS = ['Weekly', 'Monthly', '3 Months', '6 Months', 'Yearly'];
const PRICES = ['$0.99', '$1.99', '$2.99', '$4.99', '$9.99', '$14.99', '$19.99', '$29.99', '$49.99', '$99.99'];
const FREE_TRIALS = ['None', '3 days', '7 days', '1 month', '3 months'];

function ProductForm({ onAdd, onCancel }: { onAdd: (p: SubscriptionProduct) => void; onCancel: () => void }) {
  const [duration, setDuration] = useState('Monthly');
  const [price, setPrice] = useState('$4.99');
  const [freeTrial, setFreeTrial] = useState('None');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    console.log('[Subscriptions] Add product pressed, duration:', duration);
    if (!displayName) {
      Alert.alert('Missing field', 'Display name is required');
      return;
    }
    onAdd({ id: Date.now().toString(), duration, price, freeTrial, displayName, description });
  };

  return (
    <View style={styles.productForm}>
      <Text style={styles.formTitle}>New Subscription</Text>
      <View style={styles.chipSection}>
        <Text style={styles.chipLabel}>Duration</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {DURATIONS.map(d => (
            <AnimatedPressable key={d} onPress={() => setDuration(d)} style={[styles.chip, duration === d && styles.chipActive]}>
              <Text style={[styles.chipText, duration === d && styles.chipTextActive]}>{d}</Text>
            </AnimatedPressable>
          ))}
        </ScrollView>
      </View>
      <View style={styles.chipSection}>
        <Text style={styles.chipLabel}>Price</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {PRICES.map(p => (
            <AnimatedPressable key={p} onPress={() => setPrice(p)} style={[styles.chip, price === p && styles.chipActive]}>
              <Text style={[styles.chipText, price === p && styles.chipTextActive]}>{p}</Text>
            </AnimatedPressable>
          ))}
        </ScrollView>
      </View>
      <View style={styles.chipSection}>
        <Text style={styles.chipLabel}>Free Trial</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FREE_TRIALS.map(t => (
            <AnimatedPressable key={t} onPress={() => setFreeTrial(t)} style={[styles.chip, freeTrial === t && styles.chipActive]}>
              <Text style={[styles.chipText, freeTrial === t && styles.chipTextActive]}>{t}</Text>
            </AnimatedPressable>
          ))}
        </ScrollView>
      </View>
      <FormField label="Display Name" required placeholder="Monthly Premium" value={displayName} onChangeText={setDisplayName} maxChars={30} />
      <FormField label="Description" placeholder="Full access to all features" value={description} onChangeText={setDescription} maxChars={45} />
      <View style={styles.formButtons}>
        <AnimatedPressable onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </AnimatedPressable>
        <AnimatedPressable onPress={handleAdd} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add subscription</Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}

export default function SubscriptionsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProject, updateSection } = useProjects();
  const project = getProject(projectId);

  const [groups, setGroups] = useState<SubscriptionGroup[]>([]);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [addingProductToGroup, setAddingProductToGroup] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = project?.sections.subscriptions.data;
    if (d?.groups) setGroups(d.groups as SubscriptionGroup[]);
  }, [projectId]);

  const handleAddGroup = () => {
    console.log('[Subscriptions] Add group pressed, name:', newGroupName);
    if (!newGroupName.trim()) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setGroups(prev => [...prev, { id: Date.now().toString(), name: newGroupName.trim(), products: [] }]);
    setNewGroupName('');
    setShowGroupForm(false);
  };

  const handleAddProduct = (groupId: string, product: SubscriptionProduct) => {
    console.log('[Subscriptions] Product added to group:', groupId);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, products: [...g.products, product] } : g));
    setAddingProductToGroup(null);
  };

  const handleDeleteGroup = (groupId: string) => {
    console.log('[Subscriptions] Delete group pressed:', groupId);
    Alert.alert('Delete Group', 'Remove this subscription group and all its products?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setGroups(prev => prev.filter(g => g.id !== groupId));
        }
      },
    ]);
  };

  const handleSave = async () => {
    console.log('[Subscriptions] Save pressed, groups:', groups.length);
    setSaving(true);
    try {
      await updateSection(projectId, 'subscriptions', {
        status: groups.length > 0 ? 'complete' : 'empty',
        data: { groups },
        completedAt: groups.length > 0 ? new Date().toISOString() : undefined,
      });
      router.back();
    } catch (e) {
      console.error('[Subscriptions] Save failed:', e);
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
        <SectionHeader icon="📋" title="Subscriptions" subtitle="Subscription groups and auto-renewing products" />

        <View style={styles.content}>
          {groups.length === 0 && !showGroupForm ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Layers size={28} color={COLORS.textTertiary} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No subscription groups</Text>
              <Text style={styles.emptyDesc}>Create subscription groups to organize your auto-renewing subscriptions</Text>
            </View>
          ) : (
            <View style={styles.groupsList}>
              {groups.map(group => (
                <View key={group.id} style={styles.groupCard}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <TouchableOpacity onPress={() => handleDeleteGroup(group.id)} accessibilityLabel="Delete group">
                      <Trash2 size={16} color={COLORS.danger} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                  {group.products.map(product => (
                    <View key={product.id} style={styles.productCard}>
                      <View style={styles.productRow}>
                        <Text style={styles.productName}>{product.displayName}</Text>
                        <Text style={styles.productPrice}>{product.price}</Text>
                      </View>
                      <View style={styles.productMeta}>
                        <View style={styles.metaBadge}><Text style={styles.metaBadgeText}>{product.duration}</Text></View>
                        {product.freeTrial !== 'None' && (
                          <View style={[styles.metaBadge, styles.trialBadge]}>
                            <Text style={[styles.metaBadgeText, styles.trialBadgeText]}>{product.freeTrial} free trial</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                  {addingProductToGroup === group.id ? (
                    <ProductForm
                      onAdd={(p) => handleAddProduct(group.id, p)}
                      onCancel={() => setAddingProductToGroup(null)}
                    />
                  ) : (
                    <AnimatedPressable
                      onPress={() => {
                        console.log('[Subscriptions] Add product to group:', group.id);
                        setAddingProductToGroup(group.id);
                      }}
                      style={styles.addProductButton}
                    >
                      <Plus size={14} color={COLORS.primary} strokeWidth={2.5} />
                      <Text style={styles.addProductButtonText}>Add subscription</Text>
                    </AnimatedPressable>
                  )}
                </View>
              ))}
            </View>
          )}

          {showGroupForm ? (
            <View style={styles.groupForm}>
              <FormField label="Group Name" placeholder="Premium Features" value={newGroupName} onChangeText={setNewGroupName} />
              <View style={styles.formButtons}>
                <AnimatedPressable onPress={() => setShowGroupForm(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </AnimatedPressable>
                <AnimatedPressable onPress={handleAddGroup} style={styles.addButton}>
                  <Text style={styles.addButtonText}>Create group</Text>
                </AnimatedPressable>
              </View>
            </View>
          ) : (
            <AnimatedPressable
              onPress={() => {
                console.log('[Subscriptions] Add group button pressed');
                setShowGroupForm(true);
              }}
              style={styles.addGroupButton}
            >
              <Plus size={18} color={COLORS.primary} strokeWidth={2.5} />
              <Text style={styles.addGroupButtonText}>Add subscription group</Text>
            </AnimatedPressable>
          )}
        </View>

        <AnimatedPressable
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save subscriptions'}</Text>
        </AnimatedPressable>
      </ScrollView>
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
  groupsList: { gap: 12 },
  groupCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  groupName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  productCard: { backgroundColor: COLORS.surfaceSecondary, borderRadius: 10, padding: 12, gap: 6 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  productPrice: { fontSize: 14, fontWeight: '700', color: COLORS.accent },
  productMeta: { flexDirection: 'row', gap: 6 },
  metaBadge: { backgroundColor: COLORS.primaryMuted, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  metaBadgeText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  trialBadge: { backgroundColor: COLORS.accentMuted },
  trialBadgeText: { color: COLORS.accent },
  addProductButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  addProductButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  addGroupButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.surfaceSecondary, borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  addGroupButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
  groupForm: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  productForm: { backgroundColor: COLORS.surfaceSecondary, borderRadius: 12, padding: 14, gap: 12 },
  formTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  chipSection: { gap: 8 },
  chipLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3 },
  chips: { gap: 8, paddingVertical: 2 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primaryMuted, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.primary, fontWeight: '600' },
  formButtons: { flexDirection: 'row', gap: 10 },
  cancelButton: { flex: 1, backgroundColor: COLORS.surfaceSecondary, borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  addButton: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  addButtonText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  saveButton: { margin: 20, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
