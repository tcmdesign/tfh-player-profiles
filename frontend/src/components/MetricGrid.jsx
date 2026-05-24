function ordinal(n) {
  if (!n) return 'N/A';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function matchupGrade(rank) {
  if (!rank) return { grade: 'N/A', dir: 'neu' };
  if (rank >= 29) return { grade: 'A+', dir: 'up' };
  if (rank >= 25) return { grade: 'A',  dir: 'up' };
  if (rank >= 21) return { grade: 'B+', dir: 'up' };
  if (rank >= 17) return { grade: 'B',  dir: 'up' };
  if (rank >= 13) return { grade: 'C+', dir: 'neu' };
  if (rank >= 9)  return { grade: 'C',  dir: 'neu' };
  if (rank >= 5)  return { grade: 'D',  dir: 'down' };
  return { grade: 'F', dir: 'down' };
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

export default function MetricGrid({ player, rankings, stats, matchup, weekCount, filterLabel, loading, leaderboard }) {
  const { labelProjection, offseason } = useAppConfig();
  const pos = player?.position || '';

  // Avg pts
  const avgPts    = stats?.avg_fantasy_pts != null ? parseFloat(stats.avg_fantasy_pts) : null;
  const avgPtsStr = avgPts != null ? avgPts.toFixed(1) : '--';
  const recentCount = weekCount ?? stats?.recent?.length ?? 0;
  const ptsRank   = computeRank(avgPts, leaderboard?.pts);
  const ptsLabel  = filterLabel ?? `Last ${recentCount} wks`;

  // Position rank
  const posRankNum = rankings?.position_rank;
  const posRank    = posRankNum ? `#${posRankNum}` : 'NR';
  const posRankDir = !posRankNum ? 'neu' : posRankNum <= 12 ? 'up' : posRankNum > 24 ? 'down' : 'neu';

  // Matchup
  const rankFieldMap = { WR: 'rank_vs_wr', RB: 'rank_vs_rb', TE: 'rank_vs_te', QB: 'rank_vs_qb' };
  const rankField    = rankFieldMap[pos] || 'rank_vs_wr';
  const matchupRank  = matchup?.[rankField];
  const { grade, dir: matchupDir } = matchupGrade(matchupRank);
  const matchupWeekLabel = offseason ? 'Offseason' : labelProjection;
  const matchupSub   = matchupRank
    ? `${matchupWeekLabel} · vs ${matchup?.team || '?'} · ${ordinal(matchupRank)}`
    : 'matchup unavailable';

  const metrics = [
    {
      label: `Avg pts · ${ptsLabel}`,
      value: loading ? '…' : avgPtsStr,
      sub:   ptsRank ? `#${ptsRank} among ${pos}s` : ptsLabel,
      dir:   avgPts >= 15 ? 'up' : avgPts >= 8 ? 'neu' : 'down',
    },
    {
      label: 'Position rank',
      value: posRank,
      sub:   `${pos} overall`,
      dir:   posRankDir,
    },
    {
      label: 'Matchup',
      value: grade,
      sub:   matchupSub,
      dir:   matchupDir,
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '10px',
      marginBottom: '0',
    }}>
      {metrics.map((m, i) => (
        <div key={i} className="fp-metric" style={{ padding: '14px 16px' }}>
          <div className="fp-metric-label">{m.label}</div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize:   '36px',
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
