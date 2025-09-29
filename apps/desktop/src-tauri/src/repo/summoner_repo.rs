use anyhow::Context;
use rusqlite::{Transaction, params};

use crate::types::data_objects::LeagueEntryDTO;

#[allow(clippy::too_many_arguments)]
pub fn upsert_summoner(
    tx: &Transaction,
    puuid: &str,
    display_name: &str,
    level: u32,
    profile_icon_id: u32,
    profile_icon_path: &str,
    rank: &LeagueEntryDTO,
    win_rate: u32,
    recent_games: u32,
    favorite_role: &str,
    main_champion: &str,
    now: i64,
) -> anyhow::Result<()> {
    tx.execute(
        "INSERT INTO summoners (
       puuid, display_name, level, profile_icon_id, profile_icon_path,
       rank_league_id, rank_queue_type, rank_tier, rank_division, rank_lp,
       rank_wins, rank_losses, rank_hot_streak, rank_veteran,
       rank_fresh_blood, rank_inactive, rank_mini_series_json,
       win_rate, recent_games, favorite_role, main_champion, updated_at
     ) VALUES (?1, ?2, ?3, ?4, ?5,
               ?6, ?7, ?8, ?9, ?10,
               ?11, ?12, ?13, ?14,
               ?15, ?16, ?17,
               ?18, ?19, ?20, ?21, ?22)
     ON CONFLICT(puuid) DO UPDATE SET
       display_name = excluded.display_name,
       level = excluded.level,
       profile_icon_id = excluded.profile_icon_id,
       profile_icon_path = excluded.profile_icon_path,
       rank_league_id = excluded.rank_league_id,
       rank_queue_type = excluded.rank_queue_type,
       rank_tier = excluded.rank_tier,
       rank_division = excluded.rank_division,
       rank_lp = excluded.rank_lp,
       rank_wins = excluded.rank_wins,
       rank_losses = excluded.rank_losses,
       rank_hot_streak = excluded.rank_hot_streak,
       rank_veteran = excluded.rank_veteran,
       rank_fresh_blood = excluded.rank_fresh_blood,
       rank_inactive = excluded.rank_inactive,
       rank_mini_series_json = excluded.rank_mini_series_json,
       win_rate = excluded.win_rate,
       recent_games = excluded.recent_games,
       favorite_role = excluded.favorite_role,
       main_champion = excluded.main_champion,
       updated_at = excluded.updated_at",
        params![
            puuid,
            display_name,
            level as i64,
            profile_icon_id as i64,
            profile_icon_path,
            &rank.league_id,
            &rank.queue_type,
            &rank.tier,
            &rank.rank,
            rank.league_points as i64,
            rank.wins as i64,
            rank.losses as i64,
            if rank.hot_streak { 1 } else { 0 },
            if rank.veteran { 1 } else { 0 },
            if rank.fresh_blood { 1 } else { 0 },
            if rank.inactive { 1 } else { 0 },
            rank.mini_series
                .as_ref()
                .map(|ms| serde_json::to_string(ms).unwrap_or_default()),
            win_rate as i64,
            recent_games as i64,
            favorite_role,
            main_champion,
            now
        ],
    )
    .context("upsert summoner")?;

    Ok(())
}
