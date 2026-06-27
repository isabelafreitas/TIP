import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import Button from '../../components/Button';
import api from '../../services/api';

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!targetDate) return;
    const interval = setInterval(() => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) { setTimeLeft('Liberação automática em breve'); clearInterval(interval); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}min`);
    }, 60000);
    const diff = new Date(targetDate) - new Date();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    setTimeLeft(`${h}h ${m}min`);
    return () => clearInterval(interval);
  }, [targetDate]);
  return timeLeft;
}

export default function ConfirmServiceScreen({ navigation, route }) {
  const { serviceId } = route.params;
  const [service, setService] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const timeLeft = useCountdown(payment?.auto_release_at);

  useFocusEffect(useCallback(() => {
    (async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          api.get(`/services/${serviceId}`),
          api.get(`/payments/${serviceId}`),
        ]);
        setService(sRes.data.data);
        setPayment(pRes.data.data);
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar os dados.');
      } finally {
        setLoading(false);
      }
    })();
  }, [serviceId]));

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await api.patch(`/services/${serviceId}/confirm`);
      Alert.alert('Pagamento liberado!', 'Obrigada por usar o TIP. Avalie o serviço recebido.', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (e) {
      Alert.alert('Erro', e.response?.data?.error || 'Tente novamente.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <ActivityIndicator color={COLORS.petrol} style={{ flex: 1, backgroundColor: COLORS.cream }} />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar serviço</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusBanner}>
          <Text style={styles.statusTitle}>Serviço concluído!</Text>
          <Text style={styles.statusSub}>Confirme para liberar o pagamento da prestadora.</Text>
        </View>

        {timeLeft ? (
          <View style={styles.countdownCard}>
            <Text style={styles.countdownLabel}>Liberação automática em</Text>
            <Text style={styles.countdown}>{timeLeft}</Text>
          </View>
        ) : null}

        {payment && (
          <View style={styles.paymentCard}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Serviço</Text>
              <Text style={styles.rowValue}>R$ {parseFloat(payment.amount_service).toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Taxa TIP</Text>
              <Text style={styles.rowValue}>R$ {parseFloat(payment.amount_fee).toFixed(2)}</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>A liberar</Text>
              <Text style={styles.totalValue}>R$ {parseFloat(payment.amount_service).toFixed(2)}</Text>
            </View>
          </View>
        )}

        <Button
          label="✓ Liberar pagamento"
          onPress={handleConfirm}
          loading={confirming}
          style={{ marginTop: SPACING.lg, backgroundColor: COLORS.green }}
        />
        <Button
          label="Algo deu errado — contestar"
          variant="danger"
          onPress={() => navigation.navigate('Dispute', { serviceId })}
          style={{ marginTop: SPACING.sm }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: SPACING.md },
  back: { fontSize: 22, color: COLORS.petrol },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  statusBanner: { backgroundColor: COLORS.greenBg, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.lg },
  statusTitle: { fontFamily: FONTS.bold, fontSize: 20, color: COLORS.greenDark },
  statusSub: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.greenDark, marginTop: 4, textAlign: 'center' },
  countdownCard: { backgroundColor: COLORS.stone, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', marginBottom: SPACING.md },
  countdownLabel: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMedium },
  countdown: { fontFamily: FONTS.bold, fontSize: 28, color: COLORS.petrol, marginTop: 4 },
  paymentCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.stone, marginBottom: SPACING.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMedium },
  rowValue: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textPrimary },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 4, paddingTop: 8 },
  totalLabel: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary },
  totalValue: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.green },
});
