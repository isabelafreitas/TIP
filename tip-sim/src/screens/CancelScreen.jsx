import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useServicesStore } from '../store/servicesStore'
import { useToastStore } from '../store/toastStore'
import { calculateCancellationRefund, formatCurrency } from '../utils/pricing'
import ProfileHeader from '../components/ProfileHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import Chip from '../components/Chip'

const reasons = ['Mudança de planos', 'Emergência', 'Profissional não respondeu', 'Encontrei outra opção', 'Outro']

export default function CancelScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const isLate = state?.isLate || false
  const { services, cancelService } = useServicesStore()
  const { showToast } = useToastStore()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const svc = services.find(s => s.id === id)
  const refundInfo = calculateCancellationRefund(svc?.amount || 0, svc?.amount || 0, isLate)

  const handleCancel = async () => {
    if (!reason) { showToast('Selecione um motivo', 'error'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    cancelService(id, reason, isLate)
    showToast(isLate ? 'Serviço cancelado. Reembolso parcial processado.' : 'Serviço cancelado. Reembolso total em até 3 dias úteis.', 'info')
    navigate('/home')
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream pb-6">
      <ProfileHeader title="Cancelar serviço" />

      <div className="px-4 py-5 flex flex-col gap-4">
        {isLate ? (
          <div className="bg-red-bg border border-red-border rounded-2xl p-4">
            <p className="font-bold text-red-tip mb-1">⚠️ Cancelamento tardio</p>
            <p className="text-sm text-red-tip">Como é menos de 12h antes do serviço, 20% do valor será retido como compensação pela profissional.</p>
          </div>
        ) : (
          <div className="bg-green-bg border border-green-tip rounded-2xl p-4">
            <p className="font-bold text-green-dark mb-1">✓ Cancelamento sem custo</p>
            <p className="text-sm text-green-dark">Como está com mais de 12h de antecedência, você receberá reembolso total.</p>
          </div>
        )}

        <Card>
          <h3 className="font-semibold text-tip-text mb-3">Resumo do reembolso</h3>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-tip-mid">Valor pago</span>
              <span>{formatCurrency(svc?.amount || 0)}</span>
            </div>
            {isLate && (
              <div className="flex justify-between text-red-tip">
                <span>Retido (20%)</span>
                <span>- {formatCurrency(refundInfo.retained)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-cream-border pt-2">
              <span>Reembolso</span>
              <span className="text-green-dark">{formatCurrency(refundInfo.refund)}</span>
            </div>
          </div>
        </Card>

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
