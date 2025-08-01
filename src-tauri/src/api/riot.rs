use crate::api::lcu;
use crate::types::response::*;
use crate::types::{MatchData, Participant};
use reqwest::{self};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

// Add this function to save PUUID
pub async fn save_puuid(app: tauri::AppHandle, puuid: String) -> Result<(), String> {
    let app_data_dir: PathBuf = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to save PUUID: {}", e))?;

    println!("Saving {:?}", app_data_dir);
    // Create directory if it doesn't exist
    fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data directory: {}", e))?;

    let puuid_file = app_data_dir.join("puuid.txt");
    fs::write(puuid_file, puuid).map_err(|e| format!("Failed to write PUUID: {}", e))?;

    Ok(())
}

// Add this function to load PUUID
pub async fn load_puuid(app: &tauri::AppHandle) -> Result<String, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to load PUUID: {}", e))?;

    let puuid_file = app_data_dir.join("puuid.txt");

    println!("Loading Puuid from {:?}", puuid_file);

    if puuid_file.exists() {
        println!("File loaded");
        fs::read_to_string(puuid_file).map_err(|e| format!("Failed to read PUUID: {}", e))
    } else {
        println!("File not loaded");
        Err("PUUID file not found".to_string())
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn fetch_data(app: tauri::AppHandle, data_to_fetch: &str) -> Result<Responses, String> {
    let api_key = String::from("RGAPI-655f426c-9467-4716-9ef2-abce386c1352");
    let puuid: String = match load_puuid(&app).await {
        Ok(p) => p,
        Err(e) => {
            eprintln!("Failed to load puuid: {}", e);
            "".to_string()
        }
    };
    let game_region: String = String::from("euw1");
    let region: String = String::from("europe");
    let url: String;

    println!("Raw PUUID response: {}", puuid);

    match data_to_fetch {
        "CurrentMatch" => {
            url = String::from(format!(
                "https://{}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/{}",
                game_region, puuid
            ));
        }
        "MatchHistory" => {
            url = String::from(format!(
                "https://{}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/{}",
                game_region, puuid
            ));
        }
        "Mastery" => {
            url= String::from(format!(
                "https://{}.api.riotgames.com//lol/champion-mastery/v4/champion-masteries/by-puuid/{}/top",
                game_region, puuid
            ));
        }
        "PUUID" => {
            let game_name = lcu::get_game_name_simple().await?;
            let tag_line = lcu::get_tag_line_simple().await?;

            url = String::from(format!(
                "https://{}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{}/{}",
                region, game_name, tag_line
            ));
        }
        _ => {
            url = String::from("String");
        }
    }

    let client = reqwest::Client::new();

    println!("Making request to: {}", url);

    let response = client
        .get(&url)
        .header("X-Riot-Token", &api_key)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let status = response.status();
    println!("Response status: {}", status);

    // Check if the response is successful
    if !status.is_success() {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Failed to read error response".to_string());

        return Err(match status.as_u16() {
            401 => format!("Unauthorized - Check your API key. Error: {}", error_text),
            403 => format!(
                "Forbidden - API key may be expired or invalid. Error: {}",
                error_text
            ),
            404 => format!(
                "Player not found or not currently in game. Error: {}",
                error_text
            ),
            429 => format!("Rate limit exceeded. Error: {}", error_text),
            500..=599 => format!("Riot API server error ({}). Error: {}", status, error_text),
            _ => format!("HTTP error {}: {}", status, error_text),
        });
    }

    let response_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    println!("Response body length: {} characters", response_text.len());
    println!(
        "First 200 characters of response: {}",
        &response_text.chars().take(200).collect::<String>()
    );

    // Parse the JSON response into MatchData
    let data = match data_to_fetch {
        "PUUID" => {
            let puuid_data: PuuidData = serde_json::from_str(&response_text).map_err(|e| {
                format!(
                    "Failed to parse PUUID JSON: {}. Response: {}",
                    e, response_text
                )
            })?;
            println!("{:?}", puuid_data.puuid);
            save_puuid(app, String::from("Banansanana")).await?;
            Responses::Puuid(puuid_data)
        }
        _ => return Err(format!("Unknown data type: {}", data_to_fetch)),
        /*
        "SUMMONER" => {
            let summoner_data: SummonerData =
                serde_json::from_str(&response_text).map_err(|e| {
                    format!(
                        "Failed to parse Summoner JSON: {}. Response: {}",
                        e, response_text
                    )
                })?;
            MatchData::Summoner(summoner_data)
        }
        "MATCH" => {
            let match_data: GameMatchData = serde_json::from_str(&response_text).map_err(|e| {
                format!(
                    "Failed to parse Match JSON: {}. Response: {}",
                    e, response_text
                )
            })?;

            MatchData::Match(data)
        }
         */
    };
    println!("{:?}", data);
    Ok(data)
}

async fn fetch_match_data() -> Result<MatchData, String> {
    let api_key = String::from("RGAPI-ab4310dd-6e82-4e90-8ae7-804cd71466ec");
    let game_region: String = String::from("euw1");
    let puuid: String = lcu::get_puuid_simple().await?;

    println!("Raw PUUID response: {}", puuid);

    let client = reqwest::Client::new();

    let url: String = format!(
        "https://{}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/{}",
        game_region, puuid
    );

    println!("Making request to: {}", url);

    let response = client
        .get(&url)
        .header("X-Riot-Token", &api_key)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let status = response.status();
    println!("Response status: {}", status);

    // Check if the response is successful
    if !status.is_success() {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Failed to read error response".to_string());

        return Err(match status.as_u16() {
            401 => format!("Unauthorized - Check your API key. Error: {}", error_text),
            403 => format!(
                "Forbidden - API key may be expired or invalid. Error: {}",
                error_text
            ),
            404 => format!(
                "Player not found or not currently in game. Error: {}",
                error_text
            ),
            429 => format!("Rate limit exceeded. Error: {}", error_text),
            500..=599 => format!("Riot API server error ({}). Error: {}", status, error_text),
            _ => format!("HTTP error {}: {}", status, error_text),
        });
    }

    let response_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    println!("Response body length: {} characters", response_text.len());
    println!(
        "First 200 characters of response: {}",
        &response_text.chars().take(200).collect::<String>()
    );

    // Parse the JSON response into MatchData
    let match_data: MatchData = serde_json::from_str(&response_text).map_err(|e| {
        format!(
            "Failed to parse match data JSON: {}. Response was: {}",
            e, response_text
        )
    })?;

    Ok(match_data)
}

pub async fn parse_match_data() -> Result<(), String> {
    match fetch_match_data().await {
        Ok(match_data) => {
            println!("Successfully fetched match data!");
            println!("Game ID: {}", match_data.game_id);
            println!("Game Mode: {}", match_data.game_mode);
            println!("Map ID: {}", match_data.map_id);
            println!("Number of participants: {}", match_data.participants.len());

            // Print all participants
            println!("\nParticipants:");
            for (i, participant) in match_data.participants.iter().enumerate() {
                println!(
                    "  {}. {} (Champion: {}, Team: {})",
                    i + 1,
                    participant.riot_id,
                    participant.champion_id,
                    participant.team_id
                );
            }

            // Print banned champions
            println!("\nBanned Champions:");
            for ban in &match_data.banned_champions {
                if ban.champion_id > 0 {
                    println!(
                        "  Champion {} banned by team {} (pick turn {})",
                        ban.champion_id, ban.team_id, ban.pick_turn
                    );
                }
            }

            // Get team information
            let team_100: Vec<&Participant> = match_data
                .participants
                .iter()
                .filter(|p| p.team_id == 100)
                .collect();

            let team_200: Vec<&Participant> = match_data
                .participants
                .iter()
                .filter(|p| p.team_id == 200)
                .collect();

            println!("\nTeam 100 ({} players):", team_100.len());
            for player in team_100 {
                println!("  - {}", player.riot_id);
            }

            println!("\nTeam 200 ({} players):", team_200.len());
            for player in team_200 {
                println!("  - {}", player.riot_id);
            }
        }
        Err(e) => {
            eprintln!("Error fetching match data: {}", e);
        }
    }

    Ok(())
}

/*
async fn get_puuid() -> Result<String, String> {
  let api_key = String::from("RGAPI-ab4310dd-6e82-4e90-8ae7-804cd71466ec");
  let region = String::from("europe");
  let game_name = String::from("Nerodus");
  let tag_line = String::from("EUW");

  let client = reqwest::Client::new();

  let url: String = format!(
    "https://{}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{}/{}",
    region, game_name, tag_line
  );

  println!("Boom: {}", url);

  let response = client
  .get(url)
  .header("X-Riot-Token", &api_key)
  .send()
  .await
  .map_err(|e| e.to_string())?;

let text = response.text().await.map_err(|e| e.to_string())?;

Ok(text)
}
*/
