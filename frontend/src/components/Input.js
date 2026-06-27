import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

export default function Input({ label, value, onChangeText, placeholder, secureTextEntry, multiline, numberOfLines, error, style }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor={COLORS.textLight} secureTextEntry={secureTextEntry}
        multiline={multiline} numberOfLines={numberOfLines}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={[styles.input, focused && styles.focused, error && styles.errBorder,
          multiline && { height: (numberOfLines || 3) * 24, textAlignVertical: 'top' }]}
      />
      {error ? <Text style={styles.errText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.md },
  label: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMedium, marginBottom: 4 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingVertical: 10, paddingHorizontal: 12, fontFamily: FONTS.regular, fontSize: 15, color: COLORS.textPrimary, backgroundColor: COLORS.white },
  focused: { borderColor: COLORS.petrolMid },
  errBorder: { borderColor: COLORS.redBorder },
  errText: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.red, marginTop: 3 },
});
