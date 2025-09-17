// packages/client/src/dashboardClient.ts
import { DashboardData } from "@lightning/types";
import { mockDashboardData } from "@lightning/mock";
import { isTauri } from "../index";

export async function getDashboardData(
  summonerName?: string
): Promise<DashboardData> {
  if (!isTauri) {
    // Web: use mock
    // Later you can switch this to fetch("/api/dashboard") in prod
    return mockDashboardData;
  }

  // Desktop (Tauri)

  const { invoke } = await import("@tauri-apps/api/core");

  let name = summonerName;
  if (!name) {
    name = await invoke<string>("get_current_summoner");
    if (!name) throw new Error("No summoner name available");
  }

  return await invoke<DashboardData>("get_dashboard_data", {
    summonerName: name,
  });
}
