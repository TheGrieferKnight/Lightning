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
        .plugin(tauri_plugin_opener::init())
        */
        .invoke_handler(tauri::generate_handler![
            get_match_data,
            mains,
            get_image_path,
            get_summoner_spells
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn maintain_aspect_ratio(window: &tauri::WebviewWindow, new_size: &tauri::PhysicalSize<u32>) {
    let target_ratio = 3.0 / 4.0; // width / height (adjust as needed)
    let current_ratio = new_size.width as f64 / new_size.height as f64;

    // Only adjust if the ratio is significantly different
    if (current_ratio - target_ratio).abs() > 0.01 {
        let (new_width, new_height) = if current_ratio > target_ratio {
            // Window is too wide, adjust width based on height
            (
                (new_size.height as f64 * target_ratio) as u32,
                new_size.height,
            )
        } else {
            // Window is too tall, adjust height based on width
            (
                new_size.width,
                (new_size.width as f64 / target_ratio) as u32,
            )
        };

        // Use a small delay to prevent infinite resize loops
        let window_clone = window.clone();
        std::thread::spawn(move || {
            std::thread::sleep(std::time::Duration::from_millis(10));
            let _ = window_clone.set_size(tauri::Size::Physical(tauri::PhysicalSize::new(
                new_width, new_height,
            )));
        });
    }
}
