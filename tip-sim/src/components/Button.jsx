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
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 active:scale-95'
  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-sm',
  }
  const variants = {
    // mustard bg, dark text — main CTA
    primary: 'bg-mustard text-tip-text hover:opacity-90 disabled:opacity-50',
    // transparent, petroleum border and text
    secondary: 'border border-petroleum-mid text-petroleum bg-transparent hover:bg-petroleum-bg disabled:opacity-50',
    // text only ghost
    ghost: 'text-tip-mid bg-transparent hover:bg-cream-mid disabled:opacity-50',
    danger: 'bg-red-tip text-white hover:opacity-90 disabled:opacity-50',
    // petroleum filled (legacy usage in some screens)
    petroleum: 'bg-petroleum text-cream hover:bg-petroleum-mid disabled:opacity-50',
    // small mini button
    mini: 'border border-petroleum-mid text-petroleum bg-transparent rounded-md text-xs px-2 py-1 font-semibold',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant] || variants.primary} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
