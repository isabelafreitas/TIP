import React, { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity, StyleSheet, TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';

const CATEGORIES = ['Limpeza', 'Elétrica', 'Hidráulica', 'Beleza', 'Aulas', 'Outro'];
const PERIODS = ['Manhã', 'Tarde', 'Noite'];

export default function RequestServiceScreen({ navigation, route }) {
  const { provider } = route.params;
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [data, setData] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [valor, setValor] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  function validate() {
    const e = {};
    if (!descricao.trim()) e.descricao = 'Descrição obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function pickPhoto() {
    if (photos.length >= 3) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos(prev => [...prev, result.assets[0].uri]);
    }
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const payload = {
        provider_id: provider.id,
        description: descricao.trim(),
        category: categoria,
        date: data.trim(),
        period: periodo,
        suggested_value: valor ? parseFloat(valor) : undefined,
        photos,
      };
      const res = await api.post('/services', payload);
      navigation.navigate('ServiceTracking', { service_id: res.data.id || res.data.service?.id });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erro ao solicitar serviço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Solicitar serviço</Text>

          <View style={styles.providerCard}>
            <Avatar uri={provider.photo_url} name={provider.name} size={40} />
            <View style={{ marginLeft: SPACING.sm }}>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.providerCat}>{provider.categories?.[0] || provider.category || ''}</Text>
            </View>
          </View>

          {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Descreva o serviço que precisa..."
            placeholderTextColor={COLORS.textLight}
            multiline
            numberOfLines={4}
            style={[styles.textArea, errors.descricao && styles.errBorder]}
          />
          {errors.descricao ? <Text style={styles.errText}>{errors.descricao}</Text> : null}

          <Text style={styles.label}>Categoria</Text>
          <View style={styles.chipsRow}>
            {CATEGORIES.map(cat => (
              <Chip key={cat} label={cat} active={categoria === cat} onPress={() => setCategoria(cat)} />
            ))}
          </View>

          <Text style={styles.label}>Data desejada</Text>
          <TextInput
            value={data}
            onChangeText={setData}
            placeholder="Ex: 15/07/2025 ou próxima semana"
            placeholderTextColor={COLORS.textLight}
            style={styles.input}
          />

          <Text style={styles.label}>Período</Text>
          <View style={styles.chipsRow}>
            {PERIODS.map(p => (
              <Chip key={p} label={p} active={periodo === p} onPress={() => setPeriodo(p)} />
            ))}
          </View>

          <Text style={styles.label}>Valor sugerido (R$)</Text>
          <TextInput
            value={valor}
            onChangeText={setValor}
            placeholder="Opcional"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.label}>Fotos ({photos.length}/3)</Text>
          <TouchableOpacity onPress={pickPhoto} style={styles.photoBtn} disabled={photos.length >= 3}>
            <Text style={styles.photoBtnText}>+ Adicionar foto</Text>
          </TouchableOpacity>
          {photos.length > 0 && (
            <View style={styles.photosRow}>
              {photos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.photoThumb} />
              ))}
            </View>
          )}

          <Button title="Solicitar serviço" onPress={handleSubmit} loading={loading} style={styles.btn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.xl, paddingBottom: SPACING.xxl },
  backBtn: { marginBottom: SPACING.sm },
  backArrow: { fontSize: 28, color: COLORS.petrol },
  title: { fontFamily: FONTS.extraBold, fontSize: 22, color: COLORS.textPrimary, marginBottom: SPACING.md },
  providerCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.stone, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.xl,
  },
  providerName: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary },
  providerCat: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMedium },
  apiError: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.red, backgroundColor: COLORS.redBg, padding: SPACING.sm, borderRadius: 8, marginBottom: SPACING.md },
  label: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMedium, marginBottom: 4 },
  textArea: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: SPACING.sm, fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textPrimary,
    backgroundColor: COLORS.white, height: 96, textAlignVertical: 'top', marginBottom: 4,
  },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    paddingVertical: 10, paddingHorizontal: 12,
    fontFamily: FONTS.regular, fontSize: 15, color: COLORS.textPrimary,
    backgroundColor: COLORS.white, marginBottom: SPACING.md,
  },
  errBorder: { borderColor: COLORS.redBorder },
  errText: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.red, marginBottom: SPACING.sm },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md },
  photoBtn: {
    borderWidth: 1.5, borderColor: COLORS.petrolMid, borderStyle: 'dashed',
    borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center', marginBottom: SPACING.sm,
  },
  photoBtnText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.petrolMid },
  photosRow: { flexDirection: 'row', marginBottom: SPACING.md },
  photoThumb: { width: 72, height: 72, borderRadius: RADIUS.sm, marginRight: SPACING.sm },
  btn: { marginTop: SPACING.md },
});
