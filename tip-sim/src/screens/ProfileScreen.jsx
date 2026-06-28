import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import NavBar from '../components/NavBar'
import Avatar from '../components/Avatar'
import Button from '../components/Button'
import Input from '../components/Input'
import Textarea from '../components/Textarea'
import Toggle from '../components/Toggle'
import { Bookmark, History, LogOut, ChevronRight, Camera } from 'lucide-react'

export default function ProfileScreen() {
  const navigate = useNavigate()
  const { currentUser, updateProfile, toggleProviderMode, logout } = useAuthStore()
  const { showToast } = useToastStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(currentUser?.name || '')
  const [neighborhood, setNeighborhood] = useState(currentUser?.neighborhood || '')
  const [bio, setBio] = useState(currentUser?.bio || '')
  const [photo, setPhoto] = useState(currentUser?.photo || null)

  const completion = currentUser?.profileCompletion || 30

  const handleSave = () => {
    updateProfile({ name, neighborhood, bio, photo })
    showToast('Perfil atualizado!', 'success')
    setEditing(false)
  }

  const handleToggleProvider = () => {
    toggleProviderMode()
    if (!currentUser?.is_provider) {
      navigate('/provider-home')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/onboarding')
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream pb-24">
      {/* Header */}
      <div className="bg-petroleum px-5 pt-14 pb-6 flex flex-col items-center gap-3">
        <div className="relative">
          <Avatar initials={currentUser?.initials} photo={photo} size="xl" className="border-4 border-white/30" />
          {editing && (
            <label className="absolute bottom-0 right-0 bg-petroleum text-white rounded-full p-2 cursor-pointer border-2 border-white">
              <Camera size={14} />
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
          )}
        </div>
        <div className="text-center">
          <h1 className="text-white text-xl font-bold">{currentUser?.name}</h1>
          {currentUser?.neighborhood && <p className="text-petroleum-light text-sm">📍 {currentUser.neighborhood}</p>}
        </div>

        {/* Completion bar */}
        <div className="w-full">
          <div className="flex justify-between text-xs text-petroleum-light mb-1">
            <span>Perfil completo</span><span>{completion}%</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full">
            <div className="h-1.5 bg-white rounded-full" style={{ width: `${completion}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 flex flex-col gap-4">
        {editing ? (
          <div className="flex flex-col gap-3">
            <Input label="Nome" value={name} onChange={e => setName(e.target.value)} />
            <Input label="Bairro" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} />
            <Textarea label="Bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={200} />
            <div className="flex gap-2">
              <Button variant="primary" fullWidth onClick={handleSave}>Salvar</Button>
              <Button variant="ghost" fullWidth onClick={() => setEditing(false)}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            {currentUser?.bio ? (
              <p className="text-sm text-tip-mid">{currentUser.bio}</p>
            ) : (
              <p className="text-sm text-tip-light italic">Adicione uma bio ao seu perfil</p>
            )}
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => setEditing(true)}>
              Editar perfil
            </Button>
          </div>
        )}

        {/* Provider mode toggle */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <Toggle
            checked={currentUser?.is_provider || false}
            onChange={handleToggleProvider}
            label="Modo prestadora"
          />
          <p className="text-xs text-tip-light mt-2">Ative para oferecer seus serviços na TIP</p>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {[
            { icon: Bookmark, label: 'Serviços salvos', path: '/saved' },
            { icon: History, label: 'Histórico', path: '/history' },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-4 border-b border-cream-border last:border-0 hover:bg-cream-mid transition-colors"
            >
              <item.icon size={18} className="text-tip-mid" />
              <span className="flex-1 text-sm font-medium text-tip-text text-left">{item.label}</span>
              <ChevronRight size={16} className="text-tip-light" />
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-4 bg-white rounded-2xl shadow-sm text-red-tip w-full"
        >
          <LogOut size={18} />
          <span className="text-sm font-semibold">Sair da conta</span>
        </button>
      </div>

      <NavBar />
    </div>
  )
}
