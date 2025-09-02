use anyhow::Result;
use serde::de::DeserializeOwned;
use tauri::AppHandle;

use crate::config::{BASE_URL, REGION};
use crate::types::data_objects::{LeagueEntryDTO, MatchDto};
use crate::types::match_data::CurrentGameInfo;
use crate::types::response::{ChampionMasteryDto, PuuidData, Responses, SummonerNameData};
use crate::types::riot_api_client::RiotApiClient;
use crate::utils::credentials::load_credentials_internal;

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
async fn get_puuid(app: &AppHandle, client: &RiotApiClient) -> Result<PuuidData> {
    // 1. Try loading from file
    if let Ok(puuid_data) = crate::utils::file::load_puuid(app).await {
        return Ok(puuid_data);
    }

    // 2. Otherwise fetch from Riot API
    const REGION: &str = "europe";

    let game_name = crate::api::lcu::get_game_name_simple().await?;
    let tag_line = crate::api::lcu::get_tag_line_simple().await?;

    let endpoint = format!("/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}");

    let puuid_data: PuuidData = client.post_json(&endpoint, REGION).await?;
    crate::utils::file::save_puuid(app, &puuid_data).await?;
    Ok(puuid_data)
}

/// Fetch the player's PUUID string (shortcut).
pub async fn fetch_puuid(app: &AppHandle) -> Result<String> {
    let (client_id, client_secret) = load_credentials_internal()?;
    let client = RiotApiClient::new(BASE_URL.to_string(), client_id, client_secret);
    Ok(get_puuid(app, &client).await?.puuid)
}

/// Fetch raw JSON from Riot API via proxy.
pub async fn fetch_raw(endpoint: &str) -> Result<String> {
    let (client_id, client_secret) = load_credentials_internal()?;
    let client = RiotApiClient::new(BASE_URL.to_string(), client_id, client_secret);
    client.post_raw(endpoint, REGION).await
}

/// Generic helper to fetch and deserialize JSON.
async fn fetch_json<T>(endpoint: &str) -> Result<T>
where
    T: DeserializeOwned,
{
    let (client_id, client_secret) = load_credentials_internal()?;
    let client = RiotApiClient::new(BASE_URL.to_string(), client_id, client_secret);
    client.post_json(endpoint, REGION).await
}

/// Fetch summoner basic info.
pub async fn fetch_summoner_basic(puuid: &str) -> Result<serde_json::Value> {
    let endpoint = format!("/lol/summoner/v4/summoners/by-puuid/{puuid}");
    fetch_json(&endpoint).await
}

/// Fetch ranked league entries.
pub async fn fetch_league_entries(puuid: &str) -> Result<Vec<LeagueEntryDTO>> {
    let endpoint = format!("/lol/league/v4/entries/by-puuid/{puuid}");
    fetch_json(&endpoint).await
}

/// Fetch recent match IDs.
pub async fn fetch_match_ids(puuid: &str, count: usize) -> Result<Vec<String>> {
    let endpoint =
        format!("/lol/match/v5/matches/by-puuid/{puuid}/ids?type=ranked&start=0&count={count}");
    fetch_json(&endpoint).await
}

/// Fetch a match by ID.
pub async fn fetch_match_by_id(match_id: &str) -> Result<(MatchDto, String)> {
    let endpoint = format!("/lol/match/v5/matches/{match_id}");
    let json = fetch_raw(&endpoint).await?;
    let dto: MatchDto = serde_json::from_str(&json)?;
    Ok((dto, json))
}

/// Fetch top champion mastery.
pub async fn fetch_top_mastery(puuid: &str) -> Result<Vec<ChampionMasteryDto>> {
    let endpoint =
        format!("/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}/top?count=4");
    fetch_json(&endpoint).await
}

/// Fetch current live match (if any).
pub async fn fetch_current_match(app: &AppHandle) -> Result<Option<CurrentGameInfo>> {
    fetch_data(app, DataToFetch::CurrentMatch)
        .await
        .map(|resp| match resp {
            Responses::Match(data) => Some(data),
            _ => None,
        })
}

/// Fetch various data from Riot API (wrapper for Responses).
pub async fn fetch_data(app: &AppHandle, data_to_fetch: DataToFetch) -> Result<Responses> {
    let (client_id, client_secret) = load_credentials_internal()?;
    let client = RiotApiClient::new(BASE_URL.to_string(), client_id, client_secret);
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
            let puuid_data = get_puuid(app, &client).await?;
            Ok(Responses::Puuid(puuid_data))
        }

        DataToFetch::CurrentMatch => {
            let puuid_data = get_puuid(app, &client).await?;
            let endpoint = format!(
                "/lol/spectator/v5/active-games/by-summoner/{}",
                puuid_data.puuid
            );

            let match_data: CurrentGameInfo = client.post_json(&endpoint, REGION).await?;
            Ok(Responses::Match(match_data))
        }

        DataToFetch::Mastery => {
            let puuid_data = get_puuid(app, &client).await?;
            let endpoint = format!(
                "/lol/champion-mastery/v4/champion-masteries/by-puuid/{}/top",
                puuid_data.puuid
            );
            let mastery_data: Vec<ChampionMasteryDto> = client.post_json(&endpoint, REGION).await?;
            Ok(Responses::Mastery(mastery_data))
        }
    }
}
