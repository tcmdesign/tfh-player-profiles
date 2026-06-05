const TYPE_STYLES = {
  Sleeper:  { color: '#AA44FF', bg: 'rgba(170,68,255,0.05)',  border: 'rgba(170,68,255,0.4)' },
  Breakout: { color: '#FF4DA6', bg: 'rgba(255,77,166,0.05)',  border: 'rgba(255,77,166,0.4)' },
  Bust:     { color: '#FF6B35', bg: 'rgba(255,107,53,0.05)',  border: 'rgba(255,107,53,0.4)' },
};

export default function SbbSection({ data, loading }) {
  if (loading || !data?.notes) return null;

  const style = TYPE_STYLES[data.type] || TYPE_STYLES.Sleeper;

  return (
    <div className="fp-insight" style={{
      marginBottom: 16,
      background: style.bg,
      borderLeft: `2px solid ${style.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div className="fp-insight-head" style={{ color: style.color, marginBottom: 0 }}>
          {data.type} Analysis
        </div>
        {data.creator && (
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, fontWeight: 700,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#aaa',
            borderRadius: 4, padding: '2px 8px',
            letterSpacing: '0.3px',
          }}>
            {data.creator}'s Pick
          </span>
        )}
      </div>
      <div className="fp-insight-text" style={{ color: 'var(--fp-steel)' }}>
        {data.notes}
      </div>
    </div>
  );
}
