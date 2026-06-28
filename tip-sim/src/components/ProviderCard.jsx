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
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #EEF3F4',
        padding: '12px',
        display: 'flex',
        gap: 10,
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/provider/${provider.id}`)}
      className="active:scale-[0.99] transition-transform"
    >
      <Avatar initials={provider.initials} size="lg" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: 11, color: '#1A1A18' }}>{provider.name}</p>
            <p style={{ fontSize: 10, color: '#6A6858', marginTop: 1 }}>{provider.category.join(' • ')}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); toggleSaved(provider.id) }}
            style={{ padding: 4, color: '#B0A898', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {saved ? <BookmarkCheck size={16} color="#1E4D5C" /> : <Bookmark size={16} />}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Star size={11} color="#C8960A" fill="#C8960A" />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#1A1A18' }}>{provider.rating}</span>
            <span style={{ fontSize: 10, color: '#B0A898' }}>({provider.ratingCount})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <MapPin size={10} color="#B0A898" />
            <span style={{ fontSize: 9, color: '#6A6858' }}>{provider.distanceKm}km</span>
          </div>
          <span style={{ fontSize: 9, color: '#6A6858' }}>{provider.neighborhood}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#C8960A' }}>
            R${provider.priceMin}–{provider.priceMax}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/provider/${provider.id}`) }}
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: '#1E4D5C',
              border: '1px solid #2E6E84',
              borderRadius: 6,
              padding: '3px 8px',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            Ver perfil
          </button>
        </div>
      </div>
    </div>
  )
}
