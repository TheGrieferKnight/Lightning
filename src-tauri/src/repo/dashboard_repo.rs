use crate::repo::participants_repo::{get_participants, upsert_participants};
use crate::types::dashboard::{Match, MatchDetails};
use anyhow::Context;
use rusqlite::{params, Connection};

pub fn get_dashboard_matches(conn: &Connection, puuid: &str) -> anyhow::Result<Vec<Match>> {
    let mut stmt = conn.prepare(
        "SELECT match_id, game_id, champion, result, kda, duration,
              game_mode, timestamp, cs,
              team1_towers_destroyed, team2_towers_destroyed,
              team1_inhibitors_destroyed, team2_inhibitors_destroyed,
              team1_gold_earned, team2_gold_earned,
              team1_kills, team1_deaths, team1_assists,
              team2_kills, team2_deaths, team2_assists
       FROM dashboard_matches
       WHERE puuid = ?1
       ORDER BY timestamp DESC",
    )?;

    let rows = stmt
        .query_map(params![puuid], |r| {
            let match_id: String = r.get(0)?;
            Ok(Match {
                match_id: match_id.clone(),
                game_id: r.get::<_, i64>(1)? as u64,
                champion: r.get::<_, String>(2)?,
                result: r.get::<_, String>(3)?,
                kda: r.get::<_, String>(4)?,
                duration: r.get::<_, String>(5)?,
                game_mode: r.get::<_, String>(6)?,
                timestamp: r.get::<_, String>(7)?,
                cs: r.get::<_, i64>(8)? as u16,

                match_details: MatchDetails {
                    teams: get_participants(conn, &match_id)?,
                    towers_destroyed: [r.get::<_, i64>(9)? as u8, r.get::<_, i64>(10)? as u8],
                    inhibitors_destroyed: [r.get::<_, i64>(11)? as u8, r.get::<_, i64>(12)? as u8],
                    gold_earned: [r.get::<_, i64>(13)? as u32, r.get::<_, i64>(14)? as u32],
                    team_kda: [
                        [
                            r.get::<_, i64>(15)? as u16,
                            r.get::<_, i64>(16)? as u16,
                            r.get::<_, i64>(17)? as u16,
                        ],
                        [
                            r.get::<_, i64>(18)? as u16,
                            r.get::<_, i64>(19)? as u16,
                            r.get::<_, i64>(20)? as u16,
                        ],
                    ],
                },
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
           game_mode, timestamp, cs,
           team1_towers_destroyed, team2_towers_destroyed,
           team1_inhibitors_destroyed, team2_inhibitors_destroyed,
           team1_gold_earned, team2_gold_earned,
           team1_kills, team1_deaths, team1_assists,
           team2_kills, team2_deaths, team2_assists,
           updated_at
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7,
                 ?8, ?9, ?10,
                 ?11, ?12, ?13, ?14,
                 ?15, ?16,
                 ?17, ?18, ?19,
                 ?20, ?21, ?22,
                 ?23)
       ON CONFLICT(match_id) DO UPDATE SET
           puuid = excluded.puuid,
           champion = excluded.champion,
           result = excluded.result,
           kda = excluded.kda,
           duration = excluded.duration,
           game_mode = excluded.game_mode,
           timestamp = excluded.timestamp,
           cs = excluded.cs,
           team1_towers_destroyed = excluded.team1_towers_destroyed,
           team2_towers_destroyed = excluded.team2_towers_destroyed,
           team1_inhibitors_destroyed = excluded.team1_inhibitors_destroyed,
           team2_inhibitors_destroyed = excluded.team2_inhibitors_destroyed,
           team1_gold_earned = excluded.team1_gold_earned,
           team2_gold_earned = excluded.team2_gold_earned,
           team1_kills = excluded.team1_kills,
           team1_deaths = excluded.team1_deaths,
           team1_assists = excluded.team1_assists,
           team2_kills = excluded.team2_kills,
           team2_deaths = excluded.team2_deaths,
           team2_assists = excluded.team2_assists,
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
            m.match_details.towers_destroyed[0] as i64,
            m.match_details.towers_destroyed[1] as i64,
            m.match_details.inhibitors_destroyed[0] as i64,
            m.match_details.inhibitors_destroyed[1] as i64,
            m.match_details.gold_earned[0] as i64,
            m.match_details.gold_earned[1] as i64,
            m.match_details.team_kda[0][0] as i64,
            m.match_details.team_kda[0][1] as i64,
            m.match_details.team_kda[0][2] as i64,
            m.match_details.team_kda[1][0] as i64,
            m.match_details.team_kda[1][1] as i64,
            m.match_details.team_kda[1][2] as i64,
            now
        ],
    )
    .context("upsert dashboard_matches")?;

    // also upsert participants
    upsert_participants(conn, &m.match_id, &m.match_details.teams)?;

    Ok(())
}
