// src/data/mockData.ts

import { SummonerData, Match, ChampionMastery, LiveGameData, DashboardData } from '../types/dashboard';

export const mockSummonerData: SummonerData = {
  displayName: "RiftMaster2024",
  level: 87,
  profileIconId: 4371,
  rank: { tier: "GOLD", division: "II", lp: 64 },
  winRate: 73,
  recentGames: 15,
  favoriteRole: "ADC",
  mainChampion: "Jinx",
};

export const mockMatchHistory: Match[] = [
  {
    id: 1,
    champion: "Jinx",
    result: "Victory",
    kda: "12/3/7",
    duration: "28:45",
    gameMode: "Ranked Solo",
    timestamp: "2 hours ago",
    cs: 287,
  },
  {
    id: 2,
    champion: "Caitlyn",
    result: "Defeat",
    kda: "8/6/4",
    duration: "35:12",
    gameMode: "Ranked Solo",
    timestamp: "4 hours ago",
    cs: 245,
  },
  {
    id: 3,
    champion: "Vayne",
    result: "Victory",
    kda: "15/2/9",
    duration: "42:33",
    gameMode: "Ranked Solo",
    timestamp: "6 hours ago",
    cs: 312,
  },
  {
    id: 4,
    champion: "Ezreal",
    result: "Victory",
    kda: "9/4/12",
    duration: "31:28",
    gameMode: "Ranked Solo",
    timestamp: "1 day ago",
    cs: 201,
  },
  {
    id: 5,
    champion: "Kai'Sa",
    result: "Defeat",
    kda: "6/8/3",
    duration: "26:15",
    gameMode: "Ranked Solo",
    timestamp: "1 day ago",
    cs: 178,
  },
];

export const mockChampionMastery: ChampionMastery[] = [
  { name: "Jinx", level: 7, points: 284750, icon: "🎯" },
  { name: "Caitlyn", level: 6, points: 167432, icon: "🔫" },
  { name: "Vayne", level: 5, points: 89234, icon: "🏹" },
  { name: "Ezreal", level: 4, points: 45678, icon: "✨" },
];

export const mockLiveGameData: LiveGameData = {
  gameMode: "Ranked Solo/Duo",
  champion: "Jinx",
  gameTime: "15:42",
  performanceScore: 8.2,
  progress: 65,
};

export const mockDashboardData: DashboardData = {
  summoner: mockSummonerData,
  matches: mockMatchHistory,
  championMastery: mockChampionMastery,
  liveGame: mockLiveGameData,
  stats: {
    totalGames: 156,
    avgGameTime: "31:24",
  },
};