import { useParams, useNavigate } from 'react-router-dom'
import { Bookmark, BookmarkCheck, MapPin, Calendar, Star, ArrowLeft } from 'lucide-react'
import { getProvider } from '../data/providers'
import { useAuthStore } from '../store/authStore'
import Avatar from '../components/Avatar'
import StarRating from '../components/StarRating'
import Button from '../components/Button'

export default function ProviderScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const provider = getProvider(id)
  const { currentUser, toggleSaved } = useAuthStore()
  const saved = currentUser?.saved?.includes(id)

  if (!provider) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: '#6A6858' }}>Profissional não encontrada</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 28px)', background: '#FBFAF7' }}>
      {/* Profile header card — petroleum bg */}
      <div style={{ background: '#1E4D5C', borderRadius: '0 0 20px 20px', padding: '16px 20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FBFAF7', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          >
            <ArrowLeft size={18} color="#FBFAF7" />
          </button>
          <button
            onClick={() => toggleSaved(id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FBFAF7' }}
          >
            {saved ? <BookmarkCheck size={20} fill="#FBFAF7" color="#FBFAF7" /> : <Bookmark size={20} color="#FBFAF7" />}
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
          <div style={{ border: '3px solid #C8960A', borderRadius: '50%', padding: 3 }}>
            <Avatar initials={provider.initials} size="xl" />
          </div>
          <div>
            <h1 style={{ color: '#FBFAF7', fontSize: 14, fontWeight: 700 }}>{provider.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
              <StarRating rating={provider.rating} size={13} />
              <span style={{ color: '#C8960A', fontSize: 12, fontWeight: 600 }}>{provider.rating}</span>
              <span style={{ color: '#9BBDC7', fontSize: 11 }}>({provider.ratingCount} avaliações)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              <span style={{ color: '#9BBDC7', fontSize: 10 }}>
                <MapPin size={10} style={{ display: 'inline', marginRight: 3 }} />
                {provider.neighborhood} · {provider.distanceKm}km
              </span>
              <span style={{ color: '#9BBDC7', fontSize: 10 }}>
                <Calendar size={10} style={{ display: 'inline', marginRight: 3 }} />
                {provider.availableDays.slice(0, 3).join(', ')}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', color: '#FBFAF7', fontSize: 10, padding: '3px 10px', borderRadius: 9999 }}>
              {provider.level}
            </span>
            {provider.badges.map(b => (
              <span key={b} style={{ background: 'rgba(255,255,255,0.12)', color: '#FBFAF7', fontSize: 10, padding: '3px 10px', borderRadius: 9999 }}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 100 }}>
        {/* Bio */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #EEF3F4', padding: 14 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: '#1A1A18', marginBottom: 8 }}>Sobre</h3>
          <p style={{ fontSize: 11, color: '#6A6858', lineHeight: 1.6 }}>{provider.bio}</p>
        </div>

        {/* Services / Zone */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #EEF3F4', padding: 14 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: '#1A1A18', marginBottom: 10 }}>Serviços</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {provider.category.map(c => (
              <span key={c} style={{ background: '#EEF3F4', color: '#1E4D5C', fontSize: 10, padding: '3px 10px', borderRadius: 9999 }}>{c}</span>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#6A6858', textTransform: 'uppercase', fontWeight: 600 }}>Valor</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#C8960A' }}>R${provider.priceMin}–R${provider.priceMax}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: '#6A6858', textTransform: 'uppercase', fontWeight: 600 }}>Local</span>
              <span style={{ fontSize: 11, color: '#1A1A18' }}>{provider.neighborhood}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: '#6A6858', textTransform: 'uppercase', fontWeight: 600 }}>Disponível</span>
              <span style={{ fontSize: 11, color: '#1A1A18' }}>{provider.availableDays.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Portfolio */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #EEF3F4', padding: 14 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: '#1A1A18', marginBottom: 10 }}>Portfólio</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {provider.portfolio.map((emoji, i) => (
              <div key={i} style={{ background: '#EEF3F4', borderRadius: 10, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                {emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #EEF3F4', padding: 14 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: '#1A1A18', marginBottom: 10 }}>Avaliações</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#1A1A18' }}>{provider.rating}</div>
            <div>
              <StarRating rating={provider.rating} size={16} />
              <p style={{ fontSize: 10, color: '#6A6858', marginTop: 3 }}>{provider.ratingCount} avaliações</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {provider.reviews.map((r, i) => (
              <div key={i} style={{ background: '#EEF3F4', borderRadius: 10, padding: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 10, color: '#1A1A18' }}>{r.author}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Star size={10} color="#C8960A" fill="#C8960A" />
                    <span style={{ fontSize: 10, color: '#6A6858' }}>{r.rating}</span>
                  </div>
                </div>
                <p style={{ fontSize: 9, color: '#6A6858', lineHeight: 1.5 }}>{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#fff', borderTop: '1px solid #EEF3F4', padding: '12px 16px' }}>
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
