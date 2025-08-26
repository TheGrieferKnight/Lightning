use anyhow::Result;
use serde::de::DeserializeOwned;
use tauri::AppHandle;

use crate::config::PLATFORM_REGION;
use crate::types::data_objects::{LeagueEntryDTO, MatchDto};
use crate::types::match_data::CurrentGameInfo;
use crate::types::response::{ChampionMasteryDto, PuuidData, Responses, SummonerNameData};
use crate::types::riot_api_client::RiotApiClient;

/// Enum for selecting which data to fetch.
#[allow(dead_code)]
#[derive(Debug, Clone, Copy)]
pub enum DataToFetch {
    CurrentMatch,
    Mastery,
    Puuid,
    SummonerName,
}

/// Private helper: get PUUID (cached or fetch from Riot API).
async fn get_puuid(app: &AppHandle) -> Result<PuuidData> {
    // 1. Try loading from file
    if let Ok(puuid_data) = crate::utils::file::load_puuid(app).await {
        return Ok(puuid_data);
    }

    // 2. Otherwise fetch from Riot API
    const REGION: &str = "europe";
    let client = RiotApiClient::new();

    let game_name = crate::api::lcu::get_game_name_simple().await?;
    let tag_line = crate::api::lcu::get_tag_line_simple().await?;

    let endpoint = format!("/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}");
    let payload = serde_json::json!({ "endpoint": endpoint, "region": REGION });

    let puuid_data: PuuidData = client.post_json(payload).await?;
    crate::utils::file::save_puuid(app, &puuid_data).await?;
    Ok(puuid_data)
}

/// Fetch the player's PUUID string (shortcut).
pub async fn fetch_puuid(app: &AppHandle) -> Result<String> {
    Ok(get_puuid(app).await?.puuid)
}

/// Fetch raw JSON from Riot API via proxy.
pub async fn fetch_raw(endpoint: &str, region: &str) -> Result<String> {
    let client = RiotApiClient::new();
    let payload = serde_json::json!({ "endpoint": endpoint, "region": region });
    client.post_raw(payload).await
}

/// Generic helper to fetch and deserialize JSON.
async fn fetch_json<T: DeserializeOwned>(endpoint: &str, region: &str) -> Result<T> {
    let client = RiotApiClient::new();
    let payload = serde_json::json!({ "endpoint": endpoint, "region": region });
    client.post_json(payload).await
}

/// Fetch summoner basic info.
pub async fn fetch_summoner_basic(puuid: &str) -> Result<serde_json::Value> {
    let endpoint = format!("/lol/summoner/v4/summoners/by-puuid/{puuid}");
    fetch_json(&endpoint, PLATFORM_REGION).await
}

/// Fetch ranked league entries.
pub async fn fetch_league_entries(puuid: &str) -> Result<Vec<LeagueEntryDTO>> {
    let endpoint = format!("/lol/league/v4/entries/by-puuid/{puuid}");
    fetch_json(&endpoint, PLATFORM_REGION).await
}

/// Fetch recent match IDs.
pub async fn fetch_match_ids(puuid: &str, count: usize) -> Result<Vec<String>> {
    let endpoint =
        format!("/lol/match/v5/matches/by-puuid/{puuid}/ids?type=ranked&start=0&count={count}");
    fetch_json(&endpoint, PLATFORM_REGION).await
}

/// Fetch a match by ID.
pub async fn fetch_match_by_id(match_id: &str) -> Result<(MatchDto, String)> {
    let endpoint = format!("/lol/match/v5/matches/{match_id}");
    let json = fetch_raw(&endpoint, PLATFORM_REGION).await?;
    let dto: MatchDto = serde_json::from_str(&json)?;
    Ok((dto, json))
}

/// Fetch top champion mastery.
pub async fn fetch_top_mastery(puuid: &str) -> Result<Vec<ChampionMasteryDto>> {
    let endpoint =
        format!("/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}/top?count=4");
    fetch_json(&endpoint, PLATFORM_REGION).await
}

/// Fetch current live match (if any).
pub async fn fetch_current_match(app: &AppHandle) -> Result<Option<CurrentGameInfo>> {
    match fetch_data(app, DataToFetch::CurrentMatch).await {
        Ok(Responses::Match(data)) => Ok(Some(data)),
        Ok(_) => Ok(None),
        Err(e) => Err(e),
    }
}

/// Fetch various data from Riot API (wrapper for Responses).
pub async fn fetch_data(app: &AppHandle, data_to_fetch: DataToFetch) -> Result<Responses> {
    const GAME_REGION: &str = "euw1";
    let client = RiotApiClient::new();

    match data_to_fetch {
        DataToFetch::SummonerName => {
            let game_name = crate::api::lcu::get_game_name_simple().await?;
            let tag_line = crate::api::lcu::get_tag_line_simple().await?;
            Ok(Responses::SummonerName(SummonerNameData {
                game_name,
                tag_line,
            }))
        }

        DataToFetch::Puuid => {
            let puuid_data = get_puuid(app).await?;
            Ok(Responses::Puuid(puuid_data))
        }

        DataToFetch::CurrentMatch => {
            let puuid_data = get_puuid(app).await?;
            let endpoint = format!(
                "/lol/spectator/v5/active-games/by-summoner/{}",
                puuid_data.puuid
            );
            let payload = serde_json::json!({ "endpoint": endpoint, "region": GAME_REGION });

            let match_data: CurrentGameInfo = client.post_json(payload).await?;
            Ok(Responses::Match(match_data))
        }

        DataToFetch::Mastery => {
            let puuid_data = get_puuid(app).await?;
            let endpoint = format!(
                "/lol/champion-mastery/v4/champion-masteries/by-puuid/{}/top",
                puuid_data.puuid
            );
            let payload = serde_json::json!({ "endpoint": endpoint, "region": GAME_REGION });

            let mastery_data: Vec<ChampionMasteryDto> = client.post_json(payload).await?;
            Ok(Responses::Mastery(mastery_data))
        }
    }
}
