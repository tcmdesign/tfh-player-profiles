export default function ValuePickSection({ data, loading }) {
  if (loading || !data?.analysis) return null;

  return (
    <div className="fp-insight" style={{
      marginBottom: 16,
      background: 'rgba(212,255,0,0.04)',
      borderLeft: '2px solid rgba(212,255,0,0.4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div className="fp-insight-head" style={{ color: '#D4FF00', marginBottom: 0 }}>
          Value Pick Analysis
        </div>
        {data.consensus && (
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, fontWeight: 700,
            background: 'rgba(212,255,0,0.10)',
            border: '1px solid rgba(212,255,0,0.3)',
            color: '#D4FF00',
            borderRadius: 4, padding: '2px 8px',
            letterSpacing: '0.3px',
          }}>
            Consensus {data.consensus}
          </span>
        )}
      </div>
      <div className="fp-insight-text" style={{ color: 'var(--fp-steel)' }}>
        {data.analysis}
      </div>
    </div>
  );
}
