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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 28px)', background: '#FBFAF7', paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 11, color: '#6A6858' }}>{greeting},</p>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A18' }}>{user?.name?.split(' ')[0]} 👋</h1>
            {user?.neighborhood && (
              <p style={{ fontSize: 10, color: '#6A6858', marginTop: 2 }}>📍 {user.neighborhood}</p>
            )}
          </div>
          <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Avatar initials={user?.initials} photo={user?.photo} size="lg" />
          </button>
        </div>

        {/* Search bar */}
        <button
          onClick={() => navigate('/search')}
          style={{
            width: '100%',
            background: '#fff',
            border: '1.5px solid #1E4D5C',
            borderRadius: 12,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <Search size={15} color="#1E4D5C" />
          <span style={{ fontSize: 12, color: '#B0A898' }}>Buscar serviço ou profissional...</span>
        </button>
      </div>

      <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18' }}>Serviços populares</h2>
            <button
              onClick={() => navigate('/search')}
              style={{ fontSize: 11, color: '#2E6E84', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              ver todos
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/search?cat=${cat.id}`)}
                style={{
                  background: cat.id === 'mais' ? '#1E4D5C' : '#EEF3F4',
                  borderRadius: 12,
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  border: 'none',
                  cursor: 'pointer',
                }}
                className="active:scale-95 transition-transform"
              >
                <span style={{ fontSize: 22 }}>{cat.emoji}</span>
                <span style={{
                  fontSize: 9,
                  fontWeight: 500,
                  color: cat.id === 'mais' ? '#FBFAF7' : '#1E4D5C',
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Unusual services */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18' }}>Necessidades incomuns</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {unusualCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/search?cat=${cat.id}`)}
                style={{
                  background: cat.id === 'todos' ? '#EEF3F4' : '#fff',
                  borderRadius: 12,
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid #EEF3F4',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                className="active:scale-95 transition-transform"
              >
                <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 500, color: '#1E4D5C', lineHeight: 1.3 }}>
                  {cat.label}{cat.id === 'todos' ? ' →' : ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <NavBar />
    </div>
  )
}
