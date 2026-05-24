const POS_ORDER = ['QB', 'RB', 'WR', 'TE'];

function designation(posRank, teamRank) {
  if (posRank) {
    if (posRank <= 12) return { label: 'START',  color: 'var(--fp-green)' };
    if (posRank <= 24) return { label: 'FRINGE', color: 'var(--fp-cyan)'  };
    return                    { label: 'SIT',    color: 'var(--fp-pink)'  };
  }
  const r = parseInt(teamRank);
  if (r === 1) return { label: 'START',  color: 'var(--fp-green)' };
  if (r === 2) return { label: 'FRINGE', color: 'var(--fp-cyan)'  };
  return               { label: 'SIT',    color: 'var(--fp-pink)'  };
}

function shortName(fullName) {
  if (!fullName) return '?';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
}

function PlayerRow({ player, isSelf }) {
  const teamRank = parseInt(player.team_rank) || 4;
  const posRank  = player.position_rank;
  const { label, color } = designation(posRank, teamRank);

  const barPct = posRank
    ? Math.max(5, Math.round((1 - (posRank - 1) / 24) * 100))
    : Math.max(5, Math.round((1 - (teamRank - 1) / 4) * 100));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      {/* Name */}
      <div style={{
        fontFamily:   "'Barlow Condensed', sans-serif",
        fontSize:     '10px',
        fontWeight:   isSelf ? 800 : 500,
        color:        isSelf ? 'var(--fp-text)' : 'var(--fp-muted)',
        minWidth:     '64px',
        whiteSpace:   'nowrap',
        overflow:     'hidden',
        textOverflow: 'ellipsis',
      }}>
        {shortName(player.name)}
      </div>

      {/* Bar + label */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
        <div style={{
          width: '100%', height: '3px',
          background: 'var(--fp-navy3)', borderRadius: '2px', overflow: 'hidden',
        }}>
          <div style={{
            width: `${barPct}%`, height: '100%',
            background: color, borderRadius: '2px',
            transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '7px', fontWeight: 700,
          color, letterSpacing: '0.4px',
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export default function MiniDepthChart({ teammates = [], selfId }) {
  if (!teammates.length) return null;

  // Group by position, cap at 2 per group
  const groups = POS_ORDER.reduce((acc, pos) => {
    const players = teammates
      .filter(t => t.position === pos)
      .slice(0, 2);
    if (players.length) acc.push({ pos, players });
    return acc;
  }, []);

  if (!groups.length) return null;

  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      justifyContent: 'center',
      gap:            '7px',
      padding:        '0 10px',
      borderLeft:     '1px solid var(--fp-border)',
      borderRight:    '1px solid var(--fp-border)',
      minWidth:       '120px',
    }}>
      {groups.map(({ pos, players }) => (
        <div key={pos}>
          {/* Position label */}
          <div style={{
            fontFamily:    "'Barlow Condensed', sans-serif",
            fontSize:      '8px',
            fontWeight:    700,
            color:         'var(--fp-steel)',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            marginBottom:  '3px',
          }}>
            {pos}
          </div>

          {/* Players in this position */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {players.map(player => (
              <PlayerRow
                key={player.id}
                player={player}
                isSelf={player.id === selfId}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
