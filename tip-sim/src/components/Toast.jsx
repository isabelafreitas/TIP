import { useToastStore } from '../store/toastStore'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const icons = { success: CheckCircle, error: XCircle, info: Info }
const colors = {
  success: 'bg-green-bg border-green-tip text-green-dark',
  error: 'bg-red-bg border-red-border text-red-tip',
  info: 'bg-petroleum-bg border-petroleum-light text-petroleum',
}

export default function Toast() {
  const { toasts, removeToast } = useToastStore()
  if (!toasts.length) return null
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[350px] max-w-[90vw]">
      {toasts.map(t => {
        const Icon = icons[t.type] || Info
        return (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg ${colors[t.type] || colors.info}`}>
            <Icon size={18} />
            <span className="flex-1 text-sm font-medium">{t.message}</span>
            <button onClick={() => removeToast(t.id)}><X size={14} /></button>
          </div>
        )
      })}
    </div>
  )
}
