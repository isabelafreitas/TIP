export default function Input({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-semibold text-tip-text">{label}</label>}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tip-mid">{leftIcon}</span>
        )}
        <input
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-tip-text placeholder:text-tip-light outline-none transition-all
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-tip focus:border-red-tip' : 'border-cream-border focus:border-petroleum'}`}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-tip-mid">{rightIcon}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-tip">{error}</p>}
      {helper && !error && <p className="text-xs text-tip-light">{helper}</p>}
    </div>
  )
}
