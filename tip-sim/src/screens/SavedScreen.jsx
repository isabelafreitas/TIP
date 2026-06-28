import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { providers } from '../data/providers'
import ProfileHeader from '../components/ProfileHeader'
import ProviderCard from '../components/ProviderCard'
import Button from '../components/Button'

export default function SavedScreen() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.currentUser)
  const savedIds = user?.saved || []
  const savedProviders = providers.filter(p => savedIds.includes(p.id))

  return (
    <div className="flex flex-col min-h-screen bg-cream pb-6">
      <ProfileHeader title="Salvos" />

      <div className="flex-1 px-4 py-4 flex flex-col gap-3">
        {savedProviders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4">🔖</span>
            <p className="font-semibold text-tip-text">Nenhum salvo ainda</p>
            <p className="text-sm text-tip-mid mt-1 mb-4">Salve profissionais para encontrá-las rapidamente</p>
            <Button variant="primary" onClick={() => navigate('/search')}>
              Explorar profissionais
            </Button>
          </div>
        ) : (
          savedProviders.map(p => <ProviderCard key={p.id} provider={p} />)
        )}
      </div>
    </div>
  )
}
