import { create } from 'zustand'

function getInitials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

const stored = (() => {
  try {
    const u = localStorage.getItem('tip_user')
    return u ? JSON.parse(u) : null
  } catch { return null }
})()

export const useAuthStore = create((set, get) => ({
  currentUser: stored,
  isLoggedIn: !!stored,

  register: (name, email, password) => {
    const user = {
      id: 'u_' + Date.now(),
      name,
      email,
      password,
      initials: getInitials(name),
      neighborhood: '',
      bio: '',
      photo: null,
      is_provider: false,
      rating: null,
      ratingCount: 0,
      saved: [],
      profileCompletion: 30,
    }
    localStorage.setItem('tip_user', JSON.stringify(user))
    set({ currentUser: user, isLoggedIn: true })
    return user
  },

  login: (email, password) => {
    // Demo account
    if (email === 'isa@tip.com' && password === 'tip2026') {
      const existing = localStorage.getItem('tip_user_isa')
      let user
      if (existing) {
        user = JSON.parse(existing)
      } else {
        user = {
          id: 'demo-user',
          name: 'Isabela',
          email: 'isa@tip.com',
          password: 'tip2026',
          initials: 'IS',
          neighborhood: 'Pinheiros',
          bio: 'Amante de tecnologia e serviços práticos.',
          photo: null,
          is_provider: false,
          rating: null,
          ratingCount: 0,
          saved: ['p5', 'p3'],
          profileCompletion: 100,
        }
        localStorage.setItem('tip_user_isa', JSON.stringify(user))
      }
      localStorage.setItem('tip_user', JSON.stringify(user))
      set({ currentUser: user, isLoggedIn: true })
      return user
    }
    // Regular login
    const stored = localStorage.getItem('tip_user')
    if (stored) {
      const u = JSON.parse(stored)
      if (u.email === email && u.password === password) {
        set({ currentUser: u, isLoggedIn: true })
        return u
      }
    }
    return null
  },

  logout: () => {
    localStorage.removeItem('tip_user')
    set({ currentUser: null, isLoggedIn: false })
  },

  updateProfile: (data) => {
    const user = get().currentUser
    if (!user) return
    let completion = 30
    const updated = { ...user, ...data }
    if (updated.neighborhood) completion += 35
    if (updated.bio) completion += 35
    updated.profileCompletion = completion
    if (updated.name) updated.initials = getInitials(updated.name)
    localStorage.setItem('tip_user', JSON.stringify(updated))
    set({ currentUser: updated })
  },

  toggleProviderMode: () => {
    const user = get().currentUser
    if (!user) return
    const updated = { ...user, is_provider: !user.is_provider }
    localStorage.setItem('tip_user', JSON.stringify(updated))
    set({ currentUser: updated })
  },

  toggleSaved: (providerId) => {
    const user = get().currentUser
    if (!user) return
    const saved = user.saved || []
    const updated = {
      ...user,
      saved: saved.includes(providerId)
        ? saved.filter(id => id !== providerId)
        : [...saved, providerId]
    }
    localStorage.setItem('tip_user', JSON.stringify(updated))
    set({ currentUser: updated })
  },
}))
