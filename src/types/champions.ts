export type ChampionRole = "Top" | "Jungle" | "Mid" | "ADC" | "Support";

export interface ChampionTierData {
  championId: number;
  name: string;
  iconUrl: string;
  role: ChampionRole;
  tier: "S+" | "S" | "A" | "B" | "C" | "D";
  winRate: number;
  pickRate: number;
  banRate: number;
  matchesPlayed: number;
}

export interface ChampionTierList {
  role: ChampionRole;
  champions: ChampionTierData[];
}
