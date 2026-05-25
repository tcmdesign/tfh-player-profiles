import { useState } from 'react';
import { useCompare } from '../context/CompareContext';
import { getInjuryDisplay } from '../utils/injuryUtils';
import MetricGrid from './MetricGrid';
import TrendChart from './TrendChart';
import StatsFilter from './StatsFilter';
import TeamDepthChart from './TeamDepthChart';
import StatDetailGrid from './StatDetailGrid';
import { useFilteredStats, computeMetrics } from '../hooks/useFilteredStats';
import { useTeammates } from '../hooks/useTeammates';
import { usePositionLeaderboard } from '../hooks/usePositionLeaderboard';
import { useStatRanks } from '../hooks/useStatRanks';
import { useAnalytics } from '../hooks/useAnalytics';
import MomentumBadge from './MomentumBadge';
import AnalyticsTab from './AnalyticsTab';
import AdpTab from './AdpTab';
import TfhOutlook from './TfhOutlook';
import { useTfhOutlook } from '../hooks/useTfhOutlook';

const TABS = ['Overview', 'Analytics', 'Depth Chart', 'ADP Tracker'];

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function computeCareerSeasons(stats) {
  const byYear = {};
  for (const s of stats) {
    const yr = String(s.season);
    if (!byYear[yr]) byYear[yr] = { season: s.season, pts: [], games: 0 };
    byYear[yr].pts.push(parseFloat(s.fantasy_pts) || 0);
    byYear[yr].games++;
  }
  return Object.values(byYear)
    .sort((a, b) => a.season - b.season)
    .map(yr => ({
      season: yr.season,
      fantasy_pts: parseFloat((yr.pts.reduce((a, b) => a + b, 0) / yr.pts.length).toFixed(2)),
      gamesPlayed: yr.games,
      week: null,
    }));
}

function BannerBox({ label, value, sub, color = 'var(--fp-text)', accent }) {
  return (
    <div className="fp-metric" style={{ padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
      {accent && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 3, background: accent, opacity: 0.7,
        }} />
      )}
      <div className="fp-metric-label">{label}</div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 36, fontWeight: 800, color,
        lineHeight: 1, margin: '6px 0 5px',
      }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: 'var(--fp-muted)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function TabBanner({ activeTab, player, rankings, stats, analyticsData, analyticsLoading }) {
  const pos = player?.position || '';

  const wrap = children => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {children}
    </div>
  );

  if (activeTab === 'Analytics') return null;

  if (activeTab === 'Depth Chart') {
    const recent = stats?.recent || [];
    const sorted = [...recent].sort((a, b) => {
      if (b.season !== a.season) return b.season - a.season;
      return (b.week || 0) - (a.week || 0);
    });
    const lastGame = sorted[0];
    const snapRaw  = lastGame?.snap_pct != null ? parseFloat(lastGame.snap_pct) : null;
    const snapNorm = snapRaw != null ? (snapRaw > 1.5 ? snapRaw : snapRaw * 100) : null;
    const snapDisp = snapNorm != null ? `${Math.round(snapNorm)}%` : '--';
    const snapColor = snapNorm == null ? 'var(--fp-muted)' : snapNorm >= 70 ? 'var(--fp-green)' : snapNorm >= 40 ? 'var(--fp-text)' : 'var(--fp-pink)';
    const last4 = sorted.slice(0, 4);
    let volLabel, volValue;
    if (['WR', 'TE'].includes(pos)) {
      volLabel = 'AVG TARGETS L4';
      volValue = last4.length ? (last4.reduce((s, w) => s + (parseFloat(w.targets) || 0), 0) / last4.length).toFixed(1) : '--';
    } else if (pos === 'RB') {
      volLabel = 'AVG CARRIES L4';
      volValue = last4.length ? (last4.reduce((s, w) => s + (parseFloat(w.carries) || 0), 0) / last4.length).toFixed(1) : '--';
    } else if (pos === 'QB') {
      volLabel = 'PASS YDS/G L4';
      volValue = last4.length ? (last4.reduce((s, w) => s + (parseFloat(w.pass_yards) || 0), 0) / last4.length).toFixed(0) : '--';
    } else {
      volLabel = 'POSITION'; volValue = pos || '--';
    }
    const posRankNum = rankings?.position_rank;
    const roleLabel  = posRankNum ? `${pos}${posRankNum}` : (pos || '--');
    return wrap(<>
      <BannerBox label="TEAM ROLE" value={roleLabel} sub={`${player?.team || 'FA'} depth chart`} color="var(--fp-cyan)" accent="var(--fp-cyan)" />
      <BannerBox label="SNAP RATE" value={snapDisp} sub={lastGame?.opponent ? `last vs ${lastGame.opponent}` : 'last game'} color={snapColor} />
      <BannerBox label={volLabel} value={volValue} sub="last 4 weeks avg" />
    </>);
  }

  if (activeTab === 'ADP Tracker') {
    const posRankNum = rankings?.position_rank;
    const avgPts     = stats?.avg_fantasy_pts != null ? parseFloat(stats.avg_fantasy_pts).toFixed(1) : '--';
    const ageLine    = player?.age ? `Age ${player.age}` : '--';
    const yrSub      = player?.years_exp != null ? `Year ${player.years_exp + 1} in the NFL` : 'in the NFL';
    return wrap(<>
      <BannerBox label="POSITION RANK" value={posRankNum ? `${pos}${posRankNum}` : 'NR'} sub="current season" color={!posRankNum ? 'var(--fp-muted)' : posRankNum <= 12 ? 'var(--fp-green)' : posRankNum > 24 ? 'var(--fp-pink)' : 'var(--fp-muted)'} accent="var(--fp-cyan)" />
      <BannerBox label="SEASON AVG" value={avgPts} sub="fantasy pts per game" />
      <BannerBox label="EXPERIENCE" value={ageLine} sub={yrSub} color="var(--fp-muted)" />
    </>);
  }

  return null;
}

export default function PlayerCard({ data, initialTab }) {
  const [activeTab,  setActiveTab]  = useState(initialTab || 'Overview');
  const [activePill, setActivePill] = useState('s2025');
  const { add, remove, isComparing } = useCompare();

  const playerId = data?.player?.id;
  const { data: teammateData, loading: depthLoading } = useTeammates(playerId);
  const leaderboard = usePositionLeaderboard(data?.player?.position);
  const { stats: filteredStats, loading: statsLoading } = useFilteredStats(
    playerId, activePill, 8, data?.stats?.recent || []
  );
  const filteredMetrics = computeMetrics(filteredStats);
  const statRankSeason = activePill === 'career' ? null : activePill === 's2024' ? 2024 : 2025;
  const { data: statRanks, loading: statRanksLoading } = useStatRanks(playerId, statRankSeason);
  const { data: analyticsData, loading: analyticsLoading } = useAnalytics(playerId);
  const { data: outlookData, loading: outlookLoading } = useTfhOutlook(playerId);

  if (!data) return null;

  const { player, rankings, stats } = data;

  const initials = getInitials(player?.name);

  const posBadge = player?.position
    ? `${player.position}${rankings?.position_rank || ''}`
    : '--';
  const teamBadge = player?.team || 'FA';

  const ageLine = [
    player?.age           ? `Age ${player.age}`              : null,
    player?.years_exp != null ? `Yr ${player.years_exp + 1}` : null,
  ].filter(Boolean).join(' · ');

  const recentPts = (stats?.recent || []).map(w => parseFloat(w.fantasy_pts) || 0).filter(p => p > 0);
  const floor     = recentPts.length ? Math.min(...recentPts).toFixed(1) : null;
  const ceiling   = recentPts.length ? Math.max(...recentPts).toFixed(1) : null;

  const weekRank = rankings?.position_rank
    ? `${player?.position} #${rankings.position_rank}`
    : null;
  const weekLabel = rankings?.week ? `Wk ${rankings.week}` : null;

  return (
    <>
      {/* Bento player header card */}
      <div style={{
        position:     'relative',
        display:      'flex',
        background:   'var(--fp-navy2)',
        borderRadius: 14,
        border:       '1px solid rgba(255,255,255,0.07)',
        overflow:     'hidden',
        marginBottom: '1.25rem',
        minHeight:    148,
      }}>
        {/* Portrait image panel */}
        <div style={{ position: 'relative', flexShrink: 0, width: 150 }}>
          {player?.headshot_url ? (
            <img
              src={player.headshot_url}
              alt={player.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%', background: 'var(--fp-navy3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 700, color: 'var(--fp-steel)',
            }}>
              {initials}
            </div>
          )}
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 40,
            background: 'linear-gradient(to right, transparent, var(--fp-navy2))',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(to right, var(--fp-cyan), transparent)',
          }} />
        </div>

        {/* Red radial glow */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '55%', bottom: 0,
          background: 'radial-gradient(ellipse at 15% 50%, rgba(229,57,53,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Content area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 16px 8px', minWidth: 0 }}>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="fp-player-name" style={{ marginBottom: 8 }}>{player?.name || 'Unknown Player'}</div>
            <div className="fp-player-meta">
              <span className="fp-badge fp-badge-pos">{posBadge}</span>
              <span className="fp-badge fp-badge-team">{teamBadge}</span>
              {/* MomentumBadge hidden for now */}
              {/* Injury badge hidden for now */}
            </div>
            {ageLine && (
              <div style={{ fontSize: 13, color: 'var(--fp-muted)', marginTop: 6, letterSpacing: '0.3px' }}>
                {ageLine}
              </div>
            )}
          </div>

          {/* Stats panel */}
          {(floor || weekRank) && (
            <div className="fp-player-stats-panel" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 8, padding: '0 20px',
              borderLeft: '1px solid var(--fp-border)', borderRight: '1px solid var(--fp-border)',
              flexShrink: 0, alignSelf: 'stretch',
            }}>
              {weekRank && (
                <div style={{ textAlign: 'center', lineHeight: 1 }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 44, fontWeight: 800, color: 'var(--fp-cyan)', lineHeight: 1 }}>
                    {weekRank}
                  </div>
                  {weekLabel && (
                    <div style={{ fontSize: 11, color: 'var(--fp-muted)', marginTop: 4, letterSpacing: '0.5px' }}>
                      {weekLabel}
                    </div>
                  )}
                </div>
              )}
              {floor && ceiling && (
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--fp-pink)', lineHeight: 1 }}>{floor}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--fp-muted)', marginTop: 3, letterSpacing: '1.2px', textTransform: 'uppercase' }}>Floor</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--fp-green)', lineHeight: 1 }}>{ceiling}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--fp-muted)', marginTop: 3, letterSpacing: '1.2px', textTransform: 'uppercase' }}>Ceiling</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Compare toggle */}
          {(() => {
            const comparing = isComparing(playerId);
            return (
              <button
                onClick={() => comparing
                  ? remove(playerId)
                  : add({ id: playerId, name: player?.name, position: player?.position, team: player?.team })
                }
                title={comparing ? 'Remove from comparison' : 'Add to comparison'}
                aria-label={comparing ? `Remove ${player?.name} from comparison` : `Compare ${player?.name}`}
                aria-pressed={comparing}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 4, padding: '0 14px',
                  background: comparing ? 'rgba(229,57,53,0.12)' : 'transparent',
                  border: `1px solid ${comparing ? 'rgba(229,57,53,0.4)' : 'var(--fp-border)'}`,
                  borderRadius: 8, cursor: 'pointer',
                  color: comparing ? '#E53935' : 'var(--fp-muted)',
                  flexShrink: 0, alignSelf: 'stretch', transition: 'all 0.15s',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="6" height="11" rx="1.5" />
                  <rect x="12" y="3" width="6" height="13" rx="1.5" />
                  <line x1="8" y1="10.5" x2="12" y2="10.5" />
                  <path d="M10 8.5l2 2-2 2" />
                </svg>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {comparing ? 'Added' : 'Compare'}
                </span>
              </button>
            );
          })()}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="fp-tabs"
        role="tablist"
        aria-label="Player detail sections"
        onKeyDown={e => {
          const idx = TABS.indexOf(activeTab);
          if (e.key === 'ArrowRight') { e.preventDefault(); setActiveTab(TABS[(idx + 1) % TABS.length]); }
          if (e.key === 'ArrowLeft')  { e.preventDefault(); setActiveTab(TABS[(idx - 1 + TABS.length) % TABS.length]); }
          if (e.key === 'Home')       { e.preventDefault(); setActiveTab(TABS[0]); }
          if (e.key === 'End')        { e.preventDefault(); setActiveTab(TABS[TABS.length - 1]); }
        }}
      >
        {TABS.map(tab => (
          <button
            key={tab}
            id={`tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls="fp-tab-panel"
            tabIndex={activeTab === tab ? 0 : -1}
            className={`fp-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Metric strip */}
      <div style={{ padding: '12px 0 4px' }}>
        {activeTab === 'Overview' ? (
          <MetricGrid
            player={player}
            rankings={rankings}
            stats={{ ...stats, recent: filteredStats, avg_fantasy_pts: filteredMetrics.avg }}
            weekCount={filteredMetrics.count}
            filterLabel={{ s2025: '2025', s2024: '2024', career: 'Career' }[activePill] ?? '2025'}
            loading={statsLoading}
            leaderboard={leaderboard}
          />
        ) : (
          <TabBanner
            activeTab={activeTab}
            player={player}
            rankings={rankings}
            stats={stats}
            analyticsData={analyticsData}
            analyticsLoading={analyticsLoading}
          />
        )}
      </div>

      {/* Tab content */}
      <div
        id="fp-tab-panel"
        role="tabpanel"
        aria-labelledby={`tab-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
        className="fp-tab-content"
      >
        {activeTab === 'Overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TfhOutlook data={outlookData} loading={outlookLoading} />

            <StatsFilter activePill={activePill} onPill={setActivePill} />

            <div className="fp-chart-stats-row" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ flex: '0 0 65%', minWidth: 0 }}>
                {(() => {
                  const isCareer = activePill === 'career';
                  const careerSeasons = isCareer ? computeCareerSeasons(filteredStats) : null;
                  const chartStats = isCareer ? careerSeasons : filteredStats;
                  const chartLabel = isCareer
                    ? `Avg fantasy pts by season — ${careerSeasons?.length || 0} seasons`
                    : `Fantasy points — ${filteredMetrics.count} weeks`;
                  return (
                    <div style={{
                      background:   '#06060A',
                      border:       '1px solid var(--fp-border)',
                      borderRadius: 12,
                      padding:      '14px 14px 8px',
                      overflow:     'hidden',
                    }}>
                      <div className="fp-section-label" style={{ marginBottom: '10px' }}>{chartLabel}</div>
                      <TrendChart stats={{ recent: chartStats }} position={player?.position} />
                    </div>
                  );
                })()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <StatDetailGrid
                  ranks={statRanks}
                  position={player?.position}
                  loading={statRanksLoading}
                  columns={2}
                  season={statRankSeason}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Analytics' && (
          <AnalyticsTab
            playerId={playerId}
            position={player?.position}
            analyticsData={analyticsData}
            analyticsLoading={analyticsLoading}
          />
        )}

        {activeTab === 'Depth Chart' && (
          <TeamDepthChart
            teammates={teammateData?.teammates || []}
            selfId={teammateData?.selfId}
            team={player?.team}
            loading={depthLoading}
          />
        )}

        {activeTab === 'ADP Tracker' && (
          <AdpTab playerId={playerId} />
        )}
      </div>

      {/* Footer */}
      <div className="fp-footer">
        <div className="fp-footer-text">TFH Player Profiles</div>
        <div className="fp-footer-logo">
          <span>TFH</span> Player Profiles
        </div>
      </div>
    </>
  );
}
