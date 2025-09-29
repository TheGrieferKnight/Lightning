use base64::{engine::general_purpose, Engine as _};
use reqwest;
use serde::{Deserialize, Serialize};
use std::ffi::OsString;
use std::io;
use std::num::ParseIntError;
use std::path::{Path, PathBuf};
use sysinfo::{ProcessRefreshKind, ProcessesToUpdate, RefreshKind, System, UpdateKind};
use tokio::fs;
use tokio::time::{sleep, Duration};
use tracing::debug;

/// Errors that can occur when interacting with the LCU API.
#[derive(Debug)]
pub enum LockfileError {
    Io(io::Error),
    Parse(String),
    Request(reqwest::Error),
    Json(serde_json::Error),
    Http(reqwest::StatusCode),
}

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
impl std::fmt::Display for LockfileError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LockfileError::Io(err) => write!(f, "IO error: {err}"),
            LockfileError::Parse(msg) => write!(f, "Parse error: {msg}"),
            LockfileError::Request(err) => write!(f, "Request error: {err}"),
            LockfileError::Json(err) => write!(f, "JSON error: {err}"),
            LockfileError::Http(err) => write!(f, "HTTP error: {err}"),
        }
    }
}
impl std::error::Error for LockfileError {}

/// Represents the current summoner.
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
}

/// Represents the League Client lockfile.
pub struct Lockfile {
    _league_client: String,
    _process_id: i32,
    pub api_port: i32,
    pub password: String,
    _protocol: String,
}

impl Lockfile {
    async fn new() -> Result<Self, LockfileError> {
        let contents = Self::locate_lockfile().await?;
        Self::parse_lockfile_contents(&contents)
    }

    // Windows-focused, robust approach:
    // - Prefer cwd/exe paths from the process (no fragile arg parsing).
    // - Fallback to parsing --output-base-dir (handles both forms and quotes).
    // - Short retries for when the file appears slightly later.
    async fn locate_lockfile() -> Result<String, io::Error> {
        let mut sys = System::new_with_specifics(
            RefreshKind::nothing().with_processes(
                ProcessRefreshKind::nothing()
                    .with_exe(UpdateKind::Always)
                    .with_cwd(UpdateKind::Always)
                    .with_cmd(UpdateKind::Always),
            ),
        );

        // Refresh all processes and ask to update the list (true)
        sys.refresh_processes(ProcessesToUpdate::All, true);

        let proc = sys
            .processes()
            .values()
            .find(|p| {
                p.name()
                    .to_string_lossy()
                    .to_ascii_lowercase()
                    .contains("leagueclientux")
            })
            .ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "LCU not running"))?;

        let mut candidates: Vec<PathBuf> = Vec::new();

        if let Some(cwd) = proc.cwd() {
            candidates.push(cwd.join("lockfile"));
        }
        if let Some(exe) = proc.exe() {
            if let Some(dir) = exe.parent() {
                candidates.push(dir.join("lockfile"));
            }
        }

        // Fallback: parse --output-base-dir if cwd/exe didn't work
        if candidates.iter().all(|p| !p.exists()) {
            if let Some(base) = parse_output_base_dir(proc.cmd()) {
                candidates.push(Path::new(&base).join("lockfile"));
            }
        }

        // Optional last-resort default
        if candidates.is_empty() {
            candidates.push(PathBuf::from(r"C:\Riot Games\League of Legends\lockfile"));
        }

        debug!("Lockfile candidates: {candidates:?}");

        for path in candidates {
            for _ in 0..15 {
                match fs::read_to_string(&path).await {
                    Ok(s) => return Ok(s),
                    Err(e) if e.kind() == io::ErrorKind::NotFound => {
                        sleep(Duration::from_millis(120)).await;
                    }
                    Err(e) => return Err(e),
                }
            }
        }

        Err(io::Error::new(
            io::ErrorKind::NotFound,
            "LCU lockfile not found",
        ))
    }

    fn parse_lockfile_contents(contents: &str) -> Result<Self, LockfileError> {
        let parts: Vec<&str> = contents.trim().split(':').collect();
        if parts.len() != 5 {
            return Err(LockfileError::Parse(format!(
                "Unexpected lockfile format: got {} parts",
                parts.len()
            )));
        }
        Ok(Lockfile {
            _league_client: parts[0].into(),
            _process_id: parts[1].parse()?,
            api_port: parts[2].parse()?,
            password: parts[3].into(),
            _protocol: parts[4].into(),
        })
    }

    fn create_client(&self) -> Result<reqwest::Client, LockfileError> {
        Ok(reqwest::Client::builder()
            .danger_accept_invalid_certs(true)
            .build()?)
    }

    fn get_auth_header(&self) -> String {
        let credentials = format!("riot:{}", self.password);
        format!("Basic {}", general_purpose::STANDARD.encode(credentials))
    }

    fn get_base_url(&self) -> String {
        format!("https://127.0.0.1:{}", self.api_port)
    }
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

/// High-level LCU API client.
pub struct LeagueApiClient {
    pub(crate) lockfile: Lockfile,
    client: reqwest::Client,
}

impl LeagueApiClient {
    pub async fn new() -> Result<Self, LockfileError> {
        let lockfile = Lockfile::new().await?;
        let client = lockfile.create_client()?;
        Ok(Self { lockfile, client })
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
        if !response.status().is_success() {
            return Err(LockfileError::Http(response.status()));
        }
        Ok(response.json::<CurrentSummoner>().await?)
    }

    pub async fn get_game_name(&self) -> Result<String, LockfileError> {
        Ok(self.get_current_summoner().await?.game_name)
    }

    pub async fn get_tag_line(&self) -> Result<String, LockfileError> {
        Ok(self.get_current_summoner().await?.tag_line)
    }
}

fn parse_output_base_dir(cmd: &[OsString]) -> Option<String> {
    for (i, a) in cmd.iter().enumerate() {
        let s = a.to_string_lossy();
        if let Some(rest) = s.strip_prefix("--output-base-dir=") {
            return Some(trim_quotes(rest));
        }
        if s == "--output-base-dir" {
            if let Some(next) = cmd.get(i + 1) {
                return Some(trim_quotes(&next.to_string_lossy()));
            }
        }
    }
    None
}

fn trim_quotes(s: &str) -> String {
    s.trim_matches(|c| c == '"' || c == '\'' || c == ' ')
        .to_string()
}
