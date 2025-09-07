// src/utils/imageUtils.ts

import { championDataMap, spellDataMap } from "@lightning/mock";
import { safeConvertFileSrc, isTauri } from "./tauriEnv";

export const getSpellImageUrl = (spellId: number, path: string): string => {
  const spellName = spellDataMap[spellId]?.name;
  if (!spellName) return "";
  const subfolder = "summoner_spells\\";

  return safeConvertFileSrc(`${path}\\${subfolder}${spellName}.png`);
};

export const getSummonerImageUrl = (profileIconPath: string): string => {
  return safeConvertFileSrc(`${profileIconPath}`);
};

export const getChampionImageUrl = (
  championId: number,
  path: string
): string => {
  const championName = championDataMap[championId];
  if (!championName) return "";
  let subfolder;
  if (isTauri == true) {
    subfolder = "\\champion_squares\\";
  } else {
    subfolder = "";
    path = "15.17.1/img/champion/";
  }
  return safeConvertFileSrc(`${path}${subfolder}${championName}.png`);
};

export const getMatchChampionImageUrl = (
  championName: string,
  path: string
): string => {
  let subfolder;
  if(isTauri) {
  subfolder = "\\assets\\champion_squares\\";
} else {
  subfolder = "";
  path = "15.17.1/img/champion/";
}
  return safeConvertFileSrc(`${path}${subfolder}${championName}.png`);
};
