import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BASE } from '../api/client';
import { useCompare, MAX_COMPARE } from '../context/CompareContext';
import { usePlayer } from '../hooks/usePlayer';
import PlayerCompactCard from '../components/PlayerCompactCard';

const RANK_FIELDS = { WR: 'rank_vs_wr', RB: 'rank_vs_rb', TE: 'rank_vs_te', QB: 'rank_vs_qb' };

function PlayerColumn({ entry, onRemove }) {
  const { data, loading } = usePlayer(entry.id);
  const [showWriteup, setShowWriteup] = useState(false);
  const [outlook, setOutlook] = useState(null);

  useEffect(() => {
    if (!entry.id) return;
    fetch(`${BASE}/tfh/outlook/${entry.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setOutlook(d))
      .catch(() => {});
  }, [entry.id]);

  if (loading) {
    return (
      <div style={{ width: 280, flexShrink: 0, background: 'var(--fp-navy2)', borderRadius: 10, padding: 20, border: '1px solid var(--fp-border)', opacity: 0.5 }}>
        <div style={{ height: 60, background: 'var(--fp-navy3)', borderRadius: 8, marginBottom: 12 }} />
        {[...Array(5)].map((_, i) => <div key={i} style={{ height: 28, background: 'var(--fp-navy3)', borderRadius: 4, marginBottom: 8, opacity: 0.5 - i * 0.08 }} />)}
      </div>
    );
  }

  if (!data) return null;

  const { player, rankings, stats } = data;

  const recentPts  = (stats?.recent || []).map(w => parseFloat(w.fantasy_pts) || 0).filter(p => p > 0);
  const avgPts     = recentPts.length ? recentPts.reduce((a, b) => a + b, 0) / recentPts.length : 0;
  const floorPts   = recentPts.length ? Math.min(...recentPts) : 0;
  const ceilingPts = recentPts.length ? Math.max(...recentPts) : 0;
  const recentAll  = stats?.recent || [];
  const avgTargets = recentAll.length ? recentAll.reduce((a, w) => a + (parseFloat(w.targets) || 0), 0) / recentAll.length : 0;
  const avgCarries = recentAll.length ? recentAll.reduce((a, w) => a + (parseFloat(w.carries) || 0), 0) / recentAll.length : 0;

  const writeupExtra = (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--fp-border)' }}>
      {outlook?.writeup ? (
        <>
          <button
            onClick={() => setShowWriteup(v => !v)}
            style={{
              width: '100%', textAlign: 'center',
              background: showWriteup ? 'rgba(229,57,53,0.12)' : 'transparent',
              border: '1px solid rgba(229,57,53,0.35)',
              borderRadius: 6, padding: '7px 0',
              color: '#E53935', fontSize: 12, fontWeight: 700,
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: '0.4px', cursor: 'pointer',
            }}
          >
            {showWriteup ? 'Hide Outlook' : '2026 TFH Outlook'}
          </button>
          {showWriteup && (
            <div style={{
              marginTop: 10, fontSize: 12, color: 'var(--fp-text)',
              lineHeight: 1.6, background: 'var(--fp-navy3)',
              border: '1px solid var(--fp-border)',
              borderRadius: 6, padding: '10px 12px',
            }}>
              {outlook.writeup}
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--fp-muted)', padding: '4px 0' }}>
          No TFH outlook available
        </div>
      )}
    </div>
  );

  return (
    <PlayerCompactCard
      style={{ width: 280, flexShrink: 0 }}
      player={{
        name:          player?.name,
        position:      player?.position,
        team:          player?.team,
        headshot_url:  player?.headshot_url,
        status:        player?.status,
        position_rank: rankings?.position_rank,
      }}
      stats={{
        avg_pts:     parseFloat(avgPts.toFixed(1)),
        floor_pts:   parseFloat(floorPts.toFixed(1)),
        ceiling_pts: parseFloat(ceilingPts.toFixed(1)),
        avg_targets: parseFloat(avgTargets.toFixed(1)),
        avg_carries: parseFloat(avgCarries.toFixed(1)),
      }}
      extra={writeupExtra}
      onRemove={() => onRemove(entry.id)}
    />
  );
}

function EmptySlot() {
  return (
    <div style={{
      width: 280, flexShrink: 0, minHeight: 200,
      border: '2px dashed var(--fp-border)',
      borderRadius: 10, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 8,
      color: 'var(--fp-muted)',
    }}>
      <div style={{ fontSize: 28, opacity: 0.3 }}>+</div>
      <div style={{ fontSize: 12 }}>Add a player</div>
    </div>
  );
}

export default function ComparePage() {
  const navigate = useNavigate();
  const { list, remove, clear } = useCompare();

  const slots = [...list, ...Array(Math.max(0, 2 - list.length)).fill(null)];

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--fp-text)' }}>
              Player Comparison
            </div>
            <div style={{ fontSize: 12, color: 'var(--fp-muted)', marginTop: 2 }}>
              {list.length} of {MAX_COMPARE} players selected · Add players from Player Profiles
            </div>
          </div>
          {list.length > 0 && (
            <button
              onClick={clear}
              style={{
                background: 'transparent', border: '1px solid var(--fp-border)',
                color: 'var(--fp-muted)', borderRadius: 6, padding: '7px 14px',
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Clear all
            </button>
          )}
        </div>

        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--fp-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.2 }}>⚖</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No players selected</div>
            <div style={{ fontSize: 13 }}>Go to Player Profiles and tap the compare button on any player</div>
            <button
              onClick={() => navigate('/')}
              style={{
                marginTop: 20, background: 'rgba(229,57,53,0.12)',
                border: '1px solid rgba(229,57,53,0.3)', color: '#E53935',
                borderRadius: 6, padding: '8px 18px', fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Browse Player Profiles
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', minWidth: 'max-content' }}>
              {slots.map((entry, i) =>
                entry
                  ? <PlayerColumn key={entry.id} entry={entry} onRemove={remove} />
                  : <EmptySlot key={`empty-${i}`} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
