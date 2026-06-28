export default function Banner({ icon, title, description, cta, onCta, variant = 'info' }) {
  const variants = {
    info: 'bg-petroleum-bg border-petroleum-light',
    success: 'bg-green-bg border-green-tip',
    warning: 'bg-mustard-bg border-mustard',
  }
  return (
    <div className={`rounded-2xl border p-4 ${variants[variant]}`}>
      <div className="flex gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div className="flex-1">
          <p className="font-semibold text-tip-text text-sm">{title}</p>
          {description && <p className="text-xs text-tip-mid mt-0.5">{description}</p>}
          {cta && (
            <button onClick={onCta} className="text-xs font-semibold text-petroleum mt-2 hover:underline">
              {cta}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
