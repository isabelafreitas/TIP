import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import NavBar from '../components/NavBar'
import Avatar from '../components/Avatar'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export default function ChatListScreen() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.currentUser)
  const sessions = useChatStore(s => s.sessions)

  const mySessions = sessions.filter(s => s.userId === user?.id)

  return (
    <div className="flex flex-col min-h-screen bg-cream pb-20">
      <div className="bg-petroleum px-5 pt-14 pb-4">
        <h1 className="text-white text-xl font-bold">Conversas</h1>
      </div>

      <div className="flex-1">
        {mySessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <span className="text-5xl mb-4">💬</span>
            <p className="font-semibold text-tip-text">Nenhuma conversa ainda</p>
            <p className="text-sm text-tip-mid mt-1">Inicie uma conversa ao solicitar um serviço</p>
          </div>
        ) : (
          mySessions.map(session => (
            <button
              key={session.id}
              onClick={() => navigate(`/chat/${session.id}`)}
              className="w-full flex items-center gap-3 px-4 py-4 border-b border-cream-border bg-white hover:bg-cream-mid transition-colors"
            >
              <Avatar initials={session.providerInitials} size="md" />
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold text-sm text-tip-text">{session.providerName}</p>
                  <span className="text-xs text-tip-light">{timeAgo(session.lastAt)}</span>
                </div>
                <p className="text-xs text-tip-mid mt-0.5 truncate">{session.lastMessage || 'Nenhuma mensagem'}</p>
              </div>
            </button>
          ))
        )}
      </div>

      <NavBar />
    </div>
  )
}
