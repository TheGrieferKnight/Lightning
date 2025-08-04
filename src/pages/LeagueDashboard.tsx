// src/pages/LeagueDashboard.tsx

import "../styles/App.css";
import { useState, useEffect } from "react";
import {
  Trophy,
  Activity,
  Award,
  Clock,
  Star,
} from "lucide-react";

import { DashboardHeader } from '../components/DashboardHeader';
import { SummonerProfile } from '../components/SummonerProfile';
import { StatCard } from '../components/StatCard';
import { MatchHistoryItem } from '../components/MatchHistoryItem';
import { ChampionMasteryCard } from '../components/ChampionMasteryCard';
import { LiveGameStatus } from '../components/LiveGameStatus';
import { QuickActions } from '../components/QuickActions';
import { useDashboardData } from '../hooks/useDashboardData';
import { formatTime } from '../utils/dashboardUtils';

export default function LeagueDashboard() {
  const [isLive, setIsLive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  //TODO: Pass summoner name here once integrated with API's
  const { data, loading, error, refetch } = useDashboardData();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleLiveGame = () => setIsLive(!isLive);

  const handleQuickActions = {
    onFindMatch: () => console.log('Find Match clicked'),
    onPractice: () => console.log('Practice clicked'),
    onSchedule: () => console.log('Schedule clicked'),
    onRewards: () => console.log('Rewards clicked'),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading dashboard: {error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summoner, matches, championMastery, liveGame, stats } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white">
      <DashboardHeader
        isLive={isLive}
        currentTime={formatTime(currentTime)}
        onToggleLiveGame={toggleLiveGame}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <SummonerProfile summoner={summoner} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Trophy}
            title="Win Rate"
            value={`${summoner.winRate}%`}
            subtitle="Last 20 games"
            trend={5}
            color="green"
          />
          <StatCard
            icon={Activity}
            title="Games Played"
            value={stats.totalGames}
            subtitle="This season"
            trend={12}
            color="blue"
          />
          <StatCard
            icon={Award}
            title="Current LP"
            value={summoner.rank.lp}
            subtitle={`${summoner.rank.tier} ${summoner.rank.division}`}
            trend={-3}
            color="purple"
          />
          <StatCard
            icon={Clock}
            title="Avg Game Time"
            value={stats.avgGameTime}
            subtitle="Recent matches"
            color="orange"
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
                {matches.map((match) => (
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
                {championMastery.map((champion) => (
                  <ChampionMasteryCard
                    key={champion.name}
                    champion={champion}
                  />
                ))}
              </div>
            </div>

            {/* Live Game Status */}
            {(isLive && liveGame) && (
              <LiveGameStatus liveGame={liveGame} />
            )}

            {/* Quick Actions */}
            <QuickActions {...handleQuickActions} />
          </div>
        </div>
      </div>
    </div>
  );
}
