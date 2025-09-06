// src/hooks/useCooldowns.ts

import { useState, useEffect } from 'react';
import { spellDataMap } from '@lightning/mock';

export const useCooldowns = () => {
  const [activeCooldowns, setActiveCooldowns] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
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

    return () => {
      clearInterval(cooldownInterval);
    };
  }, []);

  const handleSpellClick = (
    spellId: number,
    participantIndex: number,
    spellPosition: string,
  ) => {
    const cooldownKey = `${participantIndex}-${spellPosition}`;
    const spellData = spellDataMap[spellId];

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

  return {
    activeCooldowns,
    handleSpellClick,
  };
};
