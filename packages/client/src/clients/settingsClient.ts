// packages/client/clients/settingsClient.ts
import { AppSettings } from "@lightning/types";
import { mockSettings } from "@lightning/mock";
import { isTauri } from "../index";

export async function loadSettings(): Promise<AppSettings> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core");
    const [clientId, clientSecret] = await invoke<[string, string]>(
      "load_credentials"
    );

    // Merge with mock as fallback default values
    return {
      ...mockSettings,
      clientId,
      clientSecret,
    };
  } else {
    const id = localStorage.getItem("clientId") ?? "";
    const secret = localStorage.getItem("clientSecret") ?? "";
    return {
      ...mockSettings,
      clientId: id,
      clientSecret: secret,
    };
  }
}

export async function saveSettings(input: AppSettings): Promise<void> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("save_credentials", {
      clientId: input.clientId,
      clientSecret: input.clientSecret,
    });
  } else {
    localStorage.setItem("clientId", input.clientId);
    localStorage.setItem("clientSecret", input.clientSecret);
  }

}
