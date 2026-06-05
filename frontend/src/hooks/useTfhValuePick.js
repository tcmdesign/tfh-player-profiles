import { useState, useEffect } from 'react';
import { BASE } from '../api/client';

export function useTfhValuePick(playerId) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    fetch(`${BASE}/tfh/value-pick/${playerId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d  => { setData(d);    setLoading(false); })
      .catch(() => { setData(null); setLoading(false); });
  }, [playerId]);

  return { data, loading };
}
