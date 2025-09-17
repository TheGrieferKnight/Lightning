// packages/client/src/tauriClient.ts (Tauri command call)
import { invoke } from "@tauri-apps/api/core";

export async function getChampionList() {
  return await invoke("get_champion_list"); // implemented in Rust
}
