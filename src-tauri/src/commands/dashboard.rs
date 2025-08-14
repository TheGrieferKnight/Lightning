use crate::services::dashboard_service::build_dashboard;
use crate::types::dashboard::DashboardData;
use crate::utils::locks::dashboard_lock;

#[tauri::command]
pub async fn get_dashboard_data(
    app: tauri::AppHandle,
    summoner_name: String,
) -> Result<DashboardData, String> {
    let _guard = dashboard_lock().lock().await;

    match build_dashboard(app, summoner_name).await {
        Ok(data) => Ok(data),
        Err(e) => {
            eprintln!("[get_dashboard_data] ERROR: {:?}", e);
            Err(e.to_string())
        }
    }
}
