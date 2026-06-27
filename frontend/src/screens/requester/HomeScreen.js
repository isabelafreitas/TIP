import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';
import BottomNav from '../../components/BottomNav';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';

const CATEGORIES = [
  { label: 'Limpeza', icon: '🧹', value: 'Limpeza' },
  { label: 'Elétrica', icon: '⚡', value: 'Elétrica' },
  { label: 'Hidráulica', icon: '🔧', value: 'Hidráulica' },
  { label: 'Beleza', icon: '💅', value: 'Beleza' },
  { label: 'Aulas', icon: '📚', value: 'Aulas' },
  { label: 'Mais+', icon: '+', value: '' },
];

const UNUSUAL = [
  { label: 'Passeio de pets', icon: '🐾' },
  { label: 'Montagem de móveis', icon: '🪑' },
  { label: 'Tradução', icon: '🌐' },
  { label: 'Organização', icon: '📦' },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  function handleCategory(cat) {
    navigation.navigate('ProvidersList', { category: cat.value, query: cat.value });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0] || 'visitante'}!</Text>
            <Text style={styles.subgreeting}>O que você precisa hoje?</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Avatar uri={user?.photo_url} name={user?.name} size={44} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('ProvidersList', { query: '' })}
          activeOpacity={0.8}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Buscar prestadoras ou serviços...</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Categorias</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value + cat.label}
              style={styles.catCard}
              onPress={() => handleCategory(cat)}
              activeOpacity={0.8}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={styles.catLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Serviços inusitados</Text>
        <View style={styles.unusualGrid}>
          {UNUSUAL.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.unusualCard}
              onPress={() => navigation.navigate('ProvidersList', { query: item.label })}
              activeOpacity={0.8}
            >
              <Text style={styles.unusualIcon}>{item.icon}</Text>
              <Text style={styles.unusualLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.publishBanner}
          onPress={() => navigation.navigate('PublishAnnouncement')}
          activeOpacity={0.85}
        >
          <Text style={styles.publishBannerIcon}>📢</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.publishBannerTitle}>Tem uma necessidade específica?</Text>
            <Text style={styles.publishBannerSub}>Publique um anúncio e receba propostas</Text>
          </View>
          <Text style={styles.publishArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  greeting: { fontFamily: FONTS.extraBold, fontSize: 22, color: COLORS.petrol },
  subgreeting: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMedium, marginTop: 2 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.full,
    paddingVertical: 12, paddingHorizontal: SPACING.md, marginBottom: SPACING.xl,
  },
  searchIcon: { fontSize: 16, marginRight: SPACING.sm },
  searchPlaceholder: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textLight },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.xl, marginHorizontal: -SPACING.xs },
  catCard: {
    width: '30%', marginHorizontal: '1.5%', marginBottom: SPACING.sm,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.stone,
    borderRadius: RADIUS.lg, paddingVertical: SPACING.md, alignItems: 'center',
  },
  catIcon: { fontSize: 28, marginBottom: 4 },
  catLabel: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textPrimary, textAlign: 'center' },
  unusualGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.xl, marginHorizontal: -SPACING.xs },
  unusualCard: {
    width: '47%', marginHorizontal: '1.5%', marginBottom: SPACING.sm,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.stone,
    borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', alignItems: 'center',
  },
  unusualIcon: { fontSize: 22, marginRight: SPACING.sm },
  unusualLabel: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textPrimary, flex: 1 },
  publishBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.petrol,
    borderRadius: RADIUS.lg, padding: SPACING.md,
  },
  publishBannerIcon: { fontSize: 26, marginRight: SPACING.md },
  publishBannerTitle: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.cream },
  publishBannerSub: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.petrolLight, marginTop: 2 },
  publishArrow: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.cream, marginLeft: SPACING.sm },
});
