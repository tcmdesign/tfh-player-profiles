const POS_STATS = {
  WR: [
    { key: 'avg_targets',    rankKey: 'targets_rank',    label: 'Avg Targets',  decimals: 1 },
    { key: 'avg_receptions', rankKey: 'receptions_rank', label: 'Avg Rec',      decimals: 1 },
    { key: 'avg_rec_yards',  rankKey: 'rec_yards_rank',  label: 'Avg Rec Yds',  decimals: 1 },
    { key: 'total_rec_tds',  rankKey: 'rec_tds_rank',    label: 'Rec TDs',      decimals: 0, total: true },
    { key: 'avg_snap_pct',   rankKey: 'snap_pct_rank',   label: 'Snap %',       decimals: 0, pct: true },
  ],
  TE: [
    { key: 'avg_targets',    rankKey: 'targets_rank',    label: 'Avg Targets',  decimals: 1 },
    { key: 'avg_receptions', rankKey: 'receptions_rank', label: 'Avg Rec',      decimals: 1 },
    { key: 'avg_rec_yards',  rankKey: 'rec_yards_rank',  label: 'Avg Rec Yds',  decimals: 1 },
    { key: 'total_rec_tds',  rankKey: 'rec_tds_rank',    label: 'Rec TDs',      decimals: 0, total: true },
    { key: 'avg_snap_pct',   rankKey: 'snap_pct_rank',   label: 'Snap %',       decimals: 0, pct: true },
  ],
  RB: [
    { key: 'avg_carries',    rankKey: 'carries_rank',    label: 'Avg Carries',  decimals: 1 },
    { key: 'avg_rush_yards', rankKey: 'rush_yards_rank', label: 'Avg Rush Yds', decimals: 1 },
    { key: 'total_rush_tds', rankKey: 'rush_tds_rank',   label: 'Rush TDs',     decimals: 0, total: true },
    { key: 'avg_targets',    rankKey: 'targets_rank',    label: 'Avg Targets',  decimals: 1 },
    { key: 'avg_rec_yards',  rankKey: 'rec_yards_rank',  label: 'Avg Rec Yds',  decimals: 1 },
  ],
  QB: [
    { key: 'avg_pass_yards', rankKey: 'pass_yards_rank', label: 'Avg Pass Yds', decimals: 1 },
    { key: 'total_pass_tds', rankKey: 'pass_tds_rank',   label: 'Pass TDs',     decimals: 0, total: true },
    { key: 'total_ints',     rankKey: 'int_rank',        label: 'INTs',         decimals: 0, total: true },
    { key: 'avg_snap_pct',   rankKey: 'snap_pct_rank',   label: 'Snap %',       decimals: 0, pct: true },
  ],
};

export default function StatDetailGrid({ ranks, position, loading, columns, season }) {
  const statDefs = POS_STATS[position] || POS_STATS.WR;

  if (loading) {
    return (
      <div style={{ color: 'var(--fp-muted)', fontSize: '12px', padding: '8px 0' }}>
        Loading stats…
      </div>
    );
  }

  if (!ranks || Object.keys(ranks).length === 0) return null;

  return (
    <div>
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'var(--fp-muted)',
        letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px',
      }}>
        {season ? `${season} Stats & Rankings` : 'Career Stats & Rankings'}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: columns ? `repeat(${columns}, 1fr)` : 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '8px',
      }}>
        {statDefs.map(({ key, rankKey, label, decimals, total, pct }) => {
          const raw = ranks[key];
          const rank = ranks[rankKey];
          if (raw == null) return null;

          const value = parseFloat(raw);
          const display = pct
            ? `${Math.round(value)}%`
            : total
            ? Math.round(value).toString()
            : value.toFixed(decimals);

          return (
            <div key={key} style={{
              background:   'var(--fp-navy2)',
              border:       '1px solid var(--fp-border)',
              borderRadius: '10px',
              padding:      '10px 12px',
            }}>
              <div style={{
                fontSize: '9px', fontWeight: 700,
                color: 'var(--fp-muted)', letterSpacing: '0.8px',
                textTransform: 'uppercase', marginBottom: '6px',
              }}>
                {label}
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize:   '28px',
                fontWeight: 800,
                color:      'var(--fp-text)',
                lineHeight: 1,
                marginBottom: '5px',
              }}>
                {display}
              </div>
              {rank && (
                <div style={{
                  fontSize: '10px',
                  color:    'var(--fp-steel)',
                  letterSpacing: '0.2px',
                }}>
                  #{rank} among {position}s
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
