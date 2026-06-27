import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import BottomNav from '../../components/BottomNav';
import api from '../../services/api';

const STATUS_LABELS = { active: 'Ativo', closed: 'Encerrado', expired: 'Expirado' };
const STATUS_COLORS = { active: COLORS.green, closed: COLORS.textMedium, expired: COLORS.red };

const FILTERS = ['Todos', 'Ativos', 'Encerrados'];

export default function MyAnnouncementsScreen({ navigation }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');

  useFocusEffect(useCallback(() => {
    fetchAnnouncements();
  }, []));

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements/mine');
      setAnnouncements(res.data.data || []);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os anúncios.');
    } finally {
      setLoading(false);
    }
  };

  const closeAnnouncement = async (id) => {
    try {
      await api.patch(`/announcements/${id}/close`);
      fetchAnnouncements();
    } catch {
      Alert.alert('Erro', 'Não foi possível encerrar o anúncio.');
    }
  };

  const filtered = announcements.filter(a => {
    if (filter === 'Ativos') return a.status === 'active';
    if (filter === 'Encerrados') return a.status !== 'active';
    return true;
  });

  const renderItem = ({ item }) => {
    if (item._isAdd) {
      return (
        <TouchableOpacity style={styles.addCard} onPress={() => navigation.navigate('PublishAnnouncement')}>
          <Text style={styles.addCardText}>+ Nova necessidade</Text>
        </TouchableOpacity>
      );
    }
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
          <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>
              {STATUS_LABELS[item.status] || item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.candidacies}>{item.candidacy_count || 0} candidata(s)</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.miniBtn}
            onPress={() => Alert.alert('Candidatas', `${item.candidacy_count || 0} candidatas para este anúncio.`)}
          >
            <Text style={styles.miniBtnText}>Ver candidatas</Text>
          </TouchableOpacity>
          {item.status === 'active' && (
            <TouchableOpacity
              onPress={() => Alert.alert('Encerrar', 'Encerrar este anúncio?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Encerrar', style: 'destructive', onPress: () => closeAnnouncement(item.id) },
              ])}
            >
              <Text style={styles.closeText}>Encerrar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Anúncios</Text>
      </View>
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator color={COLORS.petrol} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={[...filtered, { _isAdd: true, id: 'add' }]}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchAnnouncements}
        />
      )}
      <BottomNav navigation={navigation} active="Announcements" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  header: { padding: SPACING.lg, paddingBottom: SPACING.sm },
  title: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.textPrimary },
  filterRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.sm },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.pill, backgroundColor: COLORS.stone },
  filterChipActive: { backgroundColor: COLORS.petrol },
  filterChipText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMedium },
  filterChipTextActive: { color: COLORS.cream },
  list: { padding: SPACING.lg, paddingBottom: 100 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.stone },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACING.sm },
  desc: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textPrimary, flex: 1 },
  badge: { borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontFamily: FONTS.semiBold, fontSize: 11 },
  candidacies: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMedium, marginTop: 6 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm },
  miniBtn: { borderWidth: 1, borderColor: COLORS.petrolMid, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 5 },
  miniBtnText: { fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.petrol },
  closeText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMedium },
  addCard: { borderWidth: 1.5, borderColor: COLORS.petrolMid, borderStyle: 'dashed', borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.md },
  addCardText: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.petrol },
});
