// src/components/SpellImage.tsx

import React from 'react';
import { getSpellImageUrl } from '../utils/imageUtils';
import { spellDataMap } from '../data';

interface SpellImageProps {
  spellId: number;
  participantIndex: number;
  spellPosition: string;
  justifyClass: string;
  path: string;
  activeCooldowns: { [key: string]: number };
  onSpellClick: (spellId: number, participantIndex: number, spellPosition: string) => void;
}

export const SpellImage: React.FC<SpellImageProps> = ({
  spellId,
  participantIndex,
  spellPosition,
  justifyClass,
  path,
  activeCooldowns,
  onSpellClick,
}) => {
  const cooldownKey = `${participantIndex}-${spellPosition}`;
  const remainingCooldown = activeCooldowns[cooldownKey] || 0;
  const maxCooldown = spellDataMap[spellId]?.cooldown || 0;
  const cooldownPercent =
    maxCooldown > 0 ? (remainingCooldown / maxCooldown) * 100 : 0;

  return (
    <div className={`flex items-center ${justifyClass}`}>
      <div className="relative">
        <img
          src={getSpellImageUrl(spellId, path)}
          alt={`Spell ${spellId}`}
          className={`w-[8vh] h-[8vh] min-w-[40px] min-h-[40px] max-w-[80px] max-h-[80px] rounded-sm cursor-pointer transition-all duration-200 object-cover block ${
            remainingCooldown > 0
              ? "opacity-60 grayscale"
              : "hover:opacity-80 hover:scale-105"
          }`}
          onClick={() => onSpellClick(spellId, participantIndex, spellPosition)}
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