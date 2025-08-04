// src/components/StatCard.tsx

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { StatCardProps } from '../types/dashboard';
import { getColorClasses } from '../utils/dashboardUtils';

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
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses.bg}`}>
          <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center text-sm ${
              trend > 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend > 0 ? "+" : ""}
            {trend}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-sm text-gray-400">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};