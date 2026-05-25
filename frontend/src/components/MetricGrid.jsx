function ordinal(n) {
  if (!n) return 'N/A';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function computeRank(value, sortedDesc) {
  if (value == null || !sortedDesc?.length) return null;
  const v = parseFloat(value);
  if (isNaN(v) || v <= 0) return null;
  const idx = sortedDesc.findIndex(x => v >= x);
  return idx === -1 ? sortedDesc.length + 1 : idx + 1;
}

const DIR_COLOR = { up: 'var(--fp-green)', down: 'var(--fp-pink)', neu: 'var(--fp-muted)' };

import { useAppConfig } from '../context/AppConfigContext';

export default function MetricGrid({ player, rankings, stats, weekCount, filterLabel, loading, leaderboard }) {
  useAppConfig();
  const pos = player?.position || '';

  // Avg pts
  const avgPts      = stats?.avg_fantasy_pts != null ? parseFloat(stats.avg_fantasy_pts) : null;
  const avgPtsStr   = avgPts != null ? avgPts.toFixed(1) : '--';
  const recentCount = weekCount ?? stats?.recent?.length ?? 0;
  const ptsRank     = computeRank(avgPts, leaderboard?.pts);
  const ptsLabel    = filterLabel ?? `Last ${recentCount} wks`;

  // Position rank
  const posRankNum = rankings?.position_rank;
  const posRank    = posRankNum ? `#${posRankNum}` : 'NR';
  const posRankDir = !posRankNum ? 'neu' : posRankNum <= 12 ? 'up' : posRankNum > 24 ? 'down' : 'neu';

  // OVR rank
  const ovrNum = rankings?.overall_rank;
  const ovrStr = ovrNum ? `#${ovrNum}` : 'NR';
  const ovrDir = !ovrNum ? 'neu' : ovrNum <= 24 ? 'up' : ovrNum <= 100 ? 'neu' : 'down';

  // Season finish rank
  const finishNum = rankings?.pos_finish_rank;
  const finishStr = finishNum ? `#${finishNum}` : '--';
  const finishDir = !finishNum ? 'neu' : finishNum <= 12 ? 'up' : finishNum > 24 ? 'down' : 'neu';

  // 2025 total pts
  const totalPts    = rankings?.season_total_pts;
  const totalPtsStr = totalPts != null ? totalPts.toLocaleString() : '--';
  const totalPtsDir = !totalPts ? 'neu' : totalPts >= 200 ? 'up' : totalPts >= 100 ? 'neu' : 'down';

  const metrics = [
    {
      label: `Avg pts · ${ptsLabel}`,
      value: loading ? '…' : avgPtsStr,
      sub:   ptsRank ? `#${ptsRank} among ${pos}s` : ptsLabel,
      dir:   avgPts == null ? 'neu' : avgPts >= 15 ? 'up' : avgPts >= 8 ? 'neu' : 'down',
    },
    {
      label: 'Position rank',
      value: posRank,
      sub:   `${pos} overall`,
      dir:   posRankDir,
    },
    {
      label: 'OVR rank',
      value: ovrStr,
      sub:   'consensus overall',
      dir:   ovrDir,
    },
    {
      label: '2025 finish',
      value: finishStr,
      sub:   `${pos} season finish`,
      dir:   finishDir,
    },
    {
      label: '2025 total pts',
      value: totalPtsStr,
      sub:   'fantasy points',
      dir:   totalPtsDir,
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '10px',
      marginBottom: '0',
    }}>
      {metrics.map((m, i) => (
        <div key={i} className="fp-metric" style={{ padding: '14px 16px' }}>
          <div className="fp-metric-label">{m.label}</div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize:   '32px',
            fontWeight: 800,
            color:      'var(--fp-text)',
            lineHeight: 1,
            margin:     '6px 0 5px',
          }}>
            {m.value}
          </div>
          <div style={{ fontSize: '10px', color: DIR_COLOR[m.dir] || 'var(--fp-muted)', marginTop: '2px' }}>
            {m.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
