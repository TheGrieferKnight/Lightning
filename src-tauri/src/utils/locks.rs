// src-tauri/src/utils/locks.rs
use std::sync::OnceLock;
use tokio::sync::Mutex;

// Global singleflight lock. Optionally change to keyed locks later.
static DASHBOARD_LOCK: OnceLock<Mutex<()>> = OnceLock::new();

pub fn dashboard_lock() -> &'static Mutex<()> {
    DASHBOARD_LOCK.get_or_init(|| Mutex::new(()))
}
