// src/lib/tauriEnv.ts
export const isTauri =
  typeof window !== 'undefined' &&
  (('__TAURI_IPC__' in window) ||
    ('__TAURI_INTERNALS__' in window) ||
    ('__TAURI_METADATA__' in window) ||
    ('__TAURI__' in window));

export async function safeInvoke<T>(
  cmd: string,
  args?: Record<string, unknown>
): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(cmd, args);
}

const CUSTOM_URL_PREFIX = 'https://ddragon.leagueoflegends.com/cdn/'

function joinUrl(base: string, p: string): string {
  const a = base.endsWith('/') ? base.slice(0, -1) : base;
  // normalize Windows paths and strip drive letters
  let b = (p || '').replace(/\\/g, '/').replace(/^[a-zA-Z]:/, '');
  if (b.startsWith('/')) b = b.slice(1);
  return `${a}/${b}`;
}

/**
 * Synchronous and safe:
 * - In Tauri: calls the injected global convertFileSrc (v2: core, v1: tauri).
 * - In Web: returns CDN + normalized filePath.
 */
export function safeConvertFileSrc(filePath: string): string {
  if (typeof window !== 'undefined') {
    const tauri = (window as any).__TAURI__;
    // v2: __TAURI__.core.convertFileSrc
    // v1: __TAURI__.tauri.convertFileSrc
    const cfs =
      tauri?.core?.convertFileSrc ??
      tauri?.tauri?.convertFileSrc ??
      tauri?.convertFileSrc; // very old shims

    if (typeof cfs === 'function') {
      try {
        return cfs(filePath);
      } catch {
        // fallthrough to raw path if something odd happens
        return filePath;
      }
    }
  }
  // Browser: prefix with your CDN
  return joinUrl(CUSTOM_URL_PREFIX, filePath);
}
