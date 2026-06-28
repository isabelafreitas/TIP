export default function Textarea({ label, error, maxLength, className = '', value = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-semibold text-tip-text">{label}</label>}
      <textarea
        value={value}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-tip-text placeholder:text-tip-light outline-none resize-none transition-all
          ${error ? 'border-red-tip' : 'border-cream-border focus:border-petroleum'}`}
        maxLength={maxLength}
        {...props}
      />
      <div className="flex justify-between">
        {error ? <p className="text-xs text-red-tip">{error}</p> : <span />}
        {maxLength && <p className="text-xs text-tip-light">{value.length}/{maxLength}</p>}
      </div>
    </div>
  )
}
