import { useState, useEffect, useCallback } from 'react';
import { DashboardData } from '@lightning/types';
import { mockDashboardData } from '@lightning/mock';
import { isTauri, safeInvoke } from '@lightning/utils';

export const useDashboardData = (summonerName?: string) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // In web builds, use mock data and skip Tauri entirely.
      if (!isTauri) {
        setData(mockDashboardData);
        return;
      }

      let name = summonerName;
      if (!name) {
        const player = await safeInvoke<string>('get_current_summoner');
        name = player;
        console.log(
          '[useDashboardData] Current summoner from backend:',
          name
        );
      }

      if (!name) throw new Error('No summoner name available');

      const dashboardData = await safeInvoke<DashboardData>(
        'get_dashboard_data',
        { summonerName: name }
      );

      console.log(
        '[useDashboardData] Dashboard data received:',
        dashboardData
      );
      setData(dashboardData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
      console.error('[useDashboardData] Error:', message);

      // Fallback to mock data for development/web
      setData(mockDashboardData);
    } finally {
      setLoading(false);
    }
  }, [summonerName]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return { data, loading, error, refetch: fetchAllData };
};
