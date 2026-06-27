import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import api from '../../services/api';

export default function MyServiceScreen({ navigation, route }) {
  const { serviceId } = route.params;
  const [service, setService] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useFocusEffect(useCallback(() => {
    (async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          api.get(`/services/${serviceId}`),
          api.get(`/payments/${serviceId}`).catch(() => ({ data: { data: null } })),
        ]);
        setService(sRes.data.data);
        setPayment(pRes.data.data);
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar o serviço.');
      } finally {
        setLoading(false);
      }
    })();
  }, [serviceId]));

  const handleComplete = async () => {
    setMarking(true);
    try {
      await api.patch(`/services/${serviceId}/complete`);
      navigation.replace('AwaitingConfirmation', { serviceId });
    } catch (e) {
      Alert.alert('Erro', e.response?.data?.error || 'Tente novamente.');
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <ActivityIndicator color={COLORS.petrol} style={{ flex: 1, backgroundColor: COLORS.cream }} />;
  if (!service) return null;

  const requester = service.requester;
  const methodLabel = { pix: 'Pix', credit_once: 'Cartão à vista', credit_2x: 'Cartão 2x', debit: 'Débito' };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu serviço</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>Serviço confirmado · Aguardando realização</Text>
        </View>

        {requester && (
          <View style={styles.requesterCard}>
            <Avatar name={requester.name} photoUrl={requester.photo_url} size={48} />
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={styles.requesterName}>{requester.name}</Text>
              <Text style={styles.category}>{service.category}</Text>
              {service.scheduled_date && (
                <Text style={styles.date}>
                  📅 {service.scheduled_date} · {{ morning: 'Manhã', afternoon: 'Tarde', evening: 'Noite' }[service.scheduled_period] || ''}
                </Text>
              )}
            </View>
            {service.chat_session_id && (
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => navigation.navigate('Chat', { sessionId: service.chat_session_id, otherUserName: requester.name })}
              >
                <Text style={styles.chatBtnText}>Chat</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {payment && (
          <View style={styles.paymentCard}>
            <Text style={styles.payLabel}>Você receberá</Text>
            <Text style={styles.payAmount}>R$ {parseFloat(payment.amount_service).toFixed(2)}</Text>
            <Text style={styles.payMethod}>via {methodLabel[payment.payment_method] || payment.payment_method}</Text>
          </View>
        )}

        <Button
          label="✓ Marcar serviço como concluído"
          onPress={handleComplete}
          loading={marking}
          style={{ marginTop: SPACING.lg, backgroundColor: COLORS.green }}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('CancelServiceProvider', { serviceId, service })}
          style={styles.cancelLink}
        >
          <Text style={styles.cancelLinkText}>Cancelar serviço</Text>
        </TouchableOpacity>
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
  statusBanner: { backgroundColor: COLORS.stone, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', marginBottom: SPACING.lg },
  statusText: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.petrol },
  requesterCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.stone },
  requesterName: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary },
  category: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMedium },
  date: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMedium, marginTop: 2 },
  chatBtn: { borderWidth: 1, borderColor: COLORS.petrolMid, borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 6 },
  chatBtnText: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.petrol },
  paymentCard: { backgroundColor: COLORS.greenBg, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center' },
  payLabel: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.greenDark },
  payAmount: { fontFamily: FONTS.bold, fontSize: 32, color: COLORS.greenDark, marginTop: 4 },
  payMethod: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.greenDark, marginTop: 2 },
  cancelLink: { alignItems: 'center', padding: SPACING.lg },
  cancelLinkText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.red },
});
