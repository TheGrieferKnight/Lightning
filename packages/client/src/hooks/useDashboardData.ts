// packages/client/src/hooks/useDashboardData.ts
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import type { DashboardData } from "@lightning/types";
import { getDashboardData } from "../clients/dashboardClient";

export function useDashboardData<TSelected = DashboardData>(
  summonerName?: string,
  options?: Omit<
    UseQueryOptions<DashboardData, Error, TSelected>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<TSelected, Error> {
  return useQuery<DashboardData, Error, TSelected>({
    queryKey: ["dashboard", summonerName ?? "current"],
    queryFn: () => getDashboardData(summonerName),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    ...options,
  });
}
