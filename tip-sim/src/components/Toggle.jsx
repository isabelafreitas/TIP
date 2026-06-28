export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-petroleum' : 'bg-cream-border'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
      </div>
      {label && <span className="text-sm font-medium text-tip-text">{label}</span>}
    </label>
  )
}
