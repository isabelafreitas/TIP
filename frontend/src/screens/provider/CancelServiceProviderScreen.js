import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import Chip from '../../components/Chip';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const REASONS = ['Imprevisto pessoal', 'Problema de saúde', 'Não consigo atender', 'Outro'];

export default function CancelServiceProviderScreen({ navigation, route }) {
  const { serviceId, service } = route.params;
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const cancelCount = user?.cancellation_count_30d || 0;

  const handleCancel = async () => {
    if (!reason) { Alert.alert('Atenção', 'Selecione um motivo.'); return; }
    Alert.alert(
      'Confirmar cancelamento',
      'O cancelamento será registrado no seu perfil e a solicitadora receberá reembolso total.',
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await api.patch(`/services/${serviceId}/cancel`, { reason: `${reason}${details ? ': ' + details : ''}` });
              navigation.navigate('ProviderHome');
            } catch (e) {
              Alert.alert('Erro', e.response?.data?.error || 'Tente novamente.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
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
        <View style={styles.warningBanner}>
          <Text style={styles.warningTitle}>⚠️ Atenção</Text>
          <Text style={styles.warningText}>
            O cancelamento será registrado no seu perfil.{'\n'}
            A solicitadora receberá reembolso total.
          </Text>
        </View>

        <View style={styles.countCard}>
          <Text style={styles.countText}>{cancelCount} cancelamento(s) nos últimos 30 dias</Text>
          {cancelCount >= 2 && (
            <Text style={styles.countWarn}>⚠️ Mais 1 cancelamento pode reduzir sua visibilidade na plataforma.</Text>
          )}
        </View>

        <Text style={styles.label}>Motivo *</Text>
        <View style={styles.chips}>
          {REASONS.map(r => (
            <Chip key={r} label={r} active={reason === r} onPress={() => setReason(r)} />
          ))}
        </View>

        <Text style={styles.label}>Detalhes (opcional)</Text>
        <Input value={details} onChangeText={setDetails} placeholder="Algum detalhe adicional?" multiline />

        <Button
          label="Confirmar cancelamento"
          onPress={handleCancel}
          loading={loading}
          style={{ marginTop: SPACING.xl, backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.redBorder }}
          textStyle={{ color: COLORS.red }}
        />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Voltar</Text>
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
  warningBanner: { backgroundColor: COLORS.redBg, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md },
  warningTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.red },
  warningText: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.red, marginTop: 4 },
  countCard: { backgroundColor: COLORS.stone, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md },
  countText: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary },
  countWarn: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.red, marginTop: 4 },
  label: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  backLink: { alignItems: 'center', padding: SPACING.md },
  backLinkText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMedium },
});
