import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ProfileHeader({ title, subtitle, onBack, rightElement }) {
  const navigate = useNavigate()
  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid #EEF3F4',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <button
        onClick={onBack || (() => navigate(-1))}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1E4D5C', padding: 4 }}
      >
        <ArrowLeft size={20} color="#1E4D5C" />
      </button>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 14, fontWeight: 700, color: '#1A1A18', lineHeight: 1 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 10, color: '#6A6858', marginTop: 2 }}>{subtitle}</p>}
      </div>
      {rightElement}
    </div>
  )
}
