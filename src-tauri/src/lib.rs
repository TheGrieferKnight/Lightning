// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod api;
mod current_match;
mod types;

use api::data_dragon::*;
use current_match::{get_match_data, get_summoner_spells};
use tauri::{Manager, Window, WindowEvent};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        /*
        .setup(|app| {
            let window = app.get_webview_window("SumSpellOverlay").unwrap(); // Changed from get_window
            // Set initial size with desired aspect ratio
            let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize::new(450.0, 600.0)));
            // Listen for window events
            let window_clone = window.clone();
            window.on_window_event(move |event| {
                if let WindowEvent::Resized(size) = event {
                    maintain_aspect_ratio(&window_clone, size); // No dereference needed
                }
            });
            Ok(())
        })
        */
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_match_data,
            mains,
            get_image_path,
            get_summoner_spells
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
