// src/hooks/useGameData.ts
import { useState, useEffect, useRef } from 'react';
import { Spells, MatchData } from '@lightning/types';
import { isTauri, safeInvoke } from '@lightning/utils';

export const useGameData = () => {
  const [summonerSpells, setSummonerSpells] = useState<Spells>([]);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [counter, setCounter] = useState(0);

  const pathRef = useRef('');

  const moveWindow = async () => {
    if (!isTauri) return;

    const { getAllWindows, PhysicalPosition } = await import(
      '@tauri-apps/api/window'
    );
    const windows = await getAllWindows();

    for (const window of windows) {
      if (window.label === 'SumSpellOverlay') {
        const position = new PhysicalPosition(1920 - 175, 1080 / 2 - 268 / 2);
        window.setPosition(position);
      }
    }
  };

  const getData = async () => {
    // Web: prefer mocks; otherwise, harmless placeholders
    if (!isTauri) {
      try {
       type MockModule = {
  mockSummonerSpells?: Spells;
  mockMatchData?: MatchData;
};

const mockMod = (await import('@lightning/mock').catch(() => null)) as MockModule | null;


        if (mockMod?.mockSummonerSpells) {
          setSummonerSpells(mockMod.mockSummonerSpells as Spells);
        } else {
          setSummonerSpells([]); // minimal placeholder
        }

        if (mockMod?.mockMatchData) {
          setMatchData(mockMod.mockMatchData as MatchData);
        } else {
          setMatchData(null);
        }

        // Path not relevant on web; keep empty
        pathRef.current = '';
      } catch {
        setSummonerSpells([]);
        setMatchData(null);
        pathRef.current = '';
      }
      return;
    }

    // Tauri (desktop) path — unchanged behavior
    try {
      const applicationPath: string = await safeInvoke('get_image_path', {
        subfolder: 'summoner_spells',
        name: 'SummonerFlash',
      });

      const updatedPath = applicationPath
        .replace(/\//g, '\\')
        .replace('summoner_spells\\SummonerFlash.png', '');

      pathRef.current = updatedPath;

      const response = await safeInvoke<Spells>('get_summoner_spells');
      const matchResponse = await safeInvoke<MatchData>(
        'get_current_match_data'
      );

      if (
        matchResponse &&
        typeof matchResponse === 'object' &&
        'Match' in (matchResponse as unknown as Record<string, unknown>)
      ) {
        setMatchData(matchResponse);
      }

      console.log('Received summoner spells:', response);
      setSummonerSpells(response);
    } catch (error) {
      console.error('Error fetching summoner spells:', error);
    }
  };

  useEffect(() => {
    getData();
    // Only try to move the window in Tauri
    moveWindow();

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);

    const dataRefreshInterval = setInterval(async () => {
      console.log('Auto-refreshing data...');
      setCounter((prev) => prev + 1);
      await getData();
    }, 15000);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      clearInterval(dataRefreshInterval);
    };
  }, []);

  return {
    summonerSpells,
    setSummonerSpells,
    path: pathRef.current,
    matchData,
    counter,
  };
};
