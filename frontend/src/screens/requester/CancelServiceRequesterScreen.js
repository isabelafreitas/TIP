import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import Chip from '../../components/Chip';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../services/api';

const REASONS = ['Imprevisto pessoal', 'Problema de saúde', 'Mudança de planos', 'Outro'];

export default function CancelServiceRequesterScreen({ navigation, route }) {
  const { serviceId, service } = route.params;
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const refundAmount = service?.payment?.amount_total || null;

  const handleCancel = async () => {
    if (!reason) { Alert.alert('Atenção', 'Selecione um motivo para o cancelamento.'); return; }
    Alert.alert('Confirmar cancelamento', 'Tem certeza? Você receberá o reembolso total.', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim, cancelar',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await api.patch(`/services/${serviceId}/cancel`, { reason: `${reason}${details ? ': ' + details : ''}` });
            Alert.alert('Cancelado', 'Seu serviço foi cancelado. O reembolso será processado em breve.', [
              { text: 'OK', onPress: () => navigation.navigate('Home') },
            ]);
          } catch (e) {
            Alert.alert('Erro', e.response?.data?.error || 'Tente novamente.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancelar serviço</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.ruleBanner}>
          <Text style={styles.ruleTitle}>Cancelamento com mais de 12h de antecedência</Text>
          <Text style={styles.ruleDesc}>Você receberá reembolso total.</Text>
          {refundAmount && (
            <Text style={styles.refundAmount}>
              Reembolso: R$ {parseFloat(refundAmount).toFixed(2)}
            </Text>
          )}
        </View>

        <Text style={styles.label}>Motivo *</Text>
        <View style={styles.chips}>
          {REASONS.map(r => (
            <Chip key={r} label={r} active={reason === r} onPress={() => setReason(r)} />
          ))}
        </View>

        <Text style={styles.label}>Detalhes (opcional)</Text>
        <Input
          value={details}
          onChangeText={setDetails}
          placeholder="Algum detalhe adicional?"
          multiline
        />

        <Button
          label="Confirmar cancelamento"
          onPress={handleCancel}
          loading={loading}
          style={{ marginTop: SPACING.xl, backgroundColor: COLORS.red, borderColor: COLORS.redBorder }}
        />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Voltar — não cancelar</Text>
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
  ruleBanner: { backgroundColor: COLORS.greenBg, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg },
  ruleTitle: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.greenDark },
  ruleDesc: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.greenDark, marginTop: 4 },
  refundAmount: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.greenDark, marginTop: SPACING.sm },
  label: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  backLink: { alignItems: 'center', padding: SPACING.md },
  backLinkText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMedium },
});
