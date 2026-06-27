import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import api from '../../services/api';

const CONTEXT_TAGS = [
  'Na minha casa','Deslocamento','Uso de tempo','Presencial','Digital',
  'Trabalho manual','Envolve pets','Ao ar livre','Urgente','Recorrente',
];
const EXPIRE_OPTIONS = [
  { label: '24h', value: 24 },
  { label: '48h', value: 48 },
  { label: '72h', value: 72 },
  { label: '7 dias', value: 168 },
];

export default function PublishAnnouncementScreen({ navigation }) {
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [expectedPrice, setExpectedPrice] = useState('');
  const [expiresIn, setExpiresIn] = useState(48);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handlePublish = async () => {
    if (description.trim().length < 20) {
      setError('Descreva com pelo menos 20 caracteres o que você precisa.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/announcements', {
        description: description.trim(),
        tags: selectedTags,
        expected_price: expectedPrice ? parseFloat(expectedPrice.replace(',', '.')) : null,
        expires_in: expiresIn,
      });
      Alert.alert('Publicado!', 'Prestadoras da sua região serão notificadas.', [
        { text: 'OK', onPress: () => navigation.navigate('MyAnnouncements') },
      ]);
    } catch (e) {
      setError(e.response?.data?.error || 'Erro ao publicar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Publicar necessidade</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>O que você precisa? *</Text>
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="Descreva o que você precisa com detalhes..."
            multiline
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />

          <Text style={styles.label}>Contexto</Text>
          <View style={styles.chips}>
            {CONTEXT_TAGS.map(tag => (
              <Chip
                key={tag}
                label={tag}
                active={selectedTags.includes(tag)}
                onPress={() => toggleTag(tag)}
              />
            ))}
          </View>

          <Text style={styles.label}>Valor esperado (opcional)</Text>
          <Input
            value={expectedPrice}
            onChangeText={setExpectedPrice}
            placeholder="0,00"
            keyboardType="numeric"
            prefix="R$"
          />

          <Text style={styles.label}>Prazo para receber propostas</Text>
          <View style={styles.chips}>
            {EXPIRE_OPTIONS.map(opt => (
              <Chip
                key={opt.value}
                label={opt.label}
                active={expiresIn === opt.value}
                onPress={() => setExpiresIn(opt.value)}
              />
            ))}
          </View>

          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              📢 Prestadoras da sua região serão notificadas.
            </Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label="Publicar necessidade" onPress={handlePublish} loading={loading} style={{ marginTop: SPACING.lg }} />
          <Button label="Cancelar" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: SPACING.sm }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { marginRight: SPACING.md },
  backArrow: { fontSize: 22, color: COLORS.petrol },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textPrimary },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  label: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.textPrimary, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  infoBanner: { backgroundColor: COLORS.stone, borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.lg },
  infoText: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMedium },
  error: { color: COLORS.red, fontFamily: FONTS.regular, fontSize: 13, marginTop: SPACING.sm },
});
