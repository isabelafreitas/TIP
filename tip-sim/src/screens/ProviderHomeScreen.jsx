import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useServicesStore } from '../store/servicesStore'
import { useAnnouncementsStore } from '../store/announcementsStore'
import NavBar from '../components/NavBar'
import Avatar from '../components/Avatar'
import Card from '../components/Card'
import Toggle from '../components/Toggle'

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

  return (
    <div className="flex flex-col min-h-screen bg-cream pb-20">
      <div className="bg-petroleum px-5 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-petroleum-light text-sm">Modo prestadora</p>
            <h1 className="text-white text-xl font-bold">{user?.name?.split(' ')[0]} 👩‍🔧</h1>
          </div>
          <button onClick={() => navigate('/provider-profile')}>
            <Avatar initials={user?.initials} photo={user?.photo} size="lg" className="border-2 border-white/30" />
          </button>
        </div>
        <div className="mt-4 bg-white/15 rounded-2xl p-4">
          <Toggle checked={available} onChange={setAvailable} label={available ? '🟢 Disponível agora' : '⚫ Indisponível'} />
        </div>
      </div>

      <div className="flex-1 px-4 py-5 flex flex-col gap-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Serviços', value: thisMonth.length, sub: 'este mês' },
            { label: 'Avaliação', value: user?.rating || '—', sub: 'média' },
            { label: 'Ganhos', value: `R$${thisMonth.reduce((s, svc) => s + (svc.amount || 0) * 0.85, 0).toFixed(0)}`, sub: 'este mês' },
          ].map(stat => (
            <Card key={stat.label} className="text-center">
              <p className="text-xl font-bold text-petroleum">{stat.value}</p>
              <p className="text-xs text-tip-mid">{stat.label}</p>
              <p className="text-xs text-tip-light">{stat.sub}</p>
            </Card>
          ))}
        </div>

        {/* Opportunities */}
        <div>
          <h2 className="font-bold text-tip-text mb-3">Oportunidades próximas</h2>
          {announcements.length === 0 ? (
            <Card className="text-center py-6">
              <p className="text-tip-mid text-sm">Nenhuma oportunidade no momento</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {announcements.slice(0, 5).map(ann => (
                <Card key={ann.id}>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(ann.tags || []).map(t => (
                      <span key={t} className="text-xs bg-petroleum-bg text-petroleum px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                  <p className="text-sm text-tip-text line-clamp-2">{ann.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-tip-mid">{ann.deadline}</span>
                    {ann.price && <span className="text-sm font-bold text-mustard-dark">R${ann.price}</span>}
                  </div>
                  <button className="mt-2 text-xs font-semibold text-petroleum">Candidatar-se →</button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <NavBar />
    </div>
  )
}
