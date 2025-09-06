// src/components/StatCard.tsx
import React from "react";
import { TrendingUp } from "lucide-react";
import { StatCardProps } from "@lightning/types";
import { getColorClasses, cardBase, hoverScale } from "@lightning/utils";

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  color = "blue",
}) => {
  const colorClasses = getColorClasses(color);

  return (
    <div
      className={`${cardBase} rounded-2xl p-7 border border-neutral-800/60 ${hoverScale} shadow-2xl hover:shadow-cyan-500/20 transition-shadow duration-300 group`}
    >
      <div className="flex items-center justify-between mb-5">
        <div
          className={`p-4 rounded-xl ${colorClasses.bg} group-hover:scale-110 transition-transform duration-200`}
        >
          <Icon className={`w-7 h-7 ${colorClasses.icon}`} />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center text-base font-semibold ${
              trend > 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            <TrendingUp className="w-5 h-5 mr-1" />
            {trend > 0 ? "+" : ""}
            {trend}%
          </div>
        )}
      </div>
      <h3 className="text-3xl font-extrabold text-white mb-1 tracking-tight drop-shadow-lg">
        {value}
      </h3>
      <p className="text-lg text-cyan-300 font-medium mb-0.5">{title}</p>
      {subtitle && <p className="text-xs text-cyan-300/80 mt-1">{subtitle}</p>}
    </div>
  );
};
