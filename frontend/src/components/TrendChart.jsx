const THRESHOLDS = { WR: 15, RB: 12, QB: 20, TE: 10, K: 8 };

function niceMax(v) {
  if (v <= 10) return Math.max(Math.ceil(v / 2) * 2, 4);
  if (v <= 30) return Math.ceil(v / 5) * 5;
  return Math.ceil(v / 10) * 10;
}

function gridStep(yMax) {
  if (yMax <= 10) return 2;
  if (yMax <= 20) return 5;
  if (yMax <= 40) return 10;
  return 20;
}

function barStyle(pts, position) {
  if (pts === 0) return { fill: 'rgba(240,16,106,0.75)', valColor: '#F0106A' };
  const t = THRESHOLDS[position] || 12;
  if (pts >= t * 1.5) return { fill: 'rgba(27,240,60,0.85)',    valColor: '#1BF03C' };
  if (pts >= t)       return { fill: 'rgba(41,201,240,0.80)',   valColor: 'rgba(41,201,240,0.95)' };
  if (pts >= t * 0.6) return { fill: 'rgba(94,134,168,0.65)',   valColor: 'rgba(94,134,168,0.9)' };
  return                     { fill: 'rgba(240,16,106,0.70)',   valColor: '#F0106A' };
}

export default function TrendChart({ stats, position }) {
  const recent = stats?.recent || [];
  // Career mode: entries have week=null and represent season averages
  const careerMode = recent.length > 0 && recent[0].week == null;
  const weeks = careerMode ? recent : [...recent].reverse();

  if (!weeks.length) {
    return (
      <div style={{ color: 'var(--fp-muted)', fontSize: '13px', padding: '1rem 0', textAlign: 'center' }}>
        No recent stats available
      </div>
    );
  }

  const ptsArr = weeks.map(w => parseFloat(w.fantasy_pts) || 0);
  const maxPts = Math.max(...ptsArr, 1);
  const avg    = ptsArr.reduce((a, b) => a + b, 0) / ptsArr.length;

  const seasons     = [...new Set(weeks.map(w => w.season))].sort();
  const multiSeason = seasons.length > 1;

  // SVG canvas
  const W = 620, H = 230;
  const PL = 36, PR = 8, PT = 26, PB = 42;
  const cW = W - PL - PR;
  const cH = H - PT - PB;

  const yMax  = niceMax(maxPts);
  const step  = gridStep(yMax);
  const grids = [];
  for (let v = 0; v <= yMax; v += step) grids.push(v);

  const yToSvg = v => PT + cH * (1 - v / yMax);
  const avgY   = yToSvg(avg);

  const n      = weeks.length;
  const barGap = Math.max(2, Math.min(6, (cW / n) * 0.14));
  const barW   = (cW - (n - 1) * barGap) / n;
  const xLeft  = i => PL + i * (barW + barGap);
  const xMid   = i => xLeft(i) + barW / 2;

  const valFs  = n > 13 ? 9 : n > 9 ? 10 : 11;

  return (
    <div style={{ marginBottom: 0 }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', display: 'block' }}
      >
        {/* Y grid lines + labels */}
        {grids.map(v => {
          const y = yToSvg(v);
          return (
            <g key={v}>
              <line
                x1={PL} y1={y} x2={W - PR} y2={y}
                stroke={v === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}
                strokeWidth={v === 0 ? 1 : 0.8}
                strokeDasharray={v === 0 ? '' : '3,5'}
              />
              <text
                x={PL - 5} y={y + 3.5}
                textAnchor="end"
                fontSize="9"
                fill="rgba(255,255,255,0.22)"
                fontFamily="system-ui,sans-serif"
              >
                {v}
              </text>
            </g>
          );
        })}

        {/* Avg dashed line */}
        <line
          x1={PL} y1={avgY} x2={W - PR} y2={avgY}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1.5"
          strokeDasharray="5,5"
        />
        {/* Avg pill label */}
        <rect x={1} y={avgY - 8} width={PL - 3} height={14} rx="3" fill="rgba(255,255,255,0.08)" />
        <text
          x={PL - 6} y={avgY + 4}
          textAnchor="end"
          fontSize="9"
          fontWeight="700"
          fill="rgba(255,255,255,0.6)"
          fontFamily="'Barlow Condensed',sans-serif"
        >
          {avg.toFixed(1)}
        </text>

        {/* Bars */}
        {weeks.map((w, i) => {
          const pts          = ptsArr[i];
          const { fill, valColor } = barStyle(pts, position);
          const bH           = pts === 0 ? 3 : Math.max(3, cH * (pts / yMax));
          const bY           = PT + cH - bH;
          const xc           = xMid(i);
          const showSeason   = !careerMode && multiSeason && (i === 0 || weeks[i - 1]?.season !== w.season);

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={xLeft(i)} y={bY}
                width={barW} height={bH}
                fill={fill}
                rx="2"
              />

              {/* Value above bar */}
              <text
                x={xc} y={bY - 5}
                textAnchor="middle"
                fontSize={valFs}
                fontWeight="800"
                fill={valColor}
                fontFamily="'Barlow Condensed',sans-serif"
              >
                {pts % 1 === 0 ? pts.toFixed(0) : pts.toFixed(1)}
              </text>

              {/* X-axis labels */}
              {careerMode ? (
                <>
                  <text
                    x={xc} y={PT + cH + 13}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="rgba(41,201,240,0.85)"
                    fontFamily="'Barlow Condensed',sans-serif"
                  >
                    {String(w.season).slice(2)}
                  </text>
                  <text
                    x={xc} y={PT + cH + 26}
                    textAnchor="middle"
                    fontSize="8"
                    fill="rgba(255,255,255,0.25)"
                    fontFamily="system-ui,sans-serif"
                  >
                    {w.gamesPlayed}g
                  </text>
                </>
              ) : (
                <>
                  <text
                    x={xc} y={PT + cH + 13}
                    textAnchor="middle"
                    fontSize="9"
                    fill="rgba(255,255,255,0.38)"
                    fontFamily="system-ui,sans-serif"
                  >
                    Wk{w.week}
                  </text>
                  {showSeason ? (
                    <text
                      x={xc} y={PT + cH + 27}
                      textAnchor="middle"
                      fontSize="8.5"
                      fontWeight="700"
                      fill="rgba(41,201,240,0.8)"
                      fontFamily="system-ui,sans-serif"
                    >
                      {w.season}
                    </text>
                  ) : w.opponent ? (
                    <text
                      x={xc} y={PT + cH + 27}
                      textAnchor="middle"
                      fontSize="8"
                      fill="rgba(94,134,168,0.55)"
                      fontFamily="system-ui,sans-serif"
                    >
                      @{w.opponent}
                    </text>
                  ) : null}
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
