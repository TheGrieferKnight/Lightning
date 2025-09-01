// src-tauri/src/config.rs
pub const TTL_DASHBOARD_SECS: i64 = 10 * 60;
pub const TTL_SUMMONER_FIELDS_SECS: i64 = 15 * 60;

pub const REGION: &str = "euw1"; // match-v5 regional routing
pub const CLIENT_ID: &str = "bfba5edbd0353d50";
pub const CLIENT_SECRET: &str = "4211e033dbb826edf5ddbf6d02c2c40c8cc6a94ea0d78ccf247c3bdc2573ccf6";
pub const BASE_URL: &str =
    "https://riot-api-proxy-lightnings-projects-ba45f9d4.vercel.app/api/riot";
pub const DASHBOARD_RECENT_MATCH_COUNT: usize = 20;
