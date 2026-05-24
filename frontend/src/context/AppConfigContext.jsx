import { createContext, useContext, useEffect, useState } from 'react';
import { get } from '../api/client';

const AppConfigContext = createContext({
  statsWeek:       18,
  statsSeason:     2025,
  projectionWeek:  null,
  labelStats:      'Wk 18',
  labelProjection: 'Offseason',
  offseason:       true,
  loading:         true,
});

export function AppConfigProvider({ children }) {
  const [config, setConfig] = useState({
    statsWeek:       18,
    statsSeason:     2025,
    projectionWeek:  null,
    labelStats:      'Wk 18',
    labelProjection: 'Offseason',
    offseason:       true,
    loading:         true,
  });

  useEffect(() => {
    get('/config')
      .then(data => setConfig({
        statsWeek:       data.stats_week,
        statsSeason:     data.stats_season,
        projectionWeek:  data.projection_week,
        labelStats:      data.label_stats,
        labelProjection: data.label_projection,
        offseason:       data.offseason,
        loading:         false,
      }))
      .catch(() => setConfig(c => ({ ...c, loading: false })));
  }, []);

  return (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  return useContext(AppConfigContext);
}
