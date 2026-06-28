import { create } from 'zustand'

const KEY = 'tip_chats'
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
function save(s) { localStorage.setItem(KEY, JSON.stringify(s)) }

const AUTO_REPLIES = [
  'Olá! Claro, posso ajudar com isso.',
  'Ótimo! Podemos combinar os detalhes.',
  'Perfeito, estarei lá no horário combinado!',
  'Certo! Se tiver mais dúvidas, é só perguntar.',
  'Combinado! Até lá 😊',
]

export const useChatStore = create((set, get) => ({
  sessions: load(),

  getOrCreateSession: (userId, providerId, providerName, providerInitials) => {
    const existing = get().sessions.find(
      s => s.userId === userId && s.providerId === providerId
    )
    if (existing) return existing

    const session = {
      id: 'chat_' + Date.now(),
      userId,
      providerId,
      providerName,
      providerInitials: providerInitials || providerName?.slice(0, 2).toUpperCase(),
      messages: [],
      createdAt: new Date().toISOString(),
    }
    const sessions = [session, ...get().sessions]
    save(sessions)
    set({ sessions })
    return session
  },

  sendMessage: (sessionId, text, senderId) => {
    const msg = {
      id: 'msg_' + Date.now(),
      text,
      senderId,
      sentAt: new Date().toISOString(),
    }
    const sessions = get().sessions.map(s =>
      s.id === sessionId ? { ...s, messages: [...s.messages, msg], lastMessage: text, lastAt: msg.sentAt } : s
    )
    save(sessions)
    set({ sessions })
    return msg
  },

  simulateReply: (sessionId, providerId) => {
    setTimeout(() => {
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]
      const msg = {
        id: 'msg_' + Date.now(),
        text: reply,
        senderId: providerId,
        sentAt: new Date().toISOString(),
      }
      const sessions = get().sessions.map(s =>
        s.id === sessionId ? { ...s, messages: [...s.messages, msg], lastMessage: reply, lastAt: msg.sentAt } : s
      )
      save(sessions)
      set({ sessions })
    }, 1500)
  },

  getSession: (sessionId) => get().sessions.find(s => s.id === sessionId),
  reload: () => set({ sessions: load() }),
}))
