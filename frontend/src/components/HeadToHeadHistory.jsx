function getOutlierInfo(game, avgPts) {
  const pts     = parseFloat(game.fantasy_pts) || 0;
  const snap    = game.snap_pct != null ? parseFloat(game.snap_pct) : null;

  const lowSnap = snap !== null && snap < 40;
  const lowPts  = avgPts != null && avgPts > 0 && pts < avgPts * 0.5;

  if (lowSnap && lowPts) return { flag: true, reason: `Limited snaps (${snap.toFixed(0)}%) + well below avg` };
  if (lowSnap)           return { flag: true, reason: `Low snap% — ${snap.toFixed(0)}% (possible injury/limited role)` };
  if (lowPts)            return { flag: true, reason: 'Well below avg — possible injury or inactive' };
  return { flag: false, reason: null };
}

function statLine(game, position) {
  const pts = parseFloat(game.fantasy_pts);
  if (position === 'QB') {
    return [
      game.pass_yards   != null ? `${parseFloat(game.pass_yards).toFixed(0)} yds` : null,
      game.pass_tds     != null ? `${game.pass_tds} TD` : null,
      game.interceptions > 0    ? `${game.interceptions} INT` : null,
    ].filter(Boolean).join(' · ');
  }
  if (position === 'RB') {
    return [
      game.carries    != null ? `${game.carries} car` : null,
      game.rush_yards != null ? `${parseFloat(game.rush_yards).toFixed(0)} yds` : null,
      game.rush_tds   > 0     ? `${game.rush_tds} TD` : null,
      game.targets    != null ? `${game.targets} tgt` : null,
    ].filter(Boolean).join(' · ');
  }
  // WR / TE
  return [
    game.targets    != null ? `${game.targets} tgt` : null,
    game.receptions != null ? `${game.receptions} rec` : null,
    game.rec_yards  != null ? `${parseFloat(game.rec_yards).toFixed(0)} yds` : null,
    game.rec_tds    > 0     ? `${game.rec_tds} TD` : null,
  ].filter(Boolean).join(' · ');
}

function ptsColor(pts, avgPts) {
  if (pts == null || isNaN(pts)) return 'var(--fp-muted)';
  if (avgPts && pts >= avgPts * 1.3) return 'var(--fp-green)';
  if (avgPts && pts < avgPts * 0.5)  return 'var(--fp-pink)';
  return 'var(--fp-text)';
}

export default function HeadToHeadHistory({ playerId, matchupTeam, position, loading: parentLoading }) {
  // Props come from parent — data fetched via useVsHistory in parent
  // We receive { games, avg_pts } directly
  return null; // placeholder — see below for real component
}

// Real export used by PlayerCard:
export function HeadToHeadHistoryInner({ games = [], opponent, position, avgPts, loading }) {
  if (loading) {
    return (
      <div className="fp-card">
        <div className="fp-card-title">History vs {opponent || '…'}</div>
        <div style={{ color: 'var(--fp-muted)', fontSize: '12px' }}>Loading…</div>
      </div>
    );
  }

  if (!opponent) {
    return (
      <div className="fp-card">
        <div className="fp-card-title">Head-to-head history</div>
        <div style={{ color: 'var(--fp-muted)', fontSize: '12px' }}>No upcoming matchup found.</div>
      </div>
    );
  }

  return (
    <div className="fp-card">
      <div className="fp-card-title">History vs {opponent}</div>

      {games.length === 0 ? (
        <div style={{ color: 'var(--fp-muted)', fontSize: '12px' }}>
          No previous games found vs {opponent}.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {games.map((g, i) => {
            const pts     = parseFloat(g.fantasy_pts);
            const outlier = getOutlierInfo(g, avgPts);
            const color   = ptsColor(pts, avgPts);
            const line    = statLine(g, position);

            return (
              <div
                key={i}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '10px',
                  padding:      '8px 10px',
                  borderRadius: '8px',
                  background:   outlier.flag
                    ? 'rgba(240,16,106,0.07)'
                    : 'var(--fp-navy2)',
                  border: outlier.flag
                    ? '1px solid rgba(240,16,106,0.25)'
                    : '1px solid var(--fp-border)',
                }}
              >
                {/* Week label */}
                <div style={{
                  fontFamily:    "'Barlow Condensed', sans-serif",
                  fontSize:      '11px',
                  fontWeight:    700,
                  color:         'var(--fp-muted)',
                  minWidth:      '52px',
                  letterSpacing: '0.3px',
                }}>
                  {g.season} Wk {g.week}
                </div>

                {/* Stat line */}
                <div style={{
                  flex:     1,
                  fontSize: '11px',
                  color:    'var(--fp-steel)',
                }}>
                  {line || '—'}
                </div>

                {/* Outlier alert */}
                {outlier.flag && (
                  <div
                    title={outlier.reason}
                    style={{
                      fontSize:     '13px',
                      cursor:       'help',
                      flexShrink:   0,
                      userSelect:   'none',
                    }}
                  >
                    🚨
                  </div>
                )}

                {/* Fantasy pts */}
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize:   '15px',
                  fontWeight: 800,
                  color,
                  minWidth:   '38px',
                  textAlign:  'right',
                }}>
                  {isNaN(pts) ? '—' : pts.toFixed(1)}
                </div>
              </div>
            );
          })}

          {avgPts != null && (
            <div style={{
              marginTop:  '4px',
              fontSize:   '10px',
              color:      'var(--fp-muted)',
              textAlign:  'right',
            }}>
              Season avg: {avgPts.toFixed(1)} pts · 🚨 = outlier / possible injury
            </div>
          )}
        </div>
      )}
    </div>
  );
}
