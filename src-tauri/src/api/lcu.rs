use crate::api::lcu_api::LeagueApiClient;

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
