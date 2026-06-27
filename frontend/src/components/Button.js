import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../theme';

export default function Button({ title, onPress, variant = 'primary', disabled, loading, style }) {
  const variantStyles = {
    primary: { container: { backgroundColor: COLORS.mustard, paddingVertical: 13 }, text: { color: COLORS.textPrimary } },
    secondary: { container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.petrolMid, paddingVertical: 11 }, text: { color: COLORS.petrol } },
    ghost: { container: { backgroundColor: 'transparent', paddingVertical: 11 }, text: { color: COLORS.textMedium } },
    danger: { container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.redBorder, paddingVertical: 11 }, text: { color: COLORS.red } },
    mini: { container: { borderWidth: 1, borderColor: COLORS.petrolMid, paddingVertical: 5, paddingHorizontal: 10, width: 'auto', borderRadius: RADIUS.sm }, text: { color: COLORS.petrol, fontSize: 10 } },
  };
  const vs = variantStyles[variant] || variantStyles.primary;
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}
      style={[styles.base, vs.container, disabled && { opacity: 0.5 }, style]}>
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? COLORS.textPrimary : COLORS.petrol} />
        : <Text style={[styles.text, vs.text]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', width: '100%' },
  text: { fontFamily: FONTS.bold, fontSize: 15 },
});
