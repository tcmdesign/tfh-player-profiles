import { useState, useEffect } from 'react';
import { get } from '../api/client';

export function useTargetDistribution(playerId, season) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    setError(null);

    const params = season ? `?season=${season}` : '';
    get(`/players/${playerId}/targets${params}`)
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [playerId, season]);

  return { data, loading, error };
}
