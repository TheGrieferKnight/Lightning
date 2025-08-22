use anyhow::Context;
use rusqlite::{params, Transaction};

use crate::types::dashboard::ChampionMastery;

pub fn replace_masteries(
    tx: &Transaction,
    puuid: &str,
    mastery: &[ChampionMastery],
    now: i64,
) -> anyhow::Result<()> {
    tx.execute(
        "DELETE FROM champion_mastery WHERE puuid = ?1",
        params![puuid],
    )
    .context("delete old masteries")?;

    for (i, m) in mastery.iter().enumerate() {
        tx.execute(
            "INSERT INTO champion_mastery (
         puuid, name, level, points, icon, rank_order, updated_at
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                puuid,
                &m.name,
                m.level as i64,
                m.points as i64,
                &m.icon,
                i as i64,
                now
            ],
        )
        .context("insert mastery row")?;
    }

    Ok(())
}
