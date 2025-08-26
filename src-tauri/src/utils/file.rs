use crate::types::response::PuuidData;
use anyhow::{Context, Result};
use std::path::PathBuf;
use tauri::Manager;

pub async fn save_puuid(app: &tauri::AppHandle, puuid_data: &PuuidData) -> Result<()> {
    let json = serde_json::to_string(puuid_data)?;
    save_file(app, "puuid.json", &json).await
}

pub async fn load_puuid(app: &tauri::AppHandle) -> Result<PuuidData> {
    let json = load_file(app, "puuid.json").await?;
    let puuid_data: PuuidData = serde_json::from_str(&json)?;
    Ok(puuid_data)
}

pub async fn save_file(app: &tauri::AppHandle, filename: &str, content: &str) -> Result<()> {
    let app_data_dir = get_app_data_dir(app)?;
    tokio::fs::create_dir_all(&app_data_dir).await?;
    let file = app_data_dir.join(filename);
    tokio::fs::write(file, content).await?;
    Ok(())
}

pub async fn load_file(app: &tauri::AppHandle, filename: &str) -> Result<String> {
    let app_data_dir = get_app_data_dir(app)?;
    let file_path = app_data_dir.join(filename);

    let contents = tokio::fs::read_to_string(&file_path)
        .await
        .with_context(|| format!("Failed to read file {}", file_path.display()))?;

    Ok(contents)
}

fn get_app_data_dir(app: &tauri::AppHandle) -> Result<PathBuf> {
    app.path()
        .app_data_dir()
        .context("Failed to get app data directory")
}
