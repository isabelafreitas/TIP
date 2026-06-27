import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import Avatar from '../../components/Avatar';
import StarRating from '../../components/StarRating';
import api from '../../services/api';

export default function SavedProvidersScreen({ navigation }) {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    fetchSaved();
  }, []));

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await api.get('/saved');
      setSaved(res.data.data || []);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as prestadoras salvas.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (providerId) => {
    try {
      await api.delete(`/saved/${providerId}`);
      setSaved(prev => prev.filter(p => p.id !== providerId));
    } catch {
      Alert.alert('Erro', 'Tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Prestadoras salvas</Text>
      </View>

      {loading
        ? <ActivityIndicator color={COLORS.petrol} style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={saved}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={fetchSaved}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Nenhuma prestadora salva ainda.</Text>
                <Text style={styles.emptyHint}>Toque no 🔖 no perfil de uma prestadora para salvar.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const pp = item.provider_profile || {};
              const cats = (pp.categories || []).slice(0, 2).join(', ');
              return (
                <View style={styles.card}>
                  <Avatar name={item.name} photoUrl={item.photo_url} size={48} />
                  <View style={{ flex: 1, marginLeft: SPACING.md }}>
                    <Text style={styles.name}>{item.name}</Text>
                    {cats ? <Text style={styles.category}>{cats}</Text> : null}
                    {item.rating_count >= 3
                      ? <StarRating rating={item.rating_avg || 0} size={13} />
                      : <Text style={styles.newProvider}>Novo na plataforma</Text>
                    }
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.viewBtn}
                      onPress={() => navigation.navigate('ProviderProfile', { providerId: item.id })}
                    >
                      <Text style={styles.viewBtnText}>Ver perfil</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleUnsave(item.id)} style={styles.bookmarkBtn}>
                      <Text style={styles.bookmark}>🔖</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: SPACING.md },
  back: { fontSize: 22, color: COLORS.petrol },
  title: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  list: { padding: SPACING.lg, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.stone },
  name: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary },
  category: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMedium, marginBottom: 2 },
  newProvider: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textLight },
  actions: { alignItems: 'flex-end', gap: SPACING.sm },
  viewBtn: { borderWidth: 1, borderColor: COLORS.petrolMid, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 5 },
  viewBtnText: { fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.petrol },
  bookmarkBtn: { padding: 4 },
  bookmark: { fontSize: 20 },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: SPACING.xl },
  emptyText: { fontFamily: FONTS.semiBold, fontSize: 16, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  emptyHint: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMedium, textAlign: 'center' },
});
