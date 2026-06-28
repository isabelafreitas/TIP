export default function Avatar({ name, initials, photo, size = 'md', className = '' }) {
  const sizes = {
    sm: { wh: 32, text: 10 },
    md: { wh: 40, text: 12 },
    lg: { wh: 56, text: 16 },
    xl: { wh: 88, text: 28 },
  }
  const s = sizes[size] || sizes.md
  if (photo) {
    return (
      <img
        src={photo}
        alt={name || ''}
        style={{ width: s.wh, height: s.wh, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        className={className}
      />
    )
  }
  return (
    <div
      style={{
        width: s.wh,
        height: s.wh,
        borderRadius: '50%',
        background: '#EEF3F4',
        color: '#1E4D5C',
        fontSize: s.text,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      className={className}
    >
      {initials || (name ? name.slice(0, 2).toUpperCase() : '?')}
    </div>
  )
}
