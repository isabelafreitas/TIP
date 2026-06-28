import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import NavBar from '../components/NavBar'
import ProfileHeader from '../components/ProfileHeader'
import Input from '../components/Input'
import Button from '../components/Button'
import Chip from '../components/Chip'
import Avatar from '../components/Avatar'
import { Camera } from 'lucide-react'

const allCategories = ['Eletricista', 'Encanador', 'Beleza a domicílio', 'Montagem e reparos', 'Personal trainer', 'Cuidar de plantas', 'Ficar na fila', 'Receber encomendas', 'Outro']
const levels = ['Amador', 'Verificada', 'Especialista']

export default function ProviderProfileScreen() {
  const { currentUser, updateProfile } = useAuthStore()
  const { showToast } = useToastStore()
  const [categories, setCategories] = useState([])
  const [level, setLevel] = useState('Amador')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [neighborhood, setNeighborhood] = useState(currentUser?.neighborhood || '')
  const [bio, setBio] = useState(currentUser?.bio || '')
  const [portfolio, setPortfolio] = useState(['🔧', '💡', '⚡'])
  const [photo, setPhoto] = useState(currentUser?.photo)

  const toggleCat = c => setCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  const handleSave = () => {
    updateProfile({ neighborhood, bio, photo, providerCategories: categories, providerLevel: level, priceMin: Number(priceMin), priceMax: Number(priceMax) })
    showToast('Perfil de prestadora atualizado!', 'success')
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream pb-24">
      <ProfileHeader title="Meu perfil de prestadora" />

      <div className="px-4 py-5 flex flex-col gap-4">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <Avatar initials={currentUser?.initials} photo={photo} size="xl" />
            <label className="absolute bottom-0 right-0 bg-petroleum text-white rounded-full p-2 cursor-pointer">
              <Camera size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={e => {
                const f = e.target.files[0]
                if (f) { const r = new FileReader(); r.onload = ev => setPhoto(ev.target.result); r.readAsDataURL(f) }
              }} />
            </label>
          </div>
          <p className="font-bold text-tip-text">{currentUser?.name}</p>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-tip-text mb-3">Categorias de serviço</h3>
          <div className="flex flex-wrap gap-2">
            {allCategories.map(c => (
              <Chip key={c} label={c} active={categories.includes(c)} onClick={() => toggleCat(c)} />
            ))}
          </div>
        </div>

        {/* Level */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-tip-text mb-3">Nível</h3>
          <div className="flex gap-2">
            {levels.map(l => (
              <Chip key={l} label={l} active={level === l} onClick={() => setLevel(l)} />
            ))}
          </div>
        </div>

        {/* Prices */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-tip-text mb-3">Faixa de preço</h3>
          <div className="flex gap-3">
            <Input label="Mínimo (R$)" type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="flex-1" />
            <Input label="Máximo (R$)" type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="flex-1" />
          </div>
        </div>

        {/* Location & Bio */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <Input label="Bairro de atuação" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} />
          <div>
            <label className="text-sm font-semibold text-tip-text">Bio profissional</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              maxLength={300}
              className="w-full mt-1 rounded-xl border border-cream-border px-4 py-3 text-sm outline-none resize-none"
            />
          </div>
        </div>

        {/* Portfolio */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-tip-text mb-3">Portfólio</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {portfolio.map((e, i) => (
              <div key={i} className="bg-cream-mid rounded-xl h-16 flex items-center justify-center text-3xl">{e}</div>
            ))}
          </div>
          <button className="w-full border-2 border-dashed border-cream-border rounded-xl py-3 text-sm text-tip-mid">
            + Adicionar item ao portfólio
          </button>
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={handleSave}>
          Salvar perfil
        </Button>
      </div>

      <NavBar />
    </div>
  )
}
