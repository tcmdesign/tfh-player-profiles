import BoomBustChart        from './BoomBustChart';
import VolumeTrendChart      from './VolumeTrendChart';
import TargetDistribution    from './TargetDistribution';

function SectionLabel({ children }) {
  return (
    <div className="fp-section-label" style={{ marginBottom: 10 }}>
      {children}
    </div>
  );
}

function StatRow({ label, value, sub, color }) {
  if (value == null) return null;
  return (
    <div style={{
      display:        'flex',
      justifyContent: 'space-between',
      alignItems:     'baseline',
      padding:        '7px 0',
      borderBottom:   '1px solid var(--fp-border)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--fp-muted)' }}>{label}</span>
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize:   16,
        fontWeight: 700,
        color:      color || 'var(--fp-light)',
      }}>
        {value}
        {sub && <span style={{ fontSize: 11, color: 'var(--fp-muted)', marginLeft: 3 }}>{sub}</span>}
      </span>
    </div>
  );
}

function MomentumPanel({ momentum, loading }) {
  if (loading || !momentum) return null;

  const { last3Avg, seasonAvg, pctChange, direction } = momentum;
  const up      = direction === 'up';
  const down    = direction === 'down';
  const neutral = !up && !down;

  const accentColor = up ? '#22C55E' : down ? '#EF4444' : 'var(--fp-steel)';
  const arrow       = up ? '▲' : down ? '▼' : '—';

  return (
    <div style={{
      background:   'var(--fp-navy3)',
      border:       '1px solid var(--fp-border)',
      borderRadius: 8,
      padding:      '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--fp-muted)', letterSpacing: '0.5px' }}>MOMENTUM — LAST 3 VS SEASON</span>
        <span style={{
          fontFamily:    "'Barlow Condensed', sans-serif",
          fontSize:      13,
          fontWeight:    700,
          color:         accentColor,
          letterSpacing: '0.3px',
        }}>
          {arrow} {pctChange != null ? `${pctChange > 0 ? '+' : ''}${pctChange.toFixed(1)}%` : '—'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize:   32,
            fontWeight: 800,
            color:      accentColor,
            lineHeight: 1,
          }}>
            {last3Avg != null ? last3Avg.toFixed(1) : '—'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--fp-muted)', marginTop: 3, letterSpacing: '0.5px' }}>LAST 3 WKS</div>
        </div>
        <div style={{ width: 1, background: 'var(--fp-border)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize:   32,
            fontWeight: 800,
            color:      'var(--fp-steel)',
            lineHeight: 1,
          }}>
            {seasonAvg != null ? seasonAvg.toFixed(1) : '—'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--fp-muted)', marginTop: 3, letterSpacing: '0.5px' }}>Season avg</div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{
            fontSize:      10,
            color:         accentColor,
            fontStyle:     'italic',
            textAlign:     'right',
            letterSpacing: '0.3px',
          }}>
            {up      ? 'Player is heating up — trending in the right direction'
            : down    ? 'Production dropping — trending away from season average'
            : 'Consistent with season average — reliable floor'}
          </div>
        </div>
      </div>
    </div>
  );
}

function EfficiencyPanel({ efficiency, position, loading }) {
  if (loading || !efficiency) return null;

  const { catchRate, yardsPerTarget, yardsPerCarry, tdPerGame, avgTargets, avgCarries, opportunityScore } = efficiency;

  const isReceiver = ['WR', 'TE'].includes(position);
  const isRB       = position === 'RB';
  const isQB       = position === 'QB';

  return (
    <div className="fp-efficiency-row">
      {/* Left col: efficiency */}
      <div style={{ flex: 1 }}>
        <SectionLabel>Efficiency</SectionLabel>
        <div style={{ background: 'var(--fp-navy3)', border: '1px solid var(--fp-border)', borderRadius: 8, padding: '4px 14px' }}>
          {catchRate != null && (
            <StatRow
              label="Catch Rate"
              value={`${catchRate.toFixed(1)}%`}
              color={catchRate >= 70 ? '#22C55E' : catchRate >= 55 ? 'rgba(41,201,240,0.9)' : '#EF4444'}
            />
          )}
          {yardsPerTarget != null && (
            <StatRow
              label="Yds / Target"
              value={yardsPerTarget.toFixed(1)}
              color={yardsPerTarget >= 9 ? '#22C55E' : yardsPerTarget >= 6 ? 'rgba(41,201,240,0.9)' : 'var(--fp-steel)'}
            />
          )}
          {yardsPerCarry != null && (
            <StatRow
              label="Yds / Carry"
              value={yardsPerCarry.toFixed(1)}
              color={yardsPerCarry >= 5 ? '#22C55E' : yardsPerCarry >= 3.5 ? 'rgba(41,201,240,0.9)' : '#EF4444'}
            />
          )}
          {tdPerGame != null && (
            <StatRow
              label="TDs / Game"
              value={tdPerGame.toFixed(2)}
            />
          )}
        </div>
      </div>

      {/* Right col: usage */}
      <div style={{ flex: 1 }}>
        <SectionLabel>Usage</SectionLabel>
        <div style={{ background: 'var(--fp-navy3)', border: '1px solid var(--fp-border)', borderRadius: 8, padding: '4px 14px' }}>
          {avgTargets != null && avgTargets > 0 && (
            <StatRow label="Avg Targets / Gm" value={avgTargets.toFixed(1)} />
          )}
          {avgCarries != null && avgCarries > 0 && (
            <StatRow label="Avg Carries / Gm" value={avgCarries.toFixed(1)} />
          )}
          {opportunityScore != null && (
            <StatRow
              label="Opportunity Score"
              value={opportunityScore.toFixed(1)}
              color={opportunityScore >= 12 ? '#22C55E' : opportunityScore >= 7 ? 'rgba(41,201,240,0.9)' : 'var(--fp-steel)'}
            />
          )}
          {avgTargets != null && avgCarries != null && (
            <StatRow
              label="Role"
              value={
                avgTargets > avgCarries * 2 ? 'Pass-first'
                : avgCarries > avgTargets * 2 ? 'Run-first'
                : 'Balanced'
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsTab({ playerId, position, analyticsData, scheduleData, analyticsLoading, scheduleLoading }) {
  if (!analyticsData && !analyticsLoading) {
    return (
      <div style={{ color: 'var(--fp-muted)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
        Analytics unavailable — not enough game data
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Season label */}
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fp-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', borderBottom: '1px solid var(--fp-border)', paddingBottom: 10 }}>
        2025 Season Data

      </div>

      {/* Efficiency + Usage */}
      <EfficiencyPanel
        efficiency={analyticsData?.efficiency}
        position={position}
        loading={analyticsLoading}
      />

      {/* Volume Trend */}
      {(['WR','RB','TE','QB'].includes(position)) && (
        <div>
          <SectionLabel>Weekly Volume — Targets &amp; Carries</SectionLabel>
          <div style={{ background: 'var(--fp-navy3)', border: '1px solid var(--fp-border)', borderRadius: 8, padding: '12px 12px 8px' }}>
            <VolumeTrendChart
              volumeTrend={analyticsData?.volumeTrend}
              position={position}
              loading={analyticsLoading}
            />
          </div>
        </div>
      )}

      {/* Boom/Bust */}
      <div>
        <SectionLabel>Boom / Bust Profile</SectionLabel>
        <div style={{ background: 'var(--fp-navy3)', border: '1px solid var(--fp-border)', borderRadius: 8, padding: '14px 16px' }}>
          <BoomBustChart boomBust={analyticsData?.boomBust} loading={analyticsLoading} />
        </div>
      </div>


      {/* Target Distribution — WR/TE/RB only, from nflfastR PBP data */}
      {(['WR', 'TE', 'RB'].includes(position)) && (
        <div style={{ background: 'var(--fp-navy3)', border: '1px solid var(--fp-border)', borderRadius: 8, padding: '14px 16px' }}>
          <TargetDistribution playerId={playerId} />
        </div>
      )}


    </div>
  );
}
