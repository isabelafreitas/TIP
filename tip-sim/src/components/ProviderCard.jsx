import { Bookmark, BookmarkCheck, Star, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Avatar from './Avatar'

export default function ProviderCard({ provider }) {
  const navigate = useNavigate()
  const { currentUser, toggleSaved } = useAuthStore()
  const saved = currentUser?.saved?.includes(provider.id)

  return (
    <div
      className="bg-white rounded-2xl shadow-sm p-4 flex gap-3 cursor-pointer active:scale-[0.99] transition-transform"
      onClick={() => navigate(`/provider/${provider.id}`)}
    >
      <Avatar initials={provider.initials} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-tip-text text-sm">{provider.name}</p>
            <p className="text-xs text-tip-mid">{provider.category.join(' • ')}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); toggleSaved(provider.id) }}
            className="text-tip-light hover:text-petroleum p-1"
          >
            {saved ? <BookmarkCheck size={18} className="text-petroleum" /> : <Bookmark size={18} />}
          </button>
        </div>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-mustard fill-mustard" />
            <span className="text-xs font-semibold text-tip-text">{provider.rating}</span>
            <span className="text-xs text-tip-light">({provider.ratingCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={12} className="text-tip-light" />
            <span className="text-xs text-tip-light">{provider.distanceKm}km</span>
          </div>
          <span className="text-xs font-semibold text-mustard-dark">
            R${provider.priceMin}–{provider.priceMax}
          </span>
        </div>
        <div className="mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            provider.level === 'Especialista' ? 'bg-petroleum-bg text-petroleum' :
            provider.level === 'Verificada' || provider.level === 'Verificado' ? 'bg-green-bg text-green-dark' :
            'bg-cream-mid text-tip-mid'
          }`}>
            {provider.level}
          </span>
        </div>
      </div>
    </div>
  )
}
