import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, Animated } from 'react-native';
import { COLORS } from '@/constants/Colors';

interface FormFieldProps extends TextInputProps {
  label: string;
  maxChars?: number;
  error?: string;
  required?: boolean;
  hint?: string;
  monospace?: boolean;
}

export function FormField({ label, maxChars, error, required, hint, monospace, style, onFocus, onBlur, value, ...props }: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    onBlur?.(e);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? COLORS.danger : COLORS.border, error ? COLORS.danger : COLORS.primary],
  });

  const charCount = typeof value === 'string' ? value.length : 0;
  const isOverLimit = maxChars !== undefined && charCount > maxChars;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {maxChars !== undefined && (
          <Text style={[styles.charCount, isOverLimit && styles.charCountOver]}>
            {charCount}/{maxChars}
          </Text>
        )}
      </View>
      <Animated.View style={[styles.inputWrapper, { borderColor }]}>
        <TextInput
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={COLORS.textTertiary}
          style={[
            styles.input,
            monospace && styles.monospace,
            style,
          ]}
          {...props}
        />
      </Animated.View>
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  required: {
    color: COLORS.danger,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontVariant: ['tabular-nums'],
  },
  charCountOver: {
    color: COLORS.danger,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSecondary,
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 46,
  },
  monospace: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    letterSpacing: -0.3,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textTertiary,
    lineHeight: 16,
  },
  error: {
    fontSize: 12,
    color: COLORS.danger,
    lineHeight: 16,
  },
});
