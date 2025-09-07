import { ChampionTierList } from "@lightning/types";

export const mockChampionTierList: ChampionTierList[] = [
  {
    role: "ADC",
    champions: [
      {
        championId: 222,
        name: "Jinx",
        iconUrl: "15.17.1/img/champion/Jinx.png",
        role: "ADC",
        tier: "S+",
        winRate: 54.3,
        pickRate: 23.1,
        banRate: 12.4,
        matchesPlayed: 1234567,
      },
      {
        championId: 51,
        name: "Caitlyn",
        iconUrl: "15.17.1/img/champion/Caitlyn.png",
        role: "ADC",
        tier: "S",
        winRate: 52.1,
        pickRate: 18.4,
        banRate: 8.2,
        matchesPlayed: 987654,
      },
    ],
  },
  {
    role: "Mid",
    champions: [
      {
        championId: 103,
        name: "Ahri",
        iconUrl: "15.17.1/img/champion/Ahri.png",
        role: "Mid",
        tier: "S",
        winRate: 53.2,
        pickRate: 20.1,
        banRate: 9.5,
        matchesPlayed: 876543,
      },
    ],
  },
];
