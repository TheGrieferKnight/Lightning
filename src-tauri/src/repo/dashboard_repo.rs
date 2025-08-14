// src-tauri/src/repo/dashboard_repo.rs
use crate::types::dashboard::Match;
use anyhow::Context;
use rusqlite::{params, Connection};

pub fn get_dashboard_matches(conn: &Connection, puuid: &str) -> anyhow::Result<Vec<Match>> {
    let mut stmt = conn.prepare(
        "SELECT match_id, game_id, champion, result, kda, duration,
            game_mode, timestamp, cs
     FROM dashboard_matches
     WHERE puuid = ?1
     ORDER BY timestamp DESC",
    )?;

    let rows = stmt
        .query_map(params![puuid], |r| {
            Ok(Match {
                match_id: r.get::<_, String>(0)?,
                game_id: r.get::<_, i64>(1)? as u64,
                champion: r.get::<_, String>(2)?,
                result: r.get::<_, String>(3)?,
                kda: r.get::<_, String>(4)?,
                duration: r.get::<_, String>(5)?,
                game_mode: r.get::<_, String>(6)?,
                timestamp: r.get::<_, String>(7)?,
                cs: r.get::<_, i64>(8)? as u32,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(rows)
}

pub fn upsert_dashboard_match(
    conn: &Connection,
    puuid: &str,
    m: &Match,
    now: i64,
) -> anyhow::Result<()> {
    conn.execute(
        "INSERT INTO dashboard_matches (
         match_id, game_id, puuid, champion, result, kda, duration,
         game_mode, timestamp, cs, updated_at
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7,
                 ?8, ?9, ?10, ?11)
       ON CONFLICT(match_id) DO UPDATE SET
         puuid = excluded.puuid,
         champion = excluded.champion,
         result = excluded.result,
         kda = excluded.kda,
         duration = excluded.duration,
         game_mode = excluded.game_mode,
         timestamp = excluded.timestamp,
         cs = excluded.cs,
         updated_at = excluded.updated_at",
        params![
            &m.match_id,
            m.game_id as i64,
            puuid,
            &m.champion,
            &m.result,
            &m.kda,
            &m.duration,
            &m.game_mode,
            &m.timestamp,
            m.cs as i64,
            now
        ],
    )
    .context("upsert dashboard_matches")?;
    Ok(())
}
