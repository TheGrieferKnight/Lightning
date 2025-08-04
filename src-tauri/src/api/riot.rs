use crate::api::lcu;
use crate::types::match_data::MatchData;
use crate::types::response::{PuuidData, Responses};
use reqwest::{self, Error};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

pub async fn save_puuid(app: &tauri::AppHandle, puuid: &String) -> Result<(), String> {
    let app_data_dir: PathBuf = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to save PUUID: {e}"))?;

    println!("Saving to {app_data_dir:?}");

    // Create directory if it doesn't exist
    fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data directory: {e}"))?;

    let puuid_file = app_data_dir.join("puuid.txt");
    fs::write(puuid_file, puuid).map_err(|e| format!("Failed to write PUUID: {e}"))?;

    Ok(())
}

pub async fn load_file(app: &tauri::AppHandle, filename: &str) -> Result<String, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to load PUUID: {e}"))?;

    let puuid_file = app_data_dir.join(filename);

    println!("Loading Puuid from {puuid_file:?}");

    if puuid_file.exists() {
        println!("File loaded");
        fs::read_to_string(puuid_file).map_err(|e| format!("Failed to read PUUID: {e}"))
    } else {
        println!("File not loaded");
        Err("PUUID file not found".to_string())
    }
}

pub async fn load_puuid(app: &tauri::AppHandle) -> Result<String, String> {
    return load_file(app, "puuid.txt").await;
}

pub async fn fetch_puuid(app: &tauri::AppHandle) -> Result<String, String> {
    let url: String =
        String::from("https://riot-api-proxy-lightnings-projects-ba45f9d4.vercel.app/api/riot");

    let region: String = String::from("europe"); // Or wherever your account region is

    let game_name: String = lcu::get_game_name_simple().await?;

    let tag_line: String = lcu::get_tag_line_simple().await?;

    let endpoint = format!("/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}");

    let payload = serde_json::json!({
        "endpoint": endpoint,
        "region": region
    });

    let client = reqwest::Client::new();

    let response = client
        .post(&url)
        .header(
            "x-vercel-protection-bypass",
            "4gSz0EXtXJyTt7cxfCCH46mlH24t1J6l",
        )
        .json(&payload)
        .send()
        .await
        .map_err(|e: Error| format!("Request failed: {e}"))?;

    let status = response.status();

    if !status.is_success() {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Failed to read error response".to_string());
        return Err(format!("PUUID fetch error {status}: {error_text}"));
    }

    let response_text: String = response
        .text()
        .await
        .map_err(|e: Error| format!("Failed to read PUUID response: {e}"))?;

    let puuid_data: PuuidData = serde_json::from_str(&response_text)
        .map_err(|e| format!("Failed to parse PUUID JSON: {e}. Response: {response_text}",))?;

    save_puuid(app, &puuid_data.puuid).await?;

    Ok(puuid_data.puuid)
}

pub async fn fetch_data(app: &tauri::AppHandle, data_to_fetch: &str) -> Result<Responses, String> {
    let game_region: String = String::from("euw1");

    let region: String = String::from("europe");

    let url: String =
        String::from("https://riot-api-proxy-lightnings-projects-ba45f9d4.vercel.app/api/riot");

    let puuid: String = fetch_puuid(app).await?;

    println!("Raw PUUID response: {puuid}");

    let payload;

    match data_to_fetch {
        "CurrentMatch" => {
            let endpoint: String = format!("/lol/spectator/v5/active-games/by-summoner/{puuid}");
            payload = serde_json::json!({
                "endpoint": endpoint,
                "region": game_region
            });
        }
        "MatchHistory" => {
            let endpoint: String = format!("/lol/spectator/v5/active-games/by-summoner/{puuid}");
            payload = serde_json::json!({
                "endpoint":  endpoint,
                "region": game_region
            });
        }
        "Mastery" => {
            let endpoint: String =
                format!("/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}/top");
            payload = serde_json::json!({
                "endpoint": endpoint,
                "region": game_region
            });
        }
        "Puuid" => {
            let game_name: String = lcu::get_game_name_simple().await?;
            let tag_line: String = lcu::get_tag_line_simple().await?;
            let endpoint = format!("/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}");
            payload = serde_json::json!({
                "endpoint": endpoint,
                "region": region
            });
        }
        _ => {
            let endpoint = format!("/lol/spectator/v5/active-games/by-summoner/{puuid}");
            payload = serde_json::json!({"endpoint": endpoint, "region":game_region});
        }
    }

    let client = reqwest::Client::new();

    println!("Making request to: {url}");

    let response = client
        .post(&url)
        .header(
            "x-vercel-protection-bypass",
            "4gSz0EXtXJyTt7cxfCCH46mlH24t1J6l",
        )
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Request failed: {e}"))?;

    let status = response.status();

    println!("Response status: {status}");

    if !status.is_success() {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Failed to read error response".to_string());

        return Err(match status.as_u16() {
            401 => format!("Unauthorized - Check your API key. Error: {error_text}"),
            403 => format!("Forbidden - API key may be expired or invalid. Error: {error_text}"),
            404 => format!("Player not found or not currently in game. Error: {error_text}"),
            429 => format!("Rate limit exceeded. Error: {error_text}"),
            500..=599 => format!("Riot API server error ({status}). Error: {error_text}"),
            _ => format!("HTTP error {error_text}: {status}"),
        });
    }

    let response_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {e}"))?;

    println!("Response body length: {} characters", response_text.len());
    println!(
        "First 50 characters of response: {}",
        &response_text.chars().take(50).collect::<String>()
    );

    // TODO: Add parsing for other responses
    // Parse the JSON responses
    let data = match data_to_fetch {
        "Puuid" => {
            let puuid_data: PuuidData = serde_json::from_str(&response_text).map_err(|e| {
                format!("Failed to parse PUUID JSON: {e}. Response: {response_text}")
            })?;
            println!("{:?}", puuid_data.puuid);
            save_puuid(app, &puuid_data.puuid).await?;
            Responses::Puuid(puuid_data)
        }
        "CurrentMatch" => {
            let match_data: MatchData = serde_json::from_str(&response_text).map_err(|e| {
                format!("Failed to parse MatchData: {e}. Response: {response_text}")
            })?;
            Responses::Match(match_data)
        }
        _ => return Err(format!("Unknown data type: {data_to_fetch}")),
    };
    println!("{data:?}");
    Ok(data)
}
