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
import { Camera, ArrowLeft } from 'lucide-react'

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 28px)' }}>
      <ProfileHeader title="Solicitar serviço" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6A6858' }}>Nenhuma profissional selecionada</p>
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
    setWaitModal(true)
    await new Promise(r => setTimeout(r, 2000))
    acceptService(svc.id)
    setWaitModal(false)

    const session = getOrCreateSession(user.id, provider.id, provider.name, provider.initials)
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 28px)', background: '#FBFAF7', paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid #EEF3F4', background: '#fff' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={20} color="#1E4D5C" />
        </button>
        <h1 style={{ fontSize: 14, fontWeight: 700, color: '#1A1A18' }}>Solicitar serviço</h1>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Mini provider card */}
        <div style={{ background: '#EEF3F4', borderRadius: 12, padding: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar initials={provider.initials} size="md" />
          <div>
            <p style={{ fontWeight: 600, fontSize: 12, color: '#1A1A18' }}>{provider.name}</p>
            <p style={{ fontSize: 10, color: '#6A6858' }}>{provider.category.join(' · ')}</p>
          </div>
        </div>

        {/* Pre-filled zone card */}
        <div style={{ background: '#F5F4F0', borderRadius: 12, border: '1px solid #1E4D5C', padding: 12 }}>
          <p style={{ fontSize: 10, color: '#2E6E84', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Detalhes</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6A6858' }}>
            <span>Faixa de preço</span>
            <span style={{ color: '#C8960A', fontWeight: 600 }}>R${provider.priceMin}–R${provider.priceMax}</span>
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
          <label style={{ fontSize: 10, fontWeight: 600, color: '#1E4D5C', marginBottom: 6, display: 'block' }}>Período</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {periods.map(p => (
              <Chip key={p} label={p} active={period === p} onClick={() => setPeriod(p)} />
            ))}
          </div>
          {errors.period && <p style={{ fontSize: 11, color: '#A32D2D', marginTop: 4 }}>{errors.period}</p>}
        </div>

        <Input
          label="Valor sugerido (R$)"
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          helper={`Faixa desta profissional: R$${provider.priceMin}–R$${provider.priceMax}`}
        />

        {/* Photo upload */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: '#1E4D5C', marginBottom: 6, display: 'block' }}>
            Foto <span style={{ color: '#B0A898', fontWeight: 400 }}>(opcional)</span>
          </label>
          <label style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #EEF3F4',
            borderRadius: 12,
            padding: 20,
            cursor: 'pointer',
            background: '#F5F4F0',
          }}>
            {photo ? (
              <img src={photo} alt="preview" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }} />
            ) : (
              <>
                <Camera size={22} color="#B0A898" />
                <span style={{ fontSize: 11, color: '#6A6858', marginTop: 6 }}>Adicionar foto</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 32, margin: '0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <Spinner size="lg" color="petroleum" />
            <p style={{ fontWeight: 700, fontSize: 14, color: '#1A1A18' }}>Aguardando aceite...</p>
            <p style={{ fontSize: 12, color: '#6A6858', textAlign: 'center' }}>Enviando sua solicitação para {provider.name}</p>
          </div>
        </div>
      )}

      {/* Payment modal */}
      <Modal open={payModal} onClose={() => setPayModal(false)} title="Confirmar pagamento">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#F5F4F0', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#6A6858' }}>Serviço</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(pricing.serviceAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#6A6858' }}>Taxa TIP (15%)</span>
              <span style={{ fontWeight: 600, color: '#C8960A' }}>{formatCurrency(pricing.tipFee)}</span>
            </div>
            <div style={{ borderTop: '1px solid #E0DED6', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#1A1A18' }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#1E4D5C' }}>{formatCurrency(pricing.total)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1A18' }}>Forma de pagamento</p>
            {['💸 Pix', '💳 Cartão de crédito', '🏦 Débito'].map(m => (
              <button key={m} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 12, border: '1px solid #E0DED6', fontSize: 12, fontWeight: 500, background: '#fff', cursor: 'pointer' }}>
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
