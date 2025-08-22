use crate::api::lcu_api::LeagueApiClient;
use anyhow::Result;

pub async fn get_tag_line_simple() -> Result<String> {
    let api_client = LeagueApiClient::new().await?;
    let tag_line = api_client.get_tag_line().await
}

pub async fn get_game_name_simple() -> Result<String> {
    let api_client = LeagueApiClient::new().await?;
    let game_name = api_client.get_game_name().await
}
