// src-tauri/src/commands/dashboard/service.rs
use anyhow::{anyhow, Context};
use chrono::Utc;
use rusqlite::{params, OptionalExtension, TransactionBehavior};
use std::path::Path;
use tracing::debug;

use crate::api::riot as riot_client;
use crate::config::{DASHBOARD_RECENT_MATCH_COUNT, TTL_DASHBOARD_SECS, TTL_SUMMONER_FIELDS_SECS};
use crate::db::init::{get_app_data_dir_only, init_database};
use crate::error::AppResult;
use crate::repo::{
    dashboard_repo, live_game_repo, mastery_repo, match_repo, stats_repo, summoner_repo,
};
use crate::types::dashboard::{
    ChampionMastery, DashboardData, LiveGameData, Match, MatchDetails, Participant, Stats,
    SummonerData, Team,
};
use crate::types::data_objects::{LeagueEntryDTO, MatchDto, ParticipantDto};
use crate::utils::champions::champion_name_from_id;
use crate::utils::time::{compute_match_duration_seconds, kda_string, timestamp_to_datetime};

fn find_ranked_solo_or_default(entries: &[LeagueEntryDTO]) -> LeagueEntryDTO {
    entries
        .iter()
        .find(|e| e.queue_type.eq_ignore_ascii_case("RANKED_SOLO_5x5"))
        .cloned()
        .unwrap_or_else(|| LeagueEntryDTO {
            league_id: String::new(),
            puuid: String::new(),
            queue_type: "RANKED_SOLO_5x5".to_string(),
            tier: "UNRANKED".to_string(),
            rank: String::new(),
            league_points: 0,
            wins: 0,
            losses: 0,
            hot_streak: false,
            veteran: false,
            fresh_blood: false,
            inactive: false,
            mini_series: None,
        })
}

fn get_participant_by_puuid<'a>(
    match_data: &'a MatchDto,
    puuid: &str,
) -> Option<&'a ParticipantDto> {
    match_data
        .info
        .participants
        .as_ref()?
        .iter()
        .find(|p| p.puuid.as_deref() == Some(puuid))
}

// Note: This mirrors your existing cache loading, split for clarity.
fn load_dashboard_from_cache(
    conn: &rusqlite::Connection,
    puuid: &str,
    image_path: &str,
    now: i64,
) -> AppResult<Option<DashboardData>> {
    // Summoner drives freshness
    let row = conn
        .query_row(
            "SELECT display_name, level, profile_icon_id, profile_icon_path,
              rank_league_id, rank_queue_type, rank_tier, rank_division,
              rank_lp, rank_wins, rank_losses, rank_hot_streak, rank_veteran,
              rank_fresh_blood, rank_inactive, rank_mini_series_json,
              win_rate, recent_games, favorite_role, main_champion,
              updated_at
       FROM summoners WHERE puuid = ?1",
            rusqlite::params![puuid],
            |r| {
                Ok((
                    r.get::<_, String>(0)?, // display_name
                    r.get::<_, i64>(1)? as u32,
                    r.get::<_, i64>(2)? as u32,
                    r.get::<_, String>(3)?,
                    r.get::<_, String>(4)?,
                    r.get::<_, String>(5)?,
                    r.get::<_, String>(6)?,
                    r.get::<_, String>(7)?,
                    r.get::<_, i64>(8)? as i32,
                    r.get::<_, i64>(9)? as u32,
                    r.get::<_, i64>(10)? as u32,
                    r.get::<_, i64>(11)? != 0,
                    r.get::<_, i64>(12)? != 0,
                    r.get::<_, i64>(13)? != 0,
                    r.get::<_, i64>(14)? != 0,
                    r.get::<_, Option<String>>(15)?,
                    r.get::<_, i64>(16)? as u32,
                    r.get::<_, i64>(17)? as u32,
                    r.get::<_, String>(18)?,
                    r.get::<_, String>(19)?,
                    r.get::<_, i64>(20)?,
                ))
            },
        )
        .optional()?;

    let Some((
        display_name,
        level,
        profile_icon_id,
        profile_icon_path,
        rank_league_id,
        rank_queue_type,
        rank_tier,
        rank_division,
        rank_lp,
        rank_wins,
        rank_losses,
        rank_hot_streak,
        rank_veteran,
        rank_fresh_blood,
        rank_inactive,
        rank_mini_series_json,
        win_rate,
        recent_games,
        favorite_role,
        main_champion,
        updated_at,
    )) = row
    else {
        return Ok(None);
    };

    if now - updated_at > TTL_DASHBOARD_SECS {
        return Ok(None);
    }

    let mini_series = rank_mini_series_json.and_then(|json| serde_json::from_str(&json).ok());

    let stats_row = conn
        .query_row(
            "SELECT total_games, avg_game_time FROM stats WHERE puuid = ?1",
            params![puuid],
            |r| Ok((r.get::<_, i64>(0)? as u32, r.get::<_, String>(1)?)),
        )
        .optional()?;
    let (total_games, avg_game_time) = stats_row.unwrap_or((recent_games, "0:00".into()));

    let mut mastery_stmt = conn.prepare(
        "SELECT champion_id, champion_level, champion_points, icon
       FROM champion_mastery
       WHERE puuid = ?1
       ORDER BY rank_order ASC",
    )?;
    let mastery_iter = mastery_stmt.query_map(params![puuid], |r| {
        let champ_id: i64 = r.get(0)?;
        Ok(ChampionMastery {
            name: crate::utils::champions::champion_name_from_id(champ_id as u32),
            level: r.get::<_, i64>(1)? as u32,
            points: r.get::<_, i64>(2)? as u32,
            icon: r.get::<_, String>(3)?,
        })
    })?;
    let champion_mastery: Vec<ChampionMastery> = mastery_iter
        .collect::<Result<Vec<_>, _>>()
        .context("collect mastery")?;

    let matches_vec = crate::repo::dashboard_repo::get_dashboard_matches(conn, puuid)?;

    Ok(Some(DashboardData {
        summoner: SummonerData {
            display_name,
            level,
            profile_icon_id,
            profile_icon_path,
            rank: LeagueEntryDTO {
                league_id: rank_league_id,
                puuid: puuid.to_string(),
                queue_type: rank_queue_type,
                tier: rank_tier,
                rank: rank_division,
                league_points: rank_lp,
                wins: rank_wins,
                losses: rank_losses,
                hot_streak: rank_hot_streak,
                veteran: rank_veteran,
                fresh_blood: rank_fresh_blood,
                inactive: rank_inactive,
                mini_series,
            },
            win_rate,
            recent_games,
            favorite_role,
            main_champion,
        },
        matches: matches_vec,
        champion_mastery,
        stats: Stats {
            total_games,
            avg_game_time,
        },
        image_path: image_path.to_string(),
    }))
}

pub async fn build_dashboard(
    app: tauri::AppHandle,
    summoner_name: String,
) -> AppResult<DashboardData> {
    let mut conn = init_database(&app)?;
    conn.busy_timeout(std::time::Duration::from_secs(5))?;

    let now = Utc::now().timestamp();
    let image_path = get_app_data_dir_only(&app);

    conn.execute(
        "INSERT INTO app_meta (id, image_path, updated_at)
     VALUES (1, ?1, ?2)
     ON CONFLICT(id) DO UPDATE SET
       image_path = excluded.image_path,
       updated_at = excluded.updated_at",
        params![&image_path, now],
    )?;

    let puuid;
    if summoner_name == "current" {
        puuid = riot_client::fetch_puuid(&app).await?;
    } else {
        puuid = riot_client::get_puuid_by_summoner_name(&summoner_name).await?;
    }

    debug!("Summoner name is : {summoner_name}");

    if let Some(dd) = load_dashboard_from_cache(&conn, &puuid, &image_path, now)? {
        return Ok(dd);
    };

    // Basic fields: use cache if still fresh
    let mut display_name = summoner_name.clone();
    let mut level: u32 = 0;
    let mut profile_icon_id: u32 = 0;
    let mut profile_icon_path = String::new();

    if let Some((lvl, icon_id, icon_path, updated_at)) = conn
        .query_row(
            "SELECT level, profile_icon_id, profile_icon_path, updated_at
       FROM summoners WHERE puuid = ?1",
            params![&puuid],
            |row| {
                Ok((
                    row.get::<_, i64>(0)?,
                    row.get::<_, i64>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, i64>(3)?,
                ))
            },
        )
        .optional()?
    {
        if now - updated_at <= TTL_SUMMONER_FIELDS_SECS {
            level = lvl as u32;
            profile_icon_id = icon_id as u32;
            profile_icon_path = icon_path;
        }
    }

    if level == 0 || profile_icon_id == 0 || profile_icon_path.is_empty() {
        let sv = riot_client::fetch_summoner_basic(&puuid).await?;
        if let Some(api_name) = sv["name"].as_str() {
            display_name = api_name.to_string();
        }
        level = sv["summonerLevel"].as_u64().unwrap_or(0) as u32;
        profile_icon_id = sv["profileIconId"].as_u64().unwrap_or(0) as u32;

        let subfolder = Path::new("profile_icons");

        let icon_str = profile_icon_id.to_string();

        let icon_rel = Path::new(&icon_str);

        profile_icon_path =
            crate::api::data_dragon::get_image_path(app.clone(), subfolder, icon_rel)
                .await
                .map_err(|e| anyhow!("get_image_path: {e}"))?;

        if !std::path::Path::new(&profile_icon_path).exists() {
            let base = "https://ddragon.leagueoflegends.com/cdn/15.15.1/img/profileicon/";
            crate::api::data_dragon::download_image(&app, base, icon_rel, subfolder)
                .await
                .map_err(|e| anyhow!("download_image: {e}"))?;
        }
    }

    let entries = riot_client::fetch_league_entries(&puuid).await?;
    let solo_entry = find_ranked_solo_or_default(&entries);

    let match_ids = riot_client::fetch_match_ids(&puuid, DASHBOARD_RECENT_MATCH_COUNT).await?;

    println!("{match_ids:?}");

    let mut matches = Vec::new();
    let mut _wins_count = 0u32;
    let mut role_counts: std::collections::HashMap<String, u32> = std::collections::HashMap::new();

    for mid in match_ids {
        let (match_data, match_json) = riot_client::fetch_match_by_id(&mid).await?;

        match_repo::store_match_full(&conn, &match_data, &match_json, now)?;

        let Some(me) = get_participant_by_puuid(&match_data, &puuid) else {
            continue;
        };

        let champ_id = me.champion_id.unwrap_or(0);
        let champion = champion_name_from_id(champ_id);
        let kills = me.kills.unwrap_or(0) as i64;
        let deaths = me.deaths.unwrap_or(0) as i64;
        let assists = me.assists.unwrap_or(0) as i64;
        let cs = me
            .total_minions_killed
            .unwrap_or(0)
            .saturating_add(me.neutral_minions_killed.unwrap_or(0));
        let win = me.win.unwrap_or(false);
        if win {
            _wins_count += 1;
        }
        let role = me.team_position.clone().unwrap_or_else(|| "UNKNOWN".into());
        *role_counts.entry(role).or_insert(0) += 1;

        let duration_secs = compute_match_duration_seconds(&match_data.info);
        let ts = timestamp_to_datetime(match_data.info.game_start_timestamp);

        let mut team1_kda: Vec<u16> = vec![0, 0, 0];
        let mut team2_kda: Vec<u16> = vec![0, 0, 0];

        let mut team1_gold = 0;
        let mut team1_towers = 0;
        let mut team1_inhibitors = 0;
        let mut team2_gold = 0;
        let mut team2_towers = 0;
        let mut team2_inhibitors = 0;

        let teams: Option<[Team; 2]> = match match_data.info.participants {
            Some(participants) => {
                let mut all_participants: Vec<Participant> = Vec::new();

                // accumulators

                for p in participants {
                    let participant = Participant {
                        team: p.team_id.unwrap_or(0),
                        summoner_name: p.riot_id_game_name.unwrap_or_default(),
                        champion_name: p.champion_name.unwrap_or_default(),
                        kills: p.kills.unwrap_or(0),
                        deaths: p.deaths.unwrap_or(0),
                        assists: p.assists.unwrap_or(0),
                        lane: p.lane.unwrap_or_default(),
                        item0: p.item0.unwrap_or(0),
                        item1: p.item1.unwrap_or(0),
                        item2: p.item2.unwrap_or(0),
                        item3: p.item3.unwrap_or(0),
                        item4: p.item4.unwrap_or(0),
                        item5: p.item5.unwrap_or(0),
                        item6: p.item6.unwrap_or(0),
                        total_minions_killed: p
                            .total_minions_killed
                            .unwrap_or(0)
                            .saturating_add(p.neutral_minions_killed.unwrap_or(0)),
                        total_damage_dealt_to_champions: p
                            .total_damage_dealt_to_champions
                            .unwrap_or(0),
                    };

                    // update totals
                    if p.team_id.unwrap_or(0) == 100 {
                        team1_towers += p.turret_kills.unwrap_or(0);
                        team1_inhibitors += p.inhibitor_kills.unwrap_or(0);
                        team1_kda[0] += p.kills.unwrap_or(0);
                        team1_kda[1] += p.deaths.unwrap_or(0);
                        team1_kda[2] += p.assists.unwrap_or(0);
                        team1_gold += p.gold_earned.unwrap_or(0);
                    }
                    if p.team_id.unwrap_or(0) == 200 {
                        team2_towers += p.turret_kills.unwrap_or(0);
                        team2_inhibitors += p.inhibitor_kills.unwrap_or(0);
                        team2_kda[0] += p.kills.unwrap_or(0);
                        team2_kda[1] += p.deaths.unwrap_or(0);
                        team2_kda[2] += p.assists.unwrap_or(0);
                        team2_gold += p.gold_earned.unwrap_or(0);
                    }

                    all_participants.push(participant);
                }

                // split into two teams of 5
                if all_participants.len() == 10 {
                    let mut team1: Vec<Participant> = Vec::new();
                    let mut team2: Vec<Participant> = Vec::new();

                    for p in all_participants {
                        if p.team == 100 {
                            team1.push(p);
                        } else if p.team == 200 {
                            team2.push(p);
                        }
                    }

                    let team1: [Participant; 5] = team1.try_into().unwrap();
                    let team2: [Participant; 5] = team2.try_into().unwrap();

                    Some([team1, team2])
                } else {
                    None
                }
            }
            None => None,
        };

        let match_details: MatchDetails = MatchDetails {
            teams: teams.unwrap(),
            towers_destroyed: [team1_towers, team2_towers],
            inhibitors_destroyed: [team1_inhibitors, team2_inhibitors],
            gold_earned: [team1_gold, team2_gold],
            team_kda: [team1_kda.try_into().unwrap(), team2_kda.try_into().unwrap()],
        };

        let m = Match {
            match_id: match_data.metadata.match_id.clone(),
            game_id: match_data.info.game_id.unwrap_or_default() as u64,
            champion,
            result: if win {
                "Victory".into()
            } else {
                "Defeat".into()
            },
            kda: kda_string(kills, deaths, assists),
            duration: format!("{}:{:02}", duration_secs / 60, duration_secs % 60),
            game_mode: match_data.info.game_mode.clone().unwrap_or_default(),
            // src-tauri/src/commands/dashboard/service.rs (continued)
            timestamp: ts.format("%Y-%m-%d %H:%M").to_string(),
            cs,
            match_details,
        };

        matches.push(m);
    }

    let total_games = solo_entry.wins + solo_entry.losses;
    let win_rate = if total_games > 0 {
        ((solo_entry.wins as f32 / total_games as f32) * 100.0).round() as u32
    } else {
        0
    };

    let favorite_role = role_counts
        .into_iter()
        .max_by_key(|&(_, count)| count)
        .map(|(role, _)| role)
        .unwrap_or_else(|| "UNKNOWN".into());

    // Average game time over fetched matches (not total ranked games)
    let avg_game_time = if !matches.is_empty() {
        let total_secs: u64 = matches
            .iter()
            .map(|m| {
                let parts: Vec<&str> = m.duration.split(':').collect();
                let mins = parts
                    .first()
                    .and_then(|s| s.parse::<u64>().ok())
                    .unwrap_or(0);
                let secs = parts
                    .get(1)
                    .and_then(|s| s.parse::<u64>().ok())
                    .unwrap_or(0);
                mins * 60 + secs
            })
            .sum();
        let avg_secs = total_secs / matches.len() as u64; // ✅ correct
        format!("{}:{:02}", avg_secs / 60, avg_secs % 60)
    } else {
        "0:00".into()
    };

    // Champion Mastery (top)
    let mastery_values = riot_client::fetch_top_mastery(&puuid).await?;

    let icons = ["🎯", "🔫", "🏹", "✨"];
    let mut champion_mastery = Vec::new();
    for (i, m) in mastery_values.iter().take(4).enumerate() {
        let champ_id = m.champion_id as u32;
        champion_mastery.push(ChampionMastery {
            name: champion_name_from_id(champ_id),
            level: m.champion_level as u32,
            points: m.champion_points as u32,
            icon: icons.get(i).copied().unwrap_or("🏹").to_string(),
        });
    }

    // Live Game (optional)
    let live_game = match riot_client::fetch_current_match(&app).await {
        Ok(Some(data)) => {
            let me = data.find_participant_by_puuid(&puuid);
            Some(LiveGameData {
                game_mode: data.game_mode.clone(),
                champion: me
                    .map(|p| champion_name_from_id(p.champion_id))
                    .unwrap_or_default(),
                game_time: format!("{}:{:02}", data.game_length / 60, data.game_length % 60),
                performance_score: 8.2,
                progress: 65,
            })
        }
        Ok(None) => None, // No live game
        Err(e) => {
            // If it's a 404 spectator not found, ignore it
            let msg = e.to_string();
            if msg.contains("spectator game info isn't found") || msg.contains("404") {
                None
            } else {
                return Err(e); // real error, stop
            }
        }
    };

    // Persist atomically
    let tx = conn
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .context("begin transaction")?;

    summoner_repo::upsert_summoner(
        &tx,
        &puuid,
        &display_name,
        level,
        profile_icon_id,
        &profile_icon_path,
        &solo_entry,
        win_rate,
        total_games,
        &favorite_role,
        champion_mastery
            .first()
            .map(|c| c.name.as_str())
            .unwrap_or(""),
        now,
    )?;

    stats_repo::upsert_stats(&tx, &puuid, total_games, &avg_game_time, now)?;
    mastery_repo::replace_masteries(&tx, &puuid, &mastery_values, now)?;
    live_game_repo::upsert_live(&tx, &puuid, &live_game, now)?;

    for m in &matches {
        dashboard_repo::upsert_dashboard_match(&tx, &puuid, m, now)?;
    }

    tx.commit().context("commit transaction")?;

    Ok(DashboardData {
        summoner: SummonerData {
            display_name,
            level,
            profile_icon_id,
            profile_icon_path,
            rank: solo_entry,
            win_rate,
            recent_games: total_games,
            favorite_role,
            main_champion: champion_mastery
                .first()
                .map(|c| c.name.clone())
                .unwrap_or_default(),
        },
        matches, // ✅ make sure this is the vector you built above
        champion_mastery,
        stats: Stats {
            total_games,
            avg_game_time,
        image_path,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::{Connection, params};
    use chrono::Utc;

    // Helper: construct a LeagueEntryDTO with defaults, overriding selected fields
    fn league_entry_with(queue_type: &str, tier: &str, wins: u32, losses: u32) -> LeagueEntryDTO {
        LeagueEntryDTO {
            league_id: String::new(),
            puuid: String::new(),
            queue_type: queue_type.to_string(),
            tier: tier.to_string(),
            rank: String::new(),
            league_points: 0,
            wins,
            losses,
            hot_streak: false,
            veteran: false,
            fresh_blood: false,
            inactive: false,
            mini_series: None,
        }
    }

    #[test]
    fn find_ranked_solo_prefers_case_insensitive_match() {
        let entries = vec\![
            league_entry_with("RANKED_FLEX_SR", "GOLD", 10, 5),
            league_entry_with("ranked_solo_5x5", "PLATINUM", 22, 18), // lowercase to verify case-insensitive
        ];
        let got = find_ranked_solo_or_default(&entries);
        assert_eq\!(got.queue_type, "ranked_solo_5x5");
        assert_eq\!(got.tier, "PLATINUM");
        assert_eq\!((got.wins, got.losses), (22, 18));
    }

    #[test]
    fn find_ranked_solo_returns_default_when_missing() {
        let entries = vec\![
            league_entry_with("RANKED_FLEX_SR", "GOLD", 10, 5),
            league_entry_with("NORMAL_DRAFT", "SILVER", 3, 7),
        ];
        let got = find_ranked_solo_or_default(&entries);
        assert_eq\!(got.queue_type, "RANKED_SOLO_5x5");
        assert_eq\!(got.tier, "UNRANKED");
        assert_eq\!(got.wins, 0);
        assert_eq\!(got.losses, 0);
        assert_eq\!(got.league_points, 0);
        assert\!(got.rank.is_empty());
        assert\!(got.league_id.is_empty());
        assert\!(got.puuid.is_empty());
        assert\!(got.mini_series.is_none());
    }

    // Minimal MatchDto/ParticipantDto builders:
    // Only touch fields used by get_participant_by_puuid to avoid populating the entire struct graph.
    fn match_with_participants(puuids: &[Option<&str>]) -> MatchDto {
        MatchDto {
            metadata: Default::default(),
            info: InfoDto {
                // Only participants is accessed by get_participant_by_puuid
                participants: Some(puuids.iter().map(|popt| {
                    ParticipantDto {
                        puuid: popt.map(|s| s.to_string()),
                        // Remaining fields are not read by get_participant_by_puuid
                        ..Default::default()
                    }
                }).collect()),
                ..Default::default()
            },
            ..Default::default()
        }
    }

    #[test]
    fn get_participant_by_puuid_finds_exact_match() {
        let target = "PUUID-123";
        let m = match_with_participants(&[Some("X"), None, Some(target), Some("Y")]);
        let got = get_participant_by_puuid(&m, target);
        assert\!(got.is_some(), "Expected a participant match");
        assert_eq\!(got.unwrap().puuid.as_deref(), Some(target));
    }

    #[test]
    fn get_participant_by_puuid_returns_none_when_absent() {
        let m = match_with_participants(&[Some("A"), Some("B")]);
        assert\!(get_participant_by_puuid(&m, "C").is_none());
    }

    #[test]
    fn get_participant_by_puuid_handles_none_participants() {
        let m = MatchDto { info: InfoDto { participants: None, ..Default::default() }, ..Default::default() };
        assert\!(get_participant_by_puuid(&m, "anything").is_none());
    }

    // Setup minimal schema required to exercise load_dashboard_from_cache early returns.
    fn create_minimal_tables(conn: &Connection) {
        conn.execute_batch(r#"
            CREATE TABLE IF NOT EXISTS summoners (
                puuid TEXT PRIMARY KEY,
                display_name TEXT NOT NULL,
                level INTEGER NOT NULL,
                profile_icon_id INTEGER NOT NULL,
                profile_icon_path TEXT NOT NULL,
                rank_league_id TEXT NOT NULL,
                rank_queue_type TEXT NOT NULL,
                rank_tier TEXT NOT NULL,
                rank_division TEXT NOT NULL,
                rank_lp INTEGER NOT NULL,
                rank_wins INTEGER NOT NULL,
                rank_losses INTEGER NOT NULL,
                rank_hot_streak INTEGER NOT NULL,
                rank_veteran INTEGER NOT NULL,
                rank_fresh_blood INTEGER NOT NULL,
                rank_inactive INTEGER NOT NULL,
                rank_mini_series_json TEXT,
                win_rate INTEGER NOT NULL,
                recent_games INTEGER NOT NULL,
                favorite_role TEXT NOT NULL,
                main_champion TEXT NOT NULL,
                updated_at INTEGER NOT NULL
            );
        "#).unwrap();
        // We deliberately avoid creating other tables because our tests early-return before they are used.
    }

    #[test]
    fn load_cache_returns_none_when_no_row() {
        let conn = Connection::open_in_memory().unwrap();
        create_minimal_tables(&conn);
        let puuid = "nope";
        let now = Utc::now().timestamp();
        let got = load_dashboard_from_cache(&conn, puuid, "/img", now).unwrap();
        assert\!(got.is_none());
    }

    #[test]
    fn load_cache_returns_none_when_expired() {
        let conn = Connection::open_in_memory().unwrap();
        create_minimal_tables(&conn);
        let puuid = "expired-puuid";
        let now = Utc::now().timestamp();

        // Insert a row that is older than TTL_DASHBOARD_SECS
        let expired_at = now - (TTL_DASHBOARD_SECS + 1);
        conn.execute(
            r#"INSERT INTO summoners
               (puuid, display_name, level, profile_icon_id, profile_icon_path,
                rank_league_id, rank_queue_type, rank_tier, rank_division, rank_lp,
                rank_wins, rank_losses, rank_hot_streak, rank_veteran, rank_fresh_blood,
                rank_inactive, rank_mini_series_json, win_rate, recent_games,
                favorite_role, main_champion, updated_at)
               VALUES (?1, 'Name', 10, 1, '/path',
                '', 'RANKED_SOLO_5x5', 'IRON', '', 0,
                0, 0, 0, 0, 0,
                0, NULL, 0, 0,
                'UNKNOWN', '', ?2)
            "#,
            params\![puuid, expired_at],
        ).unwrap();

        let got = load_dashboard_from_cache(&conn, puuid, "/img", now).unwrap();
        assert\!(got.is_none(), "Expected None when cache is expired");
    }
}
}
