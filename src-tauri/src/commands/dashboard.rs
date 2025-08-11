use crate::api::data_dragon::{download_image, get_image_path};
use crate::api::riot::{fetch_data, fetch_puuid};
use crate::data::champion_data_map; // We'll add this for ID->Name mapping
use crate::types::data_objects::{InfoDto, MatchDto, ParticipantDto};
use crate::types::response::Responses;
use chrono::{DateTime, TimeZone, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use tauri::Manager;

// ---------- Helpers ----------

fn compute_match_duration_seconds(info: &InfoDto) -> u64 {
    match (info.game_duration, info.game_end_timestamp) {
        // Post 11.20 — gameDuration already in seconds
        (Some(d), Some(_)) => d.max(0) as u64,
        // Pre 11.20 — gameDuration is milliseconds, convert to seconds
        (Some(d), None) => (d.max(0) as u64) / 1000,
        // Fallback: max participant timePlayed
        _ => {
            if let Some(participants) = &info.participants {
                participants
                    .iter()
                    .filter_map(|p| p.time_played.map(|t| t as u64))
                    .max()
                    .unwrap_or(0)
            } else {
                0
            }
        }
    }
}

fn timestamp_to_datetime(ts_millis: Option<i64>) -> DateTime<Utc> {
    ts_millis
        .and_then(|ms| Utc.timestamp_millis_opt(ms).single())
        .unwrap_or_else(Utc::now)
}

// Map champion ID to name (already in your code)
fn champion_name_from_id(id: u32) -> String {
    champion_data_map()
        .get(&id)
        .cloned()
        .unwrap_or_else(|| format!("Unknown({})", id))
}

// Participant picker using typed DTOs
fn get_participant_by_puuid<'a>(
    match_data: &'a MatchDto,
    puuid: &str,
) -> Option<&'a ParticipantDto> {
    match_data
        .info
        .participants
        .as_ref()? // &Vec<ParticipantDto>
        .iter()
        .find(|p| p.puuid.as_deref() == Some(puuid))
}

/// Rank info for summoner
#[derive(Debug, Serialize, Deserialize)]
pub struct RankInfo {
    pub tier: String,
    pub division: String,
    pub lp: u32,
}

/// Summoner profile data
#[derive(Debug, Serialize, Deserialize)]
pub struct SummonerData {
    #[serde(rename = "displayName")]
    pub display_name: String,
    pub level: u32,
    #[serde(rename = "profileIconId")]
    pub profile_icon_id: u32,
    #[serde(rename = "profileIconPath")]
    pub profile_icon_path: String,
    pub rank: RankInfo,
    #[serde(rename = "winRate")]
    pub win_rate: u32,
    #[serde(rename = "recentGames")]
    pub recent_games: u32,
    #[serde(rename = "favoriteRole")]
    pub favorite_role: String,
    #[serde(rename = "mainChampion")]
    pub main_champion: String,
}

/// Match history entry
#[derive(Debug, Serialize, Deserialize)]
pub struct Match {
    pub id: u64,
    pub champion: String,
    pub result: String,
    pub kda: String,
    pub duration: String,
    #[serde(rename = "gameMode")]
    pub game_mode: String,
    pub timestamp: String,
    pub cs: u32,
}

/// Champion mastery entry
#[derive(Debug, Serialize, Deserialize)]
pub struct ChampionMastery {
    pub name: String,
    pub level: u32,
    pub points: u32,
    pub icon: String,
}

/// Live game info
#[derive(Debug, Serialize, Deserialize)]
pub struct LiveGameData {
    #[serde(rename = "gameMode")]
    pub game_mode: String,
    pub champion: String,
    #[serde(rename = "gametime")]
    pub game_time: String,
    #[serde(rename = "performanceScore")]
    pub performance_score: f32,
    pub progress: u8,
}

/// Stats summary
#[derive(Debug, Serialize, Deserialize)]
pub struct Stats {
    #[serde(rename = "totalGames")]
    pub total_games: u32,
    #[serde(rename = "avgGameTime")]
    pub avg_game_time: String,
}

/// Full dashboard payload
#[derive(Debug, Serialize, Deserialize)]
pub struct DashboardData {
    pub summoner: SummonerData,
    pub matches: Vec<Match>,
    #[serde(rename = "championMastery")]
    pub champion_mastery: Vec<ChampionMastery>,
    #[serde(rename = "liveGame")]
    pub live_game: Option<LiveGameData>,
    pub stats: Stats,
    #[serde(rename = "imagePath")]
    pub image_path: String,
}

/// Main Tauri command to fetch all dashboard data
#[tauri::command]
pub async fn get_dashboard_data(
    app: tauri::AppHandle,
    summoner_name: String,
) -> Result<DashboardData, String> {
    println!(
        "[DEBUG] get_dashboard_data called with summoner_name: {}",
        summoner_name
    );

    let puuid = match fetch_puuid(&app).await {
        Ok(p) => {
            println!("[DEBUG] Got PUUID: {}", p);
            p
        }
        Err(e) => {
            eprintln!("[ERROR] fetch_puuid failed: {}", e);
            return Err(e);
        }
    };

    // Example debug for fetch_raw
    let summoner_endpoint = format!("/lol/summoner/v4/summoners/by-puuid/{puuid}");
    println!("[DEBUG] Fetching summoner endpoint: {}", summoner_endpoint);

    let summoner_json = match crate::api::riot::fetch_raw(&app, &summoner_endpoint, "euw1").await {
        Ok(json) => {
            println!("[DEBUG] Summoner JSON: {}", json);
            json
        }
        Err(e) => {
            eprintln!("[ERROR] fetch_raw failed for summoner: {}", e);
            return Err(e);
        }
    };
    let app_data_dir: &PathBuf = &app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {e}"))?;

    let image_path: String = app_data_dir.to_string_lossy().into_owned();
    println!("[DEEEEEEEEEEEEEEEZBUG {image_path:?}");
    let summoner_value: serde_json::Value = serde_json::from_str(&summoner_json)
        .map_err(|e| format!("Failed to parse summoner JSON: {e}"))?;
    let display_name = summoner_name;
    let level = summoner_value["summonerLevel"].as_u64().unwrap_or(0) as u32;
    let profile_icon_id = summoner_value["profileIconId"].as_u64().unwrap_or(0) as u32;
    let url = format!("https://ddragon.leagueoflegends.com/cdn/15.15.1/img/profileicon/");
    println!("[DEBUG] URL: {url}");
    let subfolder = "profile_icons";
    let profile_icon_path =
        get_image_path(app.clone(), subfolder, &profile_icon_id.to_string()).await?;
    download_image(&app, &url, &profile_icon_id.to_string(), subfolder).await?;
    println!("[DEBUG] Summoner Value content: {summoner_value}");
    // 2. Fetch Ranked Stats
    let ranked_endpoint = format!(
        "/lol/league/v4/entries/by-puuid/{}",
        summoner_value["puuid"].as_str().unwrap_or("")
    );
    println!("[DEBUG] Ranked Endpoint: {ranked_endpoint}");
    let ranked_json = crate::api::riot::fetch_raw(&app, &ranked_endpoint, "euw1").await?;
    println!("[DEBUG] Ranked JSON: {ranked_json}");
    let ranked_entries: Vec<serde_json::Value> =
        serde_json::from_str(&ranked_json).unwrap_or_default();
    let solo = ranked_entries
        .iter()
        .find(|e| e["queueType"] == "RANKED_SOLO_5x5");
    let rank_info = if let Some(s) = solo {
        RankInfo {
            tier: s["tier"].as_str().unwrap_or("UNRANKED").to_string(),
            division: s["rank"].as_str().unwrap_or("").to_string(),
            lp: s["leaguePoints"].as_u64().unwrap_or(0) as u32,
        }
    } else {
        RankInfo {
            tier: "UNRANKED".into(),
            division: "".into(),
            lp: 0,
        }
    };

    // 3. Fetch Match History IDs
    let match_ids_endpoint =
        format!("/lol/match/v5/matches/by-puuid/{puuid}/ids?type=ranked&start=0");
    println!("[DEBUG] Match IDs Endpoint: {match_ids_endpoint}");
    let match_ids_json = crate::api::riot::fetch_raw(&app, &match_ids_endpoint, "euw1").await?;
    println!("[DEBUG] Match IDs JSON: {match_ids_json}");
    let match_ids: Vec<String> = serde_json::from_str(&match_ids_json).unwrap_or_default();
    println!("[DEBUG] Match IDs : {match_ids:?}");
    // 4. Fetch Match Details
    let mut matches = Vec::new();
    let mut wins_count = 0;
    let mut role_counts: HashMap<String, u32> = HashMap::new();

    for match_id in match_ids {
        let match_endpoint = format!("/lol/match/v5/matches/{match_id}");
        println!("[DEBUG] Match Endpoint: {match_endpoint}");

        // IMPORTANT: match-v5 uses regional route (e.g., "europe"), not platform (euw1)
        // If your fetch_raw selects base by this param, pass "europe" here.
        let match_json = crate::api::riot::fetch_raw(&app, &match_endpoint, "euw1").await?;
        println!("[DEBUG] Match JSON: {match_json:?}");
        let match_data: MatchDto = serde_json::from_str(&match_json)
            .map_err(|e| format!("Failed to deserialize match {}: {}", match_id, e))?;

        // Find our participant
        let me = if let Some(p) = get_participant_by_puuid(&match_data, &puuid) {
            p
        } else {
            println!(
                "[WARN] PUUID {} not found in match {}. Skipping.",
                puuid, match_data.metadata.match_id
            );
            continue;
        };

        let champ_id = me.champion_id.unwrap_or(0);
        let champion = champion_name_from_id(champ_id);
        let kills = me.kills.unwrap_or(0);
        let deaths = me.deaths.unwrap_or(0);
        let assists = me.assists.unwrap_or(0);
        let cs = me
            .total_minions_killed
            .unwrap_or(0)
            .saturating_add(me.neutral_minions_killed.unwrap_or(0));
        let win = me.win.unwrap_or(false);

        // Track wins
        if win {
            wins_count += 1;
        }

        // Track role frequency
        let role = me.team_position.clone().unwrap_or_else(|| "UNKNOWN".into());
        *role_counts.entry(role).or_insert(0) += 1;

        let duration_secs = compute_match_duration_seconds(&match_data.info);
        let ts = timestamp_to_datetime(match_data.info.game_start_timestamp);

        matches.push(Match {
            id: match_data.info.game_id.unwrap_or_default() as u64,
            champion,
            result: if win {
                "Victory".into()
            } else {
                "Defeat".into()
            },
            kda: format!("{}/{}/{}", kills, deaths, assists),
            duration: format!("{}:{:02}", duration_secs / 60, duration_secs % 60),
            game_mode: match_data.info.game_mode.clone().unwrap_or_default(),
            timestamp: ts.format("%Y-%m-%d %H:%M").to_string(),
            cs,
        });
    }

    let total_games = matches.len() as u32;
    let win_rate = if total_games > 0 {
        ((wins_count as f32 / total_games as f32) * 100.0).round() as u32
    } else {
        0
    };

    // Determine favorite role
    let favorite_role = role_counts
        .into_iter()
        .max_by_key(|&(_, count)| count)
        .map(|(role, _)| role)
        .unwrap_or_else(|| "UNKNOWN".into());

    // Calculate average game time
    #[allow(unused_variables)]
    let avg_game_time = if total_games > 0 {
        let total_secs: u64 = matches
            .iter()
            .map(|m| {
                let parts: Vec<&str> = m.duration.split(':').collect();
                let mins = parts[0].parse::<u64>().unwrap_or(0);
                let secs = parts
                    .get(1)
                    .and_then(|s| s.parse::<u64>().ok())
                    .unwrap_or(0);
                mins * 60 + secs
            })
            .sum();
        let avg_secs = total_secs / total_games as u64;
        format!("{}:{:02}", avg_secs / 60, avg_secs % 60)
    } else {
        "0:00".into()
    };

    // 5. Fetch Champion Mastery
    let mastery_endpoint =
        format!("/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}/top");
    let mastery_json = crate::api::riot::fetch_raw(&app, &mastery_endpoint, "euw1").await?;
    println!("[DEBUG] Master JSON: {mastery_json:?}");
    let mastery_entries: Vec<serde_json::Value> =
        serde_json::from_str(&mastery_json).unwrap_or_default();
    println!("[DEBUG] Mastery Entries: {mastery_entries:?}");
    let mut champion_mastery = Vec::new();
    for (i, m) in mastery_entries.iter().take(4).enumerate() {
        let champ_id = m["championId"].as_u64().unwrap_or(0) as u32;
        println!("[DEBUG] Champion ID: {champ_id:?}");
        champion_mastery.push(ChampionMastery {
            name: champion_name_from_id(champ_id),
            level: m["championLevel"].as_u64().unwrap_or(0) as u32,
            points: m["championPoints"].as_u64().unwrap_or(0) as u32,
            icon: ["🎯", "🔫", "🏹", "✨"][i].into(),
        });
    }

    // 6. Live Game Data
    let live_game = match fetch_data(&app, "CurrentMatch").await {
        Ok(Responses::Match(data)) => {
            let me = data.find_participant_by_puuid(&puuid);
            Some(LiveGameData {
                game_mode: data.game_mode.clone(),
                champion: me
                    .map(|p| champion_name_from_id(p.champion_id))
                    .unwrap_or_default(),
                game_time: format!("{}:{:02}", data.game_length / 60, data.game_length % 60),
                performance_score: 8.2, // TODO: calculate
                progress: 65,
            })
        }
        _ => None,
    };

    // 7. Stats
    let total_games = matches.len() as u32;
    let avg_game_time = if total_games > 0 {
        let total_secs: u64 = matches
            .iter()
            .map(|m| {
                let parts: Vec<&str> = m.duration.split(':').collect();
                let mins = parts[0].parse::<u64>().unwrap_or(0);
                let secs = parts
                    .get(1)
                    .and_then(|s| s.parse::<u64>().ok())
                    .unwrap_or(0);
                mins * 60 + secs
            })
            .sum();
        let avg_secs = total_secs / total_games as u64;
        format!("{}:{:02}", avg_secs / 60, avg_secs % 60)
    } else {
        "0:00".into()
    };
    println!("[DEBUG] Champion Mastery: {champion_mastery:?}");

    Ok(DashboardData {
        summoner: SummonerData {
            display_name,
            level,
            profile_icon_id,
            profile_icon_path,
            rank: rank_info,
            win_rate,
            recent_games: total_games,
            favorite_role,
            main_champion: champion_mastery
                .get(0)
                .map(|c| c.name.clone())
                .unwrap_or_default(),
        },
        matches,
        champion_mastery,
        live_game,
        stats: Stats {
            total_games,
            avg_game_time,
        },
        image_path,
    })
}
