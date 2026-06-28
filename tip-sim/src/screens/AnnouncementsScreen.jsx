import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useAnnouncementsStore } from '../store/announcementsStore'
import NavBar from '../components/NavBar'
import Modal from '../components/Modal'
import Avatar from '../components/Avatar'
import Button from '../components/Button'

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 28px)', background: '#FBFAF7', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 12px' }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A18', marginBottom: 2 }}>Minhas necessidades</h1>
        <p style={{ fontSize: 11, color: '#6A6858' }}>Encontre a profissional certa</p>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E0DED6', display: 'flex', padding: '0 20px' }}>
        {[['active', 'Ativas'], ['closed', 'Encerradas']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            style={{
              flex: 1,
              padding: '10px 0',
              fontSize: 12,
              fontWeight: 600,
              color: tab === v ? '#1E4D5C' : '#6A6858',
              borderBottom: tab === v ? '2px solid #1E4D5C' : '2px solid transparent',
              background: 'none',
              border: 'none',
              borderBottom: tab === v ? '2px solid #1E4D5C' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 0' }}>
            <span style={{ fontSize: 40, marginBottom: 10 }}>📢</span>
            <p style={{ fontWeight: 600, fontSize: 14, color: '#1A1A18' }}>Nenhuma necessidade</p>
            <p style={{ fontSize: 11, color: '#6A6858', marginTop: 4, marginBottom: 14 }}>Publique o que você precisa e receba propostas</p>
            <button
              onClick={() => navigate('/new-announcement')}
              style={{ fontSize: 12, fontWeight: 600, color: '#1E4D5C', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              + Criar anúncio
            </button>
          </div>
        ) : (
          <>
            {filtered.map(ann => (
              <div key={ann.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #EEF3F4', padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, marginRight: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1A18', lineHeight: 1.4, marginBottom: 6 }}>{ann.description}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                      {(ann.tags || []).map(t => (
                        <span key={t} style={{ fontSize: 9, background: '#EEF3F4', color: '#1E4D5C', padding: '2px 8px', borderRadius: 9999 }}>{t}</span>
                      ))}
                    </div>
                    <p style={{ fontSize: 10, color: '#B0A898' }}>{ann.deadline}</p>
                  </div>
                  <span style={{
                    fontSize: 9,
                    padding: '3px 8px',
                    borderRadius: 9999,
                    fontWeight: 600,
                    background: ann.status === 'active' ? '#E1F5EE' : '#EEF3F4',
                    color: ann.status === 'active' ? '#0F6E56' : '#1E4D5C',
                    flexShrink: 0,
                  }}>
                    {ann.status === 'active' ? 'Ativa' : 'Encerrada'}
                  </span>
                </div>

                {ann.candidates?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedAnn(ann)}
                    >
                      Ver candidatas ({ann.candidates.length})
                    </Button>
                  </div>
                )}

                {ann.status === 'active' && (
                  <button
                    onClick={() => closeAnnouncement(ann.id)}
                    style={{ marginTop: 8, fontSize: 10, color: '#B0A898', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Encerrar anúncio
                  </button>
                )}
              </div>
            ))}

            {/* Dashed new announcement card */}
            <button
              onClick={() => navigate('/new-announcement')}
              style={{
                background: 'none',
                border: '2px dashed #B0A898',
                borderRadius: 12,
                padding: '20px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                color: '#6A6858',
              }}
            >
              + Nova necessidade
            </button>
          </>
        )}
      </div>

      {/* Candidates modal */}
      <Modal open={!!selectedAnn} onClose={() => setSelectedAnn(null)} title="Candidatas">
        {selectedAnn && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(selectedAnn.candidates || []).map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: '#F5F4F0', borderRadius: 12 }}>
                <Avatar initials={typeof c === 'object' ? c.initials : c.slice(0, 2)} size="md" />
                <div>
                  <p style={{ fontWeight: 600, fontSize: 12 }}>{typeof c === 'object' ? c.name : c}</p>
                  {typeof c === 'object' && c.rating && (
                    <p style={{ fontSize: 10, color: '#6A6858' }}>⭐ {c.rating}</p>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/provider/${typeof c === 'object' ? c.id : c}`)}
                  style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: '#1E4D5C', background: 'none', border: '1px solid #2E6E84', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
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
