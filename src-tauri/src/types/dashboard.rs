// src-tauri/src/types/dashboard.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SummonerData {
    pub display_name: String,
    pub level: u32,
    pub profile_icon_id: u32,
    pub profile_icon_path: String,
    pub rank: crate::types::data_objects::LeagueEntryDTO,
    pub win_rate: u32,
    pub recent_games: u32,
    pub favorite_role: String,
    pub main_champion: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Match {
    pub match_id: String,
    pub game_id: u64,
    pub champion: String,
    pub result: String,
    pub kda: String,
    pub duration: String,
    pub game_mode: String,
    pub timestamp: String,
    pub cs: u32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChampionMastery {
    pub name: String,
    pub level: u32,
    pub points: u32,
    pub icon: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LiveGameData {
    pub game_mode: String,
    pub champion: String,
    pub game_time: String,
    pub performance_score: f32,
    pub progress: u8,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Stats {
    pub total_games: u32,
    pub avg_game_time: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardData {
    pub summoner: SummonerData,
    pub matches: Vec<Match>,
    pub champion_mastery: Vec<ChampionMastery>,
    pub live_game: Option<LiveGameData>,
    pub stats: Stats,
    pub image_path: String,
}
