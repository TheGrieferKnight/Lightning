// src/utils/imageUtils.ts
import { safeConvertFileSrc, isTauri } from "./tauriEnv";
import { championDataMap } from '@lightning/mock';
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
