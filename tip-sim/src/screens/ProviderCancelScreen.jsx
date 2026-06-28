import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useServicesStore } from '../store/servicesStore'
import { useToastStore } from '../store/toastStore'
import ProfileHeader from '../components/ProfileHeader'
import Button from '../components/Button'
import Chip from '../components/Chip'

const reasons = ['Emergência pessoal', 'Problema de saúde', 'Conflito de agenda', 'Não consigo chegar ao local', 'Outro']

export default function ProviderCancelScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cancelService } = useServicesStore()
  const { showToast } = useToastStore()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    if (!reason) { showToast('Selecione um motivo', 'error'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    cancelService(id, reason, false)
    showToast('Serviço cancelado. A solicitadora será notificada e receberá reembolso total.', 'info')
    navigate('/provider-home')
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream pb-6">
      <ProfileHeader title="Cancelar serviço" />

      <div className="px-4 py-5 flex flex-col gap-4">
        <div className="bg-red-bg border border-red-border rounded-2xl p-4">
          <p className="font-bold text-red-tip mb-2">⚠️ Atenção: impacto na sua reputação</p>
          <p className="text-sm text-tip-mid">Cancelamentos frequentes afetam sua avaliação e visibilidade na plataforma. Isso pode impactar seus ganhos.</p>
        </div>

        <div className="bg-cream-mid rounded-2xl p-4">
          <p className="text-sm text-tip-text">
            A solicitadora receberá <strong>reembolso total</strong> automaticamente e será notificada do cancelamento.
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold text-tip-text mb-2 block">Motivo do cancelamento</label>
          <div className="flex flex-wrap gap-2">
            {reasons.map(r => (
              <Chip key={r} label={r} active={reason === r} onClick={() => setReason(r)} />
            ))}
          </div>
        </div>

        <Button variant="danger" size="lg" fullWidth onClick={handleCancel} loading={loading}>
          Confirmar cancelamento
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </div>
    </div>
  )
}
