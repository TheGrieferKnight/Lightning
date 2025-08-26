// src/components/ChampionMasteryCard.tsx
import React from "react";
import { ChampionMasteryCardProps } from "../types/dashboard";
import {
  getMasteryLevelColor,
  formatNumber,
  cardBase,
} from "../utils/dashboardUtils";
import { getChampionImageUrl } from "../utils/imageUtils";

export const ChampionMasteryCard: React.FC<ChampionMasteryCardProps> = ({
  champion,
  path,
}) => (
  <div className={`${cardBase} rounded-lg p-4 hover:bg-neutral-900/70`}>
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-xl">
        <img src={getChampionImageUrl(champion.icon, `${path}\\assets`)}></img>
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-white">{champion.name}</h4>
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs px-2 py-1 rounded ${getMasteryLevelColor(
              champion.level
            )}`}
          >
            Level {champion.level}
          </span>
          <span className="text-xs text-cyan-300">
            {formatNumber(champion.points)} pts
          </span>
        </div>
      </div>
    </div>
  </div>
);
