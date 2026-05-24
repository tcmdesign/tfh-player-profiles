import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { usePlayer } from '../hooks/usePlayer';
import PlayerCard from '../components/PlayerCard';

export default function PlayerPage() {
  const { id } = useParams();
  const { data, loading, error } = usePlayer(Number(id));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || undefined;

  return (
    <div className="fp-root">
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: '1px solid var(--fp-border)',
          color: 'var(--fp-muted)',
          borderRadius: '20px',
          padding: '5px 14px',
          fontSize: '13px',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '1.25rem',
          letterSpacing: '0.3px',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          e.target.style.color = 'var(--fp-text)';
          e.target.style.borderColor = 'var(--fp-steel)';
        }}
        onMouseLeave={e => {
          e.target.style.color = 'var(--fp-muted)';
          e.target.style.borderColor = 'var(--fp-border)';
        }}
      >
        ← Back
      </button>

      {loading && (
        <div className="fp-loading">Loading player...</div>
      )}
      {error && (
        <div className="fp-error">Error: {error}</div>
      )}
      {data && <PlayerCard data={data} initialTab={initialTab} />}
    </div>
  );
}
