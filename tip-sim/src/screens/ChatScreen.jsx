import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import Avatar from '../components/Avatar'

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatScreen() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.currentUser)
  const { sessions, sendMessage, simulateReply } = useChatStore()
  const [text, setText] = useState('')
  const messagesEndRef = useRef(null)

  const session = sessions.find(s => s.id === sessionId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages?.length])

  const handleSend = () => {
    if (!text.trim() || !session) return
    sendMessage(sessionId, text.trim(), user.id)
    simulateReply(sessionId, session.providerId)
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!session) return (
    <div className="flex flex-col h-screen items-center justify-center">
      <p className="text-tip-mid">Conversa não encontrada</p>
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* Header */}
      <div className="bg-petroleum px-4 pt-12 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-white p-1">
          <ArrowLeft size={22} />
        </button>
        <Avatar initials={session.providerInitials} size="sm" className="border border-white/30" />
        <div>
          <p className="text-white font-semibold text-sm">{session.providerName}</p>
          <p className="text-petroleum-light text-xs">Prestadora</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {session.messages.map((msg, i) => {
          const isMine = msg.senderId === user.id
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                isMine
                  ? 'bg-petroleum text-white rounded-br-sm'
                  : 'bg-white border border-cream-border text-tip-text rounded-bl-sm'
              }`}>
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-petroleum-light' : 'text-tip-light'}`}>
                  {formatTime(msg.sentAt)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-cream-border px-4 py-3 flex items-center gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva uma mensagem..."
          className="flex-1 bg-cream-mid rounded-xl px-4 py-2.5 text-sm outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-10 h-10 bg-petroleum rounded-full flex items-center justify-center text-white disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
