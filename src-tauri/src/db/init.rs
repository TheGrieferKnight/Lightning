// src-tauri/src/db/init.rs
use anyhow::Context;
use rusqlite::Connection;
use tauri::Manager;

pub fn get_app_data_dir_only(app: &tauri::AppHandle) -> String {
    app.path()
        .app_data_dir()
        .unwrap()
        .to_string_lossy()
        .to_string()
}

pub fn init_database(app: &tauri::AppHandle) -> anyhow::Result<Connection> {
    let db_path = app
        .path()
        .resolve("app.db", tauri::path::BaseDirectory::AppData)
        .context("resolve app.db path")?;

    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent)
            .with_context(|| format!("create app data dir {:?}", parent))?;
    }

    let conn = Connection::open(&db_path).with_context(|| format!("open db {:?}", db_path))?;

    conn.execute_batch(
        r#"
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
    "#,
    )
    .context("set PRAGMAs")?;

    // Keep your existing schema here (unchanged)
    conn.execute_batch(include_str!("schema.sql"))?;

    Ok(conn)
}
