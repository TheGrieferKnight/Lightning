// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod api;
mod current_match;
mod types;

use api::data_dragon::*;
use current_match::{get_match_data, get_summoner_spells};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_match_data,
            download_necessary_files,
            get_image_path,
            get_summoner_spells
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
