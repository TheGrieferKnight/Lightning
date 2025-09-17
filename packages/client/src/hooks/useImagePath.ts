// packages/client/src/hooks/useImagePath.ts
import { useDashboardData } from "./useDashboardData";

export function useImagePath(summonerName?: string) {
  return useDashboardData(summonerName, {
    select: (data) => data.imagePath,
  });
}
