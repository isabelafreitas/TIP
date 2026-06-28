import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Button from '../components/Button'

const slides = [
  {
    emoji: '🤝',
    title: 'Bem-vinda ao TIP',
    description: 'Conecte-se com profissionais de confiança do seu bairro para qualquer serviço que precisar.',
  },
  {
    emoji: '🔍',
    title: 'Encontre quem você precisa',
    description: 'Busque por categoria, avalie perfis, veja portfólios e escolha a profissional ideal.',
  },
  {
    emoji: '🔒',
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
    <div className="flex flex-col h-screen bg-cream">
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-8xl mb-8">{slide.emoji}</div>
        <h1 className="text-2xl font-bold text-tip-text mb-4">{slide.title}</h1>
        <p className="text-tip-mid text-base leading-relaxed">{slide.description}</p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-petroleum' : 'w-2 bg-cream-border'}`}
          />
        ))}
      </div>

      <div className="px-6 pb-10 flex flex-col gap-3">
        <Button variant="primary" size="lg" fullWidth onClick={next}>
          {current < slides.length - 1 ? 'Próximo' : 'Começar'}
        </Button>
        {current < slides.length - 1 && (
          <Button variant="ghost" size="md" fullWidth onClick={() => navigate('/register')}>
            Pular
          </Button>
        )}
        <button
          onClick={() => navigate('/register')}
          className="text-sm text-tip-mid text-center mt-1"
        >
          Já tem conta? <span className="text-petroleum font-semibold">Entrar</span>
        </button>
      </div>
    </div>
  )
}
