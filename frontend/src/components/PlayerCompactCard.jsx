/**
 * PlayerCompactCard — shared player card used on Compare and Trade Analyzer pages.
 *
 * Props:
 *   player       { name, position, team, headshot_url, status, position_rank }
 *   stats        { avg_pts, floor_pts, ceiling_pts, avg_targets, avg_carries, consistency }
 *   matchup      { team, rank } | null
 *   score        number — the large primary number (confidence % or trade value)
 *   scoreSuffix  string — appended to score, e.g. '%' or ''
 *   scoreBadge   string — badge label: 'START' | 'FRINGE' | 'SIT' | 'TRADE VALUE' | etc.
 *   accentColor  string — overrides the derived color (for post-analysis animation)
 *   headerLabel  string — small label above the avatar row, e.g. 'YOU GIVE'
 *   headerLabelColor  string — color for headerLabel
 *   extra        ReactNode — optional section rendered below matchup (e.g. breakdown chips)
 *   onRemove     function — renders × button when provided
 *   style        object — merged into outer container
 */

const DESIGNATION_COLOR = {
  START:  '#22C55E',
  FRINGE: '#E0613A',
  SIT:    '#EF4444',
};

function ordinal(n) {
  if (!n) return '—';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getInitials(name = '') {
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0][0] : p[0][0] + p[p.length - 1][0];
}

function StatBar({ label, value, max, color, format }) {
  const pct = max > 0 ? Math.min(100, ((value ?? 0) / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: 'var(--fp-muted)', fontFamily: "'Outfit', sans-serif" }}>
          {label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", color: 'var(--fp-text)' }}>
          {value != null ? (format ? format(value) : value) : '—'}
        </span>
      </div>
      <div style={{ height: 4, background: 'var(--fp-navy3)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}

export default function PlayerCompactCard({
  player,
  stats,
  matchup,
  score,
  scoreSuffix = '',
  scoreBadge,
  accentColor,
  headerLabel,
  headerLabelColor,
  extra,
  onRemove,
  style,
}) {
  // Accent color: explicit override → designation color → score-based fallback
  const color = accentColor
    || DESIGNATION_COLOR[scoreBadge]
    || (score >= 70 ? '#22C55E' : score >= 45 ? '#E0613A' : 'var(--fp-muted)');

  // Border uses accentColor (post-analysis) or a faint tint of the derived color
  const borderColor = accentColor ? `${accentColor}60` : `${color}30`;

  return (
    <div style={{
      background:    'var(--fp-navy2)',
      borderRadius:  10,
      border:        `1px solid ${borderColor}`,
      display:       'flex',
      flexDirection: 'column',
      overflow:      'hidden',
      transition:    'border-color 0.5s ease',
      ...style,
    }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{
        background:   `${color}0D`,
        borderBottom: `1px solid ${color}25`,
        padding:      '14px 16px',
      }}>

        {/* Optional label row (e.g. "YOU GIVE") + remove button */}
        {(headerLabel || onRemove) && (
          <div style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            marginBottom:   10,
          }}>
            {headerLabel ? (
              <span style={{
                fontFamily:    "'Barlow Condensed', sans-serif",
                fontSize:      10, fontWeight: 800, letterSpacing: '0.12em',
                color:         headerLabelColor || 'var(--fp-muted)',
                textTransform: 'uppercase',
              }}>
                {headerLabel}
              </span>
            ) : <span />}

            {onRemove && (
              <button
                onClick={onRemove}
                title="Remove"
                aria-label={`Remove ${player?.name}`}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--fp-muted)', fontSize: 18, lineHeight: 1, padding: 0,
                }}
              >×</button>
            )}
          </div>
        )}

        {/* Avatar + name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
            background: 'var(--fp-navy3)', border: `2px solid ${color}50`,
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color,
          }}>
            {player?.headshot_url
              ? <img
                  src={player.headshot_url}
                  alt={player?.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              : getInitials(player?.name || '').toUpperCase()
            }
          </div>
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 18, fontWeight: 800, color: 'var(--fp-text)', lineHeight: 1,
            }}>
              {player?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--fp-muted)', marginTop: 2, fontFamily: "'Outfit', sans-serif" }}>
              {player?.position} · {player?.team || 'FA'}
              {player?.position_rank ? ` · #${player.position}${player.position_rank}` : ''}
            </div>
          </div>
        </div>

        {/* Primary metric: large number + badge */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 36, fontWeight: 800, color, lineHeight: 1,
          }}>
            {score}{scoreSuffix}
          </span>
          {scoreBadge && (
            <span style={{
              fontFamily:  "'Barlow Condensed', sans-serif",
              fontSize:    13, fontWeight: 800, letterSpacing: '1.5px',
              color,
              background:  `${color}18`,
              padding:     '3px 8px', borderRadius: 4,
              border:      `1px solid ${color}40`,
            }}>
              {scoreBadge}
            </span>
          )}
        </div>

        {/* Injury warning */}
        {player?.status && player.status !== 'Active' && (
          <div style={{ marginTop: 6, fontSize: 11, color: '#EF4444', fontWeight: 600 }}>
            ⚠ {player.status}
          </div>
        )}
      </div>

      {/* ── Stats body ──────────────────────────────────────────── */}
      <div style={{ padding: '14px 16px 18px' }}>
        <div style={{
          fontSize: 10, fontWeight: 600, color: 'var(--fp-muted)',
          letterSpacing: '0.8px', textTransform: 'uppercase',
          marginBottom: 10, fontFamily: "'Barlow Condensed', sans-serif",
        }}>
          Recent Performance
        </div>

        <StatBar label="Avg Fantasy Pts" value={stats?.avg_pts}     max={40}  color={color}    format={v => v.toFixed(1)} />
        <StatBar label="Floor"           value={stats?.floor_pts}   max={40}  color="#EF4444"  format={v => v.toFixed(1)} />
        <StatBar label="Ceiling"         value={stats?.ceiling_pts} max={50}  color="#22C55E"  format={v => v.toFixed(1)} />

        {(player?.position === 'WR' || player?.position === 'TE') && (
          <StatBar label="Avg Targets" value={stats?.avg_targets} max={15} color="#29C9F0" format={v => v.toFixed(1)} />
        )}
        {player?.position === 'RB' && (
          <StatBar label="Avg Carries" value={stats?.avg_carries} max={25} color="#29C9F0" format={v => v.toFixed(1)} />
        )}

        <StatBar label="Consistency" value={stats?.consistency} max={100} color="#A78BFA" format={v => `${v}%`} />

        {/* Matchup */}
        {matchup?.team && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--fp-border)' }}>
            <div style={{
              fontSize: 10, fontWeight: 600, color: 'var(--fp-muted)',
              letterSpacing: '0.8px', textTransform: 'uppercase',
              marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif",
            }}>
              Matchup
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--fp-text)', fontWeight: 600, fontFamily: "'Barlow Condensed', sans-serif" }}>
                vs {matchup.team}
              </span>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 14, fontWeight: 800,
                color: matchup.rank <= 8 ? '#4ADE80' : matchup.rank <= 20 ? '#F59E0B' : '#EF4444',
              }}>
                {matchup.rank ? `${ordinal(matchup.rank)} easiest` : '—'}
              </span>
            </div>
          </div>
        )}

        {/* Extra slot — e.g. trade value breakdown chips */}
        {extra}
      </div>
    </div>
  );
}
