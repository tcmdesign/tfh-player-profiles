import { useAppConfig } from '../context/AppConfigContext';

export default function Header() {
  const { statsSeason, labelStats, labelProjection, offseason, loading } = useAppConfig();

  return (
    <div className="fp-header">
      <div className="fp-logo">
        FantasyPro<em>.AI</em>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="fp-demo-badge">BETA</span>
        {!loading && (
          <span className="fp-week">
            {statsSeason} · Stats thru {labelStats}
            {!offseason && (
              <span style={{ color: '#29C9F0', marginLeft: 6 }}>
                · Proj {labelProjection}
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
