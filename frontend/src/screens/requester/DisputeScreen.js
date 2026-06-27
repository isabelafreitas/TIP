import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../services/api';

export default function DisputeScreen({ navigation, route }) {
  const { serviceId } = route.params;
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pickPhoto = async () => {
    if (photos.length >= 3) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setPhotos(prev => [...prev, result.assets[0].uri]);
    }
  };

  const handleSubmit = async () => {
    if (description.trim().length < 20) { setError('Descreva o problema com pelo menos 20 caracteres.'); return; }
    if (photos.length === 0) { setError('Adicione pelo menos uma foto como evidência.'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/disputes', { service_id: serviceId, description: description.trim(), photo_urls: photos });
      Alert.alert('Contestação enviada', 'Nossa equipe analisará o caso em até 48h.', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (e) {
      setError(e.response?.data?.error || 'Erro ao enviar contestação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Abrir contestação</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Descreva o problema *</Text>
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="O que aconteceu? Seja específico..."
            multiline
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />

          <Text style={styles.label}>Fotos como evidência *</Text>
          <View style={styles.photoRow}>
            {photos.map((uri, i) => (
              <Image key={i} source={{ uri }} style={styles.photo} />
            ))}
            {photos.length < 3 && (
              <TouchableOpacity style={styles.photoAdd} onPress={pickPhoto}>
                <Text style={styles.photoAddText}>+</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.resolutionCard}>
            <Text style={styles.resolutionTitle}>Possíveis resoluções</Text>
            <Text style={styles.resolutionItem}>• Reembolso total — serviço não foi realizado</Text>
            <Text style={styles.resolutionItem}>• Reembolso parcial — serviço realizado parcialmente</Text>
            <Text style={styles.resolutionItem}>• Liberação integral — serviço realizado corretamente</Text>
            <Text style={[styles.resolutionItem, { marginTop: SPACING.sm, color: COLORS.textMedium }]}>
              A equipe TIP analisará o caso em até 48h.
            </Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label="Enviar contestação" onPress={handleSubmit} loading={loading} style={{ marginTop: SPACING.lg }} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Voltar — liberar pagamento</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: SPACING.md },
  back: { fontSize: 22, color: COLORS.petrol },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  label: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  photoRow: { flexDirection: 'row', gap: SPACING.sm },
  photo: { width: 80, height: 80, borderRadius: RADIUS.md },
  photoAdd: { width: 80, height: 80, borderRadius: RADIUS.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.petrolMid, justifyContent: 'center', alignItems: 'center' },
  photoAddText: { fontSize: 28, color: COLORS.petrolMid },
  resolutionCard: { backgroundColor: COLORS.stone, borderRadius: RADIUS.lg, padding: SPACING.md, marginTop: SPACING.lg },
  resolutionTitle: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  resolutionItem: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textPrimary, marginBottom: 4 },
  error: { color: COLORS.red, fontFamily: FONTS.regular, fontSize: 13, marginTop: SPACING.sm },
  backLink: { alignItems: 'center', padding: SPACING.md },
  backLinkText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMedium },
});
