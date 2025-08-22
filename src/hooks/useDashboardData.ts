import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect, useCallback } from "react";
import { DashboardData } from "../types/dashboard";
import { mockDashboardData } from "../data/mockData";

export const useDashboardData = (summonerName?: string) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("stuff");

      let name = summonerName;
      if (!name) {
        // Ask backend for current player
        const player = await invoke<string>("get_current_summoner");
        name = player;
        console.log("[useDashboardData] Current summoner from backend:", name);
      }

      if (!name) {
        throw new Error("No summoner name available");
      }

      // Fetch dashboard data from backend
      const dashboardData = await invoke<DashboardData>("get_dashboard_data", {
        summonerName: name,
      });

      console.log("[useDashboardData] Dashboard data received:", dashboardData);
      setData(dashboardData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch data";
      setError(message);
      console.error("[useDashboardData] Error:", message);

      // Fallback to mock data for development
      setData(mockDashboardData);
    } finally {
      setLoading(false);
    }
  }, [summonerName]); // ✅ stable unless summonerName changes

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return { data, loading, error, refetch: fetchAllData };
};
