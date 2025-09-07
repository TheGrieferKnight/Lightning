// types/settings.ts
export interface AppSettings {
  autoStart: boolean;
  notifications: boolean;
  overlays: {
    scoreboard: boolean;
    minimap: boolean;
  };
  clientId: string;
  clientSecret: string;
}
