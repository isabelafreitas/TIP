import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import Avatar from '../../components/Avatar';
import Input from '../../components/Input';
import Chip from '../../components/Chip';
import Button from '../../components/Button';
import StarRating from '../../components/StarRating';
import { useAuth } from '../../context/AuthContext';
import BottomNavProvider from '../../components/BottomNavProvider';
import api from '../../services/api';

const CATEGORIES = ['Limpeza','Elétrica','Hidráulica','Beleza','Aulas','Culinária','Pet care','Tecnologia','Outros'];
const LEVELS = ['Iniciante', 'Experiente', 'Expert'];

export default function ProviderProfileSettingsScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const pp = user?.provider_profile || {};

  const [name, setName] = useState(user?.name || '');
  const [neighborhood, setNeighborhood] = useState(user?.neighborhood || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isProvider, setIsProvider] = useState(user?.is_provider || false);
  const [categories, setCategories] = useState(pp.categories || []);
  const [level, setLevel] = useState(pp.level || '');
  const [priceFrom, setPriceFrom] = useState(pp.price_from ? String(pp.price_from) : '');
  const [priceTo, setPriceTo] = useState(pp.price_to ? String(pp.price_to) : '');
  const [area, setArea] = useState(pp.area || '');
  const [portfolio, setPortfolio] = useState(pp.portfolio || []);
  const [saving, setSaving] = useState(false);

  const toggleCategory = (cat) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const pickPortfolioPhoto = async () => {
    if (portfolio.length >= 6) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setPortfolio(prev => [...prev, result.assets[0].uri]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const [uRes] = await Promise.all([
        api.patch('/users/me', { name, neighborhood, bio }),
        isProvider ? api.patch('/users/me/provider-profile', {
          is_provider: true,
          provider_profile: { categories, level, price_from: parseFloat(priceFrom) || null, price_to: parseFloat(priceTo) || null, area, portfolio },
        }) : Promise.resolve(),
      ]);
      updateUser(uRes.data.data);
      Alert.alert('Salvo!', 'Perfil atualizado com sucesso.');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Meu perfil</Text>

        <View style={styles.avatarSection}>
          <Avatar name={user?.name} photoUrl={user?.photo_url} size={72} />
          {user?.is_provider && user?.rating_count >= 3 && (
            <View style={{ marginTop: SPACING.sm, alignItems: 'center' }}>
              <StarRating rating={user?.rating_avg || 0} size={16} />
              <Text style={styles.ratingCount}>{user?.rating_count} avaliações</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>Dados pessoais</Text>
        <Input label="Nome" value={name} onChangeText={setName} />
        <Input label="Bairro" value={neighborhood} onChangeText={setNeighborhood} />
        <Input label="Bio" value={bio} onChangeText={setBio} multiline maxLength={300} />

        <View style={[styles.providerSection, isProvider && styles.providerSectionActive]}>
          <View style={styles.providerHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.providerTitle}>Oferecer serviços</Text>
              <Text style={styles.providerDesc}>Modo prestadora {isProvider ? 'ativo' : 'inativo'}</Text>
            </View>
            <Switch
              value={isProvider}
              onValueChange={setIsProvider}
              trackColor={{ true: COLORS.mustard, false: COLORS.textLight }}
            />
          </View>

          {isProvider && (
            <View style={styles.providerFields}>
              <Text style={styles.fieldLabel}>Categorias</Text>
              <View style={styles.chips}>
                {CATEGORIES.map(c => (
                  <Chip key={c} label={c} active={categories.includes(c)} onPress={() => toggleCategory(c)} />
                ))}
              </View>

              <Text style={styles.fieldLabel}>Nível</Text>
              <View style={styles.chips}>
                {LEVELS.map(l => (
                  <Chip key={l} label={l} active={level === l} onPress={() => setLevel(l)} />
                ))}
              </View>

              <Text style={styles.fieldLabel}>Faixa de preço</Text>
              <View style={styles.priceRow}>
                <Input label="De R$" value={priceFrom} onChangeText={setPriceFrom} keyboardType="numeric" style={{ flex: 1 }} />
                <View style={{ width: SPACING.md }} />
                <Input label="Até R$" value={priceTo} onChangeText={setPriceTo} keyboardType="numeric" style={{ flex: 1 }} />
              </View>

              <Text style={styles.fieldLabel}>Área de atendimento</Text>
              <Input value={area} onChangeText={setArea} placeholder="Ex: Barão Geraldo, Campinas" />

              <Text style={styles.fieldLabel}>Portfólio</Text>
              <View style={styles.portfolioGrid}>
                {portfolio.map((uri, i) => (
                  <Image key={i} source={{ uri }} style={styles.portfolioPhoto} />
                ))}
                {portfolio.length < 6 && (
                  <TouchableOpacity style={styles.portfolioAdd} onPress={pickPortfolioPhoto}>
                    <Text style={styles.portfolioAddText}>+</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        <Button label="Salvar" onPress={handleSave} loading={saving} style={{ marginTop: SPACING.lg }} />

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>Conta</Text>
        {[
          { label: 'Histórico de serviços', onPress: () => navigation.navigate('ServiceHistory') },
          { label: 'Notificações', onPress: () => Alert.alert('Em breve') },
        ].map(item => (
          <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress}>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Sair', 'Deseja sair?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', style: 'destructive', onPress: logout },
        ])}>
          <Text style={[styles.menuLabel, { color: COLORS.red }]}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNavProvider navigation={navigation} active="ProviderProfileSettings" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.lg, paddingBottom: 100 },
  title: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.textPrimary, marginBottom: SPACING.lg },
  avatarSection: { alignItems: 'center', marginBottom: SPACING.lg },
  ratingCount: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMedium, marginTop: 2 },
  sectionLabel: { fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.textMedium, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm, marginTop: SPACING.md },
  providerSection: { borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.border, padding: SPACING.md, marginTop: SPACING.lg },
  providerSectionActive: { borderColor: COLORS.petrol },
  providerHeader: { flexDirection: 'row', alignItems: 'center' },
  providerTitle: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary },
  providerDesc: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMedium },
  providerFields: { marginTop: SPACING.md, gap: SPACING.sm },
  fieldLabel: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.textPrimary, marginTop: SPACING.sm, marginBottom: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  priceRow: { flexDirection: 'row' },
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  portfolioPhoto: { width: 80, height: 80, borderRadius: RADIUS.md },
  portfolioAdd: { width: 80, height: 80, borderRadius: RADIUS.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.petrolMid, justifyContent: 'center', alignItems: 'center' },
  portfolioAddText: { fontSize: 28, color: COLORS.petrolMid },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.stone },
  menuLabel: { fontFamily: FONTS.medium, fontSize: 15, color: COLORS.textPrimary },
  menuArrow: { fontSize: 20, color: COLORS.textLight },
});
