import { useState, useEffect } from 'react';
import { get } from '../api/client';

export function useNgs(playerId, season) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    setError(null);

    // NGS only goes to 2024; always request 2024 if current season is later
    const ngsSeason = season && season < 2025 ? season : 2024;
    get(`/players/${playerId}/ngs?season=${ngsSeason}`)
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [playerId, season]);

  return { data, loading, error };
}
