// src/data/mockData.ts

import {
  SummonerData,
  Match,
  ChampionMastery,
  LiveGameData,
  DashboardData,
  MatchDetails,
  ParticipantMH,
} from "../types/dashboard";

/* -------------------- Mock Summoner -------------------- */
export const mockSummonerData: SummonerData = {
  displayName: "RiftMaster2024",
  level: 87,
  profileIconId: 4371,
  profileIconPath: "assets/profileIcons/4371.png",
  rank: {
    leagueId: "12345",
    puuid: "mock-puuid",
    queueType: "RANKED_SOLO_5x5",
    tier: "GOLD",
    rank: "II",
    leaguePoints: 64,
    wins: 73,
    losses: 27,
    hotStreak: false,
    veteran: false,
    freshBlood: true,
    inactive: false,
  },
  winRate: 73,
  recentGames: 15,
  favoriteRole: "ADC",
  mainChampion: "Jinx",
};

/* -------------------- Mock Match History -------------------- */
const makeParticipant = (
  summonerName: string,
  championName: string,
  kills: number,
  deaths: number,
  assists: number,
): ParticipantMH => ({
  summonerName,
  championName,
  kills,
  deaths,
  assists,
  lane: "BOTTOM",
  item0: 1055,
  item1: 3006,
  item2: 3085,
  item3: 3094,
  item4: 3031,
  item5: 3072,
  item6: 3363,
  totalMinionsKilled: 200,
  totalDamageDealtToChampions: 25000,
});

const mockMatchDetails: MatchDetails = {
  teams: [
    [
      makeParticipant("Blue1", "Jinx", 12, 3, 7),
      makeParticipant("Blue2", "Thresh", 1, 5, 15),
      makeParticipant("Blue3", "LeeSin", 6, 7, 8),
      makeParticipant("Blue4", "Ahri", 9, 4, 10),
      makeParticipant("Blue5", "Shen", 3, 6, 12),
    ],
    [
      makeParticipant("Red1", "Caitlyn", 8, 6, 4),
      makeParticipant("Red2", "Lux", 5, 8, 9),
      makeParticipant("Red3", "Vi", 7, 9, 6),
      makeParticipant("Red4", "Yasuo", 10, 10, 5),
      makeParticipant("Red5", "Darius", 4, 7, 3),
    ],
  ],
  towersDestroyed: [8, 3],
  inhibitorsDestroyed: [2, 0],
  goldEarned: [65000, 54000],
  teamKda: [
    [31, 25, 52],
    [34, 31, 27],
  ],
};

export const mockMatchHistory: Match[] = [
  {
    matchId: "EUW1_1234567890",
    gameId: 1234567890,
    champion: "Jinx",
    result: "Victory",
    kda: "12/3/7",
    duration: "28:45",
    gameMode: "Ranked Solo",
    timestamp: "2 hours ago",
    cs: 287,
    matchDetails: mockMatchDetails,
  },
  {
    matchId: "EUW1_1234567891",
    gameId: 1234567891,
    champion: "Caitlyn",
    result: "Defeat",
    kda: "8/6/4",
    duration: "35:12",
    gameMode: "Ranked Solo",
    timestamp: "4 hours ago",
    cs: 245,
    matchDetails: mockMatchDetails,
  },
];

/* -------------------- Mock Champion Mastery -------------------- */
export const mockChampionMastery: ChampionMastery[] = [
  { name: "Jinx", level: 7, points: 284750, icon: 11 },
  { name: "Caitlyn", level: 6, points: 167432, icon: 11 },
  { name: "Vayne", level: 5, points: 89234, icon: 11 },
  { name: "Ezreal", level: 4, points: 45678, icon: 11 },
];

/* -------------------- Mock Live Game -------------------- */
export const mockLiveGameData: LiveGameData = {
  gameMode: "Ranked Solo/Duo",
  champion: "Jinx",
  gametime: "15:42",
  performanceScore: 8.2,
  progress: 65,
};

/* -------------------- Mock Dashboard -------------------- */
export const mockDashboardData: DashboardData = {
  summoner: mockSummonerData,
  matches: mockMatchHistory,
  championMastery: mockChampionMastery,
  stats: {
    totalGames: 156,
    avgGameTime: "31:24",
  },
  imagePath: "assets",
};
