// src/components/SummonerProfile.tsx
import React from "react";
import { Star, Trophy, Target } from "lucide-react";
import { SummonerData } from "../types/dashboard";
import { getSummonerImageUrl } from "../utils/imageUtils";
import { sectionBase } from "../utils/dashboardUtils";

export const SummonerProfile: React.FC<{ summoner: SummonerData }> = ({
  summoner,
}) => (
  <div className={`${sectionBase} flex items-center gap-6 mb-8`}>
    <div className="relative">
      <img
        src={getSummonerImageUrl(summoner.profileIconPath)}
        alt={summoner.displayName}
        className="w-24 h-24 rounded-2xl border-2 border-cyan-400 shadow-lg"
      />
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-cyan-500 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border border-white/20">
        {summoner.level}
      </span>
    </div>
    <div className="flex-1">
      <h2 className="text-3xl font-bold text-white mb-2">
        {summoner.displayName}
      </h2>
      <div className="flex items-center gap-4 text-cyan-300">
        <span className="flex items-center gap-1">
          <Star className="w-4 h-4" /> Level {summoner.level}
        </span>
        <span className="flex items-center gap-1">
          <Trophy className="w-4 h-4" /> {summoner.rank.tier}{" "}
          {summoner.rank.rank}
        </span>
        <span className="flex items-center gap-1">
          <Target className="w-4 h-4" /> {summoner.rank.leaguePoints} LP
        </span>
      </div>
      <p className="mt-2 text-sm text-cyan-300/80">
        Main: {summoner.mainChampion} • Role: {summoner.favoriteRole}
      </p>
    </div>
  </div>
);
