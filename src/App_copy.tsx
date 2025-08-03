import "./App_copy.css";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import React, { useState, useEffect } from "react";
import { getAllWindows, PhysicalPosition } from "@tauri-apps/api/window";

// Define the type aliases outside the component for better organization
// and to make them available throughout your file if needed.
type SpellPair = [number, number, number];
type Spells = SpellPair[];

function App() {
  // Define interfaces if they are used elsewhere.
  // If only used within this component, they can stay here,
  // but often it's cleaner to put them in a separate types.ts file.
  // interface PuuidData {
  //   puuid: string;
  //   game_name: string;
  //   tag_line: string;
  // }

  interface MatchData {
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

  interface Participant {
    puuid: string;
    teamId: number;
    spell1Id: number;
    spell2Id: number;
    championId: number;
    profileIconId: number;
    riotId: string;
    bot: boolean;
    gameCustomizationObjects: unknown[]; // equivalent to Vec<Value>
    perks: Perks;
  }

  interface Perks {
    perkIds: number[];
    perkStyle: number;
    perkSubStyle: number;
  }

  interface Observers {
    encryptionKey: string;
  }

  interface BannedChampion {
    championId: number; // -1 indicates no ban
    teamId: number;
    pickTurn: number;
  }

  // Type for the possible responses from `mains` command if you uncomment it later
  // type Responses = { Puuid: PuuidData } | { Match: MatchData };

  // Use useState to manage the summoner_spells data
  const [summonerSpells, setSummonerSpells] = useState<Spells>([]);
  const [path, setPath] = useState("");
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  // Removed 'result' state as it wasn't being used correctly to display `summoner_spells`
  // and removed the var summoner_spells declaration as it's replaced by state.

  const [_counter, setCounter] = useState(0);
  const [activeCooldowns, setActiveCooldowns] = useState<{
    [key: string]: number;
  }>({});

  const moveWindow = async () => {
    let windows = await getAllWindows();
    for (const window of windows) {
      if (window.label == "SumSpellOverlay") {
        let position = new PhysicalPosition(1920 - 175, 1080 / 2 - 268 / 2);
        window.setPosition(position);
      }
    }
  };

  useEffect(() => {
    // Initial data fetch
    getData();
    moveWindow();

    const handleContextMenu = (e: any) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener("contextmenu", handleContextMenu);

    // Cooldown timer - runs every second
    const cooldownInterval = setInterval(() => {
      setActiveCooldowns((prev) => {
        const updated = { ...prev };
        let hasChanges = false;

        Object.keys(updated).forEach((key) => {
          if (updated[key] > 0) {
            updated[key] -= 1;
            hasChanges = true;
          } else if (updated[key] === 0) {
            delete updated[key];
            hasChanges = true;
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    // Data refresh timer - runs every 5 seconds
    const dataRefreshInterval = setInterval(async () => {
      console.log("Auto-refreshing data...");
      setCounter((prev) => prev + 1);
      await getData();
    }, 5000);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      clearInterval(cooldownInterval);
      clearInterval(dataRefreshInterval);
    };
  }, []);

  const getData = async () => {
    try {
      // Assuming 'get_summoner_spells' returns Spells type: [number, number][]
      const response: Spells = await invoke("get_summoner_spells");
      const application_path: string = await invoke("get_image_path", {
        name: "SummonerFlash",
      });
      const matchResponse: MatchData = await invoke("get_match_data");

      if (
        matchResponse &&
        typeof matchResponse === "object" &&
        "Match" in matchResponse
      ) {
        setMatchData(matchResponse);
      }
      console.log(matchResponse);

      setPath(
        application_path
          .replace(/\//g, "\\")
          .replace("summoner_spells\\SummonerFlash.png", ""),
      );

      console.log(path);
      console.log("Received summoner spells:", response);
      setSummonerSpells(response);
    } catch (error) {
      console.error("Error fetching summoner spells:", error);
    }
  };

  interface SpellData {
    name: string;
    cooldown: number; // in seconds
  }

  interface Dictionary<T> {
    [Key: string]: T;
  }

  const champion_data_map: Dictionary<string> = {
    1: "Annie",
    2: "Olaf",
    3: "Galio",
    4: "TwistedFate",
    5: "XinZhao",
    6: "Urgot",
    7: "LeBlanc",
    8: "Vladimir",
    9: "Fiddlesticks",
    10: "Kayle",
    11: "MasterYi",
    12: "Alistar",
    13: "Ryze",
    14: "Sion",
    15: "Sivir",
    16: "Soraka",
    17: "Teemo",
    18: "Tristana",
    19: "Warwick",
    20: "Nunu",
    21: "MissFortune",
    22: "Ashe",
    23: "Tryndamere",
    24: "Jax",
    25: "Morgana",
    26: "Zilean",
    27: "Singed",
    28: "Evelynn",
    29: "Twitch",
    30: "Karthus",
    31: "ChoGath",
    32: "Amumu",
    33: "Rammus",
    34: "Anivia",
    35: "Shaco",
    36: "DrMundo",
    37: "Sona",
    38: "Kassadin",
    39: "Irelia",
    40: "Janna",
    41: "Gangplank",
    42: "Corki",
    43: "Karma",
    44: "Taric",
    45: "Veigar",
    48: "Trundle",
    50: "Swain",
    51: "Caitlyn",
    53: "Blitzcrank",
    54: "Malphite",
    55: "Katarina",
    56: "Nocturne",
    57: "Maokai",
    58: "Renekton",
    59: "JarvanIV",
    60: "Elise",
    61: "Orianna",
    62: "Wukong",
    63: "Brand",
    64: "LeeSin",
    67: "Vayne",
    68: "Rumble",
    69: "Cassiopeia",
    72: "Skarner",
    74: "Heimerdinger",
    75: "Nasus",
    76: "Nidalee",
    77: "Udyr",
    78: "Poppy",
    79: "Gragas",
    80: "Pantheon",
    81: "Ezreal",
    82: "Mordekaiser",
    83: "Yorick",
    84: "Akali",
    85: "Kennen",
    86: "Garen",
    89: "Leona",
    90: "Malzahar",
    91: "Talon",
    92: "Riven",
    96: "KogMaw",
    98: "Shen",
    99: "Lux",
    101: "Xerath",
    102: "Shyvana",
    103: "Ahri",
    104: "Graves",
    105: "Fizz",
    106: "Volibear",
    107: "Rengar",
    110: "Varus",
    111: "Nautilus",
    112: "Viktor",
    113: "Sejuani",
    114: "Fiora",
    115: "Ziggs",
    117: "Lulu",
    119: "Draven",
    120: "Hecarim",
    121: "KhaZix",
    122: "Darius",
    126: "Jayce",
    127: "Lissandra",
    131: "Diana",
    133: "Quinn",
    134: "Syndra",
    136: "AurelionSol",
    141: "Kayn",
    142: "Zoe",
    143: "Zyra",
    145: "KaiSa",
    147: "Seraphine",
    150: "Gnar",
    154: "Zac",
    157: "Yasuo",
    161: "VelKoz",
    163: "Taliyah",
    164: "Camille",
    166: "Akshan",
    200: "BelVeth",
    201: "Braum",
    202: "Jhin",
    203: "Kindred",
    221: "Zeri",
    222: "Jinx",
    223: "TahmKench",
    233: "Briar",
    234: "Viego",
    235: "Senna",
    236: "Lucian",
    238: "Zed",
    240: "Kled",
    245: "Ekko",
    246: "Qiyana",
    254: "Vi",
    266: "Aatrox",
    267: "Nami",
    268: "Azir",
    350: "Yuumi",
    360: "Samira",
    412: "Thresh",
    420: "Illaoi",
    421: "RekSai",
    427: "Ivern",
    429: "Kalista",
    432: "Bard",
    497: "Rakan",
    498: "Xayah",
    516: "Ornn",
    517: "Sylas",
    518: "Neeko",
    523: "Aphelios",
    526: "Rell",
    555: "Pyke",
    711: "Vex",
    777: "Yone",
    799: "Ambessa",
    800: "Mel",
    804: "Yunara",
    875: "Sett",
    876: "Lillia",
    887: "Gwen",
    888: "RenataGlasc",
    893: "Aurora",
    895: "Nilah",
    897: "KSante",
    901: "Smolder",
    902: "Milio",
    910: "Hwei",
    950: "Naafiri",
  };

  const spell_data_map: Dictionary<SpellData> = {
    1: { name: "SummonerBoost", cooldown: 210 }, // Cleanse
    3: { name: "SummonerExhaust", cooldown: 210 },
    4: { name: "SummonerFlash", cooldown: 300 },
    6: { name: "SummonerHaste", cooldown: 240 }, // Ghost
    7: { name: "SummonerHeal", cooldown: 240 },
    11: { name: "SummonerSmite", cooldown: 90 }, // Jungle smite
    12: { name: "SummonerTeleport", cooldown: 360 },
    13: { name: "SummonerMana", cooldown: 240 }, // Clarity
    14: { name: "SummonerDot", cooldown: 180 }, // Ignite
    21: { name: "SummonerBarrier", cooldown: 210 },
    30: { name: "SummonerPoroRecall", cooldown: 10 },
    31: { name: "SummonerPoroThrow", cooldown: 20 },
    32: { name: "SummonerSnowball", cooldown: 80 }, // Mark/Dash (ARAM)
    39: { name: "SummonerSnowURFSnowball_Mark", cooldown: 40 },
    54: { name: "Summoner_UltBookPlaceholder", cooldown: 0 },
    55: { name: "Summoner_UltBookSmitePlaceholder", cooldown: 0 },
    2201: { name: "SummonerCherryHold", cooldown: 0 },
    2202: { name: "SummonerCherryFlash", cooldown: 300 },
  };

  const getSpellImageUrl = (spellId: number): string => {
    console.log(spellId);
    let spellName = spell_data_map[spellId].name;
    if (!spellName) return "";
    console.log(spellName);
    let subfolder: string = "summoner_spells\\";

    return convertFileSrc(`${path}\\${subfolder}${spellName}.png`);
  };

  const getChampionImageUrl = (championId: number): string => {
    let championName = champion_data_map[championId];
    if (!championName) return "";

    let subfolder: string = "champion_square\\";

    return convertFileSrc(`${path}\\${subfolder}${championName}.png`);
  };

  const handleSpellClick = (
    spellId: number,
    participantIndex: number,
    spellPosition: string,
  ) => {
    const cooldownKey = `${participantIndex}-${spellPosition}`;
    const spellData = spell_data_map[spellId];

    if (spellData && spellData.cooldown > 0) {
      setActiveCooldowns((prev) => ({
        ...prev,
        [cooldownKey]: spellData.cooldown,
      }));

      console.log(
        `Started cooldown for ${spellData.name}: ${spellData.cooldown}s`,
      );
    }
  };

  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  const handleChampionDoubleClick = (rowIndex: number) => {
    if (selectedRowIndex === null) {
      setSelectedRowIndex(rowIndex);
    } else {
      if (selectedRowIndex !== rowIndex) {
        setSummonerSpells((prev) => {
          const newSpells = [...prev];
          [newSpells[selectedRowIndex], newSpells[rowIndex]] = [
            newSpells[rowIndex],
            newSpells[selectedRowIndex],
          ];
          return newSpells;
        });
      }
      setSelectedRowIndex(null);
    }
  };

  const SpellImage = ({
    spellId,
    participantIndex,
    spellPosition,
    justifyClass,
  }: {
    spellId: number;
    participantIndex: number;
    spellPosition: string;
    justifyClass: string;
  }) => {
    const cooldownKey = `${participantIndex}-${spellPosition}`;
    const remainingCooldown = activeCooldowns[cooldownKey] || 0;
    const maxCooldown = spell_data_map[spellId]?.cooldown || 0;
    const cooldownPercent =
      maxCooldown > 0 ? (remainingCooldown / maxCooldown) * 100 : 0;

    return (
      <div className={`flex items-center ${justifyClass}`}>
        <div className="relative">
          <img
            src={getSpellImageUrl(spellId)}
            alt={`Spell ${spellId}`}
            className={`w-[8vh] h-[8vh] min-w-[40px] min-h-[40px] max-w-[80px] max-h-[80px] rounded-sm cursor-pointer transition-all duration-200 object-cover block ${
              remainingCooldown > 0
                ? "opacity-60 grayscale"
                : "hover:opacity-80 hover:scale-105"
            }`}
            onClick={() =>
              handleSpellClick(spellId, participantIndex, spellPosition)
            }
          />

          {/* Cooldown Overlay */}
          {remainingCooldown > 0 && (
            <div
              className="absolute inset-0 bg-black bg-opacity-60 rounded-sm flex items-center justify-center transition-all duration-1000"
              style={{
                background: `conic-gradient(from 0deg, rgba(0,0,0,0.8) ${cooldownPercent}%, transparent ${cooldownPercent}%)`,
              }}
            >
              <span className="text-white text-xs font-bold">
                {remainingCooldown}
              </span>
            </div>
          )}

          {/* Ready indicator */}
          {remainingCooldown === 0 && maxCooldown > 0 && (
            <div className="absolute -top-1 -right-1 w-[1.5vh] h-[1.5vh] min-w-[8px] min-h-[8px] max-w-[15px] max-h-[15px] bg-green-500 rounded-full border border-white"></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Grid for displaying summoner spells with champion icons */}
      <div className="flex-1 p-2 overflow-hidden">
        <div className="grid grid-cols-3 gap-1 h-full max-h-full w-full">
          {summonerSpells.length > 0 ? (
            summonerSpells.map((spellPair, rowIndex) => {
              return (
                <React.Fragment key="Player ${rowIndex}">
                  {/* Champion Icon */}
                  <div className="flex items-center justify-center">
                    <img
                      src={getChampionImageUrl(spellPair[0] || 0)}
                      alt={`Champion ${spellPair[0]} || "Unknown"}`}
                      className={`w-[8vh] h-[8vh] min-w-[40px] min-h-[40px] max-w-[80px] max-h-[80px] rounded-sm object-cover block border-2 cursor-pointer transition-all duration-200 ${
                        selectedRowIndex === rowIndex
                          ? "border-blue-500 ring-2 ring-blue-400"
                          : "border-yellow-400 hover:scale-105"
                      }`}
                      onDoubleClick={() => handleChampionDoubleClick(rowIndex)}
                    />
                  </div>

                  {/* Spell 1 */}
                  <SpellImage
                    spellId={spellPair[1]}
                    participantIndex={rowIndex}
                    spellPosition="first"
                    justifyClass="justify-center"
                  />

                  {/* Spell 2 */}
                  <SpellImage
                    spellId={spellPair[2]}
                    participantIndex={rowIndex}
                    spellPosition="second"
                    justifyClass="justify-center"
                  />
                </React.Fragment>
              );
            })
          ) : (
            <div className="col-span-3 flex items-center justify-center h-full"></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
