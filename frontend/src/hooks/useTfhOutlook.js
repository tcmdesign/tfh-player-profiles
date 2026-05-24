import { useState, useEffect } from 'react';
import { BASE } from '../api/client';

export function useTfhOutlook(playerId) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!playerId) return;
    let cancelled = false;
    setLoading(true);
    fetch(`${BASE}/tfh/outlook/${playerId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [playerId]);

  return { data, loading };
}
