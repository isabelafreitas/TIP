export default function Input({
  label,
  optional,
  error,
  helper,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="flex items-center gap-1.5" style={{ fontSize: 10, fontWeight: 600, color: '#1E4D5C' }}>
          {label}
          {optional && <span style={{ fontSize: 10, fontWeight: 400, color: '#B0A898' }}>(opcional)</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-petroleum">{leftIcon}</span>
        )}
        <input
          style={{
            borderRadius: 12,
            border: `1px solid ${error ? '#A32D2D' : '#D0CEC4'}`,
            background: '#fff',
            padding: '9px 12px',
            fontSize: 11,
            color: '#6A6858',
            outline: 'none',
            width: '100%',
          }}
          className={`${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} focus:border-petroleum transition-colors`}
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
