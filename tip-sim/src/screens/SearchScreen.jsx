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
    <div className="flex flex-col min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-petroleum px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-white p-1">
          <ArrowLeft size={22} />
        </button>
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar serviço ou profissional..."
          className="flex-1 bg-white/15 text-white placeholder:text-white/60 rounded-xl px-4 py-2.5 text-sm outline-none"
        />
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-cream-border px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
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
          <button className="flex items-center gap-1 text-xs text-petroleum">
            <SlidersHorizontal size={14} />
          </button>
        </div>

        {showMore && (
          <div className="mt-3 flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-tip-text">Preço máximo: R${priceMax}</label>
              <input
                type="range"
                min={30}
                max={300}
                value={priceMax}
                onChange={e => setPriceMax(Number(e.target.value))}
                className="w-full mt-1 accent-petroleum"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-tip-text">Nível</label>
              <div className="flex gap-2 mt-1">
                {['', 'Especialista', 'Verificada', 'Amador'].map(l => (
                  <Chip key={l} label={l || 'Todos'} active={levelFilter === l} onClick={() => setLevelFilter(l)} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 px-4 py-4 flex flex-col gap-3">
        <p className="text-xs text-tip-mid">{filtered.length} profissional{filtered.length !== 1 ? 'is' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <span className="text-5xl mb-4">🔍</span>
            <p className="font-semibold text-tip-text">Nenhum resultado</p>
            <p className="text-sm text-tip-mid mt-1">Tente outros termos ou ajuste os filtros</p>
          </div>
        ) : (
          filtered.map(p => <ProviderCard key={p.id} provider={p} />)
        )}
      </div>
    </div>
  )
}
