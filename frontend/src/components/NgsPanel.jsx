/**
 * NgsPanel — Next Gen Stats display, position-aware
 *
 * WR/TE: separation, cushion, aDOT, YAC, YAC+
 * RB:    RYOE, efficiency, stacked-box %, time to LOS
 * QB:    CPOE, aggressiveness, aDOT, time to throw + receiver cards
 */
import { useNgs } from '../hooks/useNgs';
import { usePlayer } from '../hooks/usePlayer';

// ── Shared primitives ─────────────────────────────────────────────────────────

function StatRow({ label, value, note, color, good, bad }) {
  if (value == null) return null;
  let valueColor = 'var(--fp-text)';
  if (good != null && bad != null) {
    if (value >= good) valueColor = 'var(--fp-green)';
    else if (value <= bad) valueColor = 'var(--fp-pink)';
    else valueColor = '#fbbf24';
  } else if (color) {
    valueColor = color;
  }
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '7px 0', borderBottom: '1px solid var(--fp-border)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--fp-muted)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        {note && <span style={{ fontSize: 10, color: 'var(--fp-steel)' }}>{note}</span>}
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: valueColor }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function SectionHeader({ children, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fp-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {children}
      </span>
      {sub && <span style={{ fontSize: 11, color: 'var(--fp-muted)' }}>{sub}</span>}
    </div>
  );
}

function fmt(v, decimals = 1) {
  if (v == null || isNaN(v)) return null;
  return parseFloat(v).toFixed(decimals);
}

function fmtSign(v, decimals = 1) {
  if (v == null || isNaN(v)) return null;
  const n = parseFloat(v);
  return (n >= 0 ? '+' : '') + n.toFixed(decimals);
}

// ── Receiving NGS (WR / TE) ───────────────────────────────────────────────────

function NgsReceiving({ data }) {
  const r = data.receiving;
  if (!r) return <div style={{ color: 'var(--fp-muted)', fontSize: 13 }}>No NGS receiving data for this season.</div>;

  return (
    <div>
      <StatRow label="Avg Separation (at target)" value={fmt(r.avg_separation)} note="yards"
        good={3.5} bad={2.5} />
      <StatRow label="Avg Cushion (pre-snap)" value={fmt(r.avg_cushion)} note="yards" />
      <StatRow label="Avg Target Depth (aDOT)" value={fmt(r.avg_intended_air_yards)} note="yards" />
      <StatRow label="Avg YAC" value={fmt(r.avg_yac)} note="yards" />
      <StatRow label="YAC Above Expectation" value={fmtSign(r.avg_yac_above_expectation)} note="yds/rec"
        good={0.5} bad={-0.5} />
      <StatRow label="Catch Rate" value={r.catch_percentage ? `${fmt(r.catch_percentage, 1)}%` : null}
        good={70} bad={55} />
      <StatRow label="Target Share" value={r.percent_share_intended_air_yards ? `${fmt(r.percent_share_intended_air_yards, 1)}%` : null}
        note="of team air yards" />
    </div>
  );
}

// ── Rushing NGS (RB) ─────────────────────────────────────────────────────────

function NgsRushing({ data }) {
  const r = data.rushing;
  if (!r) return <div style={{ color: 'var(--fp-muted)', fontSize: 13 }}>No NGS rushing data for this season.</div>;

  return (
    <div>
      <StatRow label="Rush Yards Over Expected" value={fmtSign(r.rush_yards_over_expected)} note="total"
        good={0} bad={-50} />
      <StatRow label="RYOE Per Attempt" value={fmtSign(r.rush_yards_over_expected_per_att)} note="yds/att"
        good={0.2} bad={-0.2} />
      <StatRow label="Efficiency" value={fmt(r.efficiency, 2)} />
      <StatRow label="Stacked Box %" value={r.percent_attempts_gte_eight_defenders ? `${fmt(r.percent_attempts_gte_eight_defenders, 1)}%` : null}
        note="runs vs 8+ defenders" />
      <StatRow label="Avg Time to LOS" value={r.avg_time_to_los ? `${fmt(r.avg_time_to_los, 2)}s` : null} />
      <StatRow label="Expected Rush Yards" value={fmt(r.expected_rush_yards, 0)} note="total" />
    </div>
  );
}

// ── QB passing NGS ────────────────────────────────────────────────────────────

function NqsPassingStats({ p }) {
  if (!p) return <div style={{ color: 'var(--fp-muted)', fontSize: 13 }}>No NGS passing data for this season.</div>;
  return (
    <div>
      <StatRow label="CPOE (Completion % Above Exp)" value={fmtSign(p.completion_percentage_above_expectation, 1)}
        note="%" good={3} bad={-3} />
      <StatRow label="Aggressiveness" value={p.aggressiveness ? `${fmt(p.aggressiveness, 1)}%` : null}
        note="throws into tight window" />
      <StatRow label="Avg Target Depth (aDOT)" value={fmt(p.avg_intended_air_yards)} note="yards" />
      <StatRow label="Avg Completed Air Yards" value={fmt(p.avg_completed_air_yards)} note="yards" />
      <StatRow label="Air Yards Differential" value={fmtSign(p.avg_air_yards_differential)}
        note="completed vs intended" />
      <StatRow label="Avg Time to Throw" value={p.avg_time_to_throw ? `${fmt(p.avg_time_to_throw, 2)}s` : null}
        good={2.6} bad={3.0} />
      <StatRow label="Passer Rating" value={fmt(p.passer_rating, 1)} good={100} bad={85} />
    </div>
  );
}

// ── QB Target Quality cards ───────────────────────────────────────────────────

const DESIGNATION_COLOR = { START: '#22C55E', FRINGE: '#E0613A', SIT: '#EF4444' };
const RANK_FIELDS = { WR: 'rank_vs_wr', RB: 'rank_vs_rb', TE: 'rank_vs_te', QB: 'rank_vs_qb' };

function computeConfidence({ consistency, matchup, rankings, insight, position }) {
  let score = 0;
  score += ((consistency?.score ?? 0) / 100) * 35;
  const rf = RANK_FIELDS[position] || 'rank_vs_wr';
  const matchupRank = matchup?.[rf] ?? 16;
  score += (matchupRank / 32) * 30;
  const posRank = rankings?.position_rank;
  if (posRank) score += Math.max(0, (1 - (posRank - 1) / 24)) * 25;
  else score += 10;
  if (insight?.recommendation === 'START')    score += 8;
  else if (insight?.recommendation === 'SIT') score -= 6;
  return Math.round(Math.max(0, Math.min(100, score)));
}

function getInitials(name) {
  if (!name) return '?';
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0][0] : p[0][0] + p[p.length - 1][0];
}

function NgsStatChip({ label, value, color }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      flex: 1, padding: '6px 4px',
      borderRight: '1px solid var(--fp-border)',
    }}>
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 15, fontWeight: 700,
        color: color || 'var(--fp-text)', lineHeight: 1,
      }}>{value ?? '—'}</span>
      <span style={{ fontSize: 9, color: 'var(--fp-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{label}</span>
    </div>
  );
}

function ReceiverCard({ target }) {
  const { data, loading } = usePlayer(target.player_id);

  const confidence  = data ? computeConfidence({
    consistency: data.consistency,
    matchup:     data.matchup,
    rankings:    data.rankings,
    insight:     data.insight,
    position:    data.player?.position,
  }) : null;
  const designation = confidence != null ? (confidence >= 68 ? 'START' : confidence >= 48 ? 'FRINGE' : 'SIT') : null;
  const desColor    = designation ? DESIGNATION_COLOR[designation] : 'var(--fp-border)';
  const posRank     = data?.rankings?.position_rank;
  const position    = data?.player?.position || target.position;

  // NGS color helpers
  const sepColor = (v) => v == null ? 'var(--fp-steel)' : v >= 3.5 ? 'var(--fp-green)' : v >= 2.5 ? '#fbbf24' : 'var(--fp-pink)';
  const yacColor = (v) => v == null ? 'var(--fp-steel)' : v >= 0.5 ? 'var(--fp-green)' : v >= -0.5 ? '#fbbf24' : 'var(--fp-pink)';
  const crColor  = (v) => v == null ? 'var(--fp-steel)' : v >= 70 ? 'var(--fp-green)' : v >= 55 ? '#fbbf24' : 'var(--fp-pink)';

  return (
    <div style={{
      width: 190, flexShrink: 0,
      background: 'var(--fp-navy2)',
      border: `1px solid ${desColor}35`,
      borderRadius: 10, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        background: `${desColor}0C`,
        borderBottom: `1px solid ${desColor}25`,
        padding: '12px 12px 10px',
      }}>
        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'var(--fp-navy3)', border: `2px solid ${desColor}50`,
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, color: desColor,
          }}>
            {loading
              ? null
              : data?.player?.headshot_url
                ? <img src={data.player.headshot_url} alt={target.player_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                : getInitials(target.player_name)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 800, color: 'var(--fp-text)', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {target.player_name?.split(' ').slice(-1)[0] ?? target.player_name}
            </div>
            <div style={{ fontSize: 10, color: 'var(--fp-muted)', marginTop: 2 }}>
              {position}{posRank ? ` · #${position}${posRank}` : ''}
            </div>
          </div>
        </div>

        {/* Score + designation */}
        {designation && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: desColor, lineHeight: 1 }}>
              {confidence}%
            </span>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11, fontWeight: 800, letterSpacing: '1px',
              color: desColor, background: `${desColor}18`,
              padding: '2px 7px', borderRadius: 4,
              border: `1px solid ${desColor}40`,
            }}>
              {designation}
            </span>
          </div>
        )}
        {loading && (
          <div style={{ height: 28, background: 'var(--fp-navy3)', borderRadius: 4, opacity: 0.5 }} />
        )}
      </div>

      {/* NGS stats chips */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--fp-border)' }}>
        <NgsStatChip label="Tgts" value={target.targets} />
        <NgsStatChip label="CR%" value={target.catch_pct != null ? `${target.catch_pct.toFixed(0)}%` : null} color={crColor(target.catch_pct)} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '6px 4px' }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--fp-text)', lineHeight: 1 }}>
            {target.target_share_pct != null ? `${target.target_share_pct.toFixed(0)}%` : '—'}
          </span>
          <span style={{ fontSize: 9, color: 'var(--fp-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Tgt Share</span>
        </div>
      </div>

      {/* Separation + YAC+ + aDOT */}
      <div style={{ display: 'flex', flex: 1 }}>
        <NgsStatChip
          label="Sep"
          value={target.avg_separation != null ? target.avg_separation.toFixed(1) : null}
          color={sepColor(target.avg_separation)}
        />
        <NgsStatChip
          label="YAC+"
          value={target.avg_yac_above_expectation != null
            ? (target.avg_yac_above_expectation >= 0 ? '+' : '') + target.avg_yac_above_expectation.toFixed(1)
            : null}
          color={yacColor(target.avg_yac_above_expectation)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '6px 4px' }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--fp-text)', lineHeight: 1 }}>
            {target.avg_intended_air_yards != null ? target.avg_intended_air_yards.toFixed(1) : '—'}
          </span>
          <span style={{ fontSize: 9, color: 'var(--fp-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>aDOT</span>
        </div>
      </div>
    </div>
  );
}

function TargetQualityCards({ targets }) {
  if (!targets || targets.length === 0) {
    return <div style={{ color: 'var(--fp-muted)', fontSize: 13, marginTop: 4 }}>No receiver data found for this team/season.</div>;
  }
  return (
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
      {targets.map((t, i) => (
        <ReceiverCard key={t.player_id ?? i} target={t} />
      ))}
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

export default function NgsPanel({ playerId, season }) {
  const { data, loading } = useNgs(playerId, season);

  if (loading) {
    return (
      <div style={{ padding: '16px 0', color: 'var(--fp-muted)', fontSize: 13, textAlign: 'center' }}>
        Loading Next Gen Stats…
      </div>
    );
  }

  if (!data || !data.available) return null;

  const ngsSeason = data.season;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* WR / TE */}
      {data.type === 'receiving' && (
        <div>
          <SectionHeader sub={`${ngsSeason} season · Next Gen Stats`}>
            Tracking Stats
          </SectionHeader>
          <NgsReceiving data={data} />
        </div>
      )}

      {/* RB */}
      {data.type === 'rushing' && (
        <div>
          <SectionHeader sub={`${ngsSeason} season · Next Gen Stats`}>
            Tracking Stats
          </SectionHeader>
          <NgsRushing data={data} />
        </div>
      )}

      {/* QB — passing stats + target quality table */}
      {data.type === 'passing' && (
        <>
          <div>
            <SectionHeader sub={`${ngsSeason} season · Next Gen Stats`}>
              Passing Tracking Stats
            </SectionHeader>
            <NqsPassingStats p={data.passing} />
          </div>

          <div>
            <SectionHeader sub="min 20 targets · sep · YAC+ · start/sit score">
              Target Quality
            </SectionHeader>
            <TargetQualityCards targets={data.targets} />
          </div>
        </>
      )}
    </div>
  );
}
