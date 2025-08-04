// src/hooks/useDashboardData.ts

import { useState, useEffect } from 'react';
import { DashboardData } from '../types/dashboard';
import { mockDashboardData } from '../data/mockData';

// API service functions TODO: replace with actual API calls
const apiService = {
  //TODO: Replace with actual API endpoint
  async fetchSummonerData(summonerName: string) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockDashboardData.summoner;
  },

  async fetchMatchHistory(puuid: string, count: number = 5) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockDashboardData.matches;
  },

  async fetchChampionMastery(puuid: string) {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockDashboardData.championMastery;
  },

  async fetchLiveGame(summonerName: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return null if no live game, or live game data
    return Math.random() > 0.5 ? mockDashboardData.liveGame : null;
  },

  async fetchStats(puuid: string) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockDashboardData.stats;
  }
};

export const useDashboardData = (summonerName?: string) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    if (!summonerName) {
      // Use mock data when no summoner name provided
      setData(mockDashboardData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [summoner, matches, championMastery, liveGame, stats] = await Promise.all([
        apiService.fetchSummonerData(summonerName),
        apiService.fetchMatchHistory('mock-puuid'), //TODO: Replace with actual puuid
        apiService.fetchChampionMastery('mock-puuid'),
        apiService.fetchLiveGame(summonerName),
        apiService.fetchStats('mock-puuid')
      ]);

      setData({
        summoner,
        matches,
        championMastery,
        liveGame,
        stats
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      // Fallback to mock data on error
      setData(mockDashboardData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [summonerName]);

  const refetch = () => {
    fetchAllData();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};
