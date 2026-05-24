const SEASON_FILTERS = [
  { key: 's2025', label: '2025' },
  { key: 's2024', label: '2024' },
  { key: 'career', label: 'Career' },
];

const stepBtn = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: '16px',
  fontWeight: 700,
  width: '26px',
  height: '26px',
  borderRadius: '6px',
  border: '1px solid var(--fp-border)',
  background: 'var(--fp-navy3)',
  color: 'var(--fp-steel)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
  flexShrink: 0,
};

export default function StatsFilter({ sliderValue, sliderMax, onSlider, activePill, onPill }) {
  const isSliderActive = !activePill;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {/* Season pills */}
      {SEASON_FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => onPill(f.key)}
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

      {/* Divider */}
      <div style={{ width: '1px', height: '20px', background: 'var(--fp-border)', flexShrink: 0 }} />

      {/* Compact week stepper */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'default' }}
        onClick={() => { if (activePill) onPill(null); }}
      >
        <span style={{
          fontSize: '11px',
          color: isSliderActive ? 'var(--fp-steel)' : 'var(--fp-muted)',
          letterSpacing: '0.3px',
          transition: 'color 0.15s',
          whiteSpace: 'nowrap',
        }}>
          Last
        </span>
        <button
          style={stepBtn}
          onClick={e => { e.stopPropagation(); onPill(null); onSlider(Math.max(1, sliderValue - 1)); }}
        >−</button>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '18px',
          fontWeight: 800,
          color: isSliderActive ? 'var(--fp-cyan)' : 'var(--fp-muted)',
          minWidth: '24px',
          textAlign: 'center',
          lineHeight: 1,
          transition: 'color 0.15s',
        }}>
          {sliderValue}
        </span>
        <button
          style={stepBtn}
          onClick={e => { e.stopPropagation(); onPill(null); onSlider(Math.min(sliderMax, sliderValue + 1)); }}
        >+</button>
        <span style={{
          fontSize: '11px',
          color: isSliderActive ? 'var(--fp-steel)' : 'var(--fp-muted)',
          letterSpacing: '0.3px',
          transition: 'color 0.15s',
          whiteSpace: 'nowrap',
        }}>
          wks
        </span>
      </div>
    </div>
  );
}
