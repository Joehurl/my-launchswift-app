import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Layers, BookOpen } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { Stack } from 'expo-router';

const TABS = [
  { name: '(projects)', route: '/(tabs)/(projects)', label: 'Projects', Icon: Layers },
  { name: '(guide)', route: '/(tabs)/(guide)', label: 'Guide', Icon: BookOpen },
];

function LaunchSwiftTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const activeIndex = TABS.findIndex(t => pathname.includes(t.name.replace('(', '').replace(')', '')));
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <BlurView intensity={80} style={styles.blurContainer}>
        <View style={styles.tabsRow}>
          {TABS.map((tab, i) => {
            const isActive = safeActiveIndex === i;
            const { Icon } = tab;
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tab}
                onPress={() => {
                  console.log(`[TabBar] Tab pressed: ${tab.label}`);
                  router.push(tab.route as never);
                }}
                activeOpacity={0.7}
              >
                <Icon size={22} color={isActive ? COLORS.primary : COLORS.textSecondary} strokeWidth={isActive ? 2.5 : 2} />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </SafeAreaView>
  );
}

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
        <Stack.Screen name="(projects)" />
        <Stack.Screen name="(guide)" />
      </Stack>
      <LaunchSwiftTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
  },
  blurContainer: {
    width: '80%',
    marginBottom: 16,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(22,27,34,0.85)',
  },
  tabsRow: {
    flexDirection: 'row',
    height: 58,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
