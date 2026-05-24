import { useState, useEffect } from 'react';
import { get } from '../api/client';

export function useStatRanks(playerId, season) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    const qs = season ? `?season=${season}` : '';
    get(`/players/${playerId}/stat-ranks${qs}`)
      .then(d  => { setData(d);    setLoading(false); })
      .catch(() => { setData(null); setLoading(false); });
  }, [playerId, season]);

  return { data, loading };
}
