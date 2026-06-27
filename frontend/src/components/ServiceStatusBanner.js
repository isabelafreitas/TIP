import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

const MAP = {
  scheduled: { label: 'Agendado', bg: COLORS.greenBg, color: COLORS.greenDark },
  pending: { label: 'Aguardando', bg: '#FFF8E1', color: '#856404' },
  in_progress: { label: 'Em andamento', bg: '#E3F2FD', color: '#0D47A1' },
  completed_by_provider: { label: 'Concluído pela prestadora', bg: COLORS.greenBg, color: COLORS.greenDark },
  confirmed: { label: 'Confirmado', bg: COLORS.greenBg, color: COLORS.greenDark },
  cancelled: { label: 'Cancelado', bg: COLORS.redBg, color: COLORS.red },
  disputed: { label: 'Em contestação', bg: COLORS.redBg, color: COLORS.red },
};

export default function ServiceStatusBanner({ status }) {
  const info = MAP[status] || { label: status || 'Desconhecido', bg: COLORS.stone, color: COLORS.textMedium };
  return (
    <View style={[styles.banner, { backgroundColor: info.bg }]}>
      <Text style={[styles.text, { color: info.color }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: RADIUS.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, alignItems: 'center', marginBottom: SPACING.md },
  text: { fontFamily: FONTS.semiBold, fontSize: 14 },
});
