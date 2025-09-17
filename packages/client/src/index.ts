export * from "./tauriClient";
export * from "./httpClient";

export * from "./types"; // if you define DataClient interface here

import * as http from "./httpClient";
import * as tauri from "./tauriClient";

export const isTauri =
  typeof window !== 'undefined' &&
  (('__TAURI_IPC__' in window) ||
    ('__TAURI_INTERNALS__' in window) ||
    ('__TAURI_METADATA__' in window) ||
    ('__TAURI__' in window));

export const client = isTauri? tauri : http;

export * from "./hooks/useDashboardData"
export * from "./hooks/useSettings"
export * from "./hooks/useImagePath"
