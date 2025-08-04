use crate::types::match_data::MatchData;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
#[serde(tag = "type")]
pub enum Responses {
    Puuid(PuuidData),
    Match(MatchData),
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PuuidData {
    pub puuid: String,
    pub game_name: String,
    pub tag_line: String,
}
