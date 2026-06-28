export default function Chip({ label, active, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={active ? {
        background: '#1E4D5C',
        color: '#FBFAF7',
        border: '1px solid #1E4D5C',
        borderRadius: 9999,
        padding: '5px 12px',
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      } : {
        background: '#fff',
        color: '#1E4D5C',
        border: '1px solid #2E6E84',
        borderRadius: 9999,
        padding: '5px 12px',
        fontSize: 11,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
      className={`transition-all ${className}`}
    >
      {label}
    </button>
  )
}
