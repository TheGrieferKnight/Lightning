use crate::api::lcu;
use crate::types::{
    match_data::MatchData,
    response::{PuuidData, Responses},
};
use crate::utils::file::{load_puuid, save_puuid};
use reqwest::Error;

/// Fetch the player's PUUID from Riot API and save it locally.
pub async fn fetch_puuid(app: &tauri::AppHandle) -> Result<String, String> {
    // Try loading from file first
    if let Ok(puuid) = load_puuid(app).await {
        return Ok(puuid);
    }

    let url = "https://riot-api-proxy-lightnings-projects-ba45f9d4.vercel.app/api/riot";
    let region = "europe".to_string();

    let game_name = lcu::get_game_name_simple().await?;
    let tag_line = lcu::get_tag_line_simple().await?;

    let endpoint = format!("/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}");
    let payload = serde_json::json!({
        "endpoint": endpoint,
        "region": region
    });

    let client = reqwest::Client::new();
    let response = client
        .post(url)
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
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("PUUID fetch error {}: {}", status, error_text));
    }

    let puuid_data: PuuidData = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse PUUID JSON: {e}"))?;

    save_puuid(app, &puuid_data.puuid).await?;
    Ok(puuid_data.puuid)
}

/// Fetch various data from Riot API.
pub async fn fetch_data(app: &tauri::AppHandle, data_to_fetch: &str) -> Result<Responses, String> {
    let game_region = "euw1".to_string();
    let region = "europe".to_string();
    let url = "https://riot-api-proxy-lightnings-projects-ba45f9d4.vercel.app/api/riot";

    let puuid = fetch_puuid(app).await?;
    let payload;

    match data_to_fetch {
        "CurrentMatch" => {
            let endpoint = format!("/lol/spectator/v5/active-games/by-summoner/{puuid}");
            payload = serde_json::json!({ "endpoint": endpoint, "region": game_region });
        }
        "Mastery" => {
            let endpoint =
                format!("/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}/top");
            payload = serde_json::json!({ "endpoint": endpoint, "region": game_region });
        }
        "Puuid" => {
            let game_name = lcu::get_game_name_simple().await?;
            let tag_line = lcu::get_tag_line_simple().await?;
            let endpoint = format!("/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}");
            payload = serde_json::json!({ "endpoint": endpoint, "region": region });
        }
        "SummonerName" => {
            let game_name = lcu::get_game_name_simple().await?;
            let tag_line = lcu::get_tag_line_simple().await?;
            payload = serde_json::json!({"SummonerName" : format!("{game_name}#{tag_line}")});
        }
        _ => {
            return Err(format!("Unknown data type: {data_to_fetch}"));
        }
    }

    let client = reqwest::Client::new();
    let response = client
        .post(url)
        .header(
            "x-vercel-protection-bypass",
            "4gSz0EXtXJyTt7cxfCCH46mlH24t1J6l",
        )
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Request failed: {e}"))?;

    let status = response.status();
    if !status.is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("HTTP error {}: {}", status, error_text));
    }

    let response_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {e}"))?;

    match data_to_fetch {
        "Puuid" => {
            let puuid_data: PuuidData = serde_json::from_str(&response_text)
                .map_err(|e| format!("Failed to parse PUUID JSON: {e}"))?;
            save_puuid(app, &puuid_data.puuid).await?;
            Ok(Responses::Puuid(puuid_data))
        }
        "CurrentMatch" => {
            let match_data: MatchData = serde_json::from_str(&response_text)
                .map_err(|e| format!("Failed to parse MatchData: {e}"))?;
            Ok(Responses::Match(match_data))
        }
        _ => Err(format!("Unknown data type: {data_to_fetch}")),
    }
}

/// Fetch raw JSON from Riot API via your proxy.
/// This is similar to `fetch_data` but returns the raw JSON string instead of parsing into `Responses`.
pub async fn fetch_raw(
    _app: &tauri::AppHandle,
    endpoint: &str,
    region: &str,
) -> Result<String, String> {
    let url = "https://riot-api-proxy-lightnings-projects-ba45f9d4.vercel.app/api/riot";

    let payload = serde_json::json!({
        "endpoint": endpoint,
        "region": region
    });

    let client = reqwest::Client::new();
    let response = client
        .post(url)
        .header(
            "x-vercel-protection-bypass",
            "4gSz0EXtXJyTt7cxfCCH46mlH24t1J6l",
        )
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Request failed: {e}"))?;

    let status = response.status();
    if !status.is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("HTTP error {}: {}", status, error_text));
    }
    let responses = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {e}"))?;
    Ok(responses)
}
