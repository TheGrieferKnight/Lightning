use crate::types::match_data::CurrentGameInfo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
#[serde(tag = "type")]
pub enum Responses {
    Puuid(PuuidData),
    Match(CurrentGameInfo),
    SummonerName(SummonerNameData),
    Mastery(Vec<ChampionMasteryDto>),
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SummonerNameData {
    pub game_name: String,
    pub tag_line: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PuuidData {
    pub puuid: String,
    pub game_name: String,
    pub tag_line: String,
}

use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChampionMasteryDto {
    pub puuid: String, // 78-char encrypted string
    pub chest_granted: Option<bool>,
    pub champion_id: i64,
    pub champion_level: i32,
    pub champion_points: i32,
    pub last_play_time: i64, // Unix ms timestamp
    pub champion_points_since_last_level: i64,
    pub champion_points_until_next_level: i64,
    pub mark_required_for_next_level: i32,
    pub tokens_earned: i32,
    pub champion_season_milestone: i32,
    pub milestone_grades: Option<Vec<String>>,
    pub next_season_milestone: Option<NextSeasonMilestonesDto>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NextSeasonMilestonesDto {
    pub require_grade_counts: HashMap<String, i32>, // dynamic object -> map
    pub reward_marks: i32,
    pub bonus: bool,
    pub reward_config: Option<RewardConfigDto>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RewardConfigDto {
    pub reward_value: String,
    pub reward_type: String,
    pub maximum_reward: i32,
}

impl Default for ChampionMasteryDto {
    fn default() -> Self {
        Self {
            puuid: String::new(),
            champion_points_until_next_level: 0,
            chest_granted: Some(false),
            champion_id: 0,
            last_play_time: 0,
            champion_level: 0,
            champion_points: 0,
            champion_points_since_last_level: 0,
            mark_required_for_next_level: 0,
            champion_season_milestone: 0,
            next_season_milestone: None,
            tokens_earned: 0,
            milestone_grades: None,
        }
    }
}
