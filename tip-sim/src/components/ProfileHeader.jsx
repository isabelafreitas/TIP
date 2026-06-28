import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ProfileHeader({ title, onBack, rightElement }) {
  const navigate = useNavigate()
  return (
    <div className="bg-petroleum px-4 pt-12 pb-4 flex items-center gap-3">
      <button
        onClick={onBack || (() => navigate(-1))}
        className="text-white/80 hover:text-white p-1"
      >
        <ArrowLeft size={22} />
      </button>
      <h1 className="flex-1 text-white font-bold text-lg">{title}</h1>
      {rightElement}
    </div>
  )
}
