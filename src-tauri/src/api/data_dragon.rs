use anyhow::Result;
use futures::future::try_join_all;
use reqwest;
use std::path::{Path, PathBuf};
use tauri::Manager;
use tokio::fs::{self, File};
use tokio::io::AsyncWriteExt;
use tracing::{error, info};

/// Downloads an image from Data Dragon and saves it to the app's data directory.
pub async fn download_image(
    app: &tauri::AppHandle,
    url: &str,
    filename: &Path,
    subfolder: &Path,
) -> Result<()> {
    let filename_str = filename.to_string_lossy();

    let full_url = format!("{url}{filename_str}.png");
    let response = reqwest::get(&full_url).await?;
    let bytes = response.bytes().await?;

    let app_data_dir: PathBuf = app.path().app_data_dir()?;

    let full_path = app_data_dir
        .join("assets")
        .join(subfolder)
        .join(filename)
        .with_extension("png");

    info!("The images will be downloaded to: {full_path:?}");

    if let Some(parent) = full_path.parent() {
        fs::create_dir_all(parent).await?;
    }

    let mut file = File::create(&full_path).await?;
    file.write_all(&bytes).await?;

    info!("Succesfully downloaded image: {}", filename.display());
    Ok(())
}

/// Returns the local path to a summoner spell image.
#[tauri::command]
pub async fn get_image_path(
    app: tauri::AppHandle,
    subfolder: &Path,
    name: &Path,
) -> Result<String, String> {
    let app_data_dir: PathBuf = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {e}"))?;

    let path = app_data_dir
        .join("assets")
        .join(subfolder)
        .join(name)
        .with_extension("png");

    Ok(path.to_string_lossy().into_owned())
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

    let spell_subfolder: &Path = Path::new("summoner_spells");

    let spell_tasks = spell_files.iter().map(|s| {
        let filename = Path::new(s);
        download_image(&app, spell_url, filename, spell_subfolder)
    });

    let champ_url = "https://ddragon.leagueoflegends.com/cdn/15.15.1/img/champion/";
    let champ_files = include!("champion_list.rs"); // Move champion list to a separate file for cleanliness

    let champ_subfolder: &Path = Path::new("champion_squares");

    let champ_tasks = champ_files.iter().map(|s| {
        let filename = Path::new(s);
        download_image(&app, champ_url, filename, champ_subfolder)
    });

    if let Err(e) = try_join_all(spell_tasks.chain(champ_tasks)).await {
        error!("At least one image download failed: {e}");
    };
}
