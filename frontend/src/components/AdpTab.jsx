import { useAdpHistory } from '../hooks/useAdpHistory';

// Week 1 of the 2026 NFL season — Sep 6, 2026
const WEEK1_DATE = new Date('2026-09-06');

function AdpChart({ history }) {
  if (!history || history.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 8, padding: '48px 24px', color: 'var(--fp-muted)',
        textAlign: 'center',
      }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
          <polyline points="4,30 12,20 20,24 28,12 36,16" />
          <line x1="4" y1="34" x2="36" y2="34" />
        </svg>
        <div style={{ fontSize: 14 }}>No ADP history yet</div>
        <div style={{ fontSize: 12 }}>Check back after the next sync</div>
      </div>
    );
  }

  // Clamp and sort
  const sorted = [...history].sort((a, b) => new Date(a.pulled_at) - new Date(b.pulled_at));

  const W   = 620;
  const H   = 220;
  const PAD = { top: 24, right: 32, bottom: 48, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top  - PAD.bottom;

  // X domain: first pull → Week 1 2026 (or last pull if it's after Week 1)
  const xMin = new Date(sorted[0].pulled_at).getTime();
  const xMax = Math.max(WEEK1_DATE.getTime(), new Date(sorted[sorted.length - 1].pulled_at).getTime());

  // Y domain: overall rank (inverted — rank 1 = top of chart)
  const ranks     = sorted.map(d => d.overall_rank);
  const rankMin   = Math.max(1, Math.min(...ranks) - 5);
  const rankMax   = Math.min(250, Math.max(...ranks) + 10);
  const rankRange = rankMax - rankMin || 1;

  function xPos(dateStr) {
    return PAD.left + ((new Date(dateStr).getTime() - xMin) / (xMax - xMin)) * chartW;
  }
  function yPos(rank) {
    // Inverted: lower rank = higher on chart
    return PAD.top + ((rank - rankMin) / rankRange) * chartH;
  }

  // Build SVG path
  const pts   = sorted.map(d => `${xPos(d.pulled_at).toFixed(1)},${yPos(d.overall_rank).toFixed(1)}`);
  const linePt = pts.join(' L ');
  const pathD  = `M ${linePt}`;
  // Area fill: close path along bottom
  const areaD  = `M ${pts[0]} L ${linePt} L ${xPos(sorted[sorted.length - 1].pulled_at).toFixed(1)},${(PAD.top + chartH).toFixed(1)} L ${xPos(sorted[0].pulled_at).toFixed(1)},${(PAD.top + chartH).toFixed(1)} Z`;

  // Week 1 marker x position
  const week1X = PAD.left + ((WEEK1_DATE.getTime() - xMin) / (xMax - xMin)) * chartW;
  const showWeek1 = WEEK1_DATE.getTime() > xMin && WEEK1_DATE.getTime() <= xMax;

  // Y-axis ticks
  const yTicks = [];
  const tickStep = rankRange <= 30 ? 5 : rankRange <= 80 ? 10 : 25;
  const tickStart = Math.ceil(rankMin / tickStep) * tickStep;
  for (let r = tickStart; r <= rankMax; r += tickStep) yTicks.push(r);

  // X-axis ticks — monthly
  const xTicks = [];
  const d0 = new Date(xMin);
  const d1 = new Date(xMax);
  for (let y = d0.getFullYear(); y <= d1.getFullYear(); y++) {
    for (let m = 0; m < 12; m++) {
      const t = new Date(y, m, 1).getTime();
      if (t >= xMin && t <= xMax) xTicks.push(t);
    }
  }

  const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const latestRank = sorted[sorted.length - 1].overall_rank;
  const firstRank  = sorted[0].overall_rank;
  const delta      = latestRank - firstRank;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: 'block', width: '100%', maxWidth: W, minWidth: 320 }}
      >
        <defs>
          <linearGradient id="adpFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#E0613A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#E0613A" stopOpacity="0.02" />
          </linearGradient>
          <clipPath id="adpClip">
            <rect x={PAD.left} y={PAD.top} width={chartW} height={chartH} />
          </clipPath>
        </defs>

        {/* Grid lines */}
        {yTicks.map(r => (
          <line
            key={r}
            x1={PAD.left} y1={yPos(r)}
            x2={PAD.left + chartW} y2={yPos(r)}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1"
          />
        ))}

        {/* Week 1 target line */}
        {showWeek1 && (
          <g>
            <line
              x1={week1X} y1={PAD.top}
              x2={week1X} y2={PAD.top + chartH}
              stroke="rgba(224,97,58,0.35)" strokeWidth="1" strokeDasharray="4 3"
            />
            <text
              x={week1X + 4} y={PAD.top + 11}
              fill="#E0613A" fontSize="9" fontFamily="'Barlow Condensed', sans-serif"
              fontWeight="700" letterSpacing="0.5"
            >
              WK1
            </text>
          </g>
        )}

        {/* Area fill */}
        <path d={areaD} fill="url(#adpFill)" clipPath="url(#adpClip)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#E0613A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath="url(#adpClip)"
        />

        {/* Data points */}
        {sorted.map((d, i) => (
          <circle
            key={i}
            cx={xPos(d.pulled_at)}
            cy={yPos(d.overall_rank)}
            r="3.5"
            fill="#141417"
            stroke="#E0613A"
            strokeWidth="2"
            clipPath="url(#adpClip)"
          />
        ))}

        {/* Y-axis label + ticks */}
        <text
          x={PAD.left - 8} y={PAD.top + chartH / 2}
          fill="var(--fp-muted)" fontSize="9"
          fontFamily="'Barlow Condensed', sans-serif"
          textAnchor="middle" letterSpacing="0.5"
          transform={`rotate(-90, ${PAD.left - 28}, ${PAD.top + chartH / 2})`}
        >
          OVERALL RANK
        </text>
        {yTicks.map(r => (
          <g key={r}>
            <line
              x1={PAD.left - 4} y1={yPos(r)}
              x2={PAD.left} y2={yPos(r)}
              stroke="rgba(255,255,255,0.2)" strokeWidth="1"
            />
            <text
              x={PAD.left - 7} y={yPos(r) + 4}
              fill="rgba(255,255,255,0.35)" fontSize="9"
              fontFamily="'Barlow Condensed', sans-serif"
              textAnchor="end"
            >
              {r}
            </text>
          </g>
        ))}

        {/* X-axis ticks */}
        {xTicks.map(t => {
          const x = PAD.left + ((t - xMin) / (xMax - xMin)) * chartW;
          const d = new Date(t);
          return (
            <g key={t}>
              <line
                x1={x} y1={PAD.top + chartH}
                x2={x} y2={PAD.top + chartH + 4}
                stroke="rgba(255,255,255,0.2)" strokeWidth="1"
              />
              <text
                x={x} y={PAD.top + chartH + 14}
                fill="rgba(255,255,255,0.35)" fontSize="9"
                fontFamily="'Barlow Condensed', sans-serif"
                textAnchor="middle"
              >
                {MONTH_ABBR[d.getMonth()]}
              </text>
            </g>
          );
        })}

        {/* Axes */}
        <line
          x1={PAD.left} y1={PAD.top}
          x2={PAD.left} y2={PAD.top + chartH}
          stroke="rgba(255,255,255,0.12)" strokeWidth="1"
        />
        <line
          x1={PAD.left} y1={PAD.top + chartH}
          x2={PAD.left + chartW} y2={PAD.top + chartH}
          stroke="rgba(255,255,255,0.12)" strokeWidth="1"
        />

        {/* Current rank callout */}
        <g>
          <text
            x={PAD.left + chartW + 4} y={yPos(latestRank) + 4}
            fill="#E0613A" fontSize="11"
            fontFamily="'Barlow Condensed', sans-serif"
            fontWeight="700"
          >
            #{latestRank}
          </text>
        </g>
      </svg>

      {/* Summary row */}
      <div style={{
        display: 'flex', gap: 24, paddingLeft: PAD.left,
        marginTop: -4, flexWrap: 'wrap',
      }}>
        <StatChip label="Current Rank"    value={`#${latestRank}`} color="var(--fp-text)" />
        <StatChip label="Started At"      value={`#${firstRank}`}  color="var(--fp-muted)" />
        <StatChip label="Movement"        value={deltaStr(delta)}  color={delta < 0 ? '#22C55E' : delta > 0 ? '#EF4444' : 'var(--fp-muted)'} />
        <StatChip label="ADP"             value={sorted[sorted.length - 1].adp?.toFixed(1) || '—'} color="var(--fp-text)" />
        <StatChip label="Pos Rank"        value={sorted[sorted.length - 1].pos_rank ? `${sorted[sorted.length - 1].position}${sorted[sorted.length - 1].pos_rank}` : '—'} color="var(--fp-text)" />
        <StatChip label="Data Points"     value={sorted.length}    color="var(--fp-muted)" />
      </div>
    </div>
  );
}

function deltaStr(d) {
  if (d === 0 || d == null) return '—';
  return d < 0 ? `↑ ${Math.abs(d)} spots` : `↓ ${d} spots`;
}

function StatChip({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 18, fontWeight: 800, color,
        lineHeight: 1,
      }}>
        {value}
      </span>
      <span style={{
        fontSize: 9, fontWeight: 700, color: 'var(--fp-muted)',
        letterSpacing: '0.8px', textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </div>
  );
}

export default function AdpTab({ playerId }) {
  const { data, loading, error } = useAdpHistory(playerId);

  if (loading) {
    return (
      <div style={{ padding: '48px 24px', color: 'var(--fp-muted)', fontSize: 14, textAlign: 'center' }}>
        Loading ADP history…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', color: 'var(--fp-muted)', fontSize: 13 }}>
        Could not load ADP data
      </div>
    );
  }

  const history = data?.history || [];

  return (
    <div style={{ padding: '24px 24px 12px' }}>
      {/* Section header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 13, fontWeight: 700, letterSpacing: '0.8px',
          color: 'var(--fp-muted)', textTransform: 'uppercase', marginBottom: 4,
        }}>
          ADP Tracker · 2026 Season
        </div>
        <div style={{ fontSize: 12, color: 'var(--fp-muted)', lineHeight: 1.5 }}>
          Overall rank trajectory from now through Week 1 · PPR scoring · Source: MFL mock drafts
        </div>
      </div>

      <AdpChart history={history} />

      {history.length > 0 && (
        <div style={{
          marginTop: 20, padding: '12px 16px',
          background: 'var(--fp-navy3)', borderRadius: 8,
          border: '1px solid var(--fp-border)',
          fontSize: 12, color: 'var(--fp-muted)', lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--fp-text)' }}>How to read this:</strong>{' '}
          Lower rank number = earlier pick = higher draft value. The chart is inverted so an <em>upward</em> slope
          means the player is <span style={{ color: '#22C55E' }}>rising in value</span>. The orange dashed line marks
          the start of the 2026 regular season.
        </div>
      )}
    </div>
  );
}
