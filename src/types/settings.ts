// types/settings.ts
export interface AppSettings {
  autoStart: boolean;
  notifications: boolean;
  overlays: {
    spellTracker: boolean;
    scoreboard: boolean;
    minimap: boolean;
  };
  clientId: string;
  clientSecret: string;
}
