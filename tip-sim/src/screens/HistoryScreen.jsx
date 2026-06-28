import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useServicesStore } from '../store/servicesStore'
import ProfileHeader from '../components/ProfileHeader'
import Card from '../components/Card'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

const statusLabel = {
  scheduled: 'Agendado',
  completed_by_provider: 'Aguardando confirmação',
  confirmed: 'Concluído',
  cancelled: 'Cancelado',
  disputed: 'Contestado',
}

const statusColor = {
  confirmed: 'bg-green-bg text-green-dark',
  cancelled: 'bg-red-bg text-red-tip',
  disputed: 'bg-red-bg text-red-tip',
  scheduled: 'bg-petroleum-bg text-petroleum',
  completed_by_provider: 'bg-mustard-bg text-mustard-dark',
}

export default function HistoryScreen() {
  const user = useAuthStore(s => s.currentUser)
  const services = useServicesStore(s => s.services)
  const [tab, setTab] = useState('hired')

  const hired = services.filter(s => s.requesterId === user?.id)
  const performed = services.filter(s => s.providerId === user?.id)
  const list = tab === 'hired' ? hired : performed

  // Group by month
  const grouped = list.reduce((acc, svc) => {
    const d = new Date(svc.createdAt)
    const key = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    if (!acc[key]) acc[key] = []
    acc[key].push(svc)
    return acc
  }, {})

  return (
    <div className="flex flex-col min-h-screen bg-cream pb-6">
      <ProfileHeader title="Histórico" />

      <div className="bg-white border-b border-cream-border px-4 flex">
        {[['hired', 'Contratados'], ['performed', 'Realizados']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === v ? 'border-petroleum text-petroleum' : 'border-transparent text-tip-mid'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 py-4">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4">📋</span>
            <p className="font-semibold text-tip-text">Nenhum serviço ainda</p>
          </div>
        ) : (
          Object.entries(grouped).map(([month, svcs]) => (
            <div key={month} className="mb-5">
              <p className="text-xs font-bold text-tip-mid uppercase tracking-wide mb-2 capitalize">{month}</p>
              <div className="flex flex-col gap-2">
                {svcs.map(svc => (
                  <Card key={svc.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm text-tip-text">
                          {tab === 'hired' ? svc.providerName : 'Serviço realizado'}
                        </p>
                        <p className="text-xs text-tip-mid mt-0.5">{formatDate(svc.date)} · {svc.period}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor[svc.status] || 'bg-cream-mid text-tip-mid'}`}>
                        {statusLabel[svc.status] || svc.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-tip-light line-clamp-1 flex-1">{svc.description}</p>
                      <span className="text-sm font-bold text-petroleum ml-2">R${svc.amount}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
