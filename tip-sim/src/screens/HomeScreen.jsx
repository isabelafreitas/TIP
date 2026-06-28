import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useServicesStore } from '../store/servicesStore'
import NavBar from '../components/NavBar'
import Avatar from '../components/Avatar'
import Banner from '../components/Banner'
import { categories, unusualCategories } from '../data/providers'

export default function HomeScreen() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.currentUser)
  const services = useServicesStore(s => s.services)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const activeService = services.find(s =>
    s.requesterId === user?.id && (s.status === 'scheduled' || s.status === 'completed_by_provider')
  )

  return (
    <div className="flex flex-col min-h-screen bg-cream pb-20">
      {/* Header */}
      <div className="bg-petroleum px-5 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-petroleum-light text-sm">{greeting},</p>
            <h1 className="text-white text-xl font-bold">{user?.name?.split(' ')[0]} 👋</h1>
            {user?.neighborhood && (
              <p className="text-petroleum-light text-xs mt-0.5">📍 {user.neighborhood}</p>
            )}
          </div>
          <button onClick={() => navigate('/profile')}>
            <Avatar initials={user?.initials} photo={user?.photo} size="lg" className="border-2 border-white/30" />
          </button>
        </div>

        {/* Search */}
        <button
          onClick={() => navigate('/search')}
          className="mt-4 w-full bg-white/15 text-white/70 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-left"
        >
          <Search size={16} />
          Buscar serviço ou profissional...
        </button>
      </div>

      <div className="flex-1 px-5 py-5 flex flex-col gap-6">
        {/* Active service banner */}
        {activeService && (
          <Banner
            icon="🔧"
            title={`Serviço com ${activeService.providerName}`}
            description={activeService.status === 'completed_by_provider' ? 'Aguardando sua confirmação' : `Agendado para ${activeService.date}`}
            cta="Ver detalhes"
            onCta={() => navigate(`/service/${activeService.id}`)}
            variant={activeService.status === 'completed_by_provider' ? 'warning' : 'info'}
          />
        )}

        {/* Popular services */}
        <div>
          <h2 className="text-tip-text font-bold text-base mb-3">Serviços populares</h2>
          <div className="grid grid-cols-3 gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/search?cat=${cat.id}`)}
                className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-transform"
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-medium text-tip-text text-center leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Unusual services */}
        <div>
          <h2 className="text-tip-text font-bold text-base mb-3">Necessidades incomuns</h2>
          <div className="grid grid-cols-2 gap-3">
            {unusualCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/search?cat=${cat.id}`)}
                className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm active:scale-95 transition-transform"
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className="text-xs font-medium text-tip-text text-left leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <NavBar />
    </div>
  )
}
