import { useAdpHistory } from '../hooks/useAdpHistory';

function ordinal(n) {
  if (n == null) return '—';
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function pickLabel(adp) {
  if (adp == null) return '—';
  const round = Math.ceil(adp / 12);
  const pick  = Math.round(((adp - 1) % 12) + 1);
  return `${round}.${String(pick).padStart(2, '0')}`;
}

function DeltaBadge({ draft, finish }) {
  if (draft == null || finish == null) return null;
  const diff = draft - finish;
  if (Math.abs(diff) < 1) return null;

  const over     = diff > 0;
  const color    = over ? '#22C55E' : '#EF4444';
  const arrow    = over ? '▲' : '▼';
  const label    = over ? `+${diff} positions` : `${diff} positions`;

  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:          3,
      fontSize:     10,
      fontFamily:   "'Barlow Condensed', sans-serif",
      fontWeight:   700,
      color,
      background:   `${color}18`,
      border:       `1px solid ${color}40`,
      borderRadius: 4,
      padding:      '1px 6px',
      marginLeft:   6,
    }}>
      {arrow} {Math.abs(diff)}
    </span>
  );
}

function SeasonCard({ s, position }) {
  const hasADP    = s.adp != null;
  const hasFinish = s.pos_rank_finish != null;

  return (
    <div style={{
      background:   'var(--fp-navy)',
      border:       '1px solid var(--fp-border)',
      borderRadius: 8,
      padding:      '14px 16px',
      flex:         '1 1 0',
      minWidth:     160,
    }}>
      {/* Season header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize:   22,
          fontWeight: 700,
          color:      'var(--fp-text)',
        }}>
          {s.season}
        </span>
        {s.is_rookie && (
          <span style={{
            fontSize:     9,
            fontWeight:   700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color:        'var(--fp-cyan)',
            background:   'rgba(224,97,58,0.12)',
            border:       '1px solid rgba(224,97,58,0.3)',
            borderRadius: 4,
            padding:      '2px 6px',
          }}>
            Rookie Year
          </span>
        )}
      </div>

      {/* ADP row */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: 'var(--fp-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
          Preseason Draft
        </div>
        {hasADP ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize:   28,
              fontWeight: 700,
              color:      'var(--fp-text)',
              lineHeight: 1,
            }}>
              {position}{s.pos_rank_draft}
            </span>
            <span style={{ fontSize: 12, color: 'var(--fp-steel)' }}>
              Pick {pickLabel(s.adp)}
            </span>
          </div>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--fp-muted)' }}>Not ranked</span>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--fp-border)', margin: '10px 0' }} />

      {/* Season finish row */}
      <div>
        <div style={{ fontSize: 10, color: 'var(--fp-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
          Season Finish
        </div>
        {hasFinish ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize:   28,
              fontWeight: 700,
              color:      finishColor(s.pos_rank_finish, position),
              lineHeight: 1,
            }}>
              {position}{s.pos_rank_finish}
            </span>
            <DeltaBadge draft={s.pos_rank_draft} finish={s.pos_rank_finish} />
          </div>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--fp-muted)' }}>No season data</span>
        )}
        {s.season_avg_pts != null && (
          <div style={{ fontSize: 11, color: 'var(--fp-steel)', marginTop: 3 }}>
            {s.season_avg_pts} pts/game avg
          </div>
        )}
      </div>
    </div>
  );
}

/** Color-code position finish based on tier */
function finishColor(rank, pos) {
  const thresholds = { QB: [12, 20], RB: [24, 36], WR: [30, 48], TE: [12, 18] };
  const [starter, flex] = thresholds[pos] || [12, 20];
  if (rank <= starter)      return '#22C55E';
  if (rank <= flex)         return 'var(--fp-cyan)';
  return 'var(--fp-steel)';
}

export default function DraftHistoryPanel({ playerId }) {
  const { data, loading } = useAdpHistory(playerId);

  if (loading) {
    return (
      <div style={{ padding: '16px 0', color: 'var(--fp-muted)', fontSize: 13 }}>
        Loading draft history…
      </div>
    );
  }

  if (!data || !data.seasons?.length) {
    return (
      <div style={{ padding: '10px 0', color: 'var(--fp-muted)', fontSize: 13 }}>
        No ADP data available for this player (2023–2025).
      </div>
    );
  }

  const { seasons, position } = data;

  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--fp-muted)', marginBottom: 12 }}>
        Preseason ADP vs. end-of-season position finish — FantasyPros consensus (PPR)
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {seasons.map(s => (
          <SeasonCard key={s.season} s={s} position={position} />
        ))}
      </div>
    </div>
  );
}
