import "./App_copy.css";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";

// Define the type aliases outside the component for better organization
// and to make them available throughout your file if needed.
type SpellPair = [number, number];
type Spells = SpellPair[];

function App() {
  // Define interfaces if they are used elsewhere.
  // If only used within this component, they can stay here,
  // but often it's cleaner to put them in a separate types.ts file.
  interface PuuidData {
    puuid: string;
    game_name: string;
    tag_line: string;
  }

  interface MatchData {
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
  type Responses = { Puuid: PuuidData } | { Match: MatchData };

  // Use useState to manage the summoner_spells data
  const [summonerSpells, setSummonerSpells] = useState<Spells>([]);
  var [path, setPath] = useState("");
  // Removed 'result' state as it wasn't being used correctly to display `summoner_spells`
  // and removed the var summoner_spells declaration as it's replaced by state.

  const [counter, setCounter] = useState(0);

  useEffect(() => {
    // This runs every 1000ms (1 second)
    const interval = setInterval(async () => {
      console.log("Main loop tick!");
      setCounter((prev) => prev + 1);
      // Do your main loop work here:
      // - Update game data
      // - Fetch new information
      // - Check for changes
      // etc.
    }, 1000);

    // Cleanup function - important to prevent memory leaks
    return () => clearInterval(interval);
  }, []);

  const getData = async () => {
    try {
      // Assuming 'get_summoner_spells' returns Spells type: [number, number][]
      const response: Spells = await invoke("get_summoner_spells");
      const application_path: string = await invoke("get_image_path", {
        name: "SummonerFlash",
      });
      await invoke("mains");
      setPath(
        application_path.replace(/\//g, "\\").replace("SummonerFlash.png", "")
      );
      console.log(path);
      console.log("Received summoner spells:", response);
      // Update the state with the received data
      setSummonerSpells(response);
    } catch (error) {
      console.error("Error fetching summoner spells:", error);
    }
  };

  // Helper function to generate image URLs based on spell IDs
  // You'll need to replace this with your actual image URL logic
  interface ChampionData {
    key: number;
    name: string;
  }

  interface SpellData {
    name: string;
    cooldown: number; // in seconds
  }

  interface Dictionary<T> {
    [Key: string]: T;
  }

  const champion_data_map: Dictionary<String> = {
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

  // Mock data for demonstration
  const mockSummonerSpells = [
    [4, 14], // Flash, Ignite
    [4, 7], // Flash, Heal
    [4, 12], // Flash, Teleport
    [11, 4], // Smite, Flash
    [4, 21], // Flash, Barrier
  ];

  // Mock champion data
  const mockChampions = ["Ahri", "Yasuo", "Jinx", "Lee Sin", "Lux"];

  const getSpellImageUrl = (spellId: number): string => {
    const spellData = spell_data_map[spellId];
    if (!spellData) return "";

    // Mock image URL - replace with your actual image logic
    return convertFileSrc(`${path}${spell_data_map[spellId]}.png`);
  };

  const getChampionImageUrl = (championName: string): string => {
    // Mock image URL - replace with your actual champion image logic
    return `https://via.placeholder.com/48x48/c2410c/ffffff?text=${championName.slice(
      0,
      2
    )}`;
  };
  // This is a placeholder. You need actual paths to your spell images.
  // Example: `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/spell/${spellId}.png`
  // Or from your local assets: `/assets/spell_images/${spellId}.png`

  return (
    <>
      <div className="p-4">
        <button
          onClick={getData}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Call Rust & Get Spells
        </button>
        {/* Displaying raw data for debugging/inspection. Optional. */}
        {/* Make sure summonerSpells is converted to a string for display */}
        {/* <pre className="mt-4 whitespace-pre-wrap break-words">
          {JSON.stringify(summonerSpells, null, 2)}
        </pre> */}
      </div>

      <p></p>

      {/* Grid for displaying summoner spells */}
      <div className="grid grid-cols-3 grid-rows-5 gap-1">
        {summonerSpells.length > 0 ? (
          summonerSpells.map((spellPair, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {/* First column (empty for now) */}
              <div className="flex items-center justify-end pr-0">
                <img
                  src={getSpellImageUrl(spellPair[1])}
                  className="w-12 h-12 rounded-sm"
                ></img>
              </div>

              {/* Second column: Spell 1 - Remove right margin/padding */}
              <div className="flex items-center justify-end pl-0 pr-0">
                <img
                  src={getSpellImageUrl(spellPair[0])}
                  alt={`Spell ${spellPair[0]}`}
                  className="w-12 h-12 rounded-sm"
                />
              </div>

              {/* Third column: Spell 2 - Remove left margin/padding */}
              <div className="flex items-center justify-start pl-0">
                <img
                  src={getSpellImageUrl(spellPair[1])}
                  alt={`Spell ${spellPair[1]}`}
                  className="w-12 h-12 rounded-sm"
                />
              </div>
            </React.Fragment>
          ))
        ) : (
          <div className="col-span-3 text-center p-4">
            <p>Click "Call Rust" to load summoner spells.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
