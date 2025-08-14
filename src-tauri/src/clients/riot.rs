use anyhow::anyhow;
use tauri::AppHandle;

use crate::config::PLATFORM_REGION;
use crate::types::data_objects::{LeagueEntryDTO, MatchDto};
use crate::types::match_data::MatchData;
use crate::types::response::Responses;

pub async fn fetch_puuid(app: &AppHandle) -> anyhow::Result<String> {
    crate::api::riot::fetch_puuid(app)
        .await
        .map_err(|e| anyhow!("fetch_puuid: {e}"))
}

pub async fn fetch_summoner_basic(
    app: &AppHandle,
    puuid: &str,
) -> anyhow::Result<serde_json::Value> {
    let endpoint = format!("/lol/summoner/v4/summoners/by-puuid/{puuid}");
    let json = crate::api::riot::fetch_raw(app, &endpoint, PLATFORM_REGION)
        .await
        .map_err(|e| anyhow!("fetch summoner basic: {e}"))?;
    let v: serde_json::Value =
        serde_json::from_str(&json).map_err(|e| anyhow!("parse summoner json: {e}"))?;
    Ok(v)
}

pub async fn fetch_league_entries(
    app: &AppHandle,
    puuid: &str,
) -> anyhow::Result<Vec<LeagueEntryDTO>> {
    let ep = format!("/lol/league/v4/entries/by-puuid/{puuid}");
    let json = crate::api::riot::fetch_raw(app, &ep, PLATFORM_REGION)
        .await
        .map_err(|e| anyhow!("fetch league entries: {e}"))?;
    let v: Vec<LeagueEntryDTO> =
        serde_json::from_str(&json).map_err(|e| anyhow!("deserialize league entries: {e}"))?;
    Ok(v)
}

pub async fn fetch_match_ids(
    app: &AppHandle,
    puuid: &str,
    count: usize,
) -> anyhow::Result<Vec<String>> {
    let ep =
        format!("/lol/match/v5/matches/by-puuid/{puuid}/ids?type=ranked&start=0&count={count}");
    let json = crate::api::riot::fetch_raw(app, &ep, PLATFORM_REGION)
        .await
        .map_err(|e| anyhow!("fetch match ids: {e}"))?;
    let v: Vec<String> =
        serde_json::from_str(&json).map_err(|e| anyhow!("deserialize match ids: {e}"))?;
    Ok(v)
}

pub async fn fetch_match_by_id(
    app: &AppHandle,
    match_id: &str,
) -> anyhow::Result<(MatchDto, String)> {
    let ep = format!("/lol/match/v5/matches/{match_id}");
    let json = crate::api::riot::fetch_raw(app, &ep, PLATFORM_REGION)
        .await
        .map_err(|e| anyhow!("fetch match {match_id}: {e}"))?;
    let dto: MatchDto =
        serde_json::from_str(&json).map_err(|e| anyhow!("deserialize match {match_id}: {e}"))?;
    Ok((dto, json))
}

pub async fn fetch_top_mastery(
    app: &AppHandle,
    puuid: &str,
) -> anyhow::Result<Vec<serde_json::Value>> {
    let ep = format!("/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}/top");
    let json = crate::api::riot::fetch_raw(app, &ep, PLATFORM_REGION)
        .await
        .map_err(|e| anyhow!("fetch top mastery: {e}"))?;
    let v: Vec<serde_json::Value> =
        serde_json::from_str(&json).map_err(|e| anyhow!("deserialize top mastery: {e}"))?;
    Ok(v)
}

pub async fn fetch_current_match(app: &AppHandle) -> anyhow::Result<Option<MatchData>> {
    match crate::api::riot::fetch_data(app, "CurrentMatch").await {
        Ok(Responses::Match(data)) => Ok(Some(data)),
        Ok(_) => Ok(None),
        Err(e) => Err(anyhow!("fetch current match: {e}")),
    }
}
