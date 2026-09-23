import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export function Toast({ visible, message, type = 'success' }: ToastProps) {
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 15, stiffness: 200 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 80, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const bgColor = type === 'success' ? COLORS.accent : type === 'error' ? COLORS.danger : COLORS.primary;
  const iconColor = '#fff';

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bgColor, opacity, transform: [{ translateY }] },
      ]}
      pointerEvents="none"
    >
      {type === 'success' && <Check size={16} color={iconColor} strokeWidth={2.5} />}
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

export function useToast() {
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [type, setType] = React.useState<'success' | 'error' | 'info'>('success');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, toastType: 'success' | 'error' | 'info' = 'success') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    setType(toastType);
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), 2000);
  };

  return { visible, message, type, showToast };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
