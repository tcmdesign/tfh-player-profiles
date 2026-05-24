import { useState, useEffect } from 'react';
import { BASE } from '../api/client';

export function useAdpHistory(playerId, { scoring = 'ppr' } = {}) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    setError(null);

    fetch(`${BASE}/adp/player/${playerId}/history?scoring=${scoring}`)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [playerId, scoring]);

  return { data, loading, error };
}
