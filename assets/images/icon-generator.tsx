/**
 * LaunchSwift Icon Generator (reference/documentation only)
 *
 * This file is NOT a routed screen. It documents the SVG icon design.
 * The actual icon component lives at: components/LaunchSwiftIcon.tsx
 *
 * To replace the app icon:
 * 1. Run this component in a simulator/device
 * 2. Take a screenshot of the rendered icon at 1024×1024
 * 3. Save as assets/images/newly.png (or a new file referenced in app.json)
 *
 * Icon design spec:
 * - Background: #0D1117 (dark) rounded square
 * - Rocket body: #E6EDF3 (light gray/white)
 * - Rocket window: #2F81F7 (blue)
 * - Rocket fins: #8B949E (gray)
 * - Flame: #FCD34D → #F97316 → #EF4444 gradient
 * - Glow: rgba(47,129,247,0.35) radial behind rocket
 * - Star accents: subtle white/blue dots
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LaunchSwiftIcon } from '../../components/LaunchSwiftIcon';

export default function IconGeneratorReference() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>1024 × 1024 (App Store)</Text>
      <LaunchSwiftIcon size={200} />
      <Text style={styles.label}>120 × 120 (Home Screen)</Text>
      <LaunchSwiftIcon size={120} />
      <Text style={styles.label}>60 × 60 (Spotlight)</Text>
      <LaunchSwiftIcon size={60} />
      <Text style={styles.label}>40 × 40 (Notification)</Text>
      <LaunchSwiftIcon size={40} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 32,
  },
  label: {
    color: '#8B949E',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
