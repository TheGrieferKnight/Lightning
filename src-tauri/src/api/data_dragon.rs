use reqwest;
use std::path::PathBuf;
use tauri::Manager;
use tokio::fs::{self, File};
use tokio::io::AsyncWriteExt;

/// Downloads an image from Data Dragon and saves it to the app's data directory.
pub async fn download_image(
    app: &tauri::AppHandle,
    url: &str,
    filename: &str,
    subfolder: &str,
) -> Result<(), String> {
    let full_url = format!("{url}{filename}.png");
    let response = reqwest::get(&full_url)
        .await
        .map_err(|e| format!("Failed to fetch image: {e}"))?;
    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Failed to read image bytes: {e}"))?;

    let app_data_dir: PathBuf = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {e}"))?;

    let full_path = app_data_dir.join(format!("assets/{subfolder}/{filename}.png"));
    println!("{full_path:?}");
    if let Some(parent) = full_path.parent() {
        fs::create_dir_all(parent)
            .await
            .map_err(|e| format!("Failed to create directory: {e}"))?;
    }

    let mut file = File::create(&full_path)
        .await
        .map_err(|e| format!("Failed to create file: {e}"))?;
    file.write_all(&bytes)
        .await
        .map_err(|e| format!("Failed to write file: {e}"))?;

    println!("Downloaded image: {filename}");
    Ok(())
}

/// Returns the local path to a summoner spell image.
#[tauri::command]
pub async fn get_image_path(
    app: tauri::AppHandle,
    subfolder: &str,
    name: &str,
) -> Result<String, String> {
    let app_data_dir: PathBuf = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {e}"))?;

    Ok(format!(
        "{}/assets/{}/{}.png",
        app_data_dir
            .into_os_string()
            .into_string()
            .unwrap_or_default(),
        subfolder,
        name
    ))
}

/// Downloads all necessary static assets from Data Dragon.
#[tauri::command]
pub async fn download_necessary_files(app: tauri::AppHandle) {
    let spell_url = "https://ddragon.leagueoflegends.com/cdn/15.15.1/img/spell/";
    let spell_files = [
        "SummonerBarrier.png",
        "SummonerBoost.png",
        "SummonerCherryFlash.png",
        "SummonerCherryHold.png",
        "SummonerDot.png",
        "SummonerExhaust.png",
        "SummonerFlash.png",
        "SummonerHaste.png",
        "SummonerHeal.png",
        "SummonerMana.png",
        "SummonerPoroRecall.png",
        "SummonerPoroThrow.png",
        "SummonerSmite.png",
        "SummonerSnowURFSnowball_Mark.png",
        "SummonerSnowball.png",
        "SummonerTeleport.png",
        "Summoner_UltBookPlaceholder.png",
        "Summoner_UltBookSmitePlaceholder.png",
    ];

    for filename in spell_files {
        let _ = download_image(&app, spell_url, filename, "summoner_spells").await;
    }

    let champ_url = "https://ddragon.leagueoflegends.com/cdn/15.15.1/img/champion/";
    let champ_files = include!("champion_list.rs"); // Move champion list to a separate file for cleanliness

    for filename in champ_files {
        let _ = download_image(&app, champ_url, filename, "champion_squares").await;
    }
}
