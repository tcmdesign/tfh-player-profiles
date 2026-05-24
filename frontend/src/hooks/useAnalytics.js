import { useState, useEffect } from 'react';
import { get } from '../api/client';

export function useAnalytics(playerId, season = 2025) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    get(`/players/${playerId}/analytics?season=${season}`)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setData(null); setLoading(false); });
  }, [playerId, season]);

  return { data, loading };
}

export function useDefenseSchedule(playerId, season = 2025) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    get(`/defense/schedule/${playerId}?season=${season}`)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setData(null); setLoading(false); });
  }, [playerId, season]);

  return { data, loading };
}
