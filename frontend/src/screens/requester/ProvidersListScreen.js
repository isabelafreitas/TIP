import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import ProviderCard from '../../components/ProviderCard';
import Chip from '../../components/Chip';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';

const FILTERS = ['Distância', 'Disponibilidade'];

export default function ProvidersListScreen({ navigation, route }) {
  const initialQuery = route.params?.query || '';
  const initialCategory = route.params?.category || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeFilters, setActiveFilters] = useState(initialCategory ? [initialCategory] : []);
  const [showMore, setShowMore] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');
  const [level, setLevel] = useState('');
  const [providers, setProviders] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function loadProviders() {
    try {
      setError('');
      const params = { q: query };
      if (activeFilters.length > 0) params.category = activeFilters[0];
      if (maxPrice) params.max_price = maxPrice;
      if (level) params.level = level;
      const res = await api.get('/providers', { params });
      setProviders(res.data?.providers || res.data || []);
    } catch (err) {
      setError('Erro ao carregar prestadoras. Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function loadSaved() {
    try {
      const res = await api.get('/saved');
      setSaved((res.data || []).map(s => s.provider_id || s.id));
    } catch {}
  }

  useEffect(() => {
    loadProviders();
    loadSaved();
  }, []);

  async function handleSave(providerId) {
    if (saved.includes(providerId)) {
      await api.delete(`/saved/${providerId}`);
      setSaved(prev => prev.filter(id => id !== providerId));
    } else {
      await api.post('/saved', { provider_id: providerId });
      setSaved(prev => [...prev, providerId]);
    }
  }

  function toggleFilter(f) {
    setActiveFilters(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );
  }

  function handleSearch() {
    setLoading(true);
    loadProviders();
  }

  function onRefresh() {
    setRefreshing(true);
    loadProviders();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar prestadoras..."
          placeholderTextColor={COLORS.textLight}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersRow}>
        {FILTERS.map(f => (
          <Chip key={f} label={f} active={activeFilters.includes(f)} onPress={() => toggleFilter(f)} />
        ))}
        <TouchableOpacity onPress={() => setShowMore(!showMore)} style={styles.moreBtn}>
          <Text style={styles.moreBtnText}>Mais filtros {showMore ? '▲' : '▼'}</Text>
        </TouchableOpacity>
      </View>

      {showMore && (
        <View style={styles.extraFilters}>
          <TextInput
            style={styles.extraInput}
            value={maxPrice}
            onChangeText={setMaxPrice}
            placeholder="Preço máximo (R$)"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.extraInput, { marginLeft: SPACING.sm }]}
            value={level}
            onChangeText={setLevel}
            placeholder="Nível (Iniciante, Experiente...)"
            placeholderTextColor={COLORS.textLight}
          />
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.petrol} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.petrol} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Nenhuma prestadora encontrada.</Text>
              <Text style={styles.emptySubText}>Tente outros filtros ou termos de busca.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProviderCard
              provider={item}
              saved={saved.includes(item.id)}
              onSave={() => handleSave(item.id)}
              onPress={() => navigation.navigate('ProviderProfile', { provider_id: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { paddingRight: SPACING.sm },
  backArrow: { fontSize: 28, color: COLORS.petrol, lineHeight: 32 },
  searchInput: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.full,
    paddingVertical: 8, paddingHorizontal: SPACING.md,
    fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.white,
  },
  searchBtn: { paddingLeft: SPACING.sm },
  searchBtnText: { fontSize: 20 },
  filtersRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  moreBtn: { marginLeft: 'auto' },
  moreBtnText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.petrolMid },
  extraFilters: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  extraInput: {
    flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    paddingVertical: 6, paddingHorizontal: SPACING.sm,
    fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textPrimary, backgroundColor: COLORS.white,
  },
  list: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  errorText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.red, textAlign: 'center' },
  emptyText: { fontFamily: FONTS.semiBold, fontSize: 16, color: COLORS.textPrimary, marginBottom: 4 },
  emptySubText: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMedium },
});
