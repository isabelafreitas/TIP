import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useServicesStore } from '../store/servicesStore'
import NavBar from '../components/NavBar'
import Card from '../components/Card'
import Toggle from '../components/Toggle'

const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

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

export default function AgendaScreen() {
  const user = useAuthStore(s => s.currentUser)
  const services = useServicesStore(s => s.services)
  const [tab, setTab] = useState('services')
  const [available, setAvailable] = useState(true)
  const [dayAvail, setDayAvail] = useState({ Seg: true, Ter: true, Qua: true, Qui: true, Sex: true, Sáb: false, Dom: false })

  const myServices = services.filter(s =>
    s.requesterId === user?.id || s.providerId === user?.id
  ).sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="flex flex-col min-h-screen bg-cream pb-20">
      <div className="bg-petroleum px-5 pt-14 pb-4">
        <h1 className="text-white text-xl font-bold">Agenda</h1>
      </div>

      <div className="bg-white border-b border-cream-border px-4 flex">
        {[['services', 'Serviços'], ['availability', 'Disponibilidade']].map(([v, l]) => (
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
        {tab === 'services' ? (
          myServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-5xl mb-4">📅</span>
              <p className="font-semibold text-tip-text">Nenhum serviço ainda</p>
              <p className="text-sm text-tip-mid mt-1">Seus serviços aparecerão aqui</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {myServices.map(svc => (
                <Card key={svc.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm text-tip-text">
                        {svc.requesterId === user?.id ? svc.providerName : 'Serviço agendado'}
                      </p>
                      <p className="text-xs text-tip-mid mt-0.5">{formatDate(svc.date)} · {svc.period}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      svc.status === 'confirmed' ? 'bg-green-bg text-green-dark' :
                      svc.status === 'cancelled' ? 'bg-red-bg text-red-tip' :
                      'bg-petroleum-bg text-petroleum'
                    }`}>
                      {statusLabel[svc.status] || svc.status}
                    </span>
                  </div>
                  <p className="text-xs text-tip-light mt-2 line-clamp-1">{svc.description}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-tip-mid">R${svc.amount}</span>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col gap-4">
            <Card>
              <Toggle checked={available} onChange={setAvailable} label="Disponível para novos serviços" />
            </Card>
            <Card>
              <h3 className="font-semibold text-tip-text mb-3">Dias disponíveis</h3>
              <div className="grid grid-cols-7 gap-1">
                {days.map(d => (
                  <button
                    key={d}
                    onClick={() => setDayAvail(prev => ({ ...prev, [d]: !prev[d] }))}
                    className={`rounded-xl py-2 text-xs font-semibold transition-colors ${dayAvail[d] ? 'bg-petroleum text-white' : 'bg-cream-mid text-tip-mid'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      <NavBar />
    </div>
  )
}
