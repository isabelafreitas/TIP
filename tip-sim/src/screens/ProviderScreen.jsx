import { useParams, useNavigate } from 'react-router-dom'
import { Bookmark, BookmarkCheck, MapPin, Calendar, Star } from 'lucide-react'
import { getProvider } from '../data/providers'
import { useAuthStore } from '../store/authStore'
import Avatar from '../components/Avatar'
import Card from '../components/Card'
import Button from '../components/Button'
import StarRating from '../components/StarRating'

export default function ProviderScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const provider = getProvider(id)
  const { currentUser, toggleSaved } = useAuthStore()
  const saved = currentUser?.saved?.includes(id)

  if (!provider) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-tip-mid">Profissional não encontrada</p>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-petroleum px-5 pt-14 pb-6">
        <div className="flex justify-between items-start mb-4">
          <button onClick={() => navigate(-1)} className="text-white/80 text-sm">← Voltar</button>
          <button onClick={() => toggleSaved(id)} className="text-white p-1">
            {saved ? <BookmarkCheck size={22} className="fill-white" /> : <Bookmark size={22} />}
          </button>
        </div>
        <div className="flex flex-col items-center text-center gap-3">
          <Avatar initials={provider.initials} size="xl" className="border-4 border-white/30" />
          <div>
            <h1 className="text-white text-xl font-bold">{provider.name}</h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <StarRating rating={provider.rating} size={14} />
              <span className="text-petroleum-light text-sm">{provider.rating} ({provider.ratingCount} avaliações)</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">{provider.level}</span>
            {provider.badges.map(b => (
              <span key={b} className="bg-mustard/80 text-white text-xs px-3 py-1 rounded-full">{b}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 flex flex-col gap-4 pb-32">
        {/* Bio */}
        <Card>
          <h3 className="font-bold text-tip-text mb-2">Sobre</h3>
          <p className="text-sm text-tip-mid leading-relaxed">{provider.bio}</p>
        </Card>

        {/* Services */}
        <Card>
          <h3 className="font-bold text-tip-text mb-3">Serviços</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {provider.category.map(c => (
              <span key={c} className="bg-petroleum-bg text-petroleum text-xs px-3 py-1 rounded-full">{c}</span>
            ))}
          </div>
          <div className="flex flex-col gap-2 text-sm text-tip-mid">
            <div className="flex items-center gap-2">
              <span className="text-mustard font-bold text-base">R${provider.priceMin}–R${provider.priceMax}</span>
              <span className="text-tip-light">por serviço</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-tip-light" />
              <span>{provider.neighborhood} · {provider.distanceKm}km</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-tip-light" />
              <span>{provider.availableDays.join(', ')}</span>
            </div>
          </div>
        </Card>

        {/* Portfolio */}
        <Card>
          <h3 className="font-bold text-tip-text mb-3">Portfólio</h3>
          <div className="grid grid-cols-3 gap-3">
            {provider.portfolio.map((emoji, i) => (
              <div key={i} className="bg-cream-mid rounded-xl h-20 flex items-center justify-center text-4xl">
                {emoji}
              </div>
            ))}
          </div>
        </Card>

        {/* Reviews */}
        <Card>
          <h3 className="font-bold text-tip-text mb-3">Avaliações</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold text-tip-text">{provider.rating}</div>
            <div>
              <StarRating rating={provider.rating} size={18} />
              <p className="text-xs text-tip-mid mt-1">{provider.ratingCount} avaliações</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {provider.reviews.map((r, i) => (
              <div key={i} className="border-t border-cream-border pt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-tip-text">{r.author}</span>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-mustard fill-mustard" />
                    <span className="text-xs text-tip-mid">{r.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-tip-mid">{r.comment}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-cream-border p-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/request-service', { state: { provider } })}
        >
          Solicitar serviço
        </Button>
      </div>
    </div>
  )
}
