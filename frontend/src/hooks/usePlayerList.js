import { useState, useEffect } from 'react';
import { get } from '../api/client';

export function usePlayerList(position = 'ALL') {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get(`/players/list?position=${position}`)
      .then(d  => { setData(d);    setLoading(false); })
      .catch(() => { setData(null); setLoading(false); });
  }, [position]);

  return { players: data?.players || [], loading };
}
