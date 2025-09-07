export type SpellPair = [number, number, number];
export type Spells = SpellPair[];
export interface MatchData {
    type: string;
    gameId: number;
    mapId: number;
    gameMode: string;
    gameType: string;
    gameQueueConfigId: number;
    participants: Participant[];
    observers: Observers;
    platformId: string;
    bannedChampions: BannedChampion[];
    gameStartTime: number;
    gameLength: number;
}
export interface Participant {
    puuid: string;
    teamId: number;
    spell1Id: number;
    spell2Id: number;
    championId: number;
    profileIconId: number;
    riotId: string;
    bot: boolean;
    gameCustomizationObjects: unknown[];
    perks: Perks;
}
export interface Perks {
    perkIds: number[];
    perkStyle: number;
    perkSubStyle: number;
}
export interface Observers {
    encryptionKey: string;
}
export interface BannedChampion {
    championId: number;
    teamId: number;
    pickTurn: number;
}
export interface SpellData {
    name: string;
    cooldown: number;
}
export interface Dictionary<T> {
    [Key: string]: T;
}
//# sourceMappingURL=spell.d.ts.map