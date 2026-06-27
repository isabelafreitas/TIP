import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const WS_URL = API_URL.replace('http', 'ws');

export default function ChatScreen({ navigation, route }) {
  const { sessionId, otherUserName, serviceId } = route.params;
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const wsRef = useRef(null);
  const flatListRef = useRef(null);

  useFocusEffect(useCallback(() => {
    fetchMessages();
    connectWS();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [sessionId]));

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/sessions/${sessionId}/messages`);
      setMessages((res.data.data || []).reverse());
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar o chat.');
    } finally {
      setLoading(false);
    }
  };

  const connectWS = () => {
    if (!token) return;
    const ws = new WebSocket(`${WS_URL}/chat/sessions/${sessionId}?token=${token}`);
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type !== 'ping') {
          setMessages(prev => [msg, ...prev]);
        }
      } catch {}
    };
    ws.onerror = () => {};
    ws.onclose = () => {};
    wsRef.current = ws;
  };

  const sendMessage = async () => {
    const content = text.trim();
    if (!content) return;
    setText('');
    setSending(true);
    try {
      await api.post(`/chat/sessions/${sessionId}/messages`, { content, type: 'text' });
    } catch {
      Alert.alert('Erro', 'Mensagem não enviada. Tente novamente.');
      setText(content);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = item.sender_id === user?.id;
    if (item.type === 'service_modification_card') {
      const meta = item.metadata || {};
      return (
        <View style={styles.modCard}>
          <Text style={styles.modCardTitle}>📅 Solicitação de remarcação</Text>
          {meta.new_date && <Text style={styles.modCardDetail}>Nova data: {meta.new_date}</Text>}
          {meta.new_period && <Text style={styles.modCardDetail}>Período: {{ morning: 'Manhã', afternoon: 'Tarde', evening: 'Noite' }[meta.new_period]}</Text>}
          {meta.reason && <Text style={styles.modCardDetail}>Motivo: {meta.reason}</Text>}
          {meta.status === 'pending' && !isMine && (
            <View style={styles.modCardActions}>
              <TouchableOpacity style={styles.modAccept} onPress={() => Alert.alert('Em breve', 'Aceitar via notificação')}>
                <Text style={styles.modAcceptText}>Aceitar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modDecline} onPress={() => Alert.alert('Em breve', 'Recusar via notificação')}>
                <Text style={styles.modDeclineText}>Recusar</Text>
              </TouchableOpacity>
            </View>
          )}
          {meta.status !== 'pending' && (
            <Text style={styles.modStatus}>{meta.status === 'accepted' ? '✓ Aceita' : '✗ Recusada'}</Text>
          )}
        </View>
      );
    }
    return (
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
          {item.content}
        </Text>
        <Text style={[styles.timestamp, isMine ? styles.timestampMine : styles.timestampTheirs]}>
          {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>{otherUserName || 'Chat'}</Text>
          <Text style={styles.onlineStatus}>● online</Text>
        </View>
        {serviceId && (
          <TouchableOpacity onPress={() => navigation.navigate('ServiceTracking', { serviceId })}>
            <Text style={styles.viewServiceLink}>Ver serviço</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        {loading
          ? <ActivityIndicator color={COLORS.petrol} style={{ flex: 1 }} />
          : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={i => i.id}
              renderItem={renderMessage}
              inverted
              contentContainerStyle={styles.messageList}
            />
          )
        }
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Digite uma mensagem..."
            placeholderTextColor={COLORS.textLight}
            style={styles.input}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!text.trim() || sending}
          >
            <Text style={styles.sendBtnText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: SPACING.sm },
  backBtn: { padding: 4 },
  back: { fontSize: 22, color: COLORS.petrol },
  headerName: { fontFamily: FONTS.semiBold, fontSize: 15, color: COLORS.textPrimary },
  onlineStatus: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.green },
  viewServiceLink: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.petrolMid },
  messageList: { padding: SPACING.md, paddingBottom: SPACING.lg },
  bubble: { maxWidth: '75%', borderRadius: RADIUS.lg, padding: SPACING.sm + 2, marginBottom: SPACING.sm },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: COLORS.petrol, borderTopRightRadius: 0 },
  bubbleTheirs: { alignSelf: 'flex-start', backgroundColor: COLORS.white, borderTopLeftRadius: 0, borderWidth: 1, borderColor: COLORS.stone },
  bubbleText: { fontFamily: FONTS.regular, fontSize: 14 },
  bubbleTextMine: { color: COLORS.cream },
  bubbleTextTheirs: { color: COLORS.textPrimary },
  timestamp: { fontFamily: FONTS.regular, fontSize: 10, marginTop: 2 },
  timestampMine: { color: COLORS.petrolLight, textAlign: 'right' },
  timestampTheirs: { color: COLORS.textLight },
  modCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.petrolMid, maxWidth: '85%', alignSelf: 'center' },
  modCardTitle: { fontFamily: FONTS.semiBold, fontSize: 14, color: COLORS.petrol, marginBottom: SPACING.sm },
  modCardDetail: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textPrimary, marginBottom: 2 },
  modCardActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  modAccept: { flex: 1, backgroundColor: COLORS.green, borderRadius: RADIUS.md, padding: 8, alignItems: 'center' },
  modAcceptText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.white },
  modDecline: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 8, alignItems: 'center' },
  modDeclineText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMedium },
  modStatus: { fontFamily: FONTS.semiBold, fontSize: 13, color: COLORS.textMedium, marginTop: SPACING.sm, textAlign: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.white, gap: SPACING.sm },
  input: { flex: 1, backgroundColor: COLORS.stone, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: 10, fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textPrimary, maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.petrol, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: COLORS.textLight },
  sendBtnText: { color: COLORS.white, fontSize: 18 },
});
