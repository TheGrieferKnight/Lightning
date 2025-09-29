use anyhow::Context;
use rusqlite::{Transaction, params};

/// Inserts or updates a row in the `stats` table for the given player UUID.
///
/// Updates `total_games`, `avg_game_time`, and `updated_at` when a row with the same `puuid` already exists.
///
/// # Parameters
///
/// - `tx`: Active database transaction to execute the statement on.
/// - `puuid`: Player UUID to insert or update.
/// - `total_games`: Total number of games for the player.
/// - `avg_game_time`: Average game duration as stored in the database (string slice).
/// - `now`: Timestamp (unix epoch seconds or milliseconds, as used by the caller) to set as `updated_at`.
///
/// # Returns
///
/// `Ok(())` on success, or an error if the database operation fails.
///
/// # Examples
///
/// ```
/// use rusqlite::{Connection, params};
///
/// // create in-memory DB and table
/// let conn = Connection::open_in_memory().unwrap();
/// conn.execute(
///     "CREATE TABLE stats (puuid TEXT PRIMARY KEY, total_games INTEGER, avg_game_time TEXT, updated_at INTEGER)",
///     params![],
/// ).unwrap();
///
/// let tx = conn.transaction().unwrap();
/// // call the function under test (assumes upsert_stats is in scope)
/// upsert_stats(&tx, "player-123", 5, "00:12:34", 1_700_000_000).unwrap();
/// tx.commit().unwrap();
/// ```
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
