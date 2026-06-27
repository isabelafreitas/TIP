import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import StarRating from './StarRating';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

export default function ProviderCard({ provider, onPress, onSave, saved }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.row}>
        <Avatar uri={provider.photo_url} name={provider.name} size={48} />
        <View style={styles.info}>
          <Text style={styles.name}>{provider.name}</Text>
          <Text style={styles.cat}>{provider.category || provider.categories?.[0] || ''}</Text>
          <StarRating rating={provider.rating_avg || 0} size={13} />
        </View>
        <TouchableOpacity onPress={onSave} style={{ padding: 4 }}>
          <Text style={{ fontSize: 20, color: saved ? COLORS.mustard : COLORS.textLight }}>🔖</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.meta}>{provider.distance ? `${provider.distance}km · ` : ''}Disponível</Text>
        <TouchableOpacity style={styles.miniBtn} onPress={onPress}>
          <Text style={styles.miniBtnTxt}>Ver perfil</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.stone, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: SPACING.sm },
  name: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary },
  cat: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMedium, marginBottom: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm },
  meta: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMedium },
  miniBtn: { borderWidth: 1, borderColor: COLORS.petrolMid, borderRadius: RADIUS.sm, paddingVertical: 5, paddingHorizontal: 10 },
  miniBtnTxt: { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.petrol },
});
