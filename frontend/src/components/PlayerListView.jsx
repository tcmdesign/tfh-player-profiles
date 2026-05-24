import { useState, useMemo, useRef, useCallback } from 'react';
import { usePlayerList } from '../hooks/usePlayerList';
import { useCompare } from '../context/CompareContext';
import { getInjuryDisplay } from '../utils/injuryUtils';
import SparklineTrend from './SparklineTrend';
import { get } from '../api/client';

// Module-level cache so sparkline data persists across re-renders
const sparklineCache = new Map();

const POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE'];

const DESIGNATION_COLOR = {
  START:  'var(--fp-green)',
  FRINGE: '#E0613A',
  SIT:    'var(--fp-pink)',
};

const DESIGNATION_BG = {
  START:  'rgba(34,197,94,0.12)',
  FRINGE: 'rgba(224,97,58,0.12)',
  SIT:    'rgba(239,68,68,0.12)',
};

function ordinal(n) {
  if (!n) return '?';
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function matchupColor(rank) {
  if (!rank) return 'var(--fp-muted)';
  if (rank <= 8)  return '#4ADE80';
  if (rank <= 20) return '#F59E0B';
  return '#EF4444';
}

function getInitials(name) {
  if (!name) return '?';
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0][0] : p[0][0] + p[p.length - 1][0];
}

function Avatar({ player, size = 36 }) {
  const [err, setErr] = useState(false);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--fp-navy3)',
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: size * 0.38, fontWeight: 700,
      color: 'var(--fp-steel)',
    }}>
      {player.headshot_url && !err
        ? <img src={player.headshot_url} alt={player.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setErr(true)} />
        : getInitials(player.name).toUpperCase()
      }
    </div>
  );
}

function SortIcon({ dir }) {
  if (!dir) return <span style={{ opacity: 0.25, fontSize: 10 }}>↕</span>;
  return <span style={{ fontSize: 10, color: '#E0613A' }}>{dir === 'asc' ? '↑' : '↓'}</span>;
}

function ColHeader({ label, col, sort, onSort, align = 'right', width }) {
  const active = sort.col === col;
  return (
    <th
      scope="col"
      onClick={() => onSort(col)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSort(col); } }}
      tabIndex={0}
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      style={{
        width, textAlign: align,
        padding: '10px 12px',
        fontSize: 11, fontWeight: 600,
        color: active ? '#E0613A' : 'var(--fp-muted)',
        letterSpacing: '0.6px', textTransform: 'uppercase',
        cursor: 'pointer', userSelect: 'none',
        whiteSpace: 'nowrap',
        borderBottom: '1px solid var(--fp-border)',
      }}
    >
      {label} <SortIcon dir={active ? sort.dir : null} />
    </th>
  );
}

function InjuryBadge({ status, injuryStatus }) {
  const inj = getInjuryDisplay(status, injuryStatus);
  if (!inj) return null;
  return (
    <span title={injuryStatus || status} style={{
      display:      'inline-flex',
      alignItems:   'center',
      justifyContent: 'center',
      fontFamily:   "'Outfit', sans-serif",
      fontSize:     10,
      fontWeight:   700,
      lineHeight:   1,
      padding:      '2px 5px',
      borderRadius: 3,
      background:   inj.bg,
      color:        inj.color,
      border:       `1px solid ${inj.color}60`,
      marginLeft:   4,
      flexShrink:   0,
      letterSpacing: 0,
    }}>
      {inj.badge}
    </span>
  );
}

const STAT_NUM = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 14, fontWeight: 400, color: 'var(--fp-text)',
};

function KeyStat({ player }) {
  const pos = player.position;
  const [val, label] = pos === 'QB' ? [player.avg_pass_yards, 'pass yds']
                     : pos === 'RB' ? [player.avg_carries,    'carries']
                     :                [player.avg_targets,    'targets'];
  return (
    <td style={{ padding: '0 12px', textAlign: 'right' }}>
      <span style={STAT_NUM}>{val ?? '—'}</span>
      <div style={{ fontSize: 10, color: 'var(--fp-muted)' }}>{label}</div>
    </td>
  );
}

export default function PlayerListView({ onSelectPlayer }) {
  const [position, setPosition] = useState('ALL');
  const [search,   setSearch]   = useState('');
  const [sort,     setSort]     = useState({ col: 'position_rank', dir: 'asc' });

  // Sparkline hover state — { playerId, position, data, rect }
  const [sparkline,   setSparkline]   = useState(null);
  const hideTimerRef                  = useRef(null);

  const handleSparklineShow = useCallback(async (player, iconRect) => {
    clearTimeout(hideTimerRef.current);
    const { id, position: pos } = player;

    // Anchor popup to the left of the icon button, vertically centered on it
    const popupW = 300;
    const popupH = 220;
    const left = iconRect.left - popupW - 8;
    const top  = Math.max(8, Math.min(
      window.innerHeight - popupH - 8,
      iconRect.top + iconRect.height / 2 - popupH / 2,
    ));

    // Show immediately with cached data (or loading state)
    setSparkline({ playerId: id, position: pos, data: sparklineCache.get(id) ?? null, left, top });

    if (!sparklineCache.has(id)) {
      try {
        const weeks = await get(`/players/${id}/sparkline`);
        sparklineCache.set(id, weeks);
        setSparkline(prev => prev?.playerId === id ? { ...prev, data: weeks } : prev);
      } catch (_) {
        sparklineCache.set(id, []);
      }
    }
  }, []);

  const handleSparklineHide = useCallback(() => {
    hideTimerRef.current = setTimeout(() => setSparkline(null), 120);
  }, []);

  const { players, loading } = usePlayerList(position);

  function handleSort(col) {
    setSort(s => s.col === col
      ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { col, dir: col === 'position_rank' ? 'asc' : 'desc' }  // all others default desc
    );
  }

  const filtered = useMemo(() => {
    let list = players;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.team?.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const aVal = a[sort.col] ?? (sort.dir === 'asc' ? Infinity : -Infinity);
      const bVal = b[sort.col] ?? (sort.dir === 'asc' ? Infinity : -Infinity);
      return sort.dir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [players, search, sort]);

  return (
    <div>
      {/* Position filter + search */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {POSITIONS.map(pos => (
            <button
              key={pos}
              onClick={() => setPosition(pos)}
              style={{
                fontFamily:    "'Barlow Condensed', sans-serif",
                fontSize:      13, fontWeight: 700,
                letterSpacing: '0.5px',
                padding:       '6px 14px',
                borderRadius:  5,
                border:        `1px solid ${position === pos ? 'rgba(224,97,58,0.4)' : 'var(--fp-border)'}`,
                background:    position === pos ? 'rgba(224,97,58,0.12)' : 'transparent',
                color:         position === pos ? '#E0613A' : 'var(--fp-muted)',
                cursor:        'pointer',
                transition:    'all 0.12s',
              }}
            >
              {pos}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Filter players by name or team"
          placeholder="Filter by name or team…"
          style={{
            flex: 1, minWidth: 160,
            background: 'var(--fp-navy2)',
            border: '1px solid var(--fp-border)',
            borderRadius: 6, padding: '7px 12px',
            fontSize: 13, color: 'var(--fp-text)',
            outline: 'none', fontFamily: 'inherit',
          }}
        />

        <span style={{ fontSize: 12, color: 'var(--fp-muted)', whiteSpace: 'nowrap' }}>
          {loading ? 'Loading…' : `${filtered.length} players`}
        </span>
      </div>

      {/* Sparkline popup */}
      {sparkline && (
        <div
          onMouseEnter={() => clearTimeout(hideTimerRef.current)}
          onMouseLeave={handleSparklineHide}
          style={{
            position:     'fixed',
            left:         sparkline.left,
            top:          sparkline.top,
            zIndex:       1000,
            width:        300,
            background:   'var(--fp-navy2)',
            border:       '1px solid var(--fp-border)',
            borderRadius: 10,
            padding:      '14px 16px',
            boxShadow:    '0 12px 40px rgba(0,0,0,0.6)',
            pointerEvents: 'all',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11, fontWeight: 700, letterSpacing: '0.8px',
              color: 'var(--fp-muted)', textTransform: 'uppercase',
            }}>
              Season Trend
            </div>
            <div style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 11, color: 'var(--fp-muted)',
            }}>
              <span style={{ borderBottom: '1px dashed #7A8699', paddingBottom: 1 }}>
                {({ QB: 18, RB: 10, WR: 10, TE: 8, K: 6 })[sparkline.position] ?? 10} pts
              </span>
              {' '}= start threshold
            </div>
          </div>
          {sparkline.data === null ? (
            <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--fp-muted)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
            </div>
          ) : (
            <SparklineTrend weeks={sparkline.data} position={sparkline.position} width={268} height={120} />
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10, color: 'var(--fp-muted)', fontFamily: "'Outfit', sans-serif" }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
              Start week
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
              Below threshold
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid #7A8699', display: 'inline-block' }} />
              DNP
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ background: 'var(--fp-navy2)' }}>
              <th scope="col" style={{
                textAlign: 'left', padding: '10px 12px',
                fontSize: 11, fontWeight: 600, color: 'var(--fp-muted)',
                letterSpacing: '0.6px', textTransform: 'uppercase',
                borderBottom: '1px solid var(--fp-border)',
                position: 'sticky', left: 0, zIndex: 2,
                background: 'var(--fp-navy2)',
              }}>
                Player
              </th>
              <ColHeader label="Rank"     col="position_rank" sort={sort} onSort={handleSort} width={60}  />
              <ColHeader label="Avg Pts"  col="avg_pts"       sort={sort} onSort={handleSort} width={80}  />
              <ColHeader label="Key Stat" col={position === 'QB' ? 'avg_pass_yards' : position === 'RB' ? 'avg_carries' : 'avg_targets'} sort={sort} onSort={handleSort} width={80} />
              <ColHeader label="Floor"    col="floor_pts"     sort={sort} onSort={handleSort} width={70}  />
              <ColHeader label="Ceiling"  col="ceiling_pts"   sort={sort} onSort={handleSort} width={70}  />
              <ColHeader label="Matchup"  col="matchup_rank"  sort={sort} onSort={handleSort} width={100} align="center" />
              <ColHeader label="Score"    col="confidence"    sort={sort} onSort={handleSort} width={100} align="center" />
              <th scope="col" aria-label="Actions" style={{ width: 110, borderBottom: '1px solid var(--fp-border)' }} />
            </tr>
          </thead>
          <tbody>
            {loading && (
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  {[...Array(8)].map((_, j) => (
                    <td key={j} style={{ padding: '10px 12px' }}>
                      <div style={{
                        height: 16, borderRadius: 4,
                        background: 'var(--fp-navy3)',
                        opacity: 0.4 - i * 0.04,
                        width: j === 0 ? '80%' : '60%',
                      }} />
                    </td>
                  ))}
                </tr>
              ))
            )}

            {!loading && filtered.map((player, idx) => (
              <PlayerRow
                key={player.id}
                player={player}
                idx={idx}
                onSelect={() => onSelectPlayer(player.id)}
                onSparklineShow={handleSparklineShow}
                onSparklineHide={handleSparklineHide}
              />
            ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--fp-muted)', fontSize: 13 }}>
                  No players found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Tiny trend icon SVG
function TrendIcon() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" style={{ display: 'block' }}>
      <polyline points="1,8 4,5 7,6 10,2 13,3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function PlayerRow({ player, idx, onSelect, onSparklineShow, onSparklineHide }) {
  const [hovered, setHovered] = useState(false);
  const iconRef = useRef(null);
  const { add, remove, isComparing } = useCompare();
  const comparing = isComparing(player.id);
  const desColor = DESIGNATION_COLOR[player.designation] || 'var(--fp-muted)';
  const desBg    = DESIGNATION_BG[player.designation]    || 'transparent';
  const mColor   = matchupColor(player.matchup_rank);

  return (
    <tr
      onClick={onSelect}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      tabIndex={0}
      aria-label={`View ${player.name}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:  hovered ? 'rgba(255,255,255,0.03)' : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
        cursor:      'pointer',
        borderBottom: '1px solid var(--fp-border)',
        transition:  'background 0.1s',
      }}
    >
      {/* Player */}
      <td style={{
        padding: '8px 12px',
        position: 'sticky', left: 0, zIndex: 1,
        background: hovered ? '#131316' : idx % 2 === 0 ? 'var(--fp-navy)' : '#0e0e10',
        transition: 'background 0.1s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar player={player} size={36} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 16, fontWeight: 700,
                color: hovered ? '#E0613A' : 'var(--fp-text)',
                transition: 'color 0.1s',
                whiteSpace: 'nowrap',
              }}>
                {player.name}
              </span>
              <InjuryBadge status={player.status} injuryStatus={player.injury_status} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--fp-muted)' }}>
              {player.position} · {player.team}
            </div>
          </div>
        </div>
      </td>

      {/* Rank */}
      <td style={{ padding: '0 12px', textAlign: 'right' }}>
        {player.position_rank
          ? <span style={{ ...STAT_NUM, color: '#E0613A' }}>#{player.position_rank}</span>
          : <span style={{ color: 'var(--fp-muted)', fontSize: 12 }}>—</span>
        }
      </td>

      {/* Avg Pts */}
      <td style={{ padding: '0 12px', textAlign: 'right' }}>
        <span style={STAT_NUM}>{player.avg_pts ?? '—'}</span>
        {player.games_played && (
          <div style={{ fontSize: 10, color: 'var(--fp-muted)' }}>L{player.games_played}</div>
        )}
      </td>

      {/* Key stat */}
      <KeyStat player={player} />

      {/* Floor */}
      <td style={{ padding: '0 12px', textAlign: 'right' }}>
        <span style={{ ...STAT_NUM, color: 'var(--fp-pink)' }}>{player.floor_pts ?? '—'}</span>
      </td>

      {/* Ceiling */}
      <td style={{ padding: '0 12px', textAlign: 'right' }}>
        <span style={{ ...STAT_NUM, color: 'var(--fp-green)' }}>{player.ceiling_pts ?? '—'}</span>
      </td>

      {/* Matchup */}
      <td style={{ padding: '0 12px', textAlign: 'center' }}>
        {player.opponent ? (
          <>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 400, color: 'var(--fp-text)' }}>
              vs {player.opponent}
            </span>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 400, color: mColor }}>
              {ordinal(player.matchup_rank)}
            </div>
          </>
        ) : <span style={{ color: 'var(--fp-muted)', fontSize: 12 }}>—</span>}
      </td>

      {/* Score */}
      <td style={{ padding: '0 12px', textAlign: 'center' }}>
        {player.blocked ? (
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 18, fontWeight: 800, color: '#EF4444', lineHeight: 1,
            }}>
              {player.injury_level === 'ir' ? 'IR' : 'OUT'}
            </span>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '1px',
              color: '#EF4444', background: 'rgba(239,68,68,0.12)',
              padding: '2px 6px', borderRadius: 3,
              border: '1px solid rgba(239,68,68,0.35)',
            }}>
              RULED OUT
            </span>
          </div>
        ) : (
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 20, fontWeight: 800, color: desColor, lineHeight: 1,
            }}>
              {player.confidence != null ? `${player.confidence}%` : '—'}
            </span>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '1px',
              color: desColor, background: desBg,
              padding: '2px 6px', borderRadius: 3,
              border: `1px solid ${desColor}40`,
            }}>
              {player.designation}
            </span>
          </div>
        )}
      </td>

      {/* Actions: trend icon + compare button */}
      <td style={{ padding: '0 8px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          {/* Trend sparkline icon */}
          <button
            ref={iconRef}
            onMouseEnter={() => {
              if (iconRef.current) onSparklineShow(player, iconRef.current.getBoundingClientRect());
            }}
            onMouseLeave={onSparklineHide}
            onFocus={() => {
              if (iconRef.current) onSparklineShow(player, iconRef.current.getBoundingClientRect());
            }}
            onBlur={onSparklineHide}
            title="Season trend"
            aria-label={`View season trend for ${player.name}`}
            onClick={e => {
              e.stopPropagation();
              if (iconRef.current) onSparklineShow(player, iconRef.current.getBoundingClientRect());
            }}
            style={{
              background: 'transparent',
              border: '1px solid var(--fp-border)',
              borderRadius: 5,
              color: 'var(--fp-muted)',
              cursor: 'pointer',
              padding: '4px 6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 44, minHeight: 44,
              transition: 'all 0.12s',
            }}
            onMouseOver={e => { e.currentTarget.style.color = '#E0613A'; e.currentTarget.style.borderColor = 'rgba(224,97,58,0.4)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'var(--fp-muted)'; e.currentTarget.style.borderColor = 'var(--fp-border)'; }}
          >
            <TrendIcon />
          </button>

          {/* Compare */}
          <button
            onClick={() => comparing
              ? remove(player.id)
              : add({ id: player.id, name: player.name, position: player.position, team: player.team })
            }
            title={comparing ? 'Remove from comparison' : 'Add to comparison'}
            aria-label={comparing ? `Remove ${player.name} from comparison` : `Compare ${player.name}`}
            aria-pressed={comparing}
            style={{
              background:   comparing ? 'rgba(224,97,58,0.15)' : 'transparent',
              border:       `1px solid ${comparing ? 'rgba(224,97,58,0.4)' : 'var(--fp-border)'}`,
              borderRadius: 5,
              color:        comparing ? '#E0613A' : 'var(--fp-muted)',
              cursor:       'pointer',
              padding:      '4px 8px',
              fontSize:     10,
              fontWeight:   700,
              fontFamily:   "'Barlow Condensed', sans-serif",
              letterSpacing: '0.3px',
              whiteSpace:   'nowrap',
              transition:   'all 0.12s',
            }}
          >
            {comparing ? '✓ Added' : '+ Compare'}
          </button>
        </div>
      </td>
    </tr>
  );
}
