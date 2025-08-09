// src/components/DashboardHeader.tsx

import React from "react";
import { Shield } from "lucide-react";

interface DashboardHeaderProps {
  isLive: boolean;
  currentTime: string;
  onToggleLiveGame: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isLive,
  currentTime,
  onToggleLiveGame,
}) => (
  <header className="bg-header-gradient-smooth supports-[backdrop-filter]:backdrop-blur-sm border-b border-neutral-800/60 sticky top-0 z-10 has-noise">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-avatar-gradient-smooth has-noise-light flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Lightning
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleLiveGame}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 motion-reduce:transition-none ${
              isLive
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isLive ? "bg-black" : "bg-white"
                }`}
              />
              <span>{isLive ? "Live Game" : "Start Game"}</span>
            </div>
          </button>
          <div className="text-sm text-cyan-300">{currentTime}</div>
        </div>
      </div>
    </div>
  </header>
);
