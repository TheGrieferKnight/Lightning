// src/components/QuickActions.tsx

import React from "react";
import { Users, Target, Calendar, Award } from "lucide-react";

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  colorClass: string;
  onClick?: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon: Icon,
  label,
  colorClass,
  onClick,
}) => (
  <button
    className={`${colorClass} p-3 rounded-lg transition-colors duration-200 motion-reduce:transition-none flex items-center justify-center space-x-2 transform-gpu will-change-[transform] active:scale-95`}
    onClick={onClick}
  >
    <Icon className="w-4 h-4" />
    <span className="text-sm">{label}</span>
  </button>
);

interface QuickActionsProps {
  onFindMatch?: () => void;
  onPractice?: () => void;
  onSchedule?: () => void;
  onRewards?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onFindMatch,
  onPractice,
  onSchedule,
  onRewards,
}) => (
  <div className="bg-neutral-900/50 supports-[backdrop-filter]:backdrop-blur-sm rounded-2xl p-6 border border-neutral-800/60 has-noise">
    <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
    <div className="grid grid-cols-2 gap-3">
      <QuickActionButton
        icon={Users}
        label="Find Match"
        colorClass="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400"
        onClick={onFindMatch}
      />
      <QuickActionButton
        icon={Target}
        label="Practice"
        colorClass="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400"
        onClick={onPractice}
      />
      <QuickActionButton
        icon={Calendar}
        label="Schedule"
        colorClass="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400"
        onClick={onSchedule}
      />
      <QuickActionButton
        icon={Award}
        label="Rewards"
        colorClass="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400"
        onClick={onRewards}
      />
    </div>
  </div>
);
