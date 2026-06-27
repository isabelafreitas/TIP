import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import Avatar from '../../components/Avatar';
import StarRating from '../../components/StarRating';
import Chip from '../../components/Chip';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import { formatCurrency } from '../../utils/formatters';

export default function ProviderProfileScreen({ navigation, route }) {
  const { provider_id } = route.params;
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setError('');
      const [provRes, revRes] = await Promise.all([
        api.get(`/users/${provider_id}`),
        api.get(`/users/${provider_id}/reviews`),
      ]);
      setProvider(provRes.data);
      setReviews(revRes.data?.reviews || revRes.data || []);
      const savedRes = await api.get('/saved');
      const savedIds = (savedRes.data || []).map(s => s.provider_id || s.id);
      setSaved(savedIds.includes(provider_id));
    } catch (err) {
      setError('Erro ao carregar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleSave() {
    if (saved) {
      await api.delete(`/saved/${provider_id}`);
    } else {
      await api.post('/saved', { provider_id });
    }
    setSaved(!saved);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.petrol} /></View>
      </SafeAreaView>
    );
  }

  if (error || !provider) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Perfil não encontrado.'}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: SPACING.md }}>
            <Text style={{ fontFamily: FONTS.bold, color: COLORS.petrol }}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const ratingCount = provider.rating_count || 0;
  const hasRating = ratingCount >= 3;
  const categories = provider.categories || (provider.category ? [provider.category] : []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.heroSection}>
          <Avatar uri={provider.photo_url} name={provider.name} size={88} />
          <Text style={styles.name}>{provider.name}</Text>
          {hasRating ? (
            <View style={styles.ratingRow}>
              <StarRating rating={provider.rating_avg || 0} size={18} />
              <Text style={styles.ratingCount}>({ratingCount})</Text>
            </View>
          ) : (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>✨ Nova na plataforma</Text>
            </View>
          )}
          {provider.level && (
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{provider.level}</Text>
            </View>
          )}
          <Text style={styles.serviceCount}>{provider.services_count || 0} serviços realizados</Text>
        </View>

        {provider.bairro ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>{provider.bairro}</Text>
          </View>
        ) : null}
        {provider.price_min != null ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>💰</Text>
            <Text style={styles.infoText}>
              {formatCurrency(provider.price_min)} – {formatCurrency(provider.price_max)} / hora
            </Text>
          </View>
        ) : null}
        {provider.area ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🗺</Text>
            <Text style={styles.infoText}>{provider.area}</Text>
          </View>
        ) : null}

        {provider.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre mim</Text>
            <Text style={styles.bio}>{provider.bio}</Text>
          </View>
        ) : null}

        {categories.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categorias</Text>
            <View style={styles.chipsRow}>
              {categories.map(cat => (
                <Chip key={cat} label={cat} active={false} onPress={() => {}} />
              ))}
            </View>
          </View>
        ) : null}

        {provider.portfolio && provider.portfolio.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Portfólio</Text>
            <View style={styles.portfolioGrid}>
              {provider.portfolio.slice(0, 6).map((img, i) => (
                <Image key={i} source={{ uri: img }} style={styles.portfolioImg} />
              ))}
            </View>
          </View>
        ) : null}

        {reviews.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avaliações</Text>
            {reviews.slice(0, 3).map((rev, i) => (
              <View key={i} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Avatar name={rev.reviewer_name || 'Anônimo'} size={32} />
                  <Text style={styles.reviewerName}>{rev.reviewer_name || 'Anônimo'}</Text>
                  <StarRating rating={rev.rating || 0} size={12} />
                </View>
                {rev.comment ? <Text style={styles.reviewText}>{rev.comment}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        <View style={{ height: 90 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookmarkBtn} onPress={toggleSave} activeOpacity={0.8}>
          <Text style={{ fontSize: 22, color: saved ? COLORS.mustard : COLORS.textLight }}>🔖</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.requestBtn}
          onPress={() => navigation.navigate('RequestService', { provider })}
          activeOpacity={0.85}
        >
          <Text style={styles.requestBtnText}>Solicitar serviço</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content: { paddingBottom: SPACING.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.red },
  backBtn: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  backArrow: { fontSize: 28, color: COLORS.petrol },
  heroSection: { alignItems: 'center', paddingVertical: SPACING.xl },
  name: { fontFamily: FONTS.extraBold, fontSize: 22, color: COLORS.textPrimary, marginTop: SPACING.md },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs },
  ratingCount: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMedium, marginLeft: 4 },
  newBadge: { marginTop: SPACING.xs, backgroundColor: COLORS.greenBg, borderRadius: RADIUS.pill, paddingHorizontal: 12, paddingVertical: 4 },
  newBadgeText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.greenDark },
  levelBadge: { marginTop: SPACING.xs, backgroundColor: COLORS.stone, borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 3 },
  levelText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.petrol },
  serviceCount: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMedium, marginTop: SPACING.xs },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.xl, marginBottom: SPACING.sm },
  infoIcon: { fontSize: 16, marginRight: SPACING.sm },
  infoText: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMedium },
  section: { paddingHorizontal: SPACING.xl, marginTop: SPACING.md },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  bio: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMedium, lineHeight: 22 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -SPACING.xs },
  portfolioImg: { width: '31%', aspectRatio: 1, borderRadius: RADIUS.md, margin: '1%' },
  reviewCard: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.stone, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  reviewerName: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.textPrimary, marginLeft: SPACING.sm, flex: 1 },
  reviewText: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMedium, lineHeight: 20 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, paddingBottom: 28,
  },
  bookmarkBtn: { marginRight: SPACING.md, padding: 8 },
  requestBtn: { flex: 1, backgroundColor: COLORS.mustard, borderRadius: RADIUS.lg, paddingVertical: 13, alignItems: 'center' },
  requestBtnText: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary },
});
