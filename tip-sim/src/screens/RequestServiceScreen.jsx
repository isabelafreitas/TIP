import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useServicesStore } from '../store/servicesStore'
import { useChatStore } from '../store/chatStore'
import { useToastStore } from '../store/toastStore'
import { calculatePricing, formatCurrency } from '../utils/pricing'
import ProfileHeader from '../components/ProfileHeader'
import Textarea from '../components/Textarea'
import Input from '../components/Input'
import Button from '../components/Button'
import Chip from '../components/Chip'
import Modal from '../components/Modal'
import Avatar from '../components/Avatar'
import Spinner from '../components/Spinner'
import { Camera } from 'lucide-react'

const periods = ['Manhã', 'Tarde', 'Noite']

export default function RequestServiceScreen() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const provider = state?.provider
  const user = useAuthStore(s => s.currentUser)
  const { createService, acceptService } = useServicesStore()
  const { getOrCreateSession } = useChatStore()
  const { showToast } = useToastStore()

  const [desc, setDesc] = useState('')
  const [date, setDate] = useState('')
  const [period, setPeriod] = useState('')
  const [price, setPrice] = useState(provider ? String(provider.priceMin) : '')
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [waitModal, setWaitModal] = useState(false)
  const [payModal, setPayModal] = useState(false)
  const [createdService, setCreatedService] = useState(null)
  const [errors, setErrors] = useState({})

  if (!provider) return (
    <div className="flex flex-col min-h-screen">
      <ProfileHeader title="Solicitar serviço" />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-tip-mid">Nenhuma profissional selecionada</p>
      </div>
    </div>
  )

  const pricing = calculatePricing(Number(price) || 0)

  const validate = () => {
    const e = {}
    if (desc.trim().length < 20) e.desc = 'Descreva com pelo menos 20 caracteres'
    if (!date) e.date = 'Selecione uma data'
    if (!period) e.period = 'Selecione um período'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)

    const svc = createService({
      requesterId: user.id,
      providerId: provider.id,
      providerName: provider.name,
      providerInitials: provider.initials,
      description: desc,
      date,
      period,
      amount: Number(price) || provider.priceMin,
    })

    setCreatedService(svc)

    // Simulate waiting for provider accept
    setWaitModal(true)
    await new Promise(r => setTimeout(r, 2000))
    acceptService(svc.id)
    setWaitModal(false)

    // Create chat session
    const session = getOrCreateSession(user.id, provider.id, provider.name, provider.initials)
    // Attach chat session to service
    svc.chatSessionId = session.id

    setPayModal(true)
    setLoading(false)
  }

  const handlePay = () => {
    showToast('Pagamento confirmado! Serviço agendado.', 'success')
    setPayModal(false)
    navigate(`/service/${createdService.id}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream pb-6">
      <ProfileHeader title="Solicitar serviço" />

      <div className="px-4 py-5 flex flex-col gap-4">
        {/* Mini provider card */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <Avatar initials={provider.initials} size="md" />
          <div>
            <p className="font-bold text-tip-text text-sm">{provider.name}</p>
            <p className="text-xs text-tip-mid">{provider.category.join(' · ')}</p>
          </div>
        </div>

        <Textarea
          label="Descreva o serviço"
          placeholder="Explique o que você precisa com detalhes (mínimo 20 caracteres)..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={4}
          maxLength={500}
          error={errors.desc}
        />

        <Input
          label="Data"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          error={errors.date}
        />

        <div>
          <label className="text-sm font-semibold text-tip-text">Período</label>
          <div className="flex gap-2 mt-2">
            {periods.map(p => (
              <Chip key={p} label={p} active={period === p} onClick={() => setPeriod(p)} />
            ))}
          </div>
          {errors.period && <p className="text-xs text-red-tip mt-1">{errors.period}</p>}
        </div>

        <Input
          label="Valor sugerido (R$)"
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          helper={`Faixa desta profissional: R$${provider.priceMin}–R$${provider.priceMax}`}
        />

        <div>
          <label className="text-sm font-semibold text-tip-text">Foto (opcional)</label>
          <label className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-cream-border rounded-xl p-6 cursor-pointer hover:border-petroleum transition-colors">
            {photo ? (
              <img src={photo} alt="preview" className="w-full h-32 object-cover rounded-lg" />
            ) : (
              <>
                <Camera size={24} className="text-tip-light mb-2" />
                <span className="text-sm text-tip-mid">Adicionar foto</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files[0]
                if (f) { const r = new FileReader(); r.onload = ev => setPhoto(ev.target.result); r.readAsDataURL(f) }
              }}
            />
          </label>
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={handleSubmit} loading={loading}>
          Enviar solicitação
        </Button>
      </div>

      {/* Waiting modal */}
      {waitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 mx-4 flex flex-col items-center gap-4">
            <Spinner size="lg" color="petroleum" />
            <p className="font-bold text-tip-text">Aguardando aceite...</p>
            <p className="text-sm text-tip-mid text-center">Enviando sua solicitação para {provider.name}</p>
          </div>
        </div>
      )}

      {/* Payment modal */}
      <Modal open={payModal} onClose={() => setPayModal(false)} title="Confirmar pagamento">
        <div className="flex flex-col gap-4">
          <div className="bg-cream-mid rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-tip-mid">Serviço</span>
              <span className="font-semibold">{formatCurrency(pricing.serviceAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-tip-mid">Taxa TIP (15%)</span>
              <span className="font-semibold text-mustard-dark">{formatCurrency(pricing.tipFee)}</span>
            </div>
            <div className="border-t border-cream-border pt-2 flex justify-between">
              <span className="font-bold text-tip-text">Total</span>
              <span className="font-bold text-petroleum">{formatCurrency(pricing.total)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-tip-text">Forma de pagamento</p>
            {['💸 Pix', '💳 Cartão de crédito', '🏦 Débito'].map(m => (
              <button key={m} className="w-full text-left px-4 py-3 rounded-xl border border-cream-border text-sm font-medium hover:border-petroleum transition-colors">
                {m}
              </button>
            ))}
          </div>

          <Button variant="primary" size="lg" fullWidth onClick={handlePay}>
            Simular pagamento
          </Button>
        </div>
      </Modal>
    </div>
  )
}
