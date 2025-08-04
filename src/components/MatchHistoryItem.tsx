// src/components/MatchHistoryItem.tsx

import React from 'react';
import { MatchHistoryItemProps } from '../types/dashboard';
import { getResultColor, getResultBadgeColor } from '../utils/dashboardUtils';

export const MatchHistoryItem: React.FC<MatchHistoryItemProps> = ({ match }) => (
  <div
    className={`bg-gray-800/40 rounded-lg p-4 border-l-4 ${getResultColor(match.result)} hover:bg-gray-800/60 transition-colors duration-200`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl">
          {match.champion[0]}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-white">{match.champion}</span>
            <span
              className={`text-sm px-2 py-1 rounded ${getResultBadgeColor(match.result)}`}
            >
              {match.result}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            {match.gameMode} • {match.timestamp}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-white">{match.kda}</div>
        <div className="text-sm text-gray-400">
          {match.cs} CS • {match.duration}
        </div>
      </div>
    </div>
  </div>
);