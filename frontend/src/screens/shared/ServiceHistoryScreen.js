import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import Avatar from '../../components/Avatar';
import StarRating from '../../components/StarRating';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ServiceHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contracted');
  const [search, setSearch] = useState('');

  useFocusEffect(useCallback(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/services/mine');
        const confirmed = (res.data.data || []).filter(s => s.status === 'confirmed');
        setServices(confirmed);
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar o histórico.');
      } finally {
        setLoading(false);
      }
    })();
  }, []));

  const filtered = services.filter(s => {
    const isContracted = s.requester_id === user?.id;
    if (activeTab === 'contracted' && !isContracted) return false;
    if (activeTab === 'provided' && isContracted) return false;
    if (search) {
      const q = search.toLowerCase();
      const other = isContracted ? s.provider : s.requester;
      return s.category?.toLowerCase().includes(q) || other?.name?.toLowerCase().includes(q);
    }
    return true;
  });

  const grouped = filtered.reduce((acc, s) => {
    const month = s.scheduled_date
      ? new Date(s.scheduled_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      : 'Sem data';
    if (!acc[month]) acc[month] = [];
    acc[month].push(s);
    return acc;
  }, {});

  const renderService = (s) => {
    const isContracted = s.requester_id === user?.id;
    const other = isContracted ? s.provider : s.requester;
    const myReview = s.reviews?.find(r => r.reviewer_id === user?.id);

    return (
      <TouchableOpacity
        key={s.id}
        style={styles.card}
        onPress={() => Alert.alert(
          s.category,
          `${other?.name}\nR$ ${parseFloat(s.agreed_price || s.suggested_price || 0).toFixed(2)}${myReview ? `\n\nSua avaliação: ${'⭐'.repeat(myReview.rating)}` : ''}`,
          [
            { text: 'Fechar', style: 'cancel' },
            isContracted ? {
              text: 'Contratar novamente',
              onPress: () => navigation.navigate('ProviderProfile', { providerId: s.provider_id }),
            } : null,
          ].filter(Boolean)
        )}
      >
        <Avatar name={other?.name} photoUrl={other?.photo_url} size={40} />
        <View style={{ flex: 1, marginLeft: SPACING.sm }}>
          <Text style={styles.cardName}>{other?.name}</Text>
          <Text style={styles.cardCategory}>{s.category}</Text>
          {s.scheduled_date && <Text style={styles.cardDate}>{s.scheduled_date}</Text>}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.cardPrice}>R$ {parseFloat(s.agreed_price || s.suggested_price || 0).toFixed(2)}</Text>
          {myReview && <StarRating rating={myReview.rating} size={12} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Histórico de serviços</Text>
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por nome ou categoria..."
        placeholderTextColor={COLORS.textLight}
        style={styles.search}
      />

      <View style={styles.tabs}>
        {[['contracted', 'Contratados'], ['provided', 'Realizados']].map(([key, label]) => (
          <TouchableOpacity key={key} style={[styles.tab, activeTab === key && styles.tabActive]} onPress={() => setActiveTab(key)}>
            <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <ActivityIndicator color={COLORS.petrol} style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={Object.keys(grouped)}
            keyExtractor={k => k}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>Nenhum serviço encontrado.</Text>}
            renderItem={({ item: month }) => (
              <View>
                <Text style={styles.monthHeader}>{month}</Text>
                {grouped[month].map(renderService)}
              </View>
            )}
          />
        )
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: SPACING.md },
  back: { fontSize: 22, color: COLORS.petrol },
  title: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  search: { marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.sm + 2, borderWidth: 1.5, borderColor: COLORS.border, fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textPrimary },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, padding: SPACING.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.petrol },
  tabText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMedium },
  tabTextActive: { color: COLORS.petrol, fontFamily: FONTS.semiBold },
  list: { padding: SPACING.lg, paddingBottom: 40 },
  monthHeader: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.textMedium, textTransform: 'capitalize', marginBottom: SPACING.sm, marginTop: SPACING.md },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.stone },
  cardName: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary },
  cardCategory: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMedium },
  cardDate: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textLight },
  cardPrice: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.petrol },
  empty: { textAlign: 'center', color: COLORS.textMedium, fontFamily: FONTS.regular, fontSize: 14, marginTop: 40 },
});
