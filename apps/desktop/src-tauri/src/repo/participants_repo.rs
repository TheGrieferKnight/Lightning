use crate::types::dashboard::{Participant, Team};
use rusqlite::{params, Connection};

pub fn get_participants(conn: &Connection, match_id: &str) -> rusqlite::Result<[Team; 2]> {
    let mut stmt = conn.prepare(
        "SELECT team, summoner_name, champion_name, kills, deaths, assists, lane,
            item0, item1, item2, item3, item4, item5, item6,
            total_minions_killed, total_damage_dealt_to_champions
     FROM participants
     WHERE match_id = ?1
     ORDER BY team, id",
    )?;

    let rows = stmt
        .query_map(params![match_id], |r| {
            Ok(Participant {
                team: r.get(0)?,
                summoner_name: r.get(1)?,
                champion_name: r.get(2)?, // ✅ new field
                kills: r.get(3)?,
                deaths: r.get(4)?,
                assists: r.get(5)?,
                lane: r.get(6)?,
                item0: r.get(7)?,
                item1: r.get(8)?,
                item2: r.get(9)?,
                item3: r.get(10)?,
                item4: r.get(11)?,
                item5: r.get(12)?,
                item6: r.get(13)?,
                total_minions_killed: r.get(14)?,
                total_damage_dealt_to_champions: r.get(15)?,
            })
        })?
        .collect::<rusqlite::Result<Vec<_>>>()?;

    if rows.len() != 10 {
        return Err(rusqlite::Error::ExecuteReturnedResults);
    }

    let team1: [Participant; 5] = rows[0..5].to_vec().try_into().unwrap();
    let team2: [Participant; 5] = rows[5..10].to_vec().try_into().unwrap();

    Ok([team1, team2])
}
pub fn upsert_participants(
    conn: &Connection,
    match_id: &str,
    teams: &[Team; 2],
) -> anyhow::Result<()> {
    // delete old participants for this match
    conn.execute(
        "DELETE FROM participants WHERE match_id = ?1",
        params![match_id],
    )?;

    let mut stmt = conn.prepare(
        "INSERT INTO participants (
          match_id, team, summoner_name, champion_name, kills, deaths, assists, lane,
          item0, item1, item2, item3, item4, item5, item6,
          total_minions_killed, total_damage_dealt_to_champions
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8,
                 ?9, ?10, ?11, ?12, ?13, ?14, ?15,
                 ?16, ?17)",
    )?;

    for team in teams {
        for p in team {
            stmt.execute(params![
                match_id,
                p.team,
                p.summoner_name,
                p.champion_name, // ✅ new field
                p.kills,
                p.deaths,
                p.assists,
                p.lane,
                p.item0,
                p.item1,
                p.item2,
                p.item3,
                p.item4,
                p.item5,
                p.item6,
                p.total_minions_killed,
                p.total_damage_dealt_to_champions,
            ])?;
        }
    }

    Ok(())
}
