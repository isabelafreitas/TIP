import { create } from 'zustand'

const STORAGE_KEY = 'tip_services'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}
function save(services) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services))
}

export const useServicesStore = create((set, get) => ({
  services: load(),

  createService: (data) => {
    const svc = {
      id: 'svc_' + Date.now(),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      ...data,
    }
    const services = [svc, ...get().services]
    save(services)
    set({ services })
    return svc
  },

  acceptService: (id) => {
    const services = get().services.map(s =>
      s.id === id ? { ...s, status: 'scheduled', acceptedAt: new Date().toISOString() } : s
    )
    save(services)
    set({ services })
  },

  completeService: (id) => {
    const services = get().services.map(s =>
      s.id === id ? { ...s, status: 'completed_by_provider', completedAt: new Date().toISOString() } : s
    )
    save(services)
    set({ services })
  },

  confirmService: (id) => {
    const services = get().services.map(s =>
      s.id === id ? { ...s, status: 'confirmed', confirmedAt: new Date().toISOString() } : s
    )
    save(services)
    set({ services })
  },

  cancelService: (id, reason, isLate) => {
    const services = get().services.map(s =>
      s.id === id ? { ...s, status: 'cancelled', cancelReason: reason, isLateCancel: isLate, cancelledAt: new Date().toISOString() } : s
    )
    save(services)
    set({ services })
  },

  requestModification: (id, note) => {
    const services = get().services.map(s =>
      s.id === id ? { ...s, modificationRequest: note, modificationRequestedAt: new Date().toISOString() } : s
    )
    save(services)
    set({ services })
  },

  getMyServices: (userId) => {
    return get().services.filter(s => s.requesterId === userId || s.providerId === userId)
  },

  getService: (id) => {
    return get().services.find(s => s.id === id)
  },

  reload: () => set({ services: load() }),
}))
