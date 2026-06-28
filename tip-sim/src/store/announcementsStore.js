import { create } from 'zustand'

const KEY = 'tip_announcements'
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
function save(a) { localStorage.setItem(KEY, JSON.stringify(a)) }

export const useAnnouncementsStore = create((set, get) => ({
  announcements: load(),

  createAnnouncement: (data) => {
    const ann = {
      id: 'ann_' + Date.now(),
      status: 'active',
      candidates: [],
      createdAt: new Date().toISOString(),
      ...data,
    }
    const announcements = [ann, ...get().announcements]
    save(announcements)
    set({ announcements })
    return ann
  },

  closeAnnouncement: (id) => {
    const announcements = get().announcements.map(a =>
      a.id === id ? { ...a, status: 'closed' } : a
    )
    save(announcements)
    set({ announcements })
  },

  applyToAnnouncement: (id, providerId) => {
    const announcements = get().announcements.map(a =>
      a.id === id ? { ...a, candidates: [...(a.candidates || []), providerId] } : a
    )
    save(announcements)
    set({ announcements })
  },

  getMyAnnouncements: (userId) => get().announcements.filter(a => a.userId === userId),
  getAvailableAnnouncements: () => get().announcements.filter(a => a.status === 'active'),
  reload: () => set({ announcements: load() }),
}))
