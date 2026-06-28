import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import Input from '../components/Input'
import Textarea from '../components/Textarea'
import Button from '../components/Button'

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 28px)', background: '#FBFAF7', paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px' }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A18', marginBottom: 4 }}>Seu perfil</h1>
        <p style={{ fontSize: 11, color: '#6A6858' }}>3x mais chances de ser contratada com perfil completo</p>

        {/* Progress bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: '#6A6858', fontWeight: 600 }}>{completion}%</span>
          </div>
          <div style={{ height: 4, background: '#EEF3F4', borderRadius: 9999 }}>
            <div
              style={{
                height: 4,
                background: '#C8960A',
                borderRadius: 9999,
                width: `${completion}%`,
                transition: 'width 0.4s',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {photo ? (
              <img src={photo} alt="foto" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px dashed #1E4D5C' }} />
            ) : (
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                border: '2px dashed #1E4D5C',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#EEF3F4',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1E4D5C" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
            )}
            <span style={{ fontSize: 11, color: '#1E4D5C', fontWeight: 600 }}>+ Adicionar foto</span>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
          </label>
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
        <button
          onClick={() => navigate('/home')}
          style={{ fontSize: 12, color: '#6A6858', textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0' }}
        >
          Fazer depois
        </button>
      </div>
    </div>
  )
}
