import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../theme';

function initials(name) {
  if (!name) return '?';
  const p = name.trim().split(' ');
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default function Avatar({ uri, name, size = 40 }) {
  const s = { width: size, height: size, borderRadius: size / 2 };
  if (uri) return <Image source={{ uri }} style={s} />;
  return (
    <View style={[s, styles.bg]}>
      <Text style={[styles.init, { fontSize: size * 0.36 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: COLORS.stone, alignItems: 'center', justifyContent: 'center' },
  init: { fontFamily: FONTS.bold, color: COLORS.petrol },
});
