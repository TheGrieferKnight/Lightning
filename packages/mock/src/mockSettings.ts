// data/mockSettings.ts
import { AppSettings } from "@lightning/types";

export const mockSettings: AppSettings = {
  autoStart: true,
  notifications: true,
  overlays: {
    scoreboard: false,
    minimap: true,
  },
  clientId: "",
  clientSecret: "",
};
