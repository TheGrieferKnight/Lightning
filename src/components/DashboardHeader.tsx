// src/components/DashboardHeader.tsx

import React from 'react';
import { Shield } from 'lucide-react';

interface DashboardHeaderProps {
  isLive: boolean;
  currentTime: string;
  onToggleLiveGame: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isLive,
  currentTime,
  onToggleLiveGame
}) => (
  <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/50 sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            League Dashboard
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleLiveGame}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              isLive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isLive ? "bg-white animate-pulse" : "bg-white"
                }`}
              />
              <span>{isLive ? "Live Game" : "Start Game"}</span>
            </div>
          </button>
          <div className="text-sm text-gray-400">{currentTime}</div>
        </div>
      </div>
    </div>
  </header>
);