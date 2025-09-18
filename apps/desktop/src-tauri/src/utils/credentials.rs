use keyring::Entry;
use tracing::debug;

trait ToStringErr<T> {
    fn string_err(self) -> Result<T, String>;
}

impl<T, E: std::fmt::Display> ToStringErr<T> for Result<T, E> {
    fn string_err(self) -> Result<T, String> {
        self.map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub fn save_credentials(client_id: &str, client_secret: &str) -> Result<(), String> {
    // Use a "service name" to namespace your app
    let service = "lightning-app";

    // Store client_id
    let id_entry = Entry::new(service, "client_id").string_err()?;
    id_entry.set_password(client_id).string_err()?;

    // Store client_secret
    let secret_entry = Entry::new(service, "client_secret").string_err()?;
    secret_entry.set_password(client_secret).string_err()?;

    debug!("Stored Client ID and Secret");
    Ok(())
}

pub fn load_credentials_internal() -> anyhow::Result<(String, String)> {
    let service = "lightning-app";

    let id_entry = Entry::new(service, "client_id")?;
    let client_id = id_entry.get_password()?;

    let secret_entry = Entry::new(service, "client_secret")?;
    let client_secret = secret_entry.get_password()?;

    Ok((client_id, client_secret))
}

#[tauri::command]
pub fn load_credentials() -> Result<(String, String), String> {
    let service = "lightning-app";

    let id_entry = Entry::new(service, "client_id").map_err(|e| e.to_string())?;
    let client_id = id_entry.get_password().map_err(|e| e.to_string())?;

    let secret_entry = Entry::new(service, "client_secret").map_err(|e| e.to_string())?;
    let client_secret = secret_entry.get_password().map_err(|e| e.to_string())?;

    debug!("Loaded Client ID and Secret");

    Ok((client_id, client_secret))
}
