const SEASON_FILTERS = [
  { key: 's2025', label: '2025' },
  { key: 's2024', label: '2024' },
  { key: 'career', label: 'Career' },
];

export default function StatsFilter({ activePill, onPill }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {SEASON_FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => onPill(activePill === f.key ? null : f.key)}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '12px',
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: '20px',
            cursor: 'pointer',
            letterSpacing: '0.3px',
            transition: 'all 0.15s',
            border: activePill === f.key
              ? '1px solid var(--fp-cyan)'
              : '1px solid var(--fp-border)',
            background: activePill === f.key
              ? 'var(--fp-cyan)'
              : 'var(--fp-navy2)',
            color: activePill === f.key
              ? 'var(--fp-navy)'
              : 'var(--fp-muted)',
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
