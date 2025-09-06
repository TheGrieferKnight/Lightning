// src/components/SpellGrid.tsx

import React from "react";
import { SpellImage } from "./SpellImage";
import { ChampionIcon } from "./ChampionIcon";
import { Spells } from "@lightning/types";

interface SpellGridProps {
  summonerSpells: Spells;
  selectedRowIndex: number | null;
  activeCooldowns: { [key: string]: number };
  path: string;
  onChampionDoubleClick: (rowIndex: number) => void;
  onSpellClick: (
    spellId: number,
    participantIndex: number,
    spellPosition: string
  ) => void;
}

export const SpellGrid: React.FC<SpellGridProps> = ({
  summonerSpells,
  selectedRowIndex,
  activeCooldowns,
  path,
  onChampionDoubleClick,
  onSpellClick,
}) => {
  return (
    <div className="flex-1 p-2 overflow-hidden">
      <div className="grid grid-cols-3 gap-1 h-full max-h-full w-full">
        {summonerSpells.length > 0 ? (
          summonerSpells.map((spellPair, rowIndex) => (
            <React.Fragment key={`Player ${rowIndex}`}>
              {/* Champion Icon */}
              <ChampionIcon
                championId={spellPair[0] || 0}
                rowIndex={rowIndex}
                selectedRowIndex={selectedRowIndex}
                path={path}
                onDoubleClick={onChampionDoubleClick}
              />

              {/* Spell 1 */}
              <SpellImage
                spellId={spellPair[1]}
                participantIndex={rowIndex}
                spellPosition="first"
                justifyClass="justify-center"
                path={path}
                activeCooldowns={activeCooldowns}
                onSpellClick={onSpellClick}
              />

              {/* Spell 2 */}
              <SpellImage
                spellId={spellPair[2]}
                participantIndex={rowIndex}
                spellPosition="second"
                justifyClass="justify-center"
                path={path}
                activeCooldowns={activeCooldowns}
                onSpellClick={onSpellClick}
              />
            </React.Fragment>
          ))
        ) : (
          <div className="col-span-3 flex items-center justify-center h-full"></div>
        )}
      </div>
    </div>
  );
};
