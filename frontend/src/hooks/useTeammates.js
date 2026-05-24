import { useState, useEffect } from 'react';
import { get } from '../api/client';

export function useTeammates(playerId) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) { setLoading(false); return; }
    setLoading(true);
    get(`/players/${playerId}/teammates`)
      .then(d  => { setData(d);    setLoading(false); })
      .catch(() => { setData(null); setLoading(false); });
  }, [playerId]);

  return { data, loading };
}
