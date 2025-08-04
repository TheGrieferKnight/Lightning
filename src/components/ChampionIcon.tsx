// src/components/ChampionIcon.tsx

import React from 'react';
import { getChampionImageUrl } from '../utils/imageUtils';

interface ChampionIconProps {
  championId: number;
  rowIndex: number;
  selectedRowIndex: number | null;
  path: string;
  onDoubleClick: (rowIndex: number) => void;
}

export const ChampionIcon: React.FC<ChampionIconProps> = ({
  championId,
  rowIndex,
  selectedRowIndex,
  path,
  onDoubleClick,
}) => {
  return (
    <div className="flex items-center justify-center">
      <img
        src={getChampionImageUrl(championId, path)}
        alt={`Champion ${championId || "Unknown"}`}
        className={`w-[8vh] h-[8vh] min-w-[40px] min-h-[40px] max-w-[80px] max-h-[80px] rounded-sm object-cover block border-2 cursor-pointer transition-all duration-200 ${
          selectedRowIndex === rowIndex
            ? "border-blue-500 ring-2 ring-blue-400"
            : "border-yellow-400 hover:scale-105"
        }`}
        onDoubleClick={() => onDoubleClick(rowIndex)}
      />
    </div>
  );
};