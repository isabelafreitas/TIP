import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import Avatar from '../../components/Avatar';
import BottomNavProvider from '../../components/BottomNavProvider';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ProviderHomeScreen({ navigation }) {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    fetchServices();
  }, []));

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services/mine');
      const pending = (res.data.data || []).filter(s => s.status === 'pending' && s.provider_id === user?.id);
      setServices(pending);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as oportunidades.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (serviceId) => {
    try {
      await api.patch(`/services/${serviceId}/accept`);
      Alert.alert('Aceito!', 'A solicitadora será notificada para efetuar o pagamento.');
      fetchServices();
    } catch (e) {
      Alert.alert('Erro', e.response?.data?.error || 'Tente novamente.');
    }
  };

  const handleDecline = async (serviceId) => {
    try {
      await api.patch(`/services/${serviceId}/decline`);
      fetchServices();
    } catch {
      Alert.alert('Erro', 'Tente novamente.');
    }
  };

  const rating = user?.rating_avg;
  const ratingCount = user?.rating_count || 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]}!</Text>
          <Text style={styles.subtitle}>Veja suas oportunidades</Text>
        </View>
        <View style={styles.availBadge}>
          <Text style={styles.availText}>● Disponível</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: COLORS.petrol }]}>
          <Text style={styles.summaryNumWhite}>{services.length}</Text>
          <Text style={styles.summaryLabelWhite}>Novas solicitações</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: COLORS.stone }]}>
          <Text style={styles.summaryNum}>
            {ratingCount >= 3 ? `⭐ ${parseFloat(rating || 0).toFixed(1)}` : '—'}
          </Text>
          <Text style={styles.summaryLabelGray}>
            {ratingCount >= 3 ? `${ratingCount} avaliações` : 'Novo na plataforma'}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Oportunidades compatíveis</Text>

      {loading
        ? <ActivityIndicator color={COLORS.petrol} style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={services}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={fetchServices}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Nenhuma solicitação nova no momento.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Avatar name={item.requester?.name} photoUrl={item.requester?.photo_url} size={40} />
                  <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                    <Text style={styles.cardName}>{item.requester?.name}</Text>
                    <Text style={styles.cardCategory}>{item.category}</Text>
                  </View>
                  {item.suggested_price && (
                    <Text style={styles.cardPrice}>R$ {parseFloat(item.suggested_price).toFixed(2)}</Text>
                  )}
                </View>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                {item.scheduled_date && (
                  <Text style={styles.cardDate}>📅 {item.scheduled_date} · {
                    { morning: 'Manhã', afternoon: 'Tarde', evening: 'Noite' }[item.scheduled_period] || ''
                  }</Text>
                )}
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.id)}>
                    <Text style={styles.acceptBtnText}>Aceitar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineBtn} onPress={() => handleDecline(item.id)}>
                    <Text style={styles.declineBtnText}>Recusar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )
      }
      <BottomNavProvider navigation={navigation} active="ProviderHome" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
  greeting: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.textPrimary },
  subtitle: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMedium },
  availBadge: { backgroundColor: COLORS.greenBg, borderRadius: RADIUS.pill, paddingHorizontal: 12, paddingVertical: 5 },
  availText: { fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.greenDark },
  summaryRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.md, marginBottom: SPACING.lg },
  summaryCard: { flex: 1, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center' },
  summaryNumWhite: { fontFamily: FONTS.bold, fontSize: 28, color: COLORS.cream },
  summaryLabelWhite: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.petrolLight, marginTop: 2 },
  summaryNum: { fontFamily: FONTS.bold, fontSize: 24, color: COLORS.petrol },
  summaryLabelGray: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMedium, marginTop: 2 },
  sectionTitle: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary, paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMedium },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.stone },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  cardName: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary },
  cardCategory: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMedium },
  cardPrice: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.petrol },
  cardDesc: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMedium, marginBottom: SPACING.sm },
  cardDate: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMedium, marginBottom: SPACING.sm },
  cardActions: { flexDirection: 'row', gap: SPACING.sm },
  acceptBtn: { flex: 1, backgroundColor: COLORS.mustard, borderRadius: RADIUS.md, padding: 10, alignItems: 'center' },
  acceptBtnText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.textPrimary },
  declineBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 10, alignItems: 'center' },
  declineBtnText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMedium },
});
