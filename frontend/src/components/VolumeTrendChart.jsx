// Mini SVG chart showing targets + carries per week as stacked bars

export default function VolumeTrendChart({ volumeTrend, position, loading }) {
  if (loading) return <div style={{ height: 80, background: 'var(--fp-navy3)', borderRadius: 6, opacity: 0.4 }} />;
  if (!volumeTrend?.length) return null;

  const weeks = [...volumeTrend].slice(-16); // last 16 weeks max
  const showTargets = ['WR', 'TE', 'RB'].includes(position);
  const showCarries = ['RB', 'QB'].includes(position);

  const maxVol = Math.max(...weeks.map(w => (w.targets || 0) + (w.carries || 0)), 1);

  const W = 620, H = 90;
  const PL = 0, PR = 0, PT = 14, PB = 20;
  const cW = W - PL - PR;
  const cH = H - PT - PB;
  const n = weeks.length;
  const barGap = Math.max(2, Math.min(6, (cW / n) * 0.14));
  const barW   = (cW - (n - 1) * barGap) / n;
  const xLeft  = i => PL + i * (barW + barGap);
  const xMid   = i => xLeft(i) + barW / 2;
  const yScale = v => cH * (v / maxVol);

  return (
    <div style={{ marginBottom: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
        {weeks.map((w, i) => {
          const tgt = w.targets || 0;
          const car = w.carries || 0;
          const tgtH = yScale(tgt);
          const carH = yScale(car);
          const xc   = xMid(i);

          return (
            <g key={i}>
              {/* Carries (bottom, green) */}
              {showCarries && car > 0 && (
                <rect
                  x={xLeft(i)} y={PT + cH - carH}
                  width={barW} height={carH}
                  fill="rgba(34,197,94,0.55)" rx="1"
                />
              )}
              {/* Targets (stacked on top, cyan) */}
              {showTargets && tgt > 0 && (
                <rect
                  x={xLeft(i)} y={PT + cH - carH - tgtH}
                  width={barW} height={tgtH}
                  fill="rgba(41,201,240,0.55)" rx="1"
                />
              )}
              {/* Total label */}
              <text
                x={xc} y={PT + cH - carH - tgtH - 3}
                textAnchor="middle"
                fontSize={n > 12 ? 8 : 9}
                fontWeight="700"
                fill="rgba(255,255,255,0.45)"
                fontFamily="'Barlow Condensed',sans-serif"
              >
                {tgt + car || ''}
              </text>
              {/* Week label */}
              <text
                x={xc} y={H - 4}
                textAnchor="middle"
                fontSize="8"
                fill="rgba(255,255,255,0.25)"
                fontFamily="system-ui,sans-serif"
              >
                {w.week}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
        {showTargets && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(41,201,240,0.7)' }} />
            <span style={{ fontSize: 10, color: 'var(--fp-muted)' }}>Targets</span>
          </div>
        )}
        {showCarries && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(34,197,94,0.7)' }} />
            <span style={{ fontSize: 10, color: 'var(--fp-muted)' }}>Carries</span>
          </div>
        )}
      </div>
    </div>
  );
}
