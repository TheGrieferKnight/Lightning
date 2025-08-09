// src/types/dashboard.ts

export interface MatchHistoryItemProps {
  match: Match;
  path: string; // path to local images
}

export interface Rank {
  tier: string; // e.g., "GOLD", "PLATINUM"
  division: string; // e.g., "I", "II", "III", "IV"
  lp: number; // League Points
}

export interface SummonerData {
  displayName: string;
  level: number;
  profileIconId: number;
  profileIconPath: string;
  rank: Rank;
  winRate: number; // percentage (0-100)
  recentGames: number;
  favoriteRole: string; // e.g., "ADC", "Mid", "Top"
  mainChampion: string;
}

export interface Match {
  id: number;
  champion: string;
  result: "Victory" | "Defeat";
  kda: string; // e.g., "12/3/7"
  duration: string; // e.g., "28:45"
  gameMode: string; // e.g., "Ranked Solo"
  timestamp: string; // e.g., "2 hours ago"
  cs: number; // creep score
}

export interface ChampionMastery {
  name: string;
  level: number; // mastery level (1-7)
  points: number; // mastery points
  icon: string; // could be emoji or URL
}

export interface LiveGameData {
  gameMode: string;
  champion: string;
  gameTime: string; // e.g., "15:42"
  performanceScore: number; // e.g., 8.2
  progress: number; // percentage (0-100)
}

export interface DashboardStats {
  totalGames: number;
  avgGameTime: string; // e.g., "31:24"
}

export interface DashboardData {
  summoner: SummonerData;
  matches: Match[];
  championMastery: ChampionMastery[];
  liveGame: LiveGameData;
  stats: DashboardStats;
  imagePath: string;
}
