import React, { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { COLORS, FONTS, SPACING } from '../../theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  function validate() {
    const e = {};
    if (!name.trim()) e.name = 'Nome obrigatório';
    if (!email.trim()) e.email = 'E-mail obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'E-mail inválido';
    if (!password || password.length < 6) e.password = 'Senha deve ter ao menos 6 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      navigation.navigate('CompleteProfile');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>tip.</Text>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Junte-se à comunidade TIP</Text>

          {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

          <Input
            label="Nome completo"
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            error={errors.name}
          />
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
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            error={errors.password}
          />

          <Button title="Criar conta" onPress={handleRegister} loading={loading} style={styles.btn} />

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
            <Text style={styles.linkText}>Já tenho conta → <Text style={styles.linkBold}>Entrar</Text></Text>
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
