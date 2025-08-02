// Full fixed file with types/interfaces added
import "./App.css";
import { useState, useEffect } from "react";
import {
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Star,
  Shield,
  //  Sword,
  Zap,
  Users,
  Calendar,
  Award,
  Activity,
  LucideIcon,
} from "lucide-react";

// Interfaces
interface SummonerData {
  displayName: string;
  level: number;
  profileIconId: number;
  rank: {
    tier: string;
    division: string;
    lp: number;
  };
  winRate: number;
  recentGames: number;
  favoriteRole: string;
  mainChampion: string;
}

interface Match {
  id: number;
  champion: string;
  result: "Victory" | "Defeat";
  kda: string;
  duration: string;
  gameMode: string;
  timestamp: string;
  cs: number;
}

interface ChampionMastery {
  name: string;
  level: number;
  points: number;
  icon: string;
}

interface ChampionMasteryCardProps {
  champion: ChampionMastery;
}

interface MatchHistoryItemProps {
  match: Match;
}

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  color?:
    | "blue"
    | "green"
    | "red"
    | "yellow"
    | "purple"
    | "pink"
    | "indigo"
    | "orange";
}

// Mock data
const mockSummonerData: SummonerData = {
  displayName: "RiftMaster2024",
  level: 87,
  profileIconId: 4371,
  rank: { tier: "GOLD", division: "II", lp: 64 },
  winRate: 73,
  recentGames: 15,
  favoriteRole: "ADC",
  mainChampion: "Jinx",
};

const mockMatchHistory: Match[] = [
  {
    id: 1,
    champion: "Jinx",
    result: "Victory",
    kda: "12/3/7",
    duration: "28:45",
    gameMode: "Ranked Solo",
    timestamp: "2 hours ago",
    cs: 287,
  },
  {
    id: 2,
    champion: "Caitlyn",
    result: "Defeat",
    kda: "8/6/4",
    duration: "35:12",
    gameMode: "Ranked Solo",
    timestamp: "4 hours ago",
    cs: 245,
  },
  {
    id: 3,
    champion: "Vayne",
    result: "Victory",
    kda: "15/2/9",
    duration: "42:33",
    gameMode: "Ranked Solo",
    timestamp: "6 hours ago",
    cs: 312,
  },
  {
    id: 4,
    champion: "Ezreal",
    result: "Victory",
    kda: "9/4/12",
    duration: "31:28",
    gameMode: "Ranked Solo",
    timestamp: "1 day ago",
    cs: 201,
  },
  {
    id: 5,
    champion: "Kai'Sa",
    result: "Defeat",
    kda: "6/8/3",
    duration: "26:15",
    gameMode: "Ranked Solo",
    timestamp: "1 day ago",
    cs: 178,
  },
];

const mockChampionMastery: ChampionMastery[] = [
  { name: "Jinx", level: 7, points: 284750, icon: "🎯" },
  { name: "Caitlyn", level: 6, points: 167432, icon: "🔫" },
  { name: "Vayne", level: 5, points: 89234, icon: "🏹" },
  { name: "Ezreal", level: 4, points: 45678, icon: "✨" },
];

// Components
const ChampionMasteryCard: React.FC<ChampionMasteryCardProps> = ({
  champion,
}) => (
  <div className="bg-gray-800/40 rounded-lg p-4 hover:bg-gray-800/60 transition-colors duration-200">
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl">
        {champion.icon}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-white">{champion.name}</h4>
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs px-2 py-1 rounded ${
              {
                7: "bg-purple-500/20 text-purple-400",
                6: "bg-blue-500/20 text-blue-400",
                5: "bg-green-500/20 text-green-400",
                4: "bg-yellow-500/20 text-yellow-400",
              }[champion.level as 4 | 5 | 6 | 7] ??
              "bg-gray-500/20 text-gray-400"
            }`}
          >
            Level {champion.level}
          </span>
          <span className="text-xs text-gray-400">
            {champion.points.toLocaleString()} pts
          </span>
        </div>
      </div>
    </div>
  </div>
);

const MatchHistoryItem: React.FC<MatchHistoryItemProps> = ({ match }) => (
  <div
    className={`bg-gray-800/40 rounded-lg p-4 border-l-4 ${
      match.result === "Victory" ? "border-green-500" : "border-red-500"
    } hover:bg-gray-800/60 transition-colors duration-200`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl">
          {match.champion[0]}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-white">{match.champion}</span>
            <span
              className={`text-sm px-2 py-1 rounded ${
                match.result === "Victory"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {match.result}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            {match.gameMode} • {match.timestamp}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-white">{match.kda}</div>
        <div className="text-sm text-gray-400">
          {match.cs} CS • {match.duration}
        </div>
      </div>
    </div>
  </div>
);

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  color = "blue",
}) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-${color}-500/20`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
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

export default function LeagueDashboard() {
  const [isLive, setIsLive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleLiveGame = () => setIsLive(!isLive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                League Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleLiveGame}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isLive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isLive ? "bg-white animate-pulse" : "bg-white"
                    }`}
                  />
                  <span>{isLive ? "Live Game" : "Start Game"}</span>
                </div>
              </button>
              <div className="text-sm text-gray-400">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summoner Profile */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-bold">
              {mockSummonerData.displayName[0]}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">
                {mockSummonerData.displayName}
              </h2>
              <div className="flex items-center space-x-4 text-gray-300">
                <span className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>Level {mockSummonerData.level}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Trophy className="w-4 h-4" />
                  <span>
                    {mockSummonerData.rank.tier}{" "}
                    {mockSummonerData.rank.division}
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>{mockSummonerData.rank.lp} LP</span>
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                Main: {mockSummonerData.mainChampion} • Role:{" "}
                {mockSummonerData.favoriteRole}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Trophy}
            title="Win Rate"
            value={`${mockSummonerData.winRate}%`}
            subtitle="Last 20 games"
            trend={5}
            color="green"
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
            color="purple"
          />
          <StatCard
            icon={Clock}
            title="Avg Game Time"
            value="31:24"
            subtitle="Recent matches"
            color="orange"
            trend={undefined}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Match History */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Matches</span>
                </h3>
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {mockMatchHistory.map((match) => (
                  <MatchHistoryItem key={match.id} match={match} />
                ))}
              </div>
            </div>
          </div>

          {/* Champion Mastery & Quick Stats */}
          <div className="space-y-6">
            {/* Champion Mastery */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Champion Mastery</span>
              </h3>
              <div className="space-y-3">
                {mockChampionMastery.map((champion, _index) => (
                  <ChampionMasteryCard
                    key={champion.name}
                    champion={champion}
                  />
                ))}
              </div>
            </div>

            {/* Live Game Status */}
            {isLive && (
              <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 backdrop-blur-sm rounded-2xl p-6 border border-red-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-red-400" />
                  <span>Live Game</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Game Mode</span>
                    <span className="text-white font-semibold">
                      Ranked Solo/Duo
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Champion</span>
                    <span className="text-white font-semibold">Jinx</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Game Time</span>
                    <span className="text-white font-semibold animate-pulse">
                      15:42
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full animate-pulse"
                        style={{ width: "65%" }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Performance Score: 8.2/10
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 p-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Find Match</span>
                </button>
                <button className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 p-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Practice</span>
                </button>
                <button className="bg-green-600/20 hover:bg-green-600/30 text-green-400 p-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Schedule</span>
                </button>
                <button className="bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 p-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">Rewards</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
