import { Home, Megaphone, MessageCircle, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const tabs = [
  { label: 'Home', icon: Home, path: '/home', providerPath: '/provider-home' },
  { label: 'Anúncios', icon: Megaphone, path: '/announcements' },
  { label: 'Chat', icon: MessageCircle, path: '/chat' },
  { label: 'Perfil', icon: User, path: '/profile', providerPath: '/provider-profile' },
]

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore(s => s.currentUser)
  const isProvider = user?.is_provider

  return (
    <div
      style={{ background: '#fff', borderTop: '1px solid #E0DED6' }}
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] flex z-40"
    >
      {tabs.map(tab => {
        const path = isProvider && tab.providerPath ? tab.providerPath : tab.path
        const active = location.pathname === path || location.pathname === tab.path || (isProvider && location.pathname === tab.providerPath)
        const Icon = tab.icon
        return (
          <button
            key={tab.label}
            onClick={() => navigate(path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '10px 0',
              color: active ? '#1E4D5C' : '#B0A898',
              fontSize: 8,
              fontWeight: active ? 600 : 400,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
