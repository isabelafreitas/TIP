export default function Avatar({ name, initials, photo, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  }
  if (photo) {
    return (
      <img
        src={photo}
        alt={name || ''}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    )
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-petroleum flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}>
      {initials || (name ? name.slice(0, 2).toUpperCase() : '?')}
    </div>
  )
}
