// src/components/ChampionMasteryCard.tsx

import React from 'react';
import { ChampionMasteryCardProps } from '../types/dashboard';
import { getMasteryLevelColor, formatNumber } from '../utils/dashboardUtils';

export const ChampionMasteryCard: React.FC<ChampionMasteryCardProps> = ({
  champion,
}) => (
  <div className="bg-gray-800/40 rounded-lg p-4 hover:bg-gray-800/60 transition-colors duration-200">
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl">
        {champion.icon}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-white">{champion.name}</h4>
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs px-2 py-1 rounded ${getMasteryLevelColor(champion.level)}`}
          >
            Level {champion.level}
          </span>
          <span className="text-xs text-gray-400">
            {formatNumber(champion.points)} pts
          </span>
        </div>
      </div>
    </div>
  </div>
);