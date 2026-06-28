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
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-cream-border flex z-40">
      {tabs.map(tab => {
        const path = isProvider && tab.providerPath ? tab.providerPath : tab.path
        const active = location.pathname === path || location.pathname === tab.path || (isProvider && location.pathname === tab.providerPath)
        const Icon = tab.icon
        return (
          <button
            key={tab.label}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors
              ${active ? 'text-petroleum' : 'text-tip-light'}`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
