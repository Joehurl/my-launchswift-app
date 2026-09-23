import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/Colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export function ProgressBar({ progress, height = 4, color = COLORS.primary, backgroundColor = COLORS.surfaceElevated }: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: Math.min(Math.max(progress, 0), 1),
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={[styles.container, { height, backgroundColor, borderRadius: height / 2 }]}>
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: color,
            width: animatedWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
