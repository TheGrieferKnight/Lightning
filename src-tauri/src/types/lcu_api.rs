use base64::{engine::general_purpose, Engine as _};
use reqwest;
use serde::{Deserialize, Serialize};
use std::io;
use std::num::ParseIntError;
use std::path::Path;
use tokio::fs::File;
use tokio::io::AsyncReadExt;

// Define custom error types for parsing failures
#[derive(Debug)]
pub enum LockfileError {
    Io(io::Error),
    Parse(String),
    Request(reqwest::Error),
    Json(serde_json::Error),
}

// Implement From conversions for better error handling
impl From<io::Error> for LockfileError {
    fn from(err: io::Error) -> Self {
        LockfileError::Io(err)
    }
}

impl From<ParseIntError> for LockfileError {
    fn from(err: ParseIntError) -> Self {
        LockfileError::Parse(format!("Failed to parse number: {err}"))
    }
}

impl From<reqwest::Error> for LockfileError {
    fn from(err: reqwest::Error) -> Self {
        LockfileError::Request(err)
    }
}

impl From<serde_json::Error> for LockfileError {
    fn from(err: serde_json::Error) -> Self {
        LockfileError::Json(err)
    }
}

// Implement Display trait for LockfileError
impl std::fmt::Display for LockfileError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LockfileError::Io(err) => write!(f, "IO error: {err}"),
            LockfileError::Parse(msg) => write!(f, "Parse error: {msg}"),
            LockfileError::Request(err) => write!(f, "Request error: {err}"),
            LockfileError::Json(err) => write!(f, "JSON error: {err}"),
        }
    }
}

// Implement std::error::Error trait
impl std::error::Error for LockfileError {}

// Implement Into<String> for LockfileError
impl Into<std::string::String> for LockfileError {
    fn into(self) -> String {
        format!("{self}")
    }
}

// Struct to represent the current summoner data
#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CurrentSummoner {
    pub puuid: String,
    pub summoner_id: u64,
    pub account_id: u64,
    pub display_name: String,
    pub summoner_level: u32,
    pub profile_icon_id: i32,
    pub game_name: String,
    pub tag_line: String,
    // Add other fields as needed
}

pub struct Lockfile {
    _league_client: String,
    _process_id: i32,
    pub api_port: i32,
    pub password: String,
    _protocol: String,
}

impl std::fmt::Display for Lockfile {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Lockfile {{\n  Client: {}\n  PID: {}\n  API Port: {}\n  Password: [HIDDEN]\n  Protocol: {}\n}}",
            self._league_client, self._process_id, self.api_port, self._protocol
        )
    }
}

impl Lockfile {
    async fn new() -> Result<Self, LockfileError> {
        let lockfile_contents = Self::locate_lockfile().await?;
        Self::parse_lockfile_contents(&lockfile_contents)
    }

    async fn locate_lockfile() -> Result<String, io::Error> {
        let probable_path = Path::new("C:/Program Files/Riot Games/League of Legends/lockfile");

        let mut lockfile = File::open(probable_path).await?;
        let mut contents = String::new();
        lockfile.read_to_string(&mut contents).await?;

        Ok(contents)
    }

    pub fn parse_lockfile_contents(contents: &str) -> Result<Self, LockfileError> {
        let parts: Vec<&str> = contents.trim().split(':').collect();

        if parts.len() != 5 {
            return Err(LockfileError::Parse(format!(
                "Unexpected lockfile format: Expected 5 parts, got {}",
                parts.len()
            )));
        }

        let _process_id = parts[1].parse::<i32>()?;
        let api_port = parts[2].parse::<i32>()?;

        Ok(Lockfile {
            _league_client: parts[0].to_string(),
            _process_id,
            api_port,
            password: parts[3].to_string(),
            _protocol: parts[4].to_string(),
        })
    }

    // Create a configured HTTP client for LCU API requests
    fn create_client(&self) -> Result<reqwest::Client, LockfileError> {
        let client = reqwest::Client::builder()
            .danger_accept_invalid_certs(true) // LCU uses self-signed certificates
            .build()?;

        Ok(client)
    }

    // Get the authorization header value
    fn get_auth_header(&self) -> String {
        let credentials = format!("riot:{}", self.password);
        format!("Basic {}", general_purpose::STANDARD.encode(credentials))
    }

    // Get the base URL for API requests
    pub fn get_base_url(&self) -> String {
        format!("https://127.0.0.1:{}", self.api_port)
    }
}

pub struct LeagueApiClient {
    pub(crate) lockfile: Lockfile,
    client: reqwest::Client,
}

impl LeagueApiClient {
    pub async fn new() -> Result<Self, LockfileError> {
        let lockfile = Lockfile::new().await?;
        let client = lockfile.create_client()?;

        Ok(LeagueApiClient { lockfile, client })
    }

    pub async fn get_current_summoner(&self) -> Result<CurrentSummoner, LockfileError> {
        let url = format!(
            "{}/lol-summoner/v1/current-summoner",
            self.lockfile.get_base_url()
        );

        let response = self
            .client
            .get(&url)
            .header("Authorization", self.lockfile.get_auth_header())
            .send()
            .await?;

        let status = response.status();
        println!("Response status: {status}");

        if !status.is_success() {
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Failed to read error response".to_string());

            return Err(LockfileError::Parse(match status.as_u16() {
                401 => format!("Unauthorized - Check your credentials. Error: {error_text}"),
                403 => format!("Forbidden - Invalid permissions. Error: {error_text}"),
                404 => format!("Not found - Endpoint may not exist. Error: {error_text}"),
                429 => format!("Rate limit exceeded. Error: {error_text}"),
                500..=599 => format!("LCU API server error ({status}). Error: {error_text}"),
                _ => format!("HTTP error {status}: {error_text}"),
            }));
        }

        let response_text = response.text().await?;
        let current_summoner: CurrentSummoner = serde_json::from_str(&response_text)?;

        Ok(current_summoner)
    }

    pub async fn get_puuid(&self) -> Result<String, LockfileError> {
        let summoner = self.get_current_summoner().await?;
        Ok(summoner.puuid)
    }

    pub async fn get_game_name(&self) -> Result<String, LockfileError> {
        let summoner = self.get_current_summoner().await?;
        Ok(summoner.game_name)
    }

    pub async fn get_tag_line(&self) -> Result<String, LockfileError> {
        let summoner = self.get_current_summoner().await?;
        Ok(summoner.tag_line)
    }
}
