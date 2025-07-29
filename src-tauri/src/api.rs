use reqwest;
use serde::{Deserialize, Serialize};

#[tauri::command]
pub async fn fetch_data() -> Result<String, String> {
    #[derive(Serialize, Deserialize, Debug)]
    struct PlayerInfo {
        puuid: String,
    }

    let api_key = String::from("RGAPI-ab4310dd-6e82-4e90-8ae7-804cd71466ec");
    let game_region: String = String::from("euw1");
    let mut puuid = get_puuid().await?;

    // get_puuid() returns Result<String, String>, so use ? operator
    let player_data: Result<PlayerInfo, serde_json::Error> = serde_json::from_str(&puuid);

    match player_data {
        Ok(data) => {
            println!("Extracted data: {:?}", data);
            println!("The PUUID is: {}", data.puuid);
            puuid = data.puuid;
        }
        Err(e) => {
            eprintln!("Error parsing JSON: {}", e);
        }
    };
    let client = reqwest::Client::new();

    let url: String = format!(
        "https://{}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/{}",
        game_region, puuid
    );

    let response = client
        .get(url)
        .header("X-Riot-Token", &api_key)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let text = response.text().await.map_err(|e| e.to_string())?;

    Ok(text)
}

pub async fn get_puuid() -> Result<String, String> {
    let api_key = String::from("RGAPI-ab4310dd-6e82-4e90-8ae7-804cd71466ec");
    let region = String::from("europe");
    let game_name = String::from("TheGrieferKnight");
    let tag_line = String::from("42069");

    let client = reqwest::Client::new();

    let url: String = format!(
        "https://{}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{}/{}",
        region, game_name, tag_line
    );

    let response = client
        .get(url)
        .header("X-Riot-Token", &api_key)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let text = response.text().await.map_err(|e| e.to_string())?;

    Ok(text)
}
