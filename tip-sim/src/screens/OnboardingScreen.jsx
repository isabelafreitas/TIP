import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { TipLogo } from '../App'

const slides = [
  {
    icon: '🤝',
    title: 'Bem-vinda ao TIP',
    description: 'Conecte-se com profissionais de confiança do seu bairro para qualquer serviço que precisar.',
  },
  {
    icon: '🔍',
    title: 'Encontre quem você precisa',
    description: 'Busque por categoria, avalie perfis, veja portfólios e escolha a profissional ideal.',
  },
  {
    icon: '🔒',
    title: 'Segurança e confiança',
    description: 'Pagamento protegido pela TIP. Só é liberado quando você confirmar que ficou satisfeita.',
  },
]

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)

  if (isLoggedIn) {
    navigate('/home')
    return null
  }

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1)
    else navigate('/register')
  }

  const slide = slides[current]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 28px)', background: '#FBFAF7' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 8px' }}>
        <TipLogo size="md" />
        {current < slides.length - 1 && (
          <button
            onClick={() => navigate('/register')}
            style={{ fontSize: 12, color: '#6A6858', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            Pular
          </button>
        )}
      </div>

      {/* Hero card */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 24px' }}>
        <div style={{
          background: '#1E4D5C',
          borderRadius: 20,
          padding: '36px 28px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          textAlign: 'center',
        }}>
          {/* Mustard icon square */}
          <div style={{
            background: '#C8960A',
            borderRadius: 16,
            width: 72,
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
          }}>
            {slide.icon}
          </div>
          <div>
            <h2 style={{ color: '#FBFAF7', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{slide.title}</h2>
            <p style={{ color: '#9BBDC7', fontSize: 13, lineHeight: 1.6 }}>{slide.description}</p>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
        {slides.map((_, i) => (
          <div
            key={i}
            style={{
              height: 6,
              borderRadius: 9999,
              width: i === current ? 20 : 6,
              background: i === current ? '#C8960A' : '#B0C4CB',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      {/* Actions */}
      <div style={{ padding: '0 24px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={next}
          style={{
            background: '#C8960A',
            color: '#1A1A18',
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 12,
            padding: '12px 20px',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
          }}
          className="active:scale-95 transition-transform"
        >
          {current < slides.length - 1 ? 'Próximo' : 'Começar'}
        </button>
        <button
          onClick={() => navigate('/register')}
          style={{
            background: 'none',
            border: 'none',
            color: '#6A6858',
            fontSize: 12,
            textAlign: 'center',
            cursor: 'pointer',
            padding: '6px 0',
          }}
        >
          Já tenho conta
        </button>
      </div>
    </div>
  )
}
