import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToastStore } from '../store/toastStore'
import ProfileHeader from '../components/ProfileHeader'
import Textarea from '../components/Textarea'
import Button from '../components/Button'
import Chip from '../components/Chip'

const resolutions = ['Reembolso parcial', 'Reembolso total', 'Refazer o serviço']

export default function DisputeScreen() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showToast } = useToastStore()
  const [desc, setDesc] = useState('')
  const [resolution, setResolution] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!desc.trim()) { showToast('Descreva o problema', 'error'); return }
    if (!resolution) { showToast('Selecione uma resolução desejada', 'error'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    showToast('Contestação enviada. Nossa equipe entrará em contato em até 24h.', 'success')
    navigate('/home')
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream pb-6">
      <ProfileHeader title="Contestação" />

      <div className="px-4 py-5 flex flex-col gap-4">
        <div className="bg-red-bg border border-red-border rounded-2xl p-4">
          <p className="text-sm text-red-tip font-medium">⚠️ Ao contestar, o pagamento ficará retido até a resolução do caso.</p>
        </div>

        <Textarea
          label="Descreva o problema"
          placeholder="O que aconteceu? Descreva em detalhes..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={4}
          maxLength={500}
        />

        <div>
          <label className="text-sm font-semibold text-tip-text mb-2 block">Adicionar evidência</label>
          <button className="w-full border-2 border-dashed border-cream-border rounded-xl p-4 text-sm text-tip-mid">
            📷 Adicionar foto ou vídeo
          </button>
        </div>

        <div>
          <label className="text-sm font-semibold text-tip-text mb-2 block">Resolução desejada</label>
          <div className="flex flex-col gap-2">
            {resolutions.map(r => (
              <button
                key={r}
                onClick={() => setResolution(r)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${resolution === r ? 'border-petroleum bg-petroleum-bg text-petroleum' : 'border-cream-border bg-white text-tip-text'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <Button variant="danger" size="lg" fullWidth onClick={handleSubmit} loading={loading}>
          Enviar contestação
        </Button>
      </div>
    </div>
  )
}
