// src/utils/imageUtils.ts

import { convertFileSrc } from "@tauri-apps/api/core";
import { championDataMap, spellDataMap } from '../data';

export const getSpellImageUrl = (spellId: number, path: string): string => {
  console.log(spellId);
  const spellName = spellDataMap[spellId]?.name;
  if (!spellName) return "";
  console.log(spellName);
  const subfolder = "summoner_spells\\";

  return convertFileSrc(`${path}\\${subfolder}${spellName}.png`);
};

export const getChampionImageUrl = (championId: number, path: string): string => {
  const championName = championDataMap[championId];
  if (!championName) return "";

  const subfolder = "champion_square\\";

  return convertFileSrc(`${path}\\${subfolder}${championName}.png`);
};