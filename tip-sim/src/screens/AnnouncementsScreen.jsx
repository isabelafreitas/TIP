import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useAnnouncementsStore } from '../store/announcementsStore'
import NavBar from '../components/NavBar'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Avatar from '../components/Avatar'

export default function AnnouncementsScreen() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.currentUser)
  const announcements = useAnnouncementsStore(s => s.announcements)
  const { closeAnnouncement } = useAnnouncementsStore()
  const [tab, setTab] = useState('active')
  const [selectedAnn, setSelectedAnn] = useState(null)

  const myAnns = announcements.filter(a => a.userId === user?.id)
  const filtered = myAnns.filter(a => tab === 'active' ? a.status === 'active' : a.status !== 'active')

  return (
    <div className="flex flex-col min-h-screen bg-cream pb-24">
      <div className="bg-petroleum px-5 pt-14 pb-4">
        <h1 className="text-white text-xl font-bold">Minhas necessidades</h1>
        <p className="text-petroleum-light text-sm">Encontre a profissional certa</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-cream-border px-4 flex">
        {[['active', 'Ativas'], ['closed', 'Encerradas']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === v ? 'border-petroleum text-petroleum' : 'border-transparent text-tip-mid'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 py-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <span className="text-5xl mb-4">📢</span>
            <p className="font-semibold text-tip-text">Nenhuma necessidade</p>
            <p className="text-sm text-tip-mid mt-1 mb-4">Publique o que você precisa e receba propostas</p>
            <button
              onClick={() => navigate('/new-announcement')}
              className="text-sm font-semibold text-petroleum"
            >
              + Criar anúncio
            </button>
          </div>
        ) : (
          filtered.map(ann => (
            <Card key={ann.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-tip-text line-clamp-2">{ann.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(ann.tags || []).map(t => (
                      <span key={t} className="text-xs bg-petroleum-bg text-petroleum px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                  <p className="text-xs text-tip-light mt-2">{ann.deadline}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ml-2 ${ann.status === 'active' ? 'bg-green-bg text-green-dark' : 'bg-cream-mid text-tip-mid'}`}>
                  {ann.status === 'active' ? 'Ativa' : 'Encerrada'}
                </span>
              </div>

              {ann.candidates?.length > 0 && (
                <button
                  onClick={() => setSelectedAnn(ann)}
                  className="mt-3 w-full flex items-center justify-between bg-petroleum-bg rounded-xl px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-petroleum" />
                    <span className="text-sm font-semibold text-petroleum">{ann.candidates.length} candidata{ann.candidates.length > 1 ? 's' : ''}</span>
                  </div>
                  <ChevronRight size={14} className="text-petroleum" />
                </button>
              )}

              {ann.status === 'active' && (
                <button
                  onClick={() => closeAnnouncement(ann.id)}
                  className="mt-2 text-xs text-tip-light hover:text-red-tip"
                >
                  Encerrar anúncio
                </button>
              )}
            </Card>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/new-announcement')}
        className="fixed bottom-24 right-4 w-14 h-14 bg-petroleum rounded-full flex items-center justify-center shadow-lg text-white z-30"
      >
        <Plus size={24} />
      </button>

      {/* Candidates modal */}
      <Modal open={!!selectedAnn} onClose={() => setSelectedAnn(null)} title="Candidatas">
        {selectedAnn && (
          <div className="flex flex-col gap-3">
            {(selectedAnn.candidates || []).map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-cream-mid rounded-xl">
                <Avatar initials={typeof c === 'object' ? c.initials : c.slice(0, 2)} size="md" />
                <div>
                  <p className="font-semibold text-sm">{typeof c === 'object' ? c.name : c}</p>
                  {typeof c === 'object' && c.rating && (
                    <p className="text-xs text-tip-mid">⭐ {c.rating}</p>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/provider/${typeof c === 'object' ? c.id : c}`)}
                  className="ml-auto text-xs font-semibold text-petroleum"
                >
                  Ver perfil
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <NavBar />
    </div>
  )
}
