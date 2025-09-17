// packages/client/hooks/useSettings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AppSettings } from "@lightning/types";
import { loadSettings, saveSettings } from "../clients/settingsClient";

export function useSettings() {
  return useQuery<AppSettings>({
    queryKey: ["settings"],
    queryFn: loadSettings,
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();

  return useMutation({ 
    mutationFn: saveSettings,
    onSuccess: (_data, variables) => {
      // Optimistically update query cache after saving
      queryClient.setQueryData(["settings"], variables);
    },
  });
}
