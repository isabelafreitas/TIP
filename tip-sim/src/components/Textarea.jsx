export default function Textarea({ label, error, maxLength, className = '', value = '', ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }} className={className}>
      {label && (
        <label style={{ fontSize: 10, fontWeight: 600, color: '#1E4D5C' }}>{label}</label>
      )}
      <textarea
        value={value}
        style={{
          width: '100%',
          borderRadius: 12,
          border: `1px solid ${error ? '#A32D2D' : '#D0CEC4'}`,
          background: '#fff',
          padding: '9px 12px',
          fontSize: 11,
          color: '#6A6858',
          outline: 'none',
          resize: 'none',
        }}
        maxLength={maxLength}
        {...props}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {error ? <p style={{ fontSize: 10, color: '#A32D2D' }}>{error}</p> : <span />}
        {maxLength && <p style={{ fontSize: 10, color: '#B0A898' }}>{value.length}/{maxLength}</p>}
      </div>
    </div>
  )
}
