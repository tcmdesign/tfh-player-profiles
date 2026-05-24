const SEGMENTS = [
  { key: 'boom',  label: 'BOOM',  color: '#22C55E', desc: '≥1.5× target' },
  { key: 'solid', label: 'SOLID', color: 'rgba(41,201,240,0.9)', desc: '≥ target' },
  { key: 'low',   label: 'LOW',   color: 'rgba(94,134,168,0.8)', desc: '≥0.6× target' },
  { key: 'bust',  label: 'BUST',  color: '#EF4444', desc: '< 0.6× target' },
];

export default function BoomBustChart({ boomBust, loading }) {
  if (loading) {
    return <div style={{ height: 60, background: 'var(--fp-navy3)', borderRadius: 6, opacity: 0.4 }} />;
  }
  if (!boomBust || !boomBust.total) return null;

  const { boom = 0, solid = 0, low = 0, bust = 0, total } = boomBust;

  return (
    <div>
      {/* Stacked bar */}
      <div style={{ display: 'flex', borderRadius: 4, overflow: 'hidden', height: 10, marginBottom: 12 }}>
        {SEGMENTS.map(s => {
          const pct = boomBust[s.key] || 0;
          if (!pct) return null;
          return (
            <div
              key={s.key}
              title={`${s.label}: ${pct}%`}
              style={{ width: `${pct}%`, background: s.color, transition: 'width 0.4s' }}
            />
          );
        })}
      </div>

      {/* Legend row */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {SEGMENTS.map(s => {
          const pct = boomBust[s.key] || 0;
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <div>
                <span style={{
                  fontFamily:    "'Barlow Condensed', sans-serif",
                  fontSize:      13,
                  fontWeight:    800,
                  color:         s.color,
                  marginRight:   4,
                }}>{pct}%</span>
                <span style={{ fontSize: 11, color: 'var(--fp-muted)' }}>{s.label}</span>
              </div>
            </div>
          );
        })}
        <span style={{ fontSize: 11, color: 'var(--fp-muted)', marginLeft: 'auto' }}>
          {total} games
        </span>
      </div>
    </div>
  );
}
