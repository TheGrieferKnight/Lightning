use std::fs;
use std::path::PathBuf;
use tauri::Manager;

pub async fn save_puuid(app: &tauri::AppHandle, puuid: &str) -> Result<(), String> {
    let app_data_dir: PathBuf = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {e}"))?;

    fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data directory: {e}"))?;

    let puuid_file = app_data_dir.join("puuid.txt");
    fs::write(puuid_file, puuid).map_err(|e| format!("Failed to write PUUID: {e}"))?;

    Ok(())
}

#[allow(dead_code)]
pub async fn save_file(
    app: &tauri::AppHandle,
    filename: &str,
    content: &str,
) -> Result<(), String> {
    let app_data_dir: PathBuf = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {e}"))?;

    fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data directory: {e}"))?;

    let file = app_data_dir.join(filename);
    fs::write(file, content).map_err(|e| format!("Failed to write PUUID: {e}"))?;

    Ok(())
}

pub async fn load_file(app: &tauri::AppHandle, filename: &str) -> Result<String, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {e}"))?;

    let file_path = app_data_dir.join(filename);

    if file_path.exists() {
        fs::read_to_string(file_path).map_err(|e| format!("Failed to read file: {e}"))
    } else {
        Err(format!("File {filename} not found"))
    }
}

pub async fn load_puuid(app: &tauri::AppHandle) -> Result<String, String> {
    load_file(app, "puuid.txt").await
}
