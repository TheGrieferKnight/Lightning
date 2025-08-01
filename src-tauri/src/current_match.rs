use crate::api::get_puuid_simple;
use crate::api::riot::{fetch_data, load_puuid};
use crate::types::response::Responses;
use crate::types::{match_data, MatchData, Participant};

#[tauri::command]
pub async fn main(app: tauri::AppHandle) -> Result<Participant, String> {
    // Get Puuid
    // let puuid_response: Responses = fetch_data(&app, "Puuid").await?;
    // let mut puuid: String = String::from("");
    // if let Responses::Puuid(pq) = puuid_response {
    //     puuid = pq.puuid;
    // }

    let puuid = get_puuid_simple().await?;

    // Get Match Data
    let match_data_response: Responses = fetch_data(&app, "CurrentMatch").await?;
    println!("Hello {:?}", match_data_response);

    let match_data = match match_data_response {
        Responses::Match(pq) => pq,
        _ => return Err(String::from("Expected match data")),
    };

    println!("Hello {:#?}", match_data.participants);
    // ...
    for participant in match_data.participants {
        if participant.puuid == puuid {
            println!("Haiiiiii {:#?}", participant);
            return Ok(participant);
        }
    }

    Err(String::from("no"))
}

#[tauri::command]
pub async fn get_summoner_spells(app: tauri::AppHandle) -> Result<Vec<(u32, u32)>, String> {
    let puuid = load_puuid(&app).await?;

    let match_data_response: Responses = fetch_data(&app, "CurrentMatch").await?;
    // println!("Hello {:?}", match_data_response);

    let match_data = match match_data_response {
        Responses::Match(pq) => pq,
        _ => return Err(String::from("Expected match data")),
    };

    let mut team_id: u32 = 100;

    for participant in &match_data.participants {
        if participant.puuid == puuid {
            team_id = participant.team_id;
        }
    }

    let mut spell_ids: Vec<(u32, u32, u32)> = Vec::new();

    for participant in &match_data.participants {
        if participant.team_id == team_id {
            spell_ids.push((
                participant.spell1_id,
                participant.spell2_id,
                participant.champion_id,
            ));
        }
    }

    Ok(spell_ids)
}
