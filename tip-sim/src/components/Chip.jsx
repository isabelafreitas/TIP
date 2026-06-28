export default function Chip({ label, active, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all
        ${active
          ? 'bg-mustard-bg border-mustard text-mustard-dark'
          : 'bg-white border-cream-border text-tip-mid hover:border-petroleum'
        } ${className}`}
    >
      {label}
    </button>
  )
}
