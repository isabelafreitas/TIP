import { useParams, useNavigate } from 'react-router-dom'
import { useServicesStore } from '../store/servicesStore'
import { useToastStore } from '../store/toastStore'
import ProfileHeader from '../components/ProfileHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import Avatar from '../components/Avatar'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export default function ProviderTrackingScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { services, completeService } = useServicesStore()
  const { showToast } = useToastStore()

  const svc = services.find(s => s.id === id)

  if (!svc) return (
    <div className="flex flex-col min-h-screen">
      <ProfileHeader title="Serviço" />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-tip-mid">Serviço não encontrado</p>
      </div>
    </div>
  )

  const isScheduled = svc.status === 'scheduled'

  const handleComplete = () => {
    completeService(id)
    showToast('Serviço marcado como concluído! Aguardando confirmação.', 'success')
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream pb-6">
      <ProfileHeader title="Meu serviço" />

      <div className="px-4 py-5 flex flex-col gap-4">
        <div className={`rounded-2xl p-4 flex items-center gap-3 ${
          svc.status === 'completed_by_provider' ? 'bg-mustard-bg border border-mustard' : 'bg-petroleum-bg border border-petroleum-light'
        }`}>
          <span className="text-2xl">{svc.status === 'completed_by_provider' ? '⏳' : '📋'}</span>
          <div>
            <p className="font-bold text-sm">
              {svc.status === 'completed_by_provider' ? 'Aguardando confirmação da solicitadora' : 'Serviço agendado'}
            </p>
            <p className="text-xs text-tip-mid">{formatDate(svc.date)} · {svc.period}</p>
          </div>
        </div>

        <Card>
          <h3 className="font-semibold text-tip-text mb-3">Detalhes do serviço</h3>
          <p className="text-sm text-tip-mid mb-3">{svc.description}</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-tip-light">📅 {formatDate(svc.date)}</span>
            <span className="text-tip-light">·</span>
            <span className="text-tip-light">{svc.period}</span>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center">
            <span className="text-sm text-tip-mid">Você receberá</span>
            <span className="font-bold text-green-dark text-lg">R${((svc.amount || 0) * 0.85).toFixed(0)}</span>
          </div>
          <p className="text-xs text-tip-light mt-1">Após desconto da taxa TIP (15%)</p>
        </Card>

        {isScheduled ? (
          <div className="flex flex-col gap-3">
            <Button variant="primary" size="lg" fullWidth onClick={handleComplete}>
              ✓ Marcar como concluído
            </Button>
            <Button
              variant="ghost"
              size="md"
              fullWidth
              className="text-red-tip"
              onClick={() => navigate(`/service/${id}/provider-cancel`)}
            >
              Cancelar serviço
            </Button>
          </div>
        ) : (
          <div className="bg-green-bg border border-green-tip rounded-2xl p-4 text-center">
            <p className="text-green-dark font-semibold">✓ Marcado como concluído</p>
            <p className="text-sm text-tip-mid mt-1">Aguardando a solicitadora confirmar o recebimento</p>
          </div>
        )}
      </div>
    </div>
  )
}
