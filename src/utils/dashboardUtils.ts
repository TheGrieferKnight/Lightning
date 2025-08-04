// src/utils/dashboardUtils.ts

import { ColorType } from '../types/dashboard';

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString();
};

export const getMasteryLevelColor = (level: number): string => {
  const colorMap: Record<number, string> = {
    7: "bg-purple-500/20 text-purple-400",
    6: "bg-blue-500/20 text-blue-400",
    5: "bg-green-500/20 text-green-400",
    4: "bg-yellow-500/20 text-yellow-400",
  };
  return colorMap[level] ?? "bg-gray-500/20 text-gray-400";
};

export const getColorClasses = (color: ColorType) => {
  const colorMap: Record<ColorType, { bg: string; text: string; icon: string }> = {
    blue: {
      bg: "bg-blue-500/20",
      text: "text-blue-400",
      icon: "text-blue-400"
    },
    green: {
      bg: "bg-green-500/20",
      text: "text-green-400",
      icon: "text-green-400"
    },
    red: {
      bg: "bg-red-500/20",
      text: "text-red-400",
      icon: "text-red-400"
    },
    yellow: {
      bg: "bg-yellow-500/20",
      text: "text-yellow-400",
      icon: "text-yellow-400"
    },
    purple: {
      bg: "bg-purple-500/20",
      text: "text-purple-400",
      icon: "text-purple-400"
    },
    pink: {
      bg: "bg-pink-500/20",
      text: "text-pink-400",
      icon: "text-pink-400"
    },
    indigo: {
      bg: "bg-indigo-500/20",
      text: "text-indigo-400",
      icon: "text-indigo-400"
    },
    orange: {
      bg: "bg-orange-500/20",
      text: "text-orange-400",
      icon: "text-orange-400"
    }
  };
  return colorMap[color];
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const getResultColor = (result: "Victory" | "Defeat"): string => {
  return result === "Victory" ? "border-green-500" : "border-red-500";
};

export const getResultBadgeColor = (result: "Victory" | "Defeat"): string => {
  return result === "Victory" 
    ? "bg-green-500/20 text-green-400" 
    : "bg-red-500/20 text-red-400";
};