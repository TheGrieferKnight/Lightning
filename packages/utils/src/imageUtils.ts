// src/utils/imageUtils.ts
import { safeConvertFileSrc, isTauri } from "./tauriEnv";
import { championDataMap } from '@lightning/mock';
import { useImagePath } from '@lightning/client';
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
    subfolder = "\\assets\\champion_squares\\";
    const { data: imagePath, isLoading, error} = useImagePath();
    if (isLoading) return "loading";
    if (error) return "Couldnt load champion image";
    if (imagePath) path = imagePath;
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
