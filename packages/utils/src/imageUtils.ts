// src/utils/imageUtils.ts

import { convertFileSrc } from "@tauri-apps/api/core";
import { championDataMap, spellDataMap } from "@lightning/mock";

export const getSpellImageUrl = (spellId: number, path: string): string => {
  const spellName = spellDataMap[spellId]?.name;
  if (!spellName) return "";
  const subfolder = "summoner_spells\\";

  return convertFileSrc(`${path}\\${subfolder}${spellName}.png`);
};

export const getSummonerImageUrl = (profileIconPath: string): string => {
  return convertFileSrc(`${profileIconPath}`);
};

export const getChampionImageUrl = (
  championId: number,
  path: string,
): string => {
  const championName = championDataMap[championId];
  if (!championName) return "";

  const subfolder = "champion_squares\\";

  return convertFileSrc(`${path}\\${subfolder}${championName}.png`);
};

export const getMatchChampionImageUrl = (
  championName: string,
  path: string,
): string => {
  const subfolder = "assets\\champion_squares\\";

  return convertFileSrc(`${path}\\${subfolder}${championName}.png`);
};
