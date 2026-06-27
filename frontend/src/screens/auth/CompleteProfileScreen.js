import React, { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';

export default function CompleteProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [bairro, setBairro] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const progress = [
    photo ? 25 : 0,
    bairro.trim() ? 25 : 0,
    bio.trim() ? 50 : 0,
  ].reduce((a, b) => a + b, 0);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  }

  async function handleSave() {
    setSaving(true);
    setApiError('');
    try {
      await updateUser({ photo_url: photo, bairro: bairro.trim(), bio: bio.trim() });
      navigateHome();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  }

  function navigateHome() {
    // RootNavigator handles this based on user.is_provider
    // We just reset navigation
    navigation.reset({ index: 0, routes: [{ name: user?.is_provider ? 'ProviderHome' : 'Home' }] });
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Complete seu perfil</Text>
          <Text style={styles.subtitle}>Quanto mais completo, mais confiança você transmite.</Text>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}% concluído</Text>

          <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage} activeOpacity={0.8}>
            {photo
              ? <Image source={{ uri: photo }} style={styles.avatarImg} />
              : <Avatar name={user?.name} size={88} />
            }
            <View style={styles.cameraBtn}>
              <Text style={{ fontSize: 16 }}>📷</Text>
            </View>
          </TouchableOpacity>

          {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

          <Input
            label="Bairro"
            value={bairro}
            onChangeText={setBairro}
            placeholder="Ex: Pinheiros, São Paulo"
          />

          <View>
            <Input
              label="Bio"
              value={bio}
              onChangeText={(t) => { if (t.length <= 300) setBio(t); }}
              placeholder="Conte um pouco sobre você..."
              multiline
              numberOfLines={4}
            />
            <Text style={styles.charCount}>{bio.length}/300</Text>
          </View>

          <Button title="Salvar" onPress={handleSave} loading={loading} style={styles.btn} />
          <Button
            title="Fazer depois"
            onPress={navigateHome}
            variant="ghost"
            style={styles.laterBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content: { flexGrow: 1, paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: SPACING.xxl },
  title: { fontFamily: FONTS.extraBold, fontSize: 24, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subtitle: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMedium, marginBottom: SPACING.md },
  progressBar: { height: 6, backgroundColor: COLORS.stone, borderRadius: 3, marginBottom: 4 },
  progressFill: { height: 6, backgroundColor: COLORS.mustard, borderRadius: 3 },
  progressText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMedium, marginBottom: SPACING.xl },
  avatarWrapper: { alignSelf: 'center', marginBottom: SPACING.xl, position: 'relative' },
  avatarImg: { width: 88, height: 88, borderRadius: 44 },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.white,
    borderRadius: 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  apiError: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.red, backgroundColor: COLORS.redBg, padding: SPACING.sm, borderRadius: 8, marginBottom: SPACING.md },
  charCount: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textLight, textAlign: 'right', marginTop: -SPACING.sm, marginBottom: SPACING.md },
  btn: { marginTop: SPACING.sm },
  laterBtn: { marginTop: SPACING.xs },
});
