import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import BottomNavProvider from '../../components/BottomNavProvider';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const PERIODS = ['Manhã', 'Tarde', 'Noite'];
const PERIOD_MAP = { morning: 'Manhã', afternoon: 'Tarde', evening: 'Noite' };

export default function AgendaScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alwaysAvailable, setAlwaysAvailable] = useState(
    user?.provider_profile?.availability?.always || false
  );
  const [availability, setAvailability] = useState(
    user?.provider_profile?.availability?.slots || {}
  );
  const [savingAvail, setSavingAvail] = useState(false);

  useFocusEffect(useCallback(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/services/mine');
        const active = (res.data.data || []).filter(s =>
          ['scheduled', 'confirmed', 'accepted'].includes(s.status)
        );
        setServices(active);
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar a agenda.');
      } finally {
        setLoading(false);
      }
    })();
  }, []));

  const toggleSlot = (day, period) => {
    const key = `${day}_${period}`;
    setAvailability(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveAvailability = async () => {
    setSavingAvail(true);
    try {
      const res = await api.patch('/users/me/provider-profile', {
        provider_profile: {
          ...user?.provider_profile,
          availability: { always: alwaysAvailable, slots: availability },
        },
      });
      updateUser(res.data.data);
      Alert.alert('Salvo!', 'Disponibilidade atualizada.');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setSavingAvail(false);
    }
  };

  const groupedServices = services.reduce((acc, s) => {
    const date = s.scheduled_date || 'Sem data';
    if (!acc[date]) acc[date] = [];
    acc[date].push(s);
    return acc;
  }, {});

  const hasConflict = Object.values(groupedServices).some(group => {
    const slots = group.map(s => s.scheduled_period);
    return slots.length !== new Set(slots).size;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
      </View>
      <View style={styles.tabs}>
        {['services', 'availability'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'services' ? 'Serviços' : 'Disponibilidade'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'services' ? (
        <ScrollView contentContainerStyle={styles.content}>
          {hasConflict && (
            <View style={styles.conflictBanner}>
              <Text style={styles.conflictText}>⚠️ Conflito de horário detectado em um ou mais dias.</Text>
            </View>
          )}
          {loading
            ? <ActivityIndicator color={COLORS.petrol} style={{ marginTop: 40 }} />
            : Object.keys(groupedServices).sort().map(date => (
              <View key={date}>
                <Text style={styles.dateHeader}>{date}</Text>
                {groupedServices[date].map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.serviceCard}
                    onPress={() => navigation.navigate('MyService', { serviceId: s.id })}
                  >
                    <Text style={styles.serviceCategory}>{s.category}</Text>
                    <Text style={styles.servicePeriod}>{PERIOD_MAP[s.scheduled_period] || ''}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>{s.status}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          }
          {!loading && services.length === 0 && (
            <Text style={styles.empty}>Nenhum serviço agendado.</Text>
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.alwaysRow}>
            <Text style={styles.alwaysLabel}>Sempre disponível</Text>
            <TouchableOpacity
              style={[styles.toggle, alwaysAvailable && styles.toggleOn]}
              onPress={() => setAlwaysAvailable(!alwaysAvailable)}
            >
              <View style={[styles.toggleDot, alwaysAvailable && styles.toggleDotOn]} />
            </TouchableOpacity>
          </View>
          {!alwaysAvailable && (
            <View style={styles.grid}>
              <View style={styles.gridHeader}>
                <View style={styles.gridCell} />
                {PERIODS.map(p => (
                  <Text key={p} style={styles.gridHeaderText}>{p}</Text>
                ))}
              </View>
              {DAYS.map(day => (
                <View key={day} style={styles.gridRow}>
                  <Text style={styles.gridDayText}>{day}</Text>
                  {PERIODS.map(period => {
                    const key = `${day}_${period}`;
                    const active = availability[key];
                    return (
                      <TouchableOpacity
                        key={period}
                        style={[styles.gridCell, active && styles.gridCellActive]}
                        onPress={() => toggleSlot(day, period)}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.saveBtn} onPress={saveAvailability} disabled={savingAvail}>
            <Text style={styles.saveBtnText}>{savingAvail ? 'Salvando...' : 'Salvar disponibilidade'}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      <BottomNavProvider navigation={navigation} active="Agenda" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  header: { padding: SPACING.lg, paddingBottom: SPACING.sm },
  title: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.textPrimary },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, padding: SPACING.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.petrol },
  tabText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMedium },
  tabTextActive: { color: COLORS.petrol, fontFamily: FONTS.semiBold },
  content: { padding: SPACING.lg, paddingBottom: 100 },
  conflictBanner: { backgroundColor: COLORS.redBg, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md },
  conflictText: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.red },
  dateHeader: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.textMedium, marginBottom: SPACING.sm, marginTop: SPACING.md },
  serviceCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.stone, flexDirection: 'row', alignItems: 'center' },
  serviceCategory: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary, flex: 1 },
  servicePeriod: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMedium, marginRight: SPACING.sm },
  statusBadge: { backgroundColor: COLORS.stone, borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 2 },
  statusBadgeText: { fontFamily: FONTS.semiBold, fontSize: 11, color: COLORS.petrol },
  empty: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMedium, textAlign: 'center', marginTop: 40 },
  alwaysRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  alwaysLabel: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary },
  toggle: { width: 36, height: 20, borderRadius: 10, backgroundColor: COLORS.textLight, justifyContent: 'center', padding: 2 },
  toggleOn: { backgroundColor: COLORS.mustard },
  toggleDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.white },
  toggleDotOn: { alignSelf: 'flex-end' },
  grid: { marginBottom: SPACING.lg },
  gridHeader: { flexDirection: 'row', marginBottom: 4 },
  gridHeaderText: { flex: 1, fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.textMedium, textAlign: 'center' },
  gridRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  gridDayText: { width: 36, fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.textMedium },
  gridCell: { flex: 1, height: 36, borderRadius: RADIUS.sm, backgroundColor: COLORS.stone, marginHorizontal: 2 },
  gridCellActive: { backgroundColor: COLORS.petrol },
  saveBtn: { backgroundColor: COLORS.mustard, borderRadius: RADIUS.lg, padding: 14, alignItems: 'center' },
  saveBtnText: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary },
});
