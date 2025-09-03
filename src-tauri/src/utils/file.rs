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
    let file = get_app_data_dir(app, filename)?;

    if let Some(parent) = file.parent() {
        tokio::fs::create_dir_all(parent).await?;
    }
    tokio::fs::write(&file, content)
        .await
        .with_context(|| format!("Failed to write file {}", file.display()))?;
    Ok(())
}

pub async fn load_file(app: &tauri::AppHandle, filename: &str) -> Result<String> {
    let file = get_app_data_dir(app, filename)?;

    tokio::fs::read_to_string(&file)
        .await
        .with_context(|| format!("Failed to read file {}", file.display()))
}

fn get_app_data_dir(app: &tauri::AppHandle, filename: &str) -> Result<PathBuf> {
    let dir = app
        .path()
        .app_data_dir()
        .context("Failed to get app data directory")?;
    Ok(dir.join(filename))
}
