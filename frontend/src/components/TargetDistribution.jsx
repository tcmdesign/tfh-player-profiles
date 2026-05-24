/**
 * TargetDistribution — play-by-play target heat map for WR/TE/RB
 *
 * Layout: 3 columns (Left | Middle | Right) × 4 rows (Deep | Intermediate | Short | Behind LoS)
 * Each cell = bubble sized by target count, colored by catch rate.
 * Below: summary stats strip (aDOT, targets, catch rate, YAC/rec, EPA/target).
 */
import { useTargetDistribution } from '../hooks/useTargetDistribution';

const LOCATIONS = ['left', 'middle', 'right'];
const DEPTHS    = ['deep', 'intermediate', 'short', 'behind'];
const DEPTH_LABELS = { deep: 'Deep 15+', intermediate: 'Interm 5–14', short: 'Short 0–4', behind: 'Behind LoS' };

function catchRateColor(rate) {
  if (rate == null) return 'rgba(255,255,255,0.08)';
  if (rate >= 70) return 'rgba(34,197,94,0.75)';   // green
  if (rate >= 45) return 'rgba(234,179,8,0.70)';    // amber
  return 'rgba(239,68,68,0.65)';                    // red
}

function catchRateTextColor(rate) {
  if (rate == null) return 'var(--fp-steel)';
  if (rate >= 70) return '#86efac';
  if (rate >= 45) return '#fde68a';
  return '#fca5a5';
}

function BubbleCell({ cell, maxTargets }) {
  if (!cell) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 76, background: 'rgba(255,255,255,0.02)',
        borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 11 }}>—</span>
      </div>
    );
  }

  const ratio  = maxTargets > 0 ? cell.targets / maxTargets : 0;
  const size   = Math.max(28, Math.round(ratio * 52)); // 28–52px diameter
  const color  = catchRateColor(cell.catch_rate);
  const tColor = catchRateTextColor(cell.catch_rate);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 4, height: 76,
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)',
      position: 'relative',
    }}>
      {/* Bubble */}
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 0 ${size * 0.4}px ${color}`,
      }}>
        <span style={{ fontSize: size > 36 ? 13 : 11, fontWeight: 700, color: '#fff', fontFamily: 'Barlow Condensed, sans-serif' }}>
          {cell.targets}
        </span>
      </div>
      {/* Catch rate below bubble */}
      <span style={{ fontSize: 10, color: tColor, fontWeight: 600, lineHeight: 1 }}>
        {cell.catch_rate != null ? `${cell.catch_rate}%` : '—'}
      </span>
    </div>
  );
}

function StatPill({ label, value, sub }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: 'rgba(255,255,255,0.04)', borderRadius: 8,
      padding: '8px 14px', minWidth: 72, flex: 1,
    }}>
      <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--fp-text)', fontFamily: 'Barlow Condensed, sans-serif', lineHeight: 1 }}>
        {value ?? '—'}
      </span>
      {sub && <span style={{ fontSize: 10, color: 'var(--fp-steel)', marginTop: 1 }}>{sub}</span>}
      <span style={{ fontSize: 10, color: 'var(--fp-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
  );
}

export default function TargetDistribution({ playerId, season }) {
  const { data, loading, error } = useTargetDistribution(playerId, season);

  if (loading) {
    return (
      <div style={{ padding: '24px 0', color: 'var(--fp-muted)', textAlign: 'center', fontSize: 13 }}>
        Loading target data…
      </div>
    );
  }

  if (error || !data) return null;

  if (data.targets === 0) {
    return (
      <div style={{ padding: '16px 0', color: 'var(--fp-muted)', fontSize: 13, textAlign: 'center' }}>
        No play-by-play target data available for this player this season.
      </div>
    );
  }

  // Build lookup: grid[location][depth]
  const gridMap = {};
  for (const loc of LOCATIONS) {
    gridMap[loc] = {};
    for (const dep of DEPTHS) {
      gridMap[loc][dep] = null;
    }
  }
  for (const cell of data.grid) {
    if (gridMap[cell.location]) {
      gridMap[cell.location][cell.depth] = cell;
    }
  }

  const maxTargets = Math.max(...data.grid.map(c => c.targets), 1);

  return (
    <div style={{ marginTop: 20 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fp-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Target Distribution
        </span>
        <span style={{ fontSize: 11, color: 'var(--fp-muted)' }}>{data.season} season · bubble = target count · color = catch rate</span>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr 1fr 1fr',
        gap: 4,
      }}>
        {/* Header row */}
        <div />
        {LOCATIONS.map(loc => (
          <div key={loc} style={{
            textAlign: 'center', fontSize: 11, fontWeight: 700,
            color: 'var(--fp-muted)', textTransform: 'uppercase', letterSpacing: '0.07em',
            paddingBottom: 4,
          }}>
            {loc}
          </div>
        ))}

        {/* Data rows */}
        {DEPTHS.map(dep => (
          <>
            <div key={`label-${dep}`} style={{
              display: 'flex', alignItems: 'center',
              fontSize: 10, color: 'var(--fp-steel)',
              paddingRight: 6, textAlign: 'right', justifyContent: 'flex-end',
              lineHeight: 1.2,
            }}>
              {DEPTH_LABELS[dep]}
            </div>
            {LOCATIONS.map(loc => (
              <BubbleCell key={`${loc}-${dep}`} cell={gridMap[loc][dep]} maxTargets={maxTargets} />
            ))}
          </>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'flex-end' }}>
        {[['≥70%', '#86efac'], ['45–69%', '#fde68a'], ['<45%', '#fca5a5']].map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 10, color: 'var(--fp-muted)' }}>{label} catch</span>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
        <StatPill label="Targets" value={data.targets} />
        <StatPill label="Rec" value={data.receptions} sub={`${data.catch_rate}% CR`} />
        <StatPill label="aDOT" value={data.adot != null ? `${data.adot}` : null} sub="yards" />
        <StatPill label="YAC/rec" value={data.avg_yac != null ? `${data.avg_yac}` : null} sub="yards" />
        <StatPill label="EPA/tgt" value={data.avg_epa != null ? `${data.avg_epa}` : null} />
      </div>
    </div>
  );
}
