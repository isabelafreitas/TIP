import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import Input from '../components/Input'
import Textarea from '../components/Textarea'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import { Camera } from 'lucide-react'

export default function CompleteProfileScreen() {
  const navigate = useNavigate()
  const { currentUser, updateProfile } = useAuthStore()
  const { showToast } = useToastStore()
  const [neighborhood, setNeighborhood] = useState('')
  const [bio, setBio] = useState('')
  const [photo, setPhoto] = useState(null)

  const completion = 30 + (neighborhood ? 35 : 0) + (bio ? 35 : 0)

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    updateProfile({ neighborhood, bio, photo })
    showToast('Perfil atualizado!', 'success')
    navigate('/home')
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream pb-6">
      <div className="bg-petroleum px-6 pt-16 pb-6">
        <h1 className="text-white text-xl font-bold">Complete seu perfil</h1>
        <p className="text-petroleum-light text-sm mt-1">Quanto mais completo, mais confiança você transmite</p>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-petroleum-light mb-1">
            <span>Completude do perfil</span>
            <span>{completion}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full">
            <div
              className="h-2 bg-white rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar initials={currentUser?.initials} photo={photo} size="xl" />
            <label className="absolute bottom-0 right-0 bg-petroleum text-white rounded-full p-1.5 cursor-pointer">
              <Camera size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>
          <p className="text-sm text-tip-mid">Adicionar foto de perfil</p>
        </div>

        <Input
          label="Bairro"
          placeholder="Ex: Pinheiros"
          value={neighborhood}
          onChange={e => setNeighborhood(e.target.value)}
          helper="+35% de completude"
        />

        <Textarea
          label="Bio"
          placeholder="Conte um pouco sobre você..."
          value={bio}
          onChange={e => setBio(e.target.value)}
          rows={4}
          maxLength={200}
          helper="+35% de completude"
        />

        <Button variant="primary" size="lg" fullWidth onClick={handleSave}>
          Salvar perfil
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={() => navigate('/home')}>
          Fazer depois
        </Button>
      </div>
    </div>
  )
}
