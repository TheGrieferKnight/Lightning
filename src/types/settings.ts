export interface AppSettings {
  autoStart: boolean;
  overlays: {
    summonerSpells: boolean;
    liveGame: boolean;
    matchHistory: boolean;
  };
  theme: "light" | "dark" | "system";
  notifications: boolean;
}
