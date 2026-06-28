import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, SlidersHorizontal } from 'lucide-react'
import { providers } from '../data/providers'
import ProviderCard from '../components/ProviderCard'
import Chip from '../components/Chip'

export default function SearchScreen() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ distance: false, available: false })
  const [showMore, setShowMore] = useState(false)
  const [priceMax, setPriceMax] = useState(300)
  const [levelFilter, setLevelFilter] = useState('')

  useEffect(() => {
    const cat = params.get('cat')
    if (cat) setQuery(cat.replace('-', ' '))
  }, [params])

  const filtered = providers.filter(p => {
    const q = query.toLowerCase()
    const matchesQuery = !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.some(c => c.toLowerCase().includes(q)) ||
      p.neighborhood.toLowerCase().includes(q)
    const matchesPrice = p.priceMin <= priceMax
    const matchesLevel = !levelFilter || p.level === levelFilter
    return matchesQuery && matchesPrice && matchesLevel
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 28px)', background: '#FBFAF7' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px 12px', borderBottom: '1px solid #EEF3F4', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1E4D5C', padding: 4 }}
          >
            <ArrowLeft size={20} color="#1E4D5C" />
          </button>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1A18', lineHeight: 1 }}>Buscar</p>
            <p style={{ fontSize: 10, color: '#6A6858', marginTop: 2 }}>São Paulo, SP</p>
          </div>
        </div>
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar serviço ou profissional..."
          style={{
            width: '100%',
            border: '1.5px solid #1E4D5C',
            borderRadius: 12,
            padding: '9px 12px',
            fontSize: 12,
            color: '#6A6858',
            background: '#fff',
            outline: 'none',
            marginTop: 8,
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EEF3F4', padding: '10px 16px' }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          <Chip
            label="Distância"
            active={filters.distance}
            onClick={() => setFilters(f => ({ ...f, distance: !f.distance }))}
          />
          <Chip
            label="Disponível"
            active={filters.available}
            onClick={() => setFilters(f => ({ ...f, available: !f.available }))}
          />
          <Chip
            label="Mais filtros"
            active={showMore}
            onClick={() => setShowMore(!showMore)}
          />
          <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#1E4D5C', background: 'none', border: 'none', cursor: 'pointer' }}>
            <SlidersHorizontal size={13} />
          </button>
        </div>

        {showMore && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#1E4D5C' }}>Preço máximo: R${priceMax}</label>
              <input
                type="range"
                min={30}
                max={300}
                value={priceMax}
                onChange={e => setPriceMax(Number(e.target.value))}
                style={{ width: '100%', marginTop: 4, accentColor: '#1E4D5C' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#1E4D5C' }}>Nível</label>
              <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                {['', 'Especialista', 'Verificada', 'Amador'].map(l => (
                  <Chip key={l} label={l || 'Todos'} active={levelFilter === l} onClick={() => setLevelFilter(l)} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontSize: 10, color: '#6A6858' }}>
          {filtered.length} prestadora{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
        </p>
        {filtered.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 0' }}>
            <span style={{ fontSize: 40, marginBottom: 12 }}>🔍</span>
            <p style={{ fontWeight: 600, fontSize: 14, color: '#1A1A18' }}>Nenhum resultado</p>
            <p style={{ fontSize: 12, color: '#6A6858', marginTop: 4 }}>Tente outros termos ou ajuste os filtros</p>
          </div>
        ) : (
          filtered.map(p => <ProviderCard key={p.id} provider={p} />)
        )}
      </div>
    </div>
  )
}
