export default function MomentumBadge({ momentum, loading }) {
  if (loading || !momentum || momentum.direction === 'neutral' || momentum.pctChange == null) return null;

  const up  = momentum.direction === 'up';
  const pct = Math.abs(momentum.pctChange).toFixed(0);

  const color  = up ? '#22C55E' : '#EF4444';
  const bg     = up ? 'rgba(34,197,94,0.12)'  : 'rgba(239,68,68,0.12)';
  const border = up ? 'rgba(34,197,94,0.30)'  : 'rgba(239,68,68,0.30)';
  const arrow  = up ? '▲' : '▼';
  const label  = up ? 'TRENDING UP' : 'TRENDING DOWN';

  return (
    <div style={{
      display:        'inline-flex',
      alignItems:     'center',
      gap:            '5px',
      padding:        '3px 9px',
      borderRadius:   '20px',
      border:         `1px solid ${border}`,
      background:     bg,
      fontSize:       '10px',
      fontFamily:     "'Barlow Condensed', sans-serif",
      fontWeight:     700,
      letterSpacing:  '0.6px',
      color,
      whiteSpace:     'nowrap',
    }}>
      <span style={{ fontSize: '8px' }}>{arrow}</span>
      {label}
      <span style={{ opacity: 0.7 }}>{pct}%</span>
    </div>
  );
}
