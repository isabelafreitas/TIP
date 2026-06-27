import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import Avatar from '../../components/Avatar';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [neighborhood, setNeighborhood] = useState(user?.neighborhood || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [togglingProvider, setTogglingProvider] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch('/users/me', { name, neighborhood, bio });
      updateUser(res.data.data);
      Alert.alert('Salvo!', 'Perfil atualizado com sucesso.');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleActivateProvider = async () => {
    Alert.alert(
      'Oferecer serviços',
      'Ativar modo prestadora? Você poderá oferecer seus serviços no TIP.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ativar',
          onPress: async () => {
            setTogglingProvider(true);
            try {
              const res = await api.patch('/users/me/provider-profile', { is_provider: true });
              updateUser(res.data.data);
            } catch {
              Alert.alert('Erro', 'Não foi possível ativar o modo prestadora.');
            } finally {
              setTogglingProvider(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Meu perfil</Text>

        <View style={styles.avatarSection}>
          <Avatar name={user?.name} photoUrl={user?.photo_url} size={72} />
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Text style={styles.sectionLabel}>Dados pessoais</Text>
        <Input label="Nome" value={name} onChangeText={setName} />
        <Input label="Bairro" value={neighborhood} onChangeText={setNeighborhood} placeholder="Seu bairro em Campinas" />
        <Input label="Bio" value={bio} onChangeText={setBio} placeholder="Fale um pouco sobre você (máx. 300 caracteres)" multiline maxLength={300} />
        <Text style={styles.charCount}>{bio.length}/300</Text>

        <Button label="Salvar" onPress={handleSave} loading={saving} style={{ marginTop: SPACING.md }} />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Oferecer serviços</Text>
        <View style={styles.providerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.providerTitle}>Modo prestadora</Text>
            <Text style={styles.providerDesc}>Ative para oferecer seus serviços no TIP</Text>
          </View>
          {togglingProvider
            ? <ActivityIndicator color={COLORS.mustard} />
            : <Switch value={false} onValueChange={handleActivateProvider} trackColor={{ true: COLORS.mustard }} />
          }
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Conta</Text>
        {[
          { label: 'Prestadoras salvas', onPress: () => navigation.navigate('SavedProviders') },
          { label: 'Histórico de serviços', onPress: () => navigation.navigate('ServiceHistory') },
          { label: 'Notificações', onPress: () => Alert.alert('Em breve', 'Configurações de notificações em breve.') },
          { label: 'Privacidade', onPress: () => Alert.alert('Em breve', 'Configurações de privacidade em breve.') },
        ].map(item => (
          <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress}>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Sair', 'Deseja sair da conta?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', style: 'destructive', onPress: logout },
        ])}>
          <Text style={[styles.menuLabel, { color: COLORS.red }]}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.navPlaceholder} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.lg, paddingBottom: 100 },
  title: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.textPrimary, marginBottom: SPACING.lg },
  avatarSection: { alignItems: 'center', marginBottom: SPACING.lg },
  email: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMedium, marginTop: SPACING.sm },
  sectionLabel: { fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.textMedium, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm, marginTop: SPACING.md },
  charCount: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textLight, textAlign: 'right', marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },
  providerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.stone },
  providerTitle: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary },
  providerDesc: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMedium, marginTop: 2 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.stone },
  menuLabel: { fontFamily: FONTS.medium, fontSize: 15, color: COLORS.textPrimary },
  menuArrow: { fontSize: 20, color: COLORS.textLight },
  navPlaceholder: { height: 60 },
});
