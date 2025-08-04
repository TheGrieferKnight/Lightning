// src/components/LiveGameStatus.tsx

import React from 'react';
import { Zap } from 'lucide-react';
import { LiveGameData } from '../types/dashboard';

interface LiveGameStatusProps {
  liveGame: LiveGameData;
}

export const LiveGameStatus: React.FC<LiveGameStatusProps> = ({ liveGame }) => (
  <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 backdrop-blur-sm rounded-2xl p-6 border border-red-700/50">
    <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
      <Zap className="w-5 h-5 text-red-400" />
      <span>Live Game</span>
    </h3>
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-gray-300">Game Mode</span>
        <span className="text-white font-semibold">{liveGame.gameMode}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-300">Champion</span>
        <span className="text-white font-semibold">{liveGame.champion}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-300">Game Time</span>
        <span className="text-white font-semibold animate-pulse">
          {liveGame.gameTime}
        </span>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full animate-pulse"
            style={{ width: `${liveGame.progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Performance Score: {liveGame.performanceScore}/10
        </p>
      </div>
    </div>
  </div>
);