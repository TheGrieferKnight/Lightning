// src/pages/Dashboard.tsx
import {
  ChampionMasteryCard,
  MatchHistoryItem,
  StatCard,
  SummonerProfile,
  useDashboardData,
} from "@lightning/ui";
import { sectionBase } from "@lightning/utils";
import { Activity, Award, Clock, Star, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  // const [_currentTime, setCurrentTime] = useState(new Date());
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [expandedMatches, setExpandedMatches] = useState<Set<string>>(
    new Set()
  );

  const { data, loading, error, refetch } = useDashboardData();

  // // Clock update every second
  // useEffect(() => {
  //   const timer = setInterval(() => setCurrentTime(new Date()), 1000);
  //   return () => clearInterval(timer);
  // }, []);

  // Auto-refresh dashboard every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refetch();
    }, 30_000);
    return () => {
      clearInterval(refreshInterval);
    };
  }, [refetch]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="motion-safe:animate-spin rounded-full h-20 w-20 border-b-2 border-cyan-400 mx-auto mb-4" />
          <p className="text-cyan-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if ((error && !data) || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading dashboard: {error}</p>
          <button
            onClick={refetch}
            className="button px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summoner, matches, championMastery, stats, imagePath } = data;
  const displayedMatches = showAllMatches ? matches : matches.slice(0, 5);

  const toggleExpand = (matchId: string) => {
    setExpandedMatches((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(matchId)) {
        newSet.delete(matchId);
      } else {
        newSet.add(matchId);
      }
      return newSet;
    });
  };

  return (
    <div className="relative max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Animated border */}
      <div
        className="absolute inset-0 pointer-events-none z-0 rounded-3xl border-4 border-transparent bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-indigo-500/30 animate-gradient-move"
        style={{ filter: "blur(6px)" }}
      />
      {/* Profile */}
      <div className="relative z-10">
        <SummonerProfile summoner={summoner} />
      </div>
      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          icon={Trophy}
          title="Win Rate"
          value={`${summoner.winRate}%`}
          subtitle="This season"
          trend={5}
          color="indigo"
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
          value={summoner.rank.leaguePoints}
          subtitle={`${summoner.rank.tier} ${summoner.rank.rank}`}
          trend={-3}
          color="yellow"
        />
        <StatCard
          icon={Clock}
          title="Avg Game Time"
          value={stats.avgGameTime}
          subtitle="Recent matches"
          color="blue"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Match History */}
        <div className="lg:col-span-2">
          <div
            className={`${sectionBase}`}
            style={{
              contentVisibility: "auto",
              containIntrinsicSize: "1px 600px",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <span>Recent Matches</span>
              </h3>
              {matches.length > 5 && (
                <button
                  onClick={() => setShowAllMatches((prev) => !prev)}
                  className="button text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                >
                  {showAllMatches ? "Show Less" : "View All"}
                </button>
              )}
            </div>
            <div className="space-y-3">
              {displayedMatches.map((match) => (
                <MatchHistoryItem
                  key={match.matchId}
                  match={match}
                  path={imagePath}
                  expanded={expandedMatches.has(match.matchId)}
                  onToggle={() => toggleExpand(match.matchId)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Champion Mastery */}
          <div
            className={`${sectionBase}`}
            style={{
              contentVisibility: "auto",
              containIntrinsicSize: "1px 400px",
            }}
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Star className="w-5 h-5 text-cyan-400" />
              <span>Champion Mastery</span>
            </h3>
            <div className="space-y-3">
              {championMastery.map((champion) => (
                <ChampionMasteryCard
                  key={champion.name}
                  champion={champion}
                  path={imagePath}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
