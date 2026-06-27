import React, { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { COLORS, FONTS, SPACING } from '../../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  function validate() {
    const e = {};
    if (!email.trim()) e.email = 'E-mail obrigatório';
    if (!password) e.password = 'Senha obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const u = await login(email.trim().toLowerCase(), password);
      // Navigation is handled automatically by RootNavigator based on user state
    } catch (err) {
      setApiError(err.response?.data?.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>tip.</Text>
          <Text style={styles.title}>Entrar</Text>
          <Text style={styles.subtitle}>Bem-vinda de volta!</Text>

          {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            error={errors.email}
          />
          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
            secureTextEntry
            error={errors.password}
          />

          <Button title="Entrar" onPress={handleLogin} loading={loading} style={styles.btn} />

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
            <Text style={styles.linkText}>Não tenho conta → <Text style={styles.linkBold}>Criar conta</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content: { flexGrow: 1, paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxl, paddingBottom: SPACING.xxl },
  logo: { fontFamily: FONTS.extraBold, fontSize: 36, color: COLORS.petrol, marginBottom: SPACING.xl },
  title: { fontFamily: FONTS.extraBold, fontSize: 26, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subtitle: { fontFamily: FONTS.regular, fontSize: 15, color: COLORS.textMedium, marginBottom: SPACING.xl },
  apiError: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.red, backgroundColor: COLORS.redBg, padding: SPACING.sm, borderRadius: 8, marginBottom: SPACING.md },
  btn: { marginTop: SPACING.sm },
  link: { alignItems: 'center', marginTop: SPACING.xl },
  linkText: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMedium },
  linkBold: { fontFamily: FONTS.bold, color: COLORS.petrol },
});
