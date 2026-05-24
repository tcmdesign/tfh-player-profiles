import { useState, useEffect } from 'react';
import { get } from '../api/client';

export function usePlayer(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    get(`/players/${id}`)
      .then(raw => {
        // Parse [START]/[SIT] prefix from insight_text
        if (raw.insight?.insight_text) {
          const match = raw.insight.insight_text.match(/^\[(START|SIT)\] ([\s\S]*)/);
          raw.insight.recommendation = match ? match[1] : 'START';
          raw.insight.text = match ? match[2] : raw.insight.insight_text;
        }
        setData(raw);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  return { data, loading, error };
}
