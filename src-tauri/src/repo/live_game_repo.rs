use anyhow::Context;
use rusqlite::{params, Transaction};

use crate::types::dashboard::LiveGameData;

pub fn upsert_live(
    tx: &Transaction,
    puuid: &str,
    live: &Option<LiveGameData>,
    now: i64,
) -> anyhow::Result<()> {
    match live {
        Some(l) => {
            tx.execute(
                "INSERT INTO live_game (
           puuid, game_mode, champion, game_time,
           performance_score, progress, updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
         ON CONFLICT(puuid) DO UPDATE SET
           game_mode = excluded.game_mode,
           champion = excluded.champion,
           game_time = excluded.game_time,
           performance_score = excluded.performance_score,
           progress = excluded.progress,
           updated_at = excluded.updated_at",
                params![
                    puuid,
                    &l.game_mode,
                    &l.champion,
                    &l.game_time,
                    l.performance_score as f64,
                    l.progress as i64,
                    now
                ],
            )
            .context("upsert live_game")?;
        }
        None => {
            tx.execute("DELETE FROM live_game WHERE puuid = ?1", params![puuid])
                .context("delete live_game")?;
        }
    }
    Ok(())
}
