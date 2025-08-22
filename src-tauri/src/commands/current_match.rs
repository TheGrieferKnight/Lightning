use crate::api::lcu::{get_game_name_simple, get_tag_line_simple};
use crate::api::riot::{fetch_data, fetch_puuid};
use crate::types::{match_data::Participant, response::Responses};

#[tauri::command]
pub async fn get_current_summoner(_app: tauri::AppHandle) -> Result<String, String> {
    let game_name = get_game_name_simple().await?;
    let tag_line = get_tag_line_simple().await?;
    let summoner_name = format!("{game_name}#{tag_line}");
    Ok(summoner_name)
}

/// Get the current player's participant data.
#[tauri::command]
pub async fn get_current_player(app: tauri::AppHandle) -> Result<Participant, String> {
    let puuid = fetch_puuid(&app).await?;
    let match_data_response = fetch_data(&app, "CurrentMatch").await?;

    let match_data = match match_data_response {
        Responses::Match(data) => data,
        _ => return Err("Expected match data".into()),
    };

    match_data
        .participants
        .into_iter()
        .find(|p| p.puuid == puuid)
        .ok_or_else(|| "Player not found in match".into())
}

/// Get the current match data.
#[tauri::command]
pub async fn get_match_data(app: tauri::AppHandle) -> Result<Responses, String> {
    fetch_data(&app, "CurrentMatch").await
}

/// Get summoner spells for the player's team.
#[tauri::command]
pub async fn get_summoner_spells(app: tauri::AppHandle) -> Result<Vec<(u32, u32, u32)>, String> {
    let puuid = fetch_puuid(&app).await?;
    /*
    let puuid = String::from(
        "sWa0-CXDSMK9arBkxHP-AN-dh4vSiJkmnO_SF0NuPYtI5NvLNm6mvl1OOC6AO8VcBe7SDKJmOUJtjw",
    );
    */
    let match_data_response = fetch_data(&app, "CurrentMatch").await?;

    let match_data = match match_data_response {
        Responses::Match(data) => data,
        _ => return Err("Expected match data".into()),
    };

    let participants = match_data.participants.iter();

    let mut team_id = 0;

    for p in participants.clone() {
        if p.puuid == puuid {
            team_id = p.team_id;
        }
    }

    match team_id {
        100 => team_id = 200,
        200 => team_id = 100,
        _ => team_id = 10,
    }

    Ok(participants
        .filter(|p| p.team_id == team_id)
        .map(|p| (p.champion_id, p.spell1_id, p.spell2_id))
        .collect())
}
