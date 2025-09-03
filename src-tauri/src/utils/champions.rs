// src-tauri/src/utils/champions.rs
use crate::data::champion_data_map;

pub fn champion_name_from_id(id: u32) -> String {
    champion_data_map()
        .get(&id)
        .cloned()
        .unwrap_or_else(|| format!("Unknown({id})"))
}
