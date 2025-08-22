// src-tauri/src/utils/time.rs
use crate::types::data_objects::InfoDto;
use chrono::{DateTime, TimeZone, Utc};

pub fn compute_match_duration_seconds(info: &InfoDto) -> u64 {
    match (info.game_duration, info.game_end_timestamp) {
        (Some(d), Some(_)) => d.max(0) as u64,
        (Some(d), None) => (d.max(0) as u64) / 1000,
        _ => info
            .participants
            .as_ref()
            .and_then(|ps| {
                ps.iter()
                    .filter_map(|p| p.time_played.map(|t| t as u64))
                    .max()
            })
            .unwrap_or(0),
    }
}

pub fn timestamp_to_datetime(ts_millis: Option<i64>) -> DateTime<Utc> {
    ts_millis
        .and_then(|ms| Utc.timestamp_millis_opt(ms).single())
        .unwrap_or_else(Utc::now)
}

pub fn kda_string(k: i64, d: i64, a: i64) -> String {
    format!("{k}/{d}/{a}")
}
