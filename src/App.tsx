// Standalone LeagueDashboard (mock-data version)

import "./styles/App.css";
import { useState, useEffect } from "react";
import {
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Star,
  Shield,
  Zap,
  Users,
  Calendar,
  Award,
  Activity,
  LucideIcon,
} from "lucide-react";

/* ...interfaces and mock data unchanged... */

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  color = "blue",
}) => (
  <div className="bg-neutral-900/50 supports-[backdrop-filter]:backdrop-blur-md rounded-xl p-6 border border-neutral-800/60 hover:border-neutral-700/60 transition-all duration-300 transform-gpu will-change-[transform] hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none shadow-lg has-noise">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-${color}-500/20`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      {trend !== undefined && (
        <div
          className={`flex items-center text-sm ${
            trend > 0 ? "text-yellow-400" : "text-red-400"
          }`}
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          {trend > 0 ? "+" : ""}
          {trend}%
        </div>
      )}
    </div>
    <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
    <p className="text-sm text-cyan-300">{title}</p>
    {subtitle && <p className="text-xs text-cyan-300/80 mt-1">{subtitle}</p>}
  </div>
);

export default function LeagueDashboard() {
  const [isLive, setIsLive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-app-gradient-smooth has-noise text-white">
      {/* Header */}
      <header className="bg-header-gradient-smooth supports-[backdrop-filter]:backdrop-blur-md border-b border-neutral-800/60 sticky top-0 z-10 shadow-lg has-noise">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-lg bg-avatar-gradient-smooth has-noise-light flex items-center justify-center glow-cyan">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Lightning
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-neutral-900/60 rounded-full text-sm text-cyan-200">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Profile */}
        <div className="bg-neutral-900/50 supports-[backdrop-filter]:backdrop-blur-md rounded-2xl p-8 border border-neutral-800/60 flex items-center space-x-6 shadow-lg has-noise">
          <div className="w-24 h-24 rounded-2xl bg-avatar-gradient-smooth has-noise-light flex items-center justify-center text-3xl font-bold shadow-lg glow-cyan">
            {mockSummonerData.displayName[0]}
          </div>
          <div>
            <h2 className="text-3xl font-bold">Lightning</h2>
            <div className="flex space-x-4 text-cyan-300 mt-2">
              <span>Level {mockSummonerData.level}</span>
              <span>
                {mockSummonerData.rank.tier} {mockSummonerData.rank.division}
              </span>
              <span>{mockSummonerData.rank.lp} LP</span>
            </div>
            <p className="text-sm text-cyan-300/80 mt-1">
              Main: {mockSummonerData.mainChampion} • Role:{" "}
              {mockSummonerData.favoriteRole}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Trophy}
            title="Win Rate"
            value={`${mockSummonerData.winRate}%`}
            subtitle="Last 20 games"
            trend={5}
            color="indigo"
          />
          <StatCard
            icon={Activity}
            title="Games Played"
            value="156"
            subtitle="This season"
            trend={12}
            color="blue"
          />
          <StatCard
            icon={Award}
            title="Current LP"
            value={mockSummonerData.rank.lp}
            subtitle={`${mockSummonerData.rank.tier} ${mockSummonerData.rank.division}`}
            trend={-3}
            color="yellow"
          />
          <StatCard
            icon={Clock}
            title="Avg Game Time"
            value="31:24"
            subtitle="Recent matches"
            color="blue"
          />
        </div>

        {/* Match History */}
        <div
          className="bg-neutral-900/50 supports-[backdrop-filter]:backdrop-blur-md rounded-2xl p-6 border border-neutral-800/60 shadow-lg has-noise"
          style={{
            contentVisibility: "auto",
            containIntrinsicSize: "1px 600px",
          }}
        >
          <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Recent Matches</span>
          </h3>
          <div className="space-y-3">
            {mockMatchHistory.map((match) => (
              <div
                key={match.id}
                className={`p-4 rounded-lg border-l-4 ${
                  match.result === "Victory"
                    ? "border-yellow-400"
                    : "border-red-500"
                } bg-neutral-900/40 hover:bg-neutral-900/60 transition-colors motion-reduce:transition-none has-noise`}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{match.champion}</p>
                    <p className="text-sm text-cyan-300">
                      {match.gameMode} • {match.timestamp}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono">{match.kda}</p>
                    <p className="text-sm text-cyan-300/80">
                      {match.cs} CS • {match.duration}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Champion Mastery */}
        <div
          className="bg-neutral-900/50 supports-[backdrop-filter]:backdrop-blur-md rounded-2xl p-6 border border-neutral-800/60 shadow-lg has-noise"
          style={{
            contentVisibility: "auto",
            containIntrinsicSize: "1px 400px",
          }}
        >
          <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <Star className="w-5 h-5 text-cyan-400" />
            <span>Champion Mastery</span>
          </h3>
          <div className="space-y-4">
            {mockChampionMastery.map((champ) => (
              <div key={champ.name}>
                <div className="flex justify-between text-sm">
                  <span>
                    {champ.name} (Lvl {champ.level})
                  </span>
                  <span>{champ.points.toLocaleString()} pts</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2 mt-1">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${Math.min((champ.points / 300000) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Game */}
        {isLive && (
          <div className="bg-live-gradient-smooth supports-[backdrop-filter]:backdrop-blur-md rounded-2xl p-6 border border-blue-800/50 shadow-lg has-noise">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Live Game</span>
            </h3>
            <p>Game Mode: Ranked Solo/Duo</p>
            <p>Champion: Jinx</p>
            <p className="motion-safe:animate-pulse">Game Time: 15:42</p>
          </div>
        )}
      </div>
    </div>
  );
}
