import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import { seedDemoData } from '../utils/seed'
import Input from '../components/Input'
import Button from '../components/Button'
import { TipLogo } from '../App'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterScreen() {
  const navigate = useNavigate()
  const { register, login } = useAuthStore()
  const { showToast } = useToastStore()
  const [mode, setMode] = useState('register') // 'register' | 'login'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (mode === 'register' && !form.name.trim()) e.name = 'Nome obrigatório'
    if (!form.email.includes('@')) e.email = 'E-mail inválido'
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))

    if (mode === 'login') {
      const user = login(form.email, form.password)
      if (user) {
        if (user.id === 'demo-user') seedDemoData(user.id)
        navigate('/home')
      } else {
        showToast('E-mail ou senha incorretos', 'error')
      }
    } else {
      register(form.name, form.email, form.password)
      navigate('/complete-profile')
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 28px)', background: '#FBFAF7' }}>
      {/* Top */}
      <div style={{ padding: '16px 20px 0' }}>
        <TipLogo size="sm" />
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A18', marginBottom: 4 }}>
          {mode === 'login' ? 'Bem-vinda de volta!' : 'Criar conta'}
        </h1>
        <p style={{ fontSize: 11, color: '#6A6858' }}>
          {mode === 'login' ? 'Entre para acessar a TIP' : 'Junte-se à comunidade TIP'}
        </p>
      </div>

      <div style={{ flex: 1, padding: '20px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <Input
              label="Nome completo"
              placeholder="Seu nome"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              error={errors.name}
            />
          )}
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            error={errors.email}
          />
          <Input
            label="Senha"
            type={showPw ? 'text' : 'password'}
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            error={errors.password}
            rightIcon={
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6A6858' }}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
          />

          <p style={{ fontSize: 10, color: '#6A6858', textAlign: 'center', lineHeight: 1.5 }}>
            Ao continuar, você concorda com os{' '}
            <span style={{ color: '#1E4D5C', fontWeight: 600 }}>Termos de Uso</span>{' '}
            e{' '}
            <span style={{ color: '#1E4D5C', fontWeight: 600 }}>Política de Privacidade</span>.
          </p>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          {mode === 'login' ? (
            <button
              onClick={() => setMode('register')}
              style={{ fontSize: 11, color: '#6A6858', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Não tem conta?{' '}
              <span style={{ color: '#1E4D5C', fontWeight: 600 }}>Cadastre-se</span>
            </button>
          ) : (
            <button
              onClick={() => setMode('login')}
              style={{ fontSize: 11, color: '#6A6858', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Já tenho conta —{' '}
              <span style={{ color: '#1E4D5C', fontWeight: 600 }}>entrar</span>
            </button>
          )}
        </div>

        <div style={{ marginTop: 16, padding: 10, background: '#EEF3F4', borderRadius: 10 }}>
          <p style={{ fontSize: 10, color: '#1E4D5C', fontWeight: 500 }}>Demo: isa@tip.com / tip2026</p>
        </div>
      </div>
    </div>
  )
}
