use anyhow::Context;
use rusqlite::{Transaction, params};

pub fn upsert_stats(
    tx: &Transaction,
    puuid: &str,
    total_games: u32,
    avg_game_time: &str,
    now: i64,
) -> anyhow::Result<()> {
    tx.execute(
        "INSERT INTO stats (puuid, total_games, avg_game_time, updated_at)
     VALUES (?1, ?2, ?3, ?4)
     ON CONFLICT(puuid) DO UPDATE SET
       total_games = excluded.total_games,
       avg_game_time = excluded.avg_game_time,
       updated_at = excluded.updated_at",
        params![puuid, total_games as i64, avg_game_time, now],
    )
    .context("upsert stats")?;
    Ok(())
}
