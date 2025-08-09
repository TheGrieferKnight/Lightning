import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import { DashboardData } from "../types/dashboard";
import { mockDashboardData } from "../data/mockData";

export const useDashboardData = (summonerName?: string) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      
      let name = summonerName;
      if (!name) {
        // Ask backend for current player
        const player = await invoke<string>("get_current_summoner");
        name = player;
        console.log(name);
      }
      
      if (!name) {
        throw new Error("No summoner name available");
      }
      
      const dashboardData = await invoke<DashboardData>("get_dashboard_data", {
        summonerName: name,
      });
      console.log(dashboardData);
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.log(err);
      setData(mockDashboardData); // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(()  => {
    fetchAllData(); 
  }, [summonerName]);

  return { data, loading, error, refetch: fetchAllData };
};
