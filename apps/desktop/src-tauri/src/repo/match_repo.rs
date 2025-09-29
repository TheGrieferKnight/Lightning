// src-tauri/src/repo/match_repo.rs
use crate::config::REGION;
use crate::types::data_objects::{MatchDto, ObjectiveDto};
use anyhow::Context;
use rusqlite::{Connection, params};

/// Upserts a complete match record and all related metadata into the SQLite database.
///
/// This writes the raw JSON payload and synchronizes derived tables (matches, match_raw,
/// match_metadata_participants, match_teams, match_team_bans, match_team_objectives,
/// match_participants) so the database reflects the provided MatchDto. Optional fields in
/// the DTO are safely defaulted; JSON subobjects for missions/perks/challenges are serialized
/// or default to "{}".
///
/// On success, returns `Ok(())`. On failure, returns an error with contextual information
/// for the failing upsert step.
///
/// # Examples
///
/// ```
/// # use rusqlite::Connection;
/// # use anyhow::Result;
/// # fn example(conn: &Connection, md: &crate::repo::dto::MatchDto, raw: &str) -> Result<()> {
/// let now = 1_700_000_000i64;
/// crate::repo::match_repo::store_match_full(conn, md, raw, now)?;
/// # Ok(())
/// # }
/// ```
pub fn store_match_full(
    conn: &Connection,
    md: &MatchDto,
    raw_json: &str,
    now: i64,
) -> anyhow::Result<()> {
    let match_id = md.metadata.match_id.clone();

    conn.execute(
        "INSERT INTO match_raw (match_id, region, payload_json, updated_at)
       VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(match_id) DO UPDATE SET
         payload_json = excluded.payload_json,
         updated_at = excluded.updated_at",
        params![&match_id, REGION, raw_json, now],
    )
    .context("upsert match_raw")?;

    let i = &md.info;
    conn.execute(
        "INSERT INTO matches (
         match_id, data_version, platform_id, game_id, game_mode,
         game_name, game_type, game_version, map_id, queue_id,
         game_creation, game_start_timestamp, game_end_timestamp,
         game_duration, tournament_code, end_of_game_result, updated_at
       ) VALUES (
         ?1, ?2, ?3, ?4, ?5,
         ?6, ?7, ?8, ?9, ?10,
         ?11, ?12, ?13,
         ?14, ?15, ?16, ?17
       )
       ON CONFLICT(match_id) DO UPDATE SET
         platform_id = excluded.platform_id,
         game_id = excluded.game_id,
         game_mode = excluded.game_mode,
         game_version = excluded.game_version,
         game_duration = excluded.game_duration,
         end_of_game_result = excluded.end_of_game_result,
         updated_at = excluded.updated_at",
        params![
            &match_id,
            md.metadata.data_version.as_deref(),
            i.platform_id.as_deref(),
            i.game_id.unwrap_or_default(),
            i.game_mode.as_deref(),
            i.game_name.as_deref(),
            i.game_type.as_deref(),
            i.game_version.as_deref(),
            i.map_id.unwrap_or_default() as i64,
            i.queue_id.unwrap_or_default() as i64,
            i.game_creation.unwrap_or_default(),
            i.game_start_timestamp.unwrap_or_default(),
            i.game_end_timestamp.unwrap_or_default(),
            i.game_duration.unwrap_or_default(),
            i.tournament_code.as_deref(),
            i.end_of_game_result.as_deref(),
            now
        ],
    )
    .context("upsert matches")?;

    for p in &md.metadata.participants {
        conn.execute(
            "INSERT OR IGNORE INTO match_metadata_participants (match_id, puuid)
         VALUES (?1, ?2)",
            params![&match_id, p],
        )?;
    }

    if let Some(teams) = &i.teams {
        for t in teams {
            let team_id = t.team_id.unwrap_or_default() as i64;

            conn.execute(
                "INSERT INTO match_teams (match_id, team_id, win)
           VALUES (?1, ?2, ?3)
           ON CONFLICT(match_id, team_id) DO UPDATE SET
             win = excluded.win",
                params![
                    &match_id,
                    team_id,
                    t.win.map(|b| if b { 1 } else { 0 }).unwrap_or(0)
                ],
            )
            .context("upsert match_teams")?;

            if let Some(bans) = &t.bans {
                for b in bans {
                    conn.execute(
                        "INSERT OR REPLACE INTO match_team_bans
               (match_id, team_id, pick_turn, champion_id)
               VALUES (?1, ?2, ?3, ?4)",
                        params![
                            &match_id,
                            team_id,
                            b.pick_turn.unwrap_or_default() as i64,
                            b.champion_id.unwrap_or_default() as i64
                        ],
                    )
                    .context("upsert match_team_bans")?;
                }
            }

            if let Some(obj) = &t.objectives {
                let write_obj = |name: &str, o: &Option<ObjectiveDto>| -> anyhow::Result<()> {
                    if let Some(o) = o {
                        let first = o.first.map(|b| if b { 1 } else { 0 }).unwrap_or(0);
                        let kills = o.kills.unwrap_or_default() as i64;
                        conn.execute(
                            "INSERT OR REPLACE INTO match_team_objectives
                 (match_id, team_id, objective, first, kills)
                 VALUES (?1, ?2, ?3, ?4, ?5)",
                            params![&match_id, team_id, name, first, kills],
                        )
                        .with_context(|| format!("upsert match_team_objectives {name}"))?;
                    }
                    Ok(())
                };
                write_obj("baron", &obj.baron)?;
                write_obj("champion", &obj.champion)?;
                write_obj("dragon", &obj.dragon)?;
                write_obj("horde", &obj.horde)?;
                write_obj("inhibitor", &obj.inhibitor)?;
                write_obj("rift_herald", &obj.rift_herald)?;
                write_obj("tower", &obj.tower)?;
            }
        }
    }

    if let Some(parts) = &i.participants {
        for p in parts {
            let missions_json = p
                .missions
                .as_ref()
                .map(|m| serde_json::to_string(m).unwrap_or("{}".into()))
                .unwrap_or("{}".into());
            let perks_json = p
                .perks
                .as_ref()
                .map(|m| serde_json::to_string(m).unwrap_or("{}".into()))
                .unwrap_or("{}".into());
            let challenges_json = p
                .challenges
                .as_ref()
                .map(|m| serde_json::to_string(m).unwrap_or("{}".into()))
                .unwrap_or("{}".into());

            conn.execute(
                "INSERT INTO match_participants (
             match_id, participant_id, puuid, summoner_name, summoner_id,
             summoner_level, riot_id_game_name, riot_id_tagline, team_id,
             team_position, role, lane,
             champion_id, champion_name, champion_transform,
             profile_icon,
             kills, deaths, assists,
             cs_total_minions_killed, cs_neutral_minions_killed,
             missions_json, perks_json, challenges_json,
             win, updated_at
           ) VALUES (
             ?1, ?2, ?3, ?4, ?5,
             ?6, ?7, ?8, ?9,
             ?10, ?11, ?12,
             ?13, ?14, ?15,
             ?16,
             ?17, ?18, ?19,
             ?20, ?21,
             ?22, ?23, ?24,
             ?25, ?26
           )
           ON CONFLICT(match_id, participant_id) DO UPDATE SET
             puuid = excluded.puuid,
             summoner_name = excluded.summoner_name,
             summoner_id = excluded.summoner_id,
             summoner_level = excluded.summoner_level,
             riot_id_game_name = excluded.riot_id_game_name,
             riot_id_tagline = excluded.riot_id_tagline,
             team_id = excluded.team_id,
             team_position = excluded.team_position,
             role = excluded.role,
             lane = excluded.lane,
             champion_id = excluded.champion_id,
             champion_name = excluded.champion_name,
             champion_transform = excluded.champion_transform,
             profile_icon = excluded.profile_icon,
             kills = excluded.kills,
             deaths = excluded.deaths,
             assists = excluded.assists,
             cs_total_minions_killed =
               excluded.cs_total_minions_killed,
             cs_neutral_minions_killed =
               excluded.cs_neutral_minions_killed,
             missions_json = excluded.missions_json,
             perks_json = excluded.perks_json,
             challenges_json = excluded.challenges_json,
             win = excluded.win,
             updated_at = excluded.updated_at",
                params![
                    &match_id,
                    p.participant_id.unwrap_or_default() as i64,
                    p.puuid.as_deref(),
                    p.summoner_name.as_deref(),
                    p.summoner_id.as_deref(),
                    p.summoner_level.unwrap_or_default() as i64,
                    p.riot_id_game_name.as_deref(),
                    p.riot_id_tagline.as_deref(),
                    p.team_id.unwrap_or_default() as i64,
                    p.team_position.as_deref(),
                    p.role.as_deref(),
                    p.lane.as_deref(),
                    p.champion_id.unwrap_or_default() as i64,
                    p.champion_name.as_deref(),
                    p.champion_transform.unwrap_or_default() as i64,
                    p.profile_icon.unwrap_or_default() as i64,
                    p.kills.unwrap_or_default() as i64,
                    p.deaths.unwrap_or_default() as i64,
                    p.assists.unwrap_or_default() as i64,
                    p.total_minions_killed.unwrap_or_default() as i64,
                    p.neutral_minions_killed.unwrap_or_default() as i64,
                    missions_json,
                    perks_json,
                    challenges_json,
                    p.win.map(|b| if b { 1 } else { 0 }).unwrap_or(0),
                    now
                ],
            )
            .context("upsert match_participants")?;
        }
    }

    Ok(())
}
