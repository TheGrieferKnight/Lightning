#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod api;
mod clients;
mod commands;
mod config;
mod data;
mod db;
mod error;
mod repo;
mod services;
mod types;
mod utils;

// Commands
use api::data_dragon::{download_necessary_files, get_image_path};
use commands::current_match::*;
use commands::dashboard::*;

// Other imports
use tracing::{info, warn};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize tracing subscriber (logging system)

    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .with_target(false)
        .init();

    info!("Checking if GPU Acceleration is enabled");

    if std::env::var("WEBVIEW2_DISABLE_GPU").is_ok() {
        warn!("[warning] WEBVIEW2_DISABLE_GPU was set; unsetting to keep GPU enabled.");
        std::env::remove_var("WEBVIEW2_DISABLE_GPU");
    }

    info!("Starting Tauri application...");

    tauri::Builder::default()
        .setup(|app| {
            info!("Tauri setup complete for app: {}", app.package_info().name);
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_match_data,
            download_necessary_files,
            get_summoner_spells,
            get_current_player,
            get_current_summoner,
            get_dashboard_data,
            get_image_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
