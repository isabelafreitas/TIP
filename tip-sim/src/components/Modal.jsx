import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ maxWidth: 390, margin: '0 auto', left: 0, right: 0 }}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto z-10">
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-bold text-tip-text">{title}</h3>}
          <button onClick={onClose} className="ml-auto p-1 text-tip-mid hover:text-tip-text">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
