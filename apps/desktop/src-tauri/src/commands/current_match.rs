use crate::api::lcu::{get_game_name_simple, get_tag_line_simple};
use crate::api::riot::{DataToFetch, fetch_data, fetch_puuid};
use crate::types::{match_data::CurrentGameParticipant, response::Responses};

pub trait ToStringErr<T> {
    fn string_err(self) -> Result<T, String>;
}

impl<T, E: std::fmt::Display> ToStringErr<T> for Result<T, E> {
    fn string_err(self) -> Result<T, String> {
        self.map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub async fn get_current_summoner(_app: tauri::AppHandle) -> Result<String, String> {
    let game_name = get_game_name_simple().await.string_err()?;

    let tag_line = get_tag_line_simple().await.string_err()?;

    let summoner_name = format!("{game_name}#{tag_line}");

    Ok(summoner_name)
}

/// Get the current player's participant data.
#[tauri::command]
pub async fn get_current_player(app: tauri::AppHandle) -> Result<CurrentGameParticipant, String> {
    let puuid = fetch_puuid(&app).await.string_err()?;

    let Responses::Match(match_data) = fetch_data(&app, DataToFetch::CurrentMatch)
        .await
        .string_err()?
    else {
        return Err("Expected match data".into());
    };

    match_data
        .participants
        .into_iter()
        .find(|p| p.puuid == puuid)
        .ok_or_else(|| "Player not found in match".into())
}

/// Get the current match data.
#[tauri::command]
pub async fn get_current_match_data(app: tauri::AppHandle) -> Result<Responses, String> {
    fetch_data(&app, DataToFetch::CurrentMatch)
        .await
        .string_err()
}

/// Get summoner spells for the player's team.
#[tauri::command]
pub async fn get_summoner_spells(app: tauri::AppHandle) -> Result<Vec<(u32, u32, u32)>, String> {
    let puuid = fetch_puuid(&app).await.string_err()?;

    let match_data_response = fetch_data(&app, DataToFetch::CurrentMatch)
        .await
        .string_err()?;

    let Responses::Match(match_data) = match_data_response else {
        return Err("Expected match data".into());
    };

    let team_id = match_data
        .participants
        .iter()
        .find(|p| p.puuid == puuid)
        .map(|p| match p.team_id {
            100 => 200,
            200 => 100,
            _ => 10,
        })
        .ok_or_else(|| "Player not found in match".to_string())?;

    Ok(match_data
        .participants
        .iter()
        .filter(|p| p.team_id == team_id)
        .map(|p| (p.champion_id, p.spell1_id, p.spell2_id))
        .collect())
}
