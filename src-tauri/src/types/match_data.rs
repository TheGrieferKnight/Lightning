use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchData {
    pub game_id: u64,
    pub map_id: u32,
    pub game_mode: String,
    pub game_type: String,
    pub game_queue_config_id: u32,
    pub participants: Vec<Participant>,
    pub observers: Observers,
    pub platform_id: String,
    pub banned_champions: Vec<BannedChampion>,
    pub game_start_time: u64,
    pub game_length: i32,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Participant {
    pub puuid: String,
    pub team_id: u32,
    pub spell1_id: u32,
    pub spell2_id: u32,
    pub champion_id: u32,
    pub profile_icon_id: u32,
    pub riot_id: String,
    pub bot: bool,
    pub game_customization_objects: Vec<Value>,
    pub perks: Perks,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Perks {
    pub perk_ids: Vec<u32>,
    pub perk_style: u32,
    pub perk_sub_style: u32,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Observers {
    pub encryption_key: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BannedChampion {
    pub champion_id: i32, // -1 for no ban
    pub team_id: u32,
    pub pick_turn: u32,
}

impl MatchData {
    /// Check if the game is currently active
    pub fn is_active(&self) -> bool {
        self.game_length < 0 // Negative game length means game is still in progress
    }

    /// Get participant by PUUID
    pub fn find_participant_by_puuid(&self, puuid: &str) -> Option<&Participant> {
        self.participants.iter().find(|p| p.puuid == puuid)
    }

    /// Get enemy team participants for a given player
    pub fn get_enemy_team(&self, player_puuid: &str) -> Vec<&Participant> {
        if let Some(player) = self.find_participant_by_puuid(player_puuid) {
            let enemy_team_id = if player.team_id == 100 { 200 } else { 100 };
            return self
                .participants
                .iter()
                .filter(|p| p.team_id == enemy_team_id)
                .collect();
        }
        Vec::new()
    }
}
