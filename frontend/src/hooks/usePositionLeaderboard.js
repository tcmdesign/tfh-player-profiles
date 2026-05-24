import { useState, useEffect } from 'react';
import { get } from '../api/client';

// Returns sorted descending arrays of avg_pts and avg_targets for a position.
// Used to compute real-time rank as the stats filter changes.
export function usePositionLeaderboard(position, season) {
  const [leaderboard, setLeaderboard] = useState(null);

  useEffect(() => {
    if (!position) return;
    const qs = season ? `?position=${position}&season=${season}` : `?position=${position}`;
    get(`/players/leaderboard${qs}`)
      .then(d  => setLeaderboard(d))
      .catch(() => setLeaderboard(null));
  }, [position, season]);

  return leaderboard;
}

// Given a value and a sorted-descending array, returns the 1-based rank.
export function computeRank(value, sortedDesc) {
  if (value == null || !sortedDesc?.length) return null;
  const v = parseFloat(value);
  if (isNaN(v)) return null;
  const idx = sortedDesc.findIndex(x => v >= x);
  return idx === -1 ? sortedDesc.length + 1 : idx + 1;
}
