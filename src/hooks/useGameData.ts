// src/hooks/useGameData.ts

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getAllWindows, PhysicalPosition } from "@tauri-apps/api/window";
import { Spells, MatchData } from "../types";

export const useGameData = () => {
  const [summonerSpells, setSummonerSpells] = useState<Spells>([]);
  const [path, setPath] = useState("");
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [counter, setCounter] = useState(0);

  const moveWindow = async () => {
    const windows = await getAllWindows();
    for (const window of windows) {
      if (window.label === "SumSpellOverlay") {
        const position = new PhysicalPosition(1920 - 175, 1080 / 2 - 268 / 2);
        window.setPosition(position);
      }
    }
  };

  const getData = async () => {
    try {
      const response: Spells = await invoke("get_summoner_spells");
      const applicationPath: string = await invoke("get_image_path", {
        subfolder: "summoner_spells",
        name: "SummonerFlash",
      });
      const matchResponse: MatchData = await invoke("get_match_data");

      if (
        matchResponse &&
        typeof matchResponse === "object" &&
        "Match" in matchResponse
      ) {
        setMatchData(matchResponse);
      }
      console.log(matchResponse);

      setPath(
        applicationPath
          .replace(/\//g, "\\")
          .replace("summoner_spells\\SummonerFlash.png", ""),
      );

      console.log("Received summoner spells:", response);
      setSummonerSpells(response);
    } catch (error) {
      console.error("Error fetching summoner spells:", error);
    }
  };

  useEffect(() => {
    // Initial data fetch
    getData();
    moveWindow();

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener("contextmenu", handleContextMenu);

    // Data refresh timer - runs every 15 seconds
    const dataRefreshInterval = setInterval(async () => {
      console.log("Auto-refreshing data...");
      setCounter((prev) => prev + 1);
      await getData();
    }, 15000);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      clearInterval(dataRefreshInterval);
    };
  }, []);

  return {
    summonerSpells,
    setSummonerSpells,
    path,
    matchData,
    counter,
  };
};
