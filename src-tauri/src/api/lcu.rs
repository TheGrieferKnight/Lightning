use crate::api::lcu_api::{LeagueApiClient, LockfileError};

pub async fn main() -> Result<(), LockfileError> {
    println!("Initializing League API client...");

    let api_client = LeagueApiClient::new().await?;
    println!("Lockfile parsed successfully!");
    println!("{}", api_client.lockfile);

    match api_client.get_current_summoner().await {
        Ok(summoner) => {
            println!("Current summoner: {}", summoner.display_name);
            println!("Level: {}", summoner.summoner_level);
        }
        Err(e) => {
            eprintln!("Failed to get current summoner: {e:?}");
        }
    }

    Ok(())
}

pub async fn get_tag_line_simple() -> Result<String, String> {
    let api_client = LeagueApiClient::new().await.map_err(|e| format!("{e:?}"))?;
    api_client
        .get_tag_line()
        .await
        .map_err(|e| format!("{e:?}"))
}

pub async fn get_game_name_simple() -> Result<String, String> {
    let api_client = LeagueApiClient::new().await.map_err(|e| format!("{e:?}"))?;
    api_client
        .get_game_name()
        .await
        .map_err(|e| format!("{e:?}"))
}
