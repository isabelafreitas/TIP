import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import { seedDemoData } from '../utils/seed'
import Input from '../components/Input'
import Button from '../components/Button'
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
    <div className="flex flex-col min-h-screen bg-cream">
      <div className="bg-petroleum px-6 pt-16 pb-8">
        <h1 className="text-white text-2xl font-bold">
          {mode === 'login' ? 'Bem-vinda de volta!' : 'Crie sua conta'}
        </h1>
        <p className="text-petroleum-light text-sm mt-1">
          {mode === 'login' ? 'Entre para acessar a TIP' : 'Junte-se à comunidade TIP'}
        </p>
      </div>

      <div className="flex-1 px-6 py-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <button type="button" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="mt-2">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        <div className="text-center mt-6">
          {mode === 'login' ? (
            <p className="text-sm text-tip-mid">
              Não tem conta?{' '}
              <button onClick={() => setMode('register')} className="text-petroleum font-semibold">
                Cadastre-se
              </button>
            </p>
          ) : (
            <p className="text-sm text-tip-mid">
              Já tem conta?{' '}
              <button onClick={() => setMode('login')} className="text-petroleum font-semibold">
                Entrar
              </button>
            </p>
          )}
        </div>

        <div className="mt-4 p-3 bg-petroleum-bg rounded-xl">
          <p className="text-xs text-petroleum font-medium">Demo: isa@tip.com / tip2026</p>
        </div>
      </div>
    </div>
  )
}
