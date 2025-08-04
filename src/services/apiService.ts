// src/services/apiService.ts
import { invoke } from "@tauri-apps/api/core";
import { SummonerData, Match, ChampionMastery, LiveGameData } from '../types/dashboard';

// Configuration
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://your-api-endpoint.com',
  RIOT_API_KEY: process.env.REACT_APP_RIOT_API_KEY || '',
  TIMEOUT: 10000,
};

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public endpoint: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const controller = new AbortController();
  
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Riot-Token': API_CONFIG.RIOT_API_KEY,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText, endpoint);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout', endpoint);
    }
    
    throw new ApiError(500, 'Network error', endpoint);
  }
}

// API Service Class
export class ApiService {
  // Fetch summoner data by name
  static async fetchSummonerByName(summonerName: string, region: string = 'na1'): Promise<SummonerData> {
    // Example endpoint - replace with your actual API structure
    const endpoint = `/riot/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`;
    
    try {
      const data = await apiRequest<any>(endpoint);
      
      // Transform the API response to match SummonerData interface
      return {
        displayName: data.name,
        level: data.summonerLevel,
        profileIconId: data.profileIconId,
        rank: {
          tier: 'GOLD', //TODO: Fetch from rank API
          division: 'II',
          lp: 64,
        },
        winRate: 73, //TODO: Calculate from match history
        recentGames: 15,
        favoriteRole: 'ADC', //TODO: Calculate from match history
        mainChampion: 'Jinx', //TODO: Calculate from champion mastery
      };
    } catch (error) {
      console.error('Failed to fetch summoner data:', error);
      throw error;
    }
  }

  //TODO: Fetch summoner's PUUID
  static async fetchSummonerPuuid(summonerName: string, region: string = 'na1'): Promise<string> {
    const endpoint = `/riot/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`;
    const data = await apiRequest<{ puuid: string }>(endpoint);
    return data.puuid;
  }

  //TODO: Fetch match history
  static async fetchMatchHistory(puuid: string, count: number = 20, region: string = 'americas'): Promise<Match[]> {
    try {
      //TODO: Get match IDs
      const matchIdsEndpoint = `/riot/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`;
      const matchIds = await apiRequest<string[]>(matchIdsEndpoint);

      // Then fetch detailed match data for each match
      const matchPromises = matchIds.slice(0, 5).map(async (matchId) => {
        const matchEndpoint = `/riot/match/v5/matches/${matchId}`;
        const matchData = await apiRequest<any>(matchEndpoint);
        
        //TODO: Transform match data to Match interface
        //TODO: Extract the participant data for the specific summoner
        return {
          id: parseInt(matchId.split('_')[1]), //TODO: Extract numeric ID
          champion: 'Champion Name', //TODO: Extract from participants
          result: Math.random() > 0.5 ? 'Victory' as const : 'Defeat' as const,
          kda: '10/2/8', //TODO: Calculate from participant stats
          duration: `${Math.floor(matchData.info.gameDuration / 60)}:${(matchData.info.gameDuration % 60).toString().padStart(2, '0')}`,
          gameMode: matchData.info.gameMode,
          timestamp: new Date(matchData.info.gameCreation).toLocaleString(),
          cs: 200, //TODO: Extract from participant stats
        };
      });

      return await Promise.all(matchPromises);
    } catch (error) {
      console.error('Failed to fetch match history:', error);
      throw error;
    }
  }

  //TODO: Fetch champion mastery
  static async fetchChampionMastery(puuid: string, region: string = 'na1'): Promise<ChampionMastery[]> {
    try {
      //TODO: Get encrypted summoner ID for masteries
      const summoner = await apiRequest<{ id: string }>(`/riot/summoner/v4/summoners/by-puuid/${puuid}`);
      const endpoint = `/riot/champion-mastery/v4/champion-masteries/by-summoner/${summoner.id}`;
      
      const masteryData = await apiRequest<any[]>(endpoint);
      
      return masteryData.slice(0, 4).map((mastery, index) => ({
        name: `Champion ${mastery.championId}`, //TODO: Integrate with Champion Name to ID mapping
        level: mastery.championLevel,
        points: mastery.championPoints,
        icon: ['🎯', '🔫', '🏹', '✨'][index], // Placeholder icons
      }));
    } catch (error) {
      console.error('Failed to fetch champion mastery:', error);
      throw error;
    }
  }

  //TODO: Fetch live game data
  static async fetchLiveGame(summonerName: string, region: string = 'na1'): Promise<LiveGameData | null> {
    try {
      //TODO: Get summoner ID
      const summoner = await apiRequest<{ id: string }>(`/riot/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`);
      const endpoint = `/riot/spectator/v4/active-games/by-summoner/${summoner.id}`;
      
      const gameData = await apiRequest<any>(endpoint);
      
      if (!gameData) return null;
      
      //TODO: Find the summoner's participant data
      const participant = gameData.participants.find((p: any) => p.summonerId === summoner.id);
      
      return {
        gameMode: gameData.gameMode,
        champion: `Champion ${participant?.championId}`, //TODO: Map champion ID to name
        gameTime: `${Math.floor(gameData.gameLength / 60)}:${(gameData.gameLength % 60).toString().padStart(2, '0')}`,
        performanceScore: 8.5, //TODO: Calculate with formula like KDA in relation to Gold per minute and CS per Minute
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null; // No active game
      }
      console.error('Failed to fetch live game:', error);
      throw error;
    }
  }

  //TODO: Fetch ranked stats
  static async fetchRankedStats(summonerName: string, region: string = 'na1') {
    try {
      const summoner = await apiRequest<{ id: string }>(`/riot/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`);
      const endpoint = `/riot/league/v4/entries/by-summoner/${summoner.id}`;
      
      const rankedData = await apiRequest<any[]>(endpoint);
      const soloQueue = rankedData.find(entry => entry.queueType === 'RANKED_SOLO_5x5');
      
      if (!soloQueue) {
        return {
          tier: 'UNRANKED',
          division: '',
          lp: 0,
          wins: 0,
          losses: 0,
        };
      }
      
      return {
        tier: soloQueue.tier,
        division: soloQueue.rank,
        lp: soloQueue.leaguePoints,
        wins: soloQueue.wins,
        losses: soloQueue.losses,
      };
    } catch (error) {
      console.error('Failed to fetch ranked stats:', error);
      throw error;
    }
  }
}
