import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageCircle, AlertCircle } from 'lucide-react'
import { useServicesStore } from '../store/servicesStore'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import { useToastStore } from '../store/toastStore'
import { useReviewsStore } from '../store/reviewsStore'
import { calculatePricing, formatCurrency } from '../utils/pricing'
import ProfileHeader from '../components/ProfileHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import StarRating from '../components/StarRating'
import Chip from '../components/Chip'
import Avatar from '../components/Avatar'

const criteriaOptions = ['Pontualidade', 'Qualidade', 'Comunicação', 'Limpeza']

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export default function ServiceTrackingScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.currentUser)
  const { services, completeService, confirmService } = useServicesStore()
  const { getOrCreateSession } = useChatStore()
  const { showToast } = useToastStore()
  const { submitReview } = useReviewsStore()
  const [reviewModal, setReviewModal] = useState(false)
  const [stars, setStars] = useState(0)
  const [criteria, setCriteria] = useState([])
  const [reviewComment, setReviewComment] = useState('')

  const svc = services.find(s => s.id === id)

  if (!svc) return (
    <div className="flex flex-col min-h-screen">
      <ProfileHeader title="Serviço" />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-tip-mid">Serviço não encontrado</p>
      </div>
    </div>
  )

  const pricing = calculatePricing(svc.amount || 0)
  const isScheduled = svc.status === 'scheduled'
  const isCompleted = svc.status === 'completed_by_provider'

  const goChat = () => {
    const session = getOrCreateSession(user.id, svc.providerId, svc.providerName, svc.providerInitials)
    const sessionId = svc.chatSessionId || session.id
    navigate(`/chat/${sessionId}`)
  }

  const handleComplete = () => {
    completeService(id)
    showToast('Serviço marcado como concluído', 'info')
  }

  const handleConfirm = () => {
    confirmService(id)
    setReviewModal(true)
  }

  const handleReview = () => {
    if (stars === 0) { showToast('Selecione uma avaliação', 'error'); return }
    submitReview({ serviceId: id, reviewedId: svc.providerId, reviewerId: user.id, stars, criteria, comment: reviewComment })
    showToast('Pagamento liberado! Obrigada por avaliar.', 'success')
    setReviewModal(false)
    navigate('/home')
  }

  const toggleCriteria = (c) => setCriteria(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  return (
    <div className="flex flex-col min-h-screen bg-cream pb-6">
      <ProfileHeader title="Acompanhar serviço" />

      <div className="px-4 py-5 flex flex-col gap-4">
        {/* Status */}
        <div className={`rounded-2xl p-4 flex items-center gap-3 ${isCompleted ? 'bg-mustard-bg border border-mustard' : 'bg-green-bg border border-green-tip'}`}>
          <span className="text-2xl">{isCompleted ? '⏳' : '✅'}</span>
          <div>
            <p className="font-bold text-sm">{isCompleted ? 'Aguardando sua confirmação' : 'Serviço agendado'}</p>
            <p className="text-xs text-tip-mid">{isCompleted ? 'A prestadora marcou como concluído' : `${formatDate(svc.date)} · ${svc.period}`}</p>
          </div>
        </div>

        {/* Provider info */}
        <Card>
          <div className="flex items-center gap-3">
            <Avatar initials={svc.providerInitials} size="md" />
            <div>
              <p className="font-bold text-tip-text">{svc.providerName}</p>
              <p className="text-xs text-tip-mid">Prestadora de serviço</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-tip-mid">{svc.description}</p>
          {!isCompleted && (
            <div className="flex gap-2 mt-3">
              <p className="text-xs text-tip-light">📅 {formatDate(svc.date)} · {svc.period}</p>
            </div>
          )}
        </Card>

        {/* Payment */}
        <Card>
          <h3 className="font-semibold text-tip-text mb-3">Pagamento</h3>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-tip-mid">Serviço</span>
              <span>{formatCurrency(pricing.serviceAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tip-mid">Taxa TIP</span>
              <span>{formatCurrency(pricing.tipFee)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-cream-border pt-2">
              <span>Total pago</span>
              <span className="text-petroleum">{formatCurrency(pricing.total)}</span>
            </div>
          </div>
          <p className="text-xs text-tip-light mt-2">🔒 Pagamento protegido pela TIP</p>
        </Card>

        {isScheduled && (
          <>
            <Button variant="secondary" fullWidth onClick={goChat}>
              <MessageCircle size={16} /> Falar com prestadora
            </Button>

            <Card className="border border-cream-border">
              <p className="text-sm font-semibold text-tip-text mb-2">Simular cenários (demo)</p>
              <div className="flex flex-col gap-2">
                <Button variant="ghost" size="sm" fullWidth onClick={handleComplete}>
                  Simular conclusão pela prestadora
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-tip-mid"
                    onClick={() => navigate(`/service/${id}/cancel`, { state: { isLate: false } })}
                  >
                    Cancelar (&gt;12h)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-red-tip"
                    onClick={() => navigate(`/service/${id}/cancel`, { state: { isLate: true } })}
                  >
                    Cancelar (&lt;12h)
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}

        {isCompleted && (
          <div className="flex flex-col gap-3">
            <Button variant="primary" size="lg" fullWidth onClick={handleConfirm}>
              Liberar pagamento ✓
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => navigate(`/service/${id}/dispute`)}
            >
              <AlertCircle size={16} /> Contestar
            </Button>
          </div>
        )}
      </div>

      {/* Review modal */}
      <Modal open={reviewModal} onClose={() => { setReviewModal(false); navigate('/home') }} title="Avaliar serviço">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-tip-mid">Como foi o serviço de {svc.providerName}?</p>
            <StarRating rating={stars} interactive onRate={setStars} size={32} />
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">O que se destacou?</p>
            <div className="flex flex-wrap gap-2">
              {criteriaOptions.map(c => (
                <Chip key={c} label={c} active={criteria.includes(c)} onClick={() => toggleCriteria(c)} />
              ))}
            </div>
          </div>
          <textarea
            value={reviewComment}
            onChange={e => setReviewComment(e.target.value)}
            placeholder="Conte mais sobre sua experiência..."
            rows={3}
            className="w-full rounded-xl border border-cream-border px-4 py-3 text-sm outline-none"
          />
          <Button variant="primary" size="lg" fullWidth onClick={handleReview}>
            Enviar avaliação
          </Button>
        </div>
      </Modal>
    </div>
  )
}
