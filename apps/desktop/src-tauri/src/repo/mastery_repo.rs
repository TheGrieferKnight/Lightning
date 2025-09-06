use crate::types::response::ChampionMasteryDto;
use anyhow::Context;
use rusqlite::{params, Transaction};

pub fn replace_masteries(
    tx: &Transaction,
    puuid: &str,
    mastery: &[ChampionMasteryDto],
    now: i64,
) -> anyhow::Result<()> {
    tx.execute(
        "DELETE FROM champion_mastery WHERE puuid = ?1",
        params![puuid],
    )
    .context("delete old masteries")?;

    for (i, m) in mastery.iter().enumerate() {
        let next_season_milestone_json = m
            .next_season_milestone
            .as_ref()
            .map(|n| serde_json::to_string(n).unwrap_or_default());
        let milestone_grades_json = serde_json::to_string(&m.milestone_grades).unwrap_or_default();

        tx.execute(
            "INSERT INTO champion_mastery (
               puuid, champion_id, champion_name, champion_level, champion_points,
               chest_granted, last_play_time, champion_points_until_next_level,
               champion_points_since_last_level, mark_required_for_next_level,
               champion_season_milestone, next_season_milestone_json,
               tokens_earned, milestone_grades_json, icon, rank_order, updated_at
             ) VALUES (?1, ?2, ?3, ?4, ?5,
                       ?6, ?7, ?8,
                       ?9, ?10,
                       ?11, ?12,
                       ?13, ?14, ?15, ?16, ?17)",
            params![
                puuid,
                m.champion_id,
                crate::utils::champions::champion_name_from_id(m.champion_id as u32),
                m.champion_level,
                m.champion_points,
                if m.chest_granted.unwrap_or(false) {
                    1
                } else {
                    0
                },
                m.last_play_time,
                m.champion_points_until_next_level,
                m.champion_points_since_last_level,
                m.mark_required_for_next_level,
                m.champion_season_milestone,
                next_season_milestone_json,
                m.tokens_earned,
                milestone_grades_json,
                m.champion_id, // placeholder icon (or map champion_id -> icon)
                i as i64,
                now
            ],
        )
        .context("insert mastery row")?;
    }

    Ok(())
}
