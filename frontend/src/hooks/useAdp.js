import { useState, useEffect } from 'react';
import { BASE } from '../api/client';

export function useAdp({ scoring = 'ppr', position = 'ALL', limit = 250 } = {}) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ scoring, limit });
    if (position !== 'ALL') params.set('position', position);

    fetch(`${BASE}/adp?${params}`)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [scoring, position, limit]);

  return { data, loading, error };
}

export function useAdpMeta({ scoring = 'ppr' } = {}) {
  const [meta,    setMeta]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/adp/meta?scoring=${scoring}`)
      .then(r => r.json())
      .then(d => { setMeta(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [scoring]);

  return { meta, loading };
}
