// src/types/dashboard.ts
import { LucideIcon } from "lucide-react";

export interface ChampionMastery {
  icon: React.ReactNode; // Can be an <img> or an icon component
  name: string;
  level: number;
  points: number;
}

export interface ChampionMasteryCardProps {
  champion: ChampionMastery;
}

export interface StatCardProps {
  icon: LucideIcon; // Icon component from lucide-react
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number; // Positive or negative percentage
  color?: ColorType; // Defaults to "blue"
}

export type ColorType =
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "purple"
  | "pink"
  | "indigo"
  | "orange";

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
