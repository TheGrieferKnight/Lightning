// data/mockSettings.ts
import { AppSettings } from "../types/settings";

export const mockSettings: AppSettings = {
  autoStart: true,
  notifications: true,
  overlays: {
    spellTracker: true,
    scoreboard: false,
    minimap: true,
  },
  clientId: "",
  clientSecret: "",
};
