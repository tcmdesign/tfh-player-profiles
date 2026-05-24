import { useState, useEffect } from 'react';
import { get } from '../api/client';

const SEASON_2025 = 2025;
const SEASON_2024 = 2024;

// activePill: 's2025' | 's2024' | 'career' | null (null = use slider)
// sliderN: number of recent weeks to show when pill is null
export function useFilteredStats(playerId, activePill, sliderN, recentStats) {
  const [stats,   setStats]   = useState(recentStats || []);
  const [loading, setLoading] = useState(false);

  // Slider mode — just slice local data, no fetch
  useEffect(() => {
    if (activePill) return;
    setStats((recentStats || []).slice(0, sliderN));
  }, [activePill, sliderN, recentStats]);

  // Pill mode — fetch from API
  useEffect(() => {
    if (!activePill || !playerId) return;

    setLoading(true);
    let url;
    if (activePill === 's2025')        url = `/players/${playerId}/stats?season=${SEASON_2025}&limit=22`;
    else if (activePill === 's2024')   url = `/players/${playerId}/stats?season=${SEASON_2024}&limit=22`;
    else if (activePill === 'career')  url = `/players/${playerId}/stats?limit=200`;
    else return;

    get(url)
      .then(d => { setStats(d.stats || []); setLoading(false); })
      .catch(() => { setStats(recentStats || []); setLoading(false); });
  }, [activePill, playerId]);

  return { stats, loading };
}

export function computeMetrics(statsArr) {
  if (!statsArr?.length) return { avg: null, avgTargets: null, count: 0 };
  const pts     = statsArr.map(s => parseFloat(s.fantasy_pts) || 0);
  const targets = statsArr.map(s => s.targets || 0);
  const avg     = parseFloat((pts.reduce((a, b) => a + b, 0) / pts.length).toFixed(2));
  const avgTargets = parseFloat((targets.reduce((a, b) => a + b, 0) / targets.length).toFixed(1));
  return { avg, avgTargets, count: statsArr.length };
}
