import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import api from '../../services/api';

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!targetDate) return;
    const calc = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) { setTimeLeft('Processando liberação...'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}min`);
    };
    calc();
    const iv = setInterval(calc, 60000);
    return () => clearInterval(iv);
  }, [targetDate]);
  return timeLeft;
}

export default function AwaitingConfirmationScreen({ navigation, route }) {
  const { serviceId } = route.params;
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeLeft = useCountdown(payment?.auto_release_at);

  useFocusEffect(useCallback(() => {
    (async () => {
      try {
        const res = await api.get(`/payments/${serviceId}`);
        setPayment(res.data.data);
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar os dados.');
      } finally {
        setLoading(false);
      }
    })();
  }, [serviceId]));

  if (loading) return <ActivityIndicator color={COLORS.petrol} style={{ flex: 1, backgroundColor: COLORS.cream }} />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('ProviderHome')}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aguardando confirmação</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.statusBanner}>
          <Text style={styles.statusIcon}>⏳</Text>
          <Text style={styles.statusTitle}>Aguardando a solicitadora</Text>
          <Text style={styles.statusDesc}>Ela tem até 24h para confirmar que o serviço foi realizado.</Text>
        </View>

        {timeLeft ? (
          <View style={styles.countdownCard}>
            <Text style={styles.countdownLabel}>Liberação automática em</Text>
            <Text style={styles.countdown}>{timeLeft}</Text>
          </View>
        ) : null}

        {payment && (
          <View style={styles.payCard}>
            <Text style={styles.payLabel}>Você receberá</Text>
            <Text style={styles.payAmount}>R$ {parseFloat(payment.amount_service).toFixed(2)}</Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Se a solicitadora contestar o serviço, nossa equipe analisará o caso com base nas evidências apresentadas.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: SPACING.md },
  back: { fontSize: 22, color: COLORS.petrol },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  content: { flex: 1, padding: SPACING.lg, gap: SPACING.md },
  statusBanner: { backgroundColor: COLORS.stone, borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center' },
  statusIcon: { fontSize: 40, marginBottom: SPACING.sm },
  statusTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  statusDesc: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMedium, marginTop: 4, textAlign: 'center' },
  countdownCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.stone },
  countdownLabel: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMedium },
  countdown: { fontFamily: FONTS.bold, fontSize: 32, color: COLORS.petrol, marginTop: 4 },
  payCard: { backgroundColor: COLORS.greenBg, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center' },
  payLabel: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.greenDark },
  payAmount: { fontFamily: FONTS.bold, fontSize: 28, color: COLORS.greenDark, marginTop: 4 },
  infoCard: { backgroundColor: COLORS.stone, borderRadius: RADIUS.md, padding: SPACING.md },
  infoText: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMedium },
});
