import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useServicesStore } from '../store/servicesStore'
import { useAnnouncementsStore } from '../store/announcementsStore'
import NavBar from '../components/NavBar'
import Avatar from '../components/Avatar'
import Toggle from '../components/Toggle'
import Button from '../components/Button'

export default function ProviderHomeScreen() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.currentUser)
  const services = useServicesStore(s => s.services)
  const announcements = useAnnouncementsStore(s => s.getAvailableAnnouncements())
  const [available, setAvailable] = useState(true)

  const myServices = services.filter(s => s.providerId === user?.id)
  const thisMonth = myServices.filter(s => {
    const d = new Date(s.createdAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const stats = [
    { label: 'Serviços', value: thisMonth.length, sub: 'este mês' },
    { label: 'Avaliação', value: user?.rating || '—', sub: 'média' },
    { label: 'Ganhos', value: `R$${thisMonth.reduce((s, svc) => s + (svc.amount || 0) * 0.85, 0).toFixed(0)}`, sub: 'este mês' },
    { label: 'Perfil', value: `${user?.completion || 65}%`, sub: 'completo' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 28px)', background: '#FBFAF7', paddingBottom: 70 }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 14px', background: '#fff', borderBottom: '1px solid #EEF3F4' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 11, color: '#6A6858' }}>Modo prestadora</p>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A18' }}>{user?.name?.split(' ')[0]} 👩‍🔧</h1>
          </div>
          <button onClick={() => navigate('/provider-profile')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Avatar initials={user?.initials} photo={user?.photo} size="lg" />
          </button>
        </div>
        <div style={{ marginTop: 12, background: '#EEF3F4', borderRadius: 12, padding: '10px 14px' }}>
          <Toggle checked={available} onChange={setAvailable} label={available ? '🟢 Disponível agora' : '⚫ Indisponível'} />
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Stats grid 2x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {stats.map(stat => (
            <div key={stat.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #EEF3F4', padding: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#1E4D5C' }}>{stat.value}</p>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#1A1A18', marginTop: 2 }}>{stat.label}</p>
              <p style={{ fontSize: 9, color: '#6A6858' }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Opportunities */}
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18', marginBottom: 10 }}>Oportunidades próximas</h2>
          {announcements.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #EEF3F4', padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: '#6A6858' }}>Nenhuma oportunidade no momento</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {announcements.slice(0, 5).map(ann => (
                <div key={ann.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #EEF3F4', padding: 14 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                    {(ann.tags || []).map(t => (
                      <span key={t} style={{ fontSize: 9, background: '#EEF3F4', color: '#1E4D5C', padding: '2px 8px', borderRadius: 9999, fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#1A1A18', lineHeight: 1.4, marginBottom: 4 }}>{ann.description.slice(0, 80)}{ann.description.length > 80 ? '...' : ''}</p>
                  <p style={{ fontSize: 10, color: '#6A6858', marginBottom: 8 }}>{ann.deadline}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {ann.price && <span style={{ fontSize: 12, fontWeight: 700, color: '#C8960A' }}>R${ann.price}</span>}
                    <Button variant="primary" size="sm">
                      Candidatar-se
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <NavBar />
    </div>
  )
}
