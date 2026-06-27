import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../theme';

export default function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}
      style={[styles.chip, active ? styles.active : styles.inactive]}>
      <Text style={[styles.text, active ? styles.atxt : styles.itxt]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: { borderRadius: RADIUS.pill, paddingVertical: 5, paddingHorizontal: 10, marginRight: 6, marginBottom: 6 },
  active: { backgroundColor: COLORS.petrol },
  inactive: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.petrolMid },
  text: { fontFamily: FONTS.medium, fontSize: 13 },
  atxt: { color: COLORS.cream },
  itxt: { color: COLORS.petrol },
});
