//\! Unit tests for dashboard_service.rs focused on recent diff.
//\! Framework: Rust built-in test harness (cargo test), no external test deps.

#\![allow(clippy::unwrap_used)]

use super::*;
use std::time::{SystemTime, UNIX_EPOCH};

fn mk_league_entry(queue: &str, tier: &str, wins: u32, losses: u32) -> LeagueEntryDTO {
    LeagueEntryDTO {
        league_id: String::from("L123"),
        puuid: String::from("puuid-xyz"),
        queue_type: queue.to_string(),
        tier: tier.to_string(),
        rank: "I".to_string(),
        league_points: 50,
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
fn find_ranked_solo_returns_exact_match() {
    let entries = vec\![
        mk_league_entry("RANKED_FLEX_SR", "GOLD", 10, 8),
        mk_league_entry("RANKED_SOLO_5x5", "PLATINUM", 20, 10),
    ];
    let got = find_ranked_solo_or_default(&entries);
    assert_eq\!(got.queue_type, "RANKED_SOLO_5x5");
    assert_eq\!(got.tier, "PLATINUM");
    assert_eq\!(got.wins, 20);
    assert_eq\!(got.losses, 10);
}

#[test]
fn find_ranked_solo_is_case_insensitive() {
    let entries = vec\![
        mk_league_entry("ranked_solo_5X5", "EMERALD", 12, 11),
    ];
    let got = find_ranked_solo_or_default(&entries);
    assert_eq\!(got.queue_type, "ranked_solo_5X5"); // returns cloned entry as-is
    assert_eq\!(got.tier, "EMERALD");
}

#[test]
fn find_ranked_solo_returns_default_when_absent() {
    let entries = vec\![
        mk_league_entry("RANKED_FLEX_SR", "SILVER", 5, 7),
        mk_league_entry("ARAM", "UNRANKED", 0, 0),
    ];
    let got = find_ranked_solo_or_default(&entries);
    assert_eq\!(got.queue_type, "RANKED_SOLO_5x5");
    assert_eq\!(got.tier, "UNRANKED");
    assert_eq\!(got.wins, 0);
    assert_eq\!(got.losses, 0);
    assert_eq\!(got.rank, "");
    assert_eq\!(got.league_points, 0);
    assert\!(got.mini_series.is_none());
}

#[test]
fn get_participant_by_puuid_finds_match_when_present() {
    // Build a minimal MatchDto with two participants; only fields used by get_participant_by_puuid
    let p1 = ParticipantDto { puuid: Some("a".into()), ..Default::default() };
    let p2 = ParticipantDto { puuid: Some("b".into()), ..Default::default() };
    let info = InfoDto { participants: Some(vec\![p1.clone(), p2.clone()]), ..Default::default() };
    let md = MatchDto {
        metadata: MetadataDto { match_id: "MATCH-1".into(), ..Default::default() },
        info,
    };
    let got = get_participant_by_puuid(&md, "b");
    assert\!(got.is_some());
    assert_eq\!(got.unwrap().puuid.as_deref(), Some("b"));
}

#[test]
fn get_participant_by_puuid_returns_none_when_list_missing() {
    let info = InfoDto { participants: None, ..Default::default() };
    let md = MatchDto {
        metadata: MetadataDto { match_id: "MATCH-2".into(), ..Default::default() },
        info,
    };
    let got = get_participant_by_puuid(&md, "any");
    assert\!(got.is_none());
}

#[test]
fn get_participant_by_puuid_returns_none_when_not_found() {
    let p1 = ParticipantDto { puuid: Some("x".into()), ..Default::default() };
    let info = InfoDto { participants: Some(vec\![p1]), ..Default::default() };
    let md = MatchDto {
        metadata: MetadataDto { match_id: "MATCH-3".into(), ..Default::default() },
        info,
    };
    let got = get_participant_by_puuid(&md, "y");
    assert\!(got.is_none());
}

#[test]
fn load_dashboard_from_cache_returns_none_when_no_summoner_row() {
    let conn = rusqlite::Connection::open_in_memory().unwrap();
    // Create minimal schema to allow query to run but return no rows
    conn.execute_batch(r#"
        CREATE TABLE summoners (
            puuid TEXT PRIMARY KEY,
            display_name TEXT, level INTEGER, profile_icon_id INTEGER, profile_icon_path TEXT,
            rank_league_id TEXT, rank_queue_type TEXT, rank_tier TEXT, rank_division TEXT,
            rank_lp INTEGER, rank_wins INTEGER, rank_losses INTEGER,
            rank_hot_streak INTEGER, rank_veteran INTEGER, rank_fresh_blood INTEGER, rank_inactive INTEGER,
            rank_mini_series_json TEXT,
            win_rate INTEGER, recent_games INTEGER,
            favorite_role TEXT, main_champion TEXT,
            updated_at INTEGER
        );
        -- Stats table referenced later but optional path shouldn't be reached in this case
        CREATE TABLE stats (puuid TEXT PRIMARY KEY, total_games INTEGER, avg_game_time TEXT);
        -- champion_mastery as referenced later (not reached here)
        CREATE TABLE champion_mastery (
            puuid TEXT, champion_id INTEGER, champion_level INTEGER, champion_points INTEGER, icon TEXT, rank_order INTEGER
        );
    "#).unwrap();

    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() as i64;
    let res = load_dashboard_from_cache(&conn, "missing-puuid", "/tmp", now).unwrap();
    assert\!(res.is_none());
}

#[test]
fn load_dashboard_from_cache_returns_none_when_ttl_expired() {
    let conn = rusqlite::Connection::open_in_memory().unwrap();
    conn.execute_batch(r#"
        CREATE TABLE summoners (
            puuid TEXT PRIMARY KEY,
            display_name TEXT, level INTEGER, profile_icon_id INTEGER, profile_icon_path TEXT,
            rank_league_id TEXT, rank_queue_type TEXT, rank_tier TEXT, rank_division TEXT,
            rank_lp INTEGER, rank_wins INTEGER, rank_losses INTEGER,
            rank_hot_streak INTEGER, rank_veteran INTEGER, rank_fresh_blood INTEGER, rank_inactive INTEGER,
            rank_mini_series_json TEXT,
            win_rate INTEGER, recent_games INTEGER,
            favorite_role TEXT, main_champion TEXT,
            updated_at INTEGER
        );
        CREATE TABLE stats (puuid TEXT PRIMARY KEY, total_games INTEGER, avg_game_time TEXT);
        CREATE TABLE champion_mastery (
            puuid TEXT, champion_id INTEGER, champion_level INTEGER, champion_points INTEGER, icon TEXT, rank_order INTEGER
        );
    "#).unwrap();

    // Insert one summoner row with stale updated_at
    let stale_updated_at = 0i64; // very old
    conn.execute(r#"
        INSERT INTO summoners (
            puuid, display_name, level, profile_icon_id, profile_icon_path,
            rank_league_id, rank_queue_type, rank_tier, rank_division,
            rank_lp, rank_wins, rank_losses,
            rank_hot_streak, rank_veteran, rank_fresh_blood, rank_inactive,
            rank_mini_series_json,
            win_rate, recent_games,
            favorite_role, main_champion,
            updated_at
        ) VALUES (?1, 'Name', 10, 1, '/path',
                  'LID', 'RANKED_SOLO_5x5', 'BRONZE', 'IV',
                  0, 0, 0,
                  0, 0, 0, 0,
                  NULL,
                  0, 0,
                  'UNKNOWN', 'None',
                  ?2)
    "#,
    rusqlite::params\!["stale-puuid", stale_updated_at]).unwrap();

    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() as i64;
    let res = load_dashboard_from_cache(&conn, "stale-puuid", "/tmp", now).unwrap();
    assert\!(res.is_none(), "should be None when now - updated_at > TTL_DASHBOARD_SECS");
}

// Smoke test: ensure default structs compile with Default where used in helper tests.
// These type aliases/uses assume the crate exposes these DTOs in scope of dashboard_service.rs.
#[test]
fn dto_defaults_are_constructible_for_helper_tests() {
    let p: ParticipantDto = Default::default();
    let _ = p;
    let info: InfoDto = Default::default();
    let _ = info;
    let md: MatchDto = MatchDto { metadata: MetadataDto::default(), info };
    let _ = md;
}