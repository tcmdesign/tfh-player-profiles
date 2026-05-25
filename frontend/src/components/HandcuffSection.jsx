export default function HandcuffSection({ data, loading }) {
  if (loading || !data?.analysis) return null;

  return (
    <div className="fp-insight" style={{
      marginBottom: 16,
      background: 'rgba(41,140,220,0.05)',
      borderLeft: '2px solid rgba(41,140,220,0.4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div className="fp-insight-head" style={{ color: '#4DA6E8', marginBottom: 0 }}>
          Handcuff Analysis
        </div>
        {data.starter && (
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, fontWeight: 700,
            background: 'rgba(41,140,220,0.12)',
            border: '1px solid rgba(41,140,220,0.3)',
            color: '#4DA6E8',
            borderRadius: 4, padding: '2px 8px',
            letterSpacing: '0.3px',
          }}>
            Backs up {data.starter}
          </span>
        )}
      </div>
      <div className="fp-insight-text" style={{ color: 'var(--fp-steel)' }}>
        {data.analysis}
      </div>
    </div>
  );
}
