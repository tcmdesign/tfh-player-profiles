/**
 * SparklineTrend — SVG line chart anchored to a position start threshold.
 *
 * Props:
 *   weeks      [{ week, pts, opponent }]  — current-season data, bye weeks excluded
 *   position   string                     — 'QB' | 'RB' | 'WR' | 'TE' | 'K'
 *   width      number (default 280)
 *   height     number (default 120)
 */

const THRESHOLDS = { QB: 18, RB: 10, WR: 10, TE: 8, K: 6 };

export default function SparklineTrend({ weeks = [], position = 'WR', width = 280, height = 120 }) {
  if (!weeks.length) {
    return (
      <div style={{
        width, height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--fp-muted)', fontSize: 12, fontFamily: "'Outfit', sans-serif",
      }}>
        No data
      </div>
    );
  }

  const threshold = THRESHOLDS[position] ?? 12;
  const maxPts    = Math.max(...weeks.map(w => w.pts), 0);
  const maxY      = Math.max(threshold * 2, maxPts * 1.05, threshold + 1);

  const PAD = { top: 8, right: 10, bottom: 20, left: 28 };
  const chartW = width  - PAD.left - PAD.right;
  const chartH = height - PAD.top  - PAD.bottom;

  function xOf(i)   { return PAD.left + (i / Math.max(weeks.length - 1, 1)) * chartW; }
  function yOf(pts) { return PAD.top  + chartH - (pts / maxY) * chartH; }

  const thresholdY = yOf(threshold);

  // Build polyline points
  const linePoints = weeks.map((w, i) => `${xOf(i)},${yOf(w.pts)}`).join(' ');

  // Fill area under line
  const fillPoints = [
    `${xOf(0)},${PAD.top + chartH}`,
    ...weeks.map((w, i) => `${xOf(i)},${yOf(w.pts)}`),
    `${xOf(weeks.length - 1)},${PAD.top + chartH}`,
  ].join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <clipPath id="sc-chart">
          <rect x={PAD.left} y={PAD.top} width={chartW} height={chartH} />
        </clipPath>
        {/* Green gradient above threshold, red below */}
        <linearGradient id="sc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#22C55E" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#EF4444" stopOpacity={0.08} />
        </linearGradient>
      </defs>

      {/* Background zones */}
      {/* Green zone (above threshold) */}
      <rect
        x={PAD.left} y={PAD.top}
        width={chartW} height={Math.max(0, thresholdY - PAD.top)}
        fill="#22C55E" fillOpacity={0.06}
        clipPath="url(#sc-chart)"
      />
      {/* Red zone (below threshold) */}
      <rect
        x={PAD.left} y={thresholdY}
        width={chartW} height={Math.max(0, PAD.top + chartH - thresholdY)}
        fill="#EF4444" fillOpacity={0.06}
        clipPath="url(#sc-chart)"
      />

      {/* Fill under line */}
      <polygon points={fillPoints} fill="url(#sc-fill)" clipPath="url(#sc-chart)" />

      {/* Threshold line */}
      <line
        x1={PAD.left} y1={thresholdY} x2={PAD.left + chartW} y2={thresholdY}
        stroke="#7A8699" strokeWidth={1} strokeDasharray="3 3"
      />
      {/* Threshold label */}
      <text
        x={PAD.left - 3} y={thresholdY + 4}
        textAnchor="end" fontSize={8}
        fill="#7A8699" fontFamily="'Barlow Condensed', sans-serif"
      >
        {threshold}
      </text>

      {/* Y-axis zero label */}
      <text
        x={PAD.left - 3} y={PAD.top + chartH}
        textAnchor="end" fontSize={8}
        fill="#7A8699" fontFamily="'Barlow Condensed', sans-serif"
        dominantBaseline="middle"
      >
        0
      </text>

      {/* Line */}
      <polyline
        points={linePoints}
        fill="none"
        stroke="#E0613A"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        clipPath="url(#sc-chart)"
      />

      {/* Dots */}
      {weeks.map((w, i) => {
        const cx   = xOf(i);
        const cy   = yOf(w.pts);
        const isDnp = w.pts === 0;
        const isStart = w.pts >= threshold;
        const fill  = isDnp ? 'var(--fp-navy2)' : isStart ? '#22C55E' : '#EF4444';
        const stroke = isDnp ? '#7A8699' : fill;

        return (
          <g key={i}>
            <circle
              cx={cx} cy={cy} r={3.5}
              fill={fill} stroke={stroke} strokeWidth={1.5}
            />
            {/* Tooltip via title */}
            <title>
              {`Wk ${w.week} vs ${w.opponent}: ${isDnp ? 'DNP' : `${w.pts.toFixed(1)} pts`}`}
            </title>
            {/* Larger hit area for native title tooltip */}
            <circle cx={cx} cy={cy} r={7} fill="transparent">
              <title>
                {`Wk ${w.week} vs ${w.opponent}: ${isDnp ? 'DNP' : `${w.pts.toFixed(1)} pts`}`}
              </title>
            </circle>
          </g>
        );
      })}

      {/* X-axis: week numbers */}
      {weeks.map((w, i) => {
        // Only label every other week if crowded
        if (weeks.length > 10 && i % 2 !== 0) return null;
        return (
          <text
            key={i}
            x={xOf(i)} y={height - 4}
            textAnchor="middle" fontSize={7}
            fill="#7A8699" fontFamily="'Barlow Condensed', sans-serif"
          >
            {w.week}
          </text>
        );
      })}
    </svg>
  );
}
