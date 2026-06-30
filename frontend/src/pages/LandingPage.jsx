import { useState, useRef, useEffect } from 'react';
import { usePlayer } from '../hooks/usePlayer';
import PlayerSearch from '../components/PlayerSearch';
import PlayerCard from '../components/PlayerCard';
import PlayerListView from '../components/PlayerListView';

function LoadingState() {
  return (
    <div className="fp-loading">
      <div style={{ marginBottom: '8px' }}>Loading player data...</div>
      <div style={{
        width: '40px', height: '3px',
        background: 'var(--fp-cyan)', borderRadius: '2px',
        margin: '0 auto', animation: 'pulse 1.2s ease-in-out infinite',
      }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}

export default function LandingPage() {
  const [activePlayerId, setActivePlayerId] = useState(null);
  const { data, loading, error } = usePlayer(activePlayerId);
  const savedScrollY = useRef(0);

  function selectPlayer(id) {
    savedScrollY.current = window.scrollY;
    setActivePlayerId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBackToList() {
    setActivePlayerId(null);
  }

  // Restore scroll position when returning to the list
  useEffect(() => {
    if (!activePlayerId && savedScrollY.current > 0) {
      const y = savedScrollY.current;
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
  }, [activePlayerId]);

  return (
    <div className="fp-root">
      {/* Site header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.5rem', paddingBottom: '1rem',
        borderBottom: '1px solid var(--fp-border)',
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 22, fontWeight: 800, letterSpacing: '1px',
          color: 'var(--fp-text)',
        }}>
          <span style={{
            background: 'var(--fp-orange-grad)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>TFH</span> Player Profiles
        </div>
        <div style={{ fontSize: 11, color: 'var(--fp-muted)' }}>2026 Draft Guide</div>
      </div>

      <PlayerSearch onSelect={selectPlayer} />

      {activePlayerId && (
        <>
          <button
            onClick={goBackToList}
            style={{
              display:     'flex',
              alignItems:  'center',
              gap:         6,
              marginBottom: 16,
              background:  'transparent',
              border:      '1px solid var(--fp-border)',
              borderRadius: 6,
              padding:     '6px 12px',
              color:       'var(--fp-muted)',
              fontSize:    13,
              cursor:      'pointer',
              fontFamily:  'inherit',
              transition:  'color 0.12s, border-color 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--fp-text)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--fp-muted)'; e.currentTarget.style.borderColor = 'var(--fp-border)'; }}
          >
            ← Player Profiles
          </button>

          {loading && <LoadingState />}
          {error   && <div className="fp-error">Failed to load player: {error}</div>}
          {!loading && !error && data && <PlayerCard data={data} />}
        </>
      )}

      {!activePlayerId && (
        <PlayerListView onSelectPlayer={selectPlayer} />
      )}
    </div>
  );
}
