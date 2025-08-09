mod api;
mod commands;
mod data;
mod types;
mod utils;
use api::data_dragon::{download_necessary_files, get_image_path};
use commands::current_match::*;
use commands::dashboard::*;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if std::env::var("WEBVIEW2_DISABLE_GPU").is_ok() {
        eprintln!("[warning] WEBVIEW2_DISABLE_GPU was set; unsetting to keep GPU enabled.");
        std::env::remove_var("WEBVIEW2_DISABLE_GPU");
    }
    tauri::Builder::default()
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
