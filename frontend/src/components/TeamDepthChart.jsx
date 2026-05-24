import { useNavigate } from 'react-router-dom';

const POS_ORDER  = ['QB', 'RB', 'WR', 'TE'];
const POS_LABELS = { QB: 'Quarterback', RB: 'Running Back', WR: 'Wide Receiver', TE: 'Tight End' };

function designation(posRank, teamRank) {
  if (posRank) {
    if (posRank <= 12) return { label: 'START',  color: 'var(--fp-green)' };
    if (posRank <= 24) return { label: 'FRINGE', color: 'var(--fp-cyan)'  };
    return                    { label: 'SIT',    color: 'var(--fp-pink)'  };
  }
  const r = parseInt(teamRank);
  if (r === 1) return { label: 'START',  color: 'var(--fp-green)' };
  if (r === 2) return { label: 'FRINGE', color: 'var(--fp-cyan)'  };
  return               { label: 'SIT',   color: 'var(--fp-pink)'  };
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function PlayerRow({ player, isSelf, onClick }) {
  const teamRank = parseInt(player.team_rank) || 4;
  const posRank  = player.position_rank;
  const { label, color } = designation(posRank, teamRank);

  const barPct = posRank
    ? Math.max(4, Math.round((1 - (posRank - 1) / 24) * 100))
    : Math.max(4, Math.round((1 - (teamRank - 1) / 4) * 100));

  const avgPts = player.avg_pts ? parseFloat(player.avg_pts).toFixed(1) : null;
  const initials = getInitials(player.name);

  return (
    <div
      onClick={onClick}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '12px',
        padding:      '10px 12px',
        borderRadius: '10px',
        background:   isSelf ? 'rgba(41,201,240,0.08)' : 'transparent',
        border:       isSelf ? '1px solid rgba(41,201,240,0.2)' : '1px solid transparent',
        cursor:       'pointer',
        transition:   'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        if (!isSelf) e.currentTarget.style.background = 'var(--fp-navy3)';
      }}
      onMouseLeave={e => {
        if (!isSelf) e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Avatar */}
      <div style={{
        width:        '40px',
        height:       '40px',
        borderRadius: '50%',
        background:   'var(--fp-navy3)',
        border:       `2px solid ${isSelf ? 'var(--fp-cyan)' : color}`,
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        flexShrink:   0,
        overflow:     'hidden',
        fontFamily:   "'Barlow Condensed', sans-serif",
        fontSize:     '13px',
        fontWeight:   800,
        color:        'var(--fp-muted)',
      }}>
        {player.headshot_url ? (
          <img
            src={player.headshot_url}
            alt={player.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            onError={e => {
              e.target.style.display = 'none';
              e.target.parentNode.textContent = initials;
            }}
          />
        ) : initials}
      </div>

      {/* Name + bar */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
          <span style={{
            fontFamily:   "'Barlow Condensed', sans-serif",
            fontSize:     '16px',
            fontWeight:   isSelf ? 800 : 600,
            color:        isSelf ? 'var(--fp-text)' : 'var(--fp-muted)',
            whiteSpace:   'nowrap',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
          }}>
            {player.name}
          </span>
        </div>
        <div style={{
          width: '100%', height: '4px',
          background: 'var(--fp-navy3)', borderRadius: '2px', overflow: 'hidden',
        }}>
          <div style={{
            width: `${barPct}%`, height: '100%',
            background: color, borderRadius: '2px',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Avg pts */}
      {avgPts && (
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize:   '13px',
          fontWeight: 700,
          color:      'var(--fp-steel)',
          flexShrink: 0,
        }}>
          {avgPts} pts
        </div>
      )}

      {/* Designation */}
      <div style={{
        fontFamily:    "'Barlow Condensed', sans-serif",
        fontSize:      '12px',
        fontWeight:    800,
        color,
        letterSpacing: '0.5px',
        minWidth:      '46px',
        textAlign:     'right',
        flexShrink:    0,
      }}>
        {posRank ? `#${posRank}` : label}
      </div>
    </div>
  );
}

export default function TeamDepthChart({ teammates = [], selfId, team, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="fp-card">
        <div className="fp-card-title">Depth Chart — {team || '…'}</div>
        <div style={{ color: 'var(--fp-muted)', fontSize: '12px' }}>Loading…</div>
      </div>
    );
  }

  if (!teammates.length) {
    return (
      <div className="fp-card">
        <div className="fp-card-title">Depth Chart</div>
        <div style={{ color: 'var(--fp-muted)', fontSize: '12px' }}>No depth data available.</div>
      </div>
    );
  }

  const groups = POS_ORDER.reduce((acc, pos) => {
    const players = teammates.filter(t => t.position === pos);
    if (players.length) acc.push({ pos, players });
    return acc;
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {groups.map(({ pos, players }) => (
        <div key={pos} className="fp-card">
          <div className="fp-card-title">{POS_LABELS[pos] || pos}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {players.map(player => (
              <PlayerRow
                key={player.id}
                player={player}
                isSelf={player.id === selfId}
                onClick={() => navigate(`/app/player/${player.id}`)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
