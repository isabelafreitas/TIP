import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useAnnouncementsStore } from '../store/announcementsStore'
import { useToastStore } from '../store/toastStore'
import ProfileHeader from '../components/ProfileHeader'
import Textarea from '../components/Textarea'
import Input from '../components/Input'
import Button from '../components/Button'
import Chip from '../components/Chip'

const tagOptions = ['Eletricista', 'Encanador', 'Beleza', 'Montagem', 'Personal', 'Plantas', 'Filas', 'Outro']
const deadlineOptions = ['Urgente (hoje)', 'Esta semana', 'Este mês', 'Combinamos']

export default function NewAnnouncementScreen() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.currentUser)
  const { createAnnouncement } = useAnnouncementsStore()
  const { showToast } = useToastStore()

  const [desc, setDesc] = useState('')
  const [tags, setTags] = useState([])
  const [price, setPrice] = useState('')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleTag = (t) => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const handleSubmit = async () => {
    if (!desc.trim()) { showToast('Descreva sua necessidade', 'error'); return }
    if (!deadline) { showToast('Selecione um prazo', 'error'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    createAnnouncement({ userId: user.id, description: desc, tags, price: Number(price) || null, deadline })
    showToast('Anúncio publicado! Aguarde candidatas.', 'success')
    navigate('/announcements')
    setLoading(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream pb-6">
      <ProfileHeader title="Nova necessidade" />

      <div className="px-4 py-5 flex flex-col gap-4">
        <Textarea
          label="Descreva o que você precisa"
          placeholder="Ex: Preciso de alguém para instalar uma prateleira na sala..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={4}
          maxLength={400}
        />

        <div>
          <label className="text-sm font-semibold text-tip-text">Categoria</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {tagOptions.map(t => (
              <Chip key={t} label={t} active={tags.includes(t)} onClick={() => toggleTag(t)} />
            ))}
          </div>
        </div>

        <Input
          label="Valor que pagaria (opcional)"
          type="number"
          placeholder="R$"
          value={price}
          onChange={e => setPrice(e.target.value)}
        />

        <div>
          <label className="text-sm font-semibold text-tip-text">Prazo</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {deadlineOptions.map(d => (
              <Chip key={d} label={d} active={deadline === d} onClick={() => setDeadline(d)} />
            ))}
          </div>
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={handleSubmit} loading={loading}>
          Publicar necessidade
        </Button>
      </div>
    </div>
  )
}
