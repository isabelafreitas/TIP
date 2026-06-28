import Spinner from './Spinner'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  fullWidth = false,
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-150 active:scale-95'
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  }
  const variants = {
    primary: 'bg-petroleum text-white hover:bg-petroleum-mid disabled:opacity-50',
    secondary: 'border-2 border-petroleum text-petroleum bg-transparent hover:bg-petroleum-bg disabled:opacity-50',
    ghost: 'text-petroleum bg-transparent hover:bg-petroleum-bg disabled:opacity-50',
    danger: 'bg-red-tip text-white hover:opacity-90 disabled:opacity-50',
    mustard: 'bg-mustard text-white hover:opacity-90 disabled:opacity-50',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
