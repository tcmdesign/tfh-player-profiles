import { useState, useMemo, useEffect } from 'react';
import { usePlayerList } from '../hooks/usePlayerList';
import { useCompare } from '../context/CompareContext';
import { getInjuryDisplay } from '../utils/injuryUtils';
import { BASE } from '../api/client';

const POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE'];

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
  return <span style={{ fontSize: 10, color: 'var(--fp-cyan)' }}>{dir === 'asc' ? '↑' : '↓'}</span>;
}

function ColHeader({ label, col, sort, onSort, align = 'right', width }) {
  const active = sort.col === col;
  return (
    <th
      scope="col"
      onClick={() => onSort(col)}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSort(col); } }}
      style={{
        width, textAlign: align,
        padding: '10px 12px',
        fontSize: 11, fontWeight: 600,
        color: active ? 'var(--fp-cyan)' : 'var(--fp-muted)',
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

function WriteupIcon() {
  return (
    <span title="TFH Outlook available" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      marginLeft: 6, flexShrink: 0,
      width: 18, height: 18,
      borderRadius: 5,
      background: 'rgba(229,57,53,0.12)',
      border: '1px solid rgba(229,57,53,0.45)',
      boxShadow: '0 0 7px rgba(229,57,53,0.55)',
    }}>
      <svg width="11" height="11" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2 1.5C2 1.22386 2.22386 1 2.5 1H8.5L12 4.5V12.5C12 12.7761 11.7761 13 11.5 13H2.5C2.22386 13 2 12.7761 2 12.5V1.5Z"
          stroke="#E53935" strokeWidth="1.2" fill="none"
        />
        <path d="M8.5 1L12 4.5H8.5V1Z" stroke="#E53935" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
        <line x1="4.5" y1="7" x2="9.5" y2="7" stroke="#E53935" strokeWidth="1.1" strokeLinecap="round" />
        <line x1="4.5" y1="9" x2="9.5" y2="9" stroke="#E53935" strokeWidth="1.1" strokeLinecap="round" />
        <line x1="4.5" y1="11" x2="7.5" y2="11" stroke="#E53935" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    </span>
  );
}

const STAT_NUM = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontSize: 14, fontWeight: 400, color: 'var(--fp-text)',
};

function StatCell({ value, dash = true }) {
  return (
    <td style={{ padding: '0 12px', textAlign: 'right' }}>
      {value != null && value > 0
        ? <span style={STAT_NUM}>{value.toLocaleString()}</span>
        : <span style={{ color: 'var(--fp-muted)', fontSize: 12 }}>{dash ? '—' : ''}</span>
      }
    </td>
  );
}

function PlayerRow({ player, idx, onSelect, hasWriteup }) {
  const [hovered, setHovered] = useState(false);
  const { add, remove, isComparing } = useCompare();
  const comparing = isComparing(player.id);
  const pos = player.position;

  return (
    <tr
      onClick={onSelect}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      tabIndex={0}
      aria-label={`View ${player.name}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   hovered ? 'rgba(255,255,255,0.03)' : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
        cursor:       'pointer',
        borderBottom: '1px solid var(--fp-border)',
        transition:   'background 0.1s',
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
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 16, fontWeight: 700,
                color: hovered ? 'var(--fp-cyan)' : 'var(--fp-text)',
                transition: 'color 0.1s', whiteSpace: 'nowrap',
              }}>
                {player.name}
              </span>
              {hasWriteup && <WriteupIcon />}
            </div>
            <div style={{ fontSize: 11, color: 'var(--fp-muted)' }}>
              {player.position} · {player.team}
            </div>
          </div>
        </div>
      </td>

      {/* Overall Rank */}
      <td style={{ padding: '0 12px', textAlign: 'right' }}>
        {player.overall_rank != null
          ? <span style={{ ...STAT_NUM, color: 'var(--fp-cyan)' }}>#{player.overall_rank}</span>
          : <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: 'var(--fp-muted)', letterSpacing: '0.5px' }}>NR</span>
        }
      </td>

      {/* Avg Pts (2025) */}
      <td style={{ padding: '0 12px', textAlign: 'right' }}>
        <span style={STAT_NUM}>{player.season_avg_pts ?? '—'}</span>
      </td>

      {/* Rush Yds — RB only meaningful, show for all */}
      <StatCell value={player.total_rush_yards} />

      {/* Rec Yds */}
      <StatCell value={player.total_rec_yards} />

      {/* Pass Yds — QB only meaningful */}
      <StatCell value={player.total_pass_yards} />

      {/* TDs */}
      <StatCell value={player.total_tds} />

      {/* Compare */}
      <td style={{ padding: '0 8px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => comparing
            ? remove(player.id)
            : add({ id: player.id, name: player.name, position: player.position, team: player.team })
          }
          title={comparing ? 'Remove from comparison' : 'Add to comparison'}
          aria-label={comparing ? `Remove ${player.name} from comparison` : `Compare ${player.name}`}
          aria-pressed={comparing}
          style={{
            background:    comparing ? 'rgba(229,57,53,0.15)' : 'transparent',
            border:        `1px solid ${comparing ? 'rgba(229,57,53,0.4)' : 'var(--fp-border)'}`,
            borderRadius:  5,
            color:         comparing ? '#E53935' : 'var(--fp-muted)',
            cursor:        'pointer',
            padding:       '4px 8px',
            fontSize:      10,
            fontWeight:    700,
            fontFamily:    "'Barlow Condensed', sans-serif",
            letterSpacing: '0.3px',
            whiteSpace:    'nowrap',
            transition:    'all 0.12s',
          }}
        >
          {comparing ? '✓ Added' : '+ Compare'}
        </button>
      </td>
    </tr>
  );
}

export default function PlayerListView({ onSelectPlayer }) {
  const [position, setPosition] = useState('ALL');
  const [search,   setSearch]   = useState('');
  const [sort,     setSort]     = useState({ col: 'overall_rank', dir: 'asc' });
  const [writeupIds, setWriteupIds] = useState(new Set());

  const { players, loading } = usePlayerList(position);

  // Fetch list of player IDs that have TFH writeups
  useEffect(() => {
    fetch(`${BASE}/tfh/has-outlook`)
      .then(r => r.ok ? r.json() : [])
      .then(ids => setWriteupIds(new Set(ids)))
      .catch(() => {});
  }, []);

  function handleSort(col) {
    setSort(s => s.col === col
      ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { col, dir: col === 'overall_rank' ? 'asc' : 'desc' }
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
      const aVal = a[sort.col];
      const bVal = b[sort.col];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
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
                fontSize:      13, fontWeight: 700, letterSpacing: '0.5px',
                padding:       '6px 14px', borderRadius: 5,
                border:        `1px solid ${position === pos ? 'rgba(229,57,53,0.4)' : 'var(--fp-border)'}`,
                background:    position === pos ? 'rgba(229,57,53,0.12)' : 'transparent',
                color:         position === pos ? '#E53935' : 'var(--fp-muted)',
                cursor:        'pointer', transition: 'all 0.12s',
              }}
            >
              {pos}
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Filter players by name or team"
          placeholder="Filter by name or team…"
          style={{
            flex: 1, minWidth: 160,
            background: 'var(--fp-navy2)', border: '1px solid var(--fp-border)',
            borderRadius: 6, padding: '7px 12px',
            fontSize: 13, color: 'var(--fp-text)', outline: 'none', fontFamily: 'inherit',
          }}
        />

        <span style={{ fontSize: 12, color: 'var(--fp-muted)', whiteSpace: 'nowrap' }}>
          {loading ? 'Loading…' : `${filtered.length} players`}
        </span>
      </div>

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
                position: 'sticky', left: 0, zIndex: 2, background: 'var(--fp-navy2)',
              }}>
                Player
              </th>
              <ColHeader label="OVR"       col="overall_rank"    sort={sort} onSort={handleSort} width={70}  />
              <ColHeader label="Avg Pts '25" col="season_avg_pts"  sort={sort} onSort={handleSort} width={90}  />
              <ColHeader label="Rush Yds"  col="total_rush_yards" sort={sort} onSort={handleSort} width={85} />
              <ColHeader label="Rec Yds"   col="total_rec_yards"  sort={sort} onSort={handleSort} width={85} />
              <ColHeader label="Pass Yds"  col="total_pass_yards" sort={sort} onSort={handleSort} width={85} />
              <ColHeader label="TDs"       col="total_tds"        sort={sort} onSort={handleSort} width={60} />
              <th scope="col" style={{ width: 100, borderBottom: '1px solid var(--fp-border)' }} />
            </tr>
          </thead>
          <tbody>
            {loading && (
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  {[...Array(8)].map((_, j) => (
                    <td key={j} style={{ padding: '10px 12px' }}>
                      <div style={{
                        height: 16, borderRadius: 4, background: 'var(--fp-navy3)',
                        opacity: 0.4 - i * 0.04, width: j === 0 ? '80%' : '60%',
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
                hasWriteup={writeupIds.has(player.id)}
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
