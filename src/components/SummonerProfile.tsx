// src/components/SummonerProfile.tsx

import React from 'react';
import { Star, Trophy, Target } from 'lucide-react';
import { SummonerData } from '../types/dashboard';

interface SummonerProfileProps {
  summoner: SummonerData;
}

export const SummonerProfile: React.FC<SummonerProfileProps> = ({ summoner }) => (
  <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50">
    <div className="flex items-center space-x-6">
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-bold">
        {summoner.displayName[0]}
      </div>
      <div className="flex-1">
        <h2 className="text-3xl font-bold text-white mb-2">
          {summoner.displayName}
        </h2>
        <div className="flex items-center space-x-4 text-gray-300">
          <span className="flex items-center space-x-1">
            <Star className="w-4 h-4" />
            <span>Level {summoner.level}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Trophy className="w-4 h-4" />
            <span>
              {summoner.rank.tier} {summoner.rank.division}
            </span>
          </span>
          <span className="flex items-center space-x-1">
            <Target className="w-4 h-4" />
            <span>{summoner.rank.lp} LP</span>
          </span>
        </div>
        <div className="mt-2 text-sm text-gray-400">
          Main: {summoner.mainChampion} • Role: {summoner.favoriteRole}
        </div>
      </div>
    </div>
  </div>
);