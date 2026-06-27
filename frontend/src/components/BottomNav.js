import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS } from '../theme';

const TABS = [
  { name: 'Home', label: 'Home', icon: '🏠' },
  { name: 'MyAnnouncements', label: 'Anúncios', icon: '📢' },
  { name: 'Chat', label: 'Chat', icon: '💬' },
  { name: 'Profile', label: 'Perfil', icon: '👤' },
];

export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();
  return (
    <View style={styles.nav}>
      {TABS.map(tab => {
        const active = route.name === tab.name;
        return (
          <TouchableOpacity key={tab.name} style={styles.item} onPress={() => navigation.navigate(tab.name)}>
            <Text style={styles.icon}>{tab.icon}</Text>
            <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: 16, paddingTop: 8 },
  item: { flex: 1, alignItems: 'center' },
  icon: { fontSize: 20 },
  label: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  activeLabel: { fontFamily: FONTS.bold, color: COLORS.petrol },
});
