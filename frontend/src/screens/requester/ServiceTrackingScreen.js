import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import Avatar from '../../components/Avatar';
import api from '../../services/api';

const STATUS_LABELS = {
  pending: 'Aguardando aceite',
  accepted: 'Aceito — realize o pagamento',
  scheduled: 'Serviço agendado',
  in_progress: 'Em andamento',
  completed_by_provider: 'Serviço concluído — confirme!',
  confirmed: 'Concluído',
  disputed: 'Em contestação',
  cancelled: 'Cancelado',
};

export default function ServiceTrackingScreen({ navigation, route }) {
  const { serviceId } = route.params;
  const [service, setService] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    fetchData();
  }, [serviceId]));

  const fetchData = async () => {
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
  };

  if (loading) return <ActivityIndicator color={COLORS.petrol} style={{ flex: 1, backgroundColor: COLORS.cream }} />;
  if (!service) return null;

  const provider = service.provider;
  const isCompleted = service.status === 'completed_by_provider';

  const handleCancel = () => {
    // Determine if < 12h to show correct screen
    navigation.navigate('CancelServiceRequester', { serviceId, service });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu serviço</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.statusBanner, isCompleted ? styles.statusBannerGreen : styles.statusBannerBlue]}>
          <Text style={[styles.statusText, isCompleted ? styles.statusTextGreen : styles.statusTextBlue]}>
            {STATUS_LABELS[service.status] || service.status}
          </Text>
        </View>

        {provider && (
          <View style={styles.providerCard}>
            <Avatar name={provider.name} photoUrl={provider.photo_url} size={48} />
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.providerCategory}>{service.category}</Text>
            </View>
            {service.chat_session_id && (
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => navigation.navigate('Chat', {
                  sessionId: service.chat_session_id,
                  otherUserName: provider.name,
                })}
              >
                <Text style={styles.chatBtnText}>Chat</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {payment && (
          <View style={styles.paymentCard}>
            <Text style={styles.sectionTitle}>Pagamento retido</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Serviço</Text>
              <Text style={styles.paymentValue}>R$ {parseFloat(payment.amount_service).toFixed(2)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Taxa TIP (10%)</Text>
              <Text style={styles.paymentValue}>R$ {parseFloat(payment.amount_fee).toFixed(2)}</Text>
            </View>
            <View style={[styles.paymentRow, styles.paymentTotal]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>R$ {parseFloat(payment.amount_total).toFixed(2)}</Text>
            </View>
          </View>
        )}

        <View style={styles.escrowBanner}>
          <Text style={styles.escrowText}>
            🔒 Seu pagamento está retido com segurança. Liberado apenas após sua confirmação.
          </Text>
        </View>

        {isCompleted && (
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => navigation.navigate('ConfirmService', { serviceId })}
          >
            <Text style={styles.confirmBtnText}>Confirmar serviço recebido</Text>
          </TouchableOpacity>
        )}

        {['scheduled', 'accepted', 'in_progress'].includes(service.status) && (
          <TouchableOpacity onPress={handleCancel} style={styles.cancelLink}>
            <Text style={styles.cancelLinkText}>Cancelar serviço</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: SPACING.md },
  backArrow: { fontSize: 22, color: COLORS.petrol },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  statusBanner: { borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg, alignItems: 'center' },
  statusBannerBlue: { backgroundColor: COLORS.stone },
  statusBannerGreen: { backgroundColor: COLORS.greenBg },
  statusText: { fontFamily: FONTS.semiBold, fontSize: 15 },
  statusTextBlue: { color: COLORS.petrol },
  statusTextGreen: { color: COLORS.greenDark },
  providerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.stone },
  providerName: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary },
  providerCategory: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMedium },
  chatBtn: { borderWidth: 1, borderColor: COLORS.petrolMid, borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 6 },
  chatBtnText: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.petrol },
  paymentCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.stone },
  sectionTitle: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  paymentLabel: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMedium },
  paymentValue: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textPrimary },
  paymentTotal: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 4, paddingTop: 8 },
  totalLabel: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary },
  totalValue: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.petrol },
  escrowBanner: { backgroundColor: COLORS.greenBg, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg },
  escrowText: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.greenDark },
  confirmBtn: { backgroundColor: COLORS.mustard, borderRadius: RADIUS.lg, padding: 14, alignItems: 'center', marginBottom: SPACING.md },
  confirmBtnText: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textPrimary },
  cancelLink: { alignItems: 'center', padding: SPACING.md },
  cancelLinkText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.red },
});
