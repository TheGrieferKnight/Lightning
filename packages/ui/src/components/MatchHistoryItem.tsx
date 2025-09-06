import { MatchHistoryItemProps } from "@lightning/types";
import {
  cardBase,
  getMatchChampionImageUrl,
  getResultBadgeColor,
  getResultColor,
  hoverScale,
} from "@lightning/utils";
import React, { useEffect, useRef, useState } from "react";

export const MatchHistoryItem: React.FC<MatchHistoryItemProps> = ({
  match,
  path,
  expanded,
  onToggle,
}) => {
  const [maxHeight, setMaxHeight] = useState("0px");
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (expanded && contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxHeight("0px");
    }
  }, [expanded]);

  const blueTeam = match.matchDetails.teams[0];
  const redTeam = match.matchDetails.teams[1];

  return (
    <div
      className={`rounded-lg border-l-4 ${getResultColor(
        match.result
      )} ${cardBase}`}
    >
      {/* Header row (clickable) */}
      <div
        className={`flex items-center gap-4 p-4 cursor-pointer ${hoverScale}`}
        onClick={onToggle}
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

      {/* Expandable details with animation */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight }}
      >
        <div className="px-4 pb-4 border-t border-neutral-800/60 text-sm text-cyan-200">
          {/* Team Summary Row */}
          <div className="grid grid-cols-2 text-center py-3">
            {/* Blue team */}
            <div className="space-y-1">
              <h5 className="font-semibold text-blue-400">Blue Team</h5>
              <p>Gold: {match.matchDetails.goldEarned[0].toLocaleString()}</p>
              <p>
                Towers: {match.matchDetails.towersDestroyed[0]} • Inhibitors:{" "}
                {match.matchDetails.inhibitorsDestroyed[0]}
              </p>
              <p>
                KDA: {match.matchDetails.teamKda[0][0]}/
                {match.matchDetails.teamKda[0][1]}/
                {match.matchDetails.teamKda[0][2]}
              </p>
            </div>

            {/* Red team */}
            <div className="space-y-1">
              <h5 className="font-semibold text-red-400">Red Team</h5>
              <p>Gold: {match.matchDetails.goldEarned[1].toLocaleString()}</p>
              <p>
                Towers: {match.matchDetails.towersDestroyed[1]} • Inhibitors:{" "}
                {match.matchDetails.inhibitorsDestroyed[1]}
              </p>
              <p>
                KDA: {match.matchDetails.teamKda[1][0]}/
                {match.matchDetails.teamKda[1][1]}/
                {match.matchDetails.teamKda[1][2]}
              </p>
            </div>
          </div>

          {/* Lane-by-lane comparison */}
          <div className="mt-4 space-y-2">
            {blueTeam.map((blueP, i) => {
              const redP = redTeam[i];
              return (
                <div
                  key={blueP.summonerName + "-" + redP.summonerName}
                  className="grid grid-cols-3 items-center text-xs"
                >
                  {/* Blue side */}
                  <div className="flex items-center gap-2">
                    <img
                      src={getMatchChampionImageUrl(blueP.championName, path)}
                      alt={blueP.championName}
                      className="w-6 h-6 rounded-full border border-neutral-700"
                    />
                    <span className="text-blue-300 truncate">
                      {blueP.summonerName}
                    </span>
                  </div>

                  {/* Center KDA comparison */}
                  <div className="text-center font-mono text-cyan-300">
                    {blueP.kills}/{blueP.deaths}/{blueP.assists} &nbsp;|&nbsp;{" "}
                    {redP.kills}/{redP.deaths}/{redP.assists}
                  </div>

                  {/* Red side */}
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-red-300 truncate">
                      {redP.summonerName}
                    </span>
                    <img
                      src={getMatchChampionImageUrl(redP.championName, path)}
                      alt={redP.championName}
                      className="w-6 h-6 rounded-full border border-neutral-700"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
