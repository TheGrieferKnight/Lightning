import React from "react";
import { MatchHistoryItemProps } from "../types/dashboard";
import {
  getResultColor,
  getResultBadgeColor,
  cardBase,
  hoverScale,
} from "../utils/dashboardUtils";
import { getMatchChampionImageUrl } from "../utils/imageUtils";

export const MatchHistoryItem: React.FC<MatchHistoryItemProps> = ({
  match,
  path,
}) => (
  <div
    className={`flex items-center gap-4 p-4 rounded-lg border-l-4 ${getResultColor(
      match.result
    )} ${hoverScale} ${cardBase}`}
  >
    <img
      src={getMatchChampionImageUrl(match.champion, path)}
      alt={match.champion}
      className="w-12 h-12 rounded-full border border-neutral-700 object-cover"
    />
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-white">{match.champion}</span>
        <span
          className={`text-sm px-2 py-1 rounded ${getResultBadgeColor(
            match.result
          )}`}
        >
          {match.result}
        </span>
      </div>
      <div className="text-sm text-cyan-300">
        {match.gameMode} • {match.timestamp}
      </div>
    </div>
    <div className="text-right">
      <div className="font-mono text-white">{match.kda}</div>
      <div className="text-sm text-cyan-300/80">
        {match.cs} CS • {match.duration}
      </div>
    </div>
  </div>
);
