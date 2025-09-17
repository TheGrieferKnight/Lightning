import { useState } from "react";
import { mockChampionTierList } from "@lightning/mock";
import { ChampionRole, ChampionTierData } from "@lightning/types";
import { getChampionImageUrl } from "@lightning/utils";

const roles: (ChampionRole | "All")[] = [
  "All",
  "Top",
  "Jungle",
  "Mid",
  "ADC",
  "Support",
];

export function ChampionsPage() {
  const [selectedRole, setSelectedRole] = useState<ChampionRole | "All">("All");
  const [sortKey, setSortKey] = useState<keyof ChampionTierData>("winRate");
  const [sortAsc, setSortAsc] = useState(false);

  const champions = mockChampionTierList
    .filter((list) => selectedRole === "All" || list.role === selectedRole)
    .flatMap((list) => list.champions)
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA;
      }
      return 0;
    });

  const handleSort = (key: keyof ChampionTierData) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Champion Tier List</h1>
      <div className="flex gap-2 mb-4">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`button px-3 py-1 rounded ${
              selectedRole === role
                ? "bg-blue-600 text-white"
                : "bg-neutral-800 text-cyan-300 hover:bg-neutral-700"
            }`}
          >
            {role}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-800 text-cyan-300">
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Champion</th>
              <th className="p-2">Role</th>
              <th
                className="p-2 cursor-pointer"
                onClick={() => handleSort("tier")}
              >
                Tier
              </th>
              <th
                className="p-2 cursor-pointer"
                onClick={() => handleSort("winRate")}
              >
                Win Rate
              </th>
              <th
                className="p-2 cursor-pointer"
                onClick={() => handleSort("pickRate")}
              >
                Pick Rate
              </th>
              <th
                className="p-2 cursor-pointer"
                onClick={() => handleSort("banRate")}
              >
                Ban Rate
              </th>
              <th
                className="p-2 cursor-pointer"
                onClick={() => handleSort("matchesPlayed")}
              >
                Matches
              </th>
            </tr>
          </thead>
          <tbody>
            {champions.map((champ, idx) => (
              <tr
                key={champ.championId}
                className="border-b border-neutral-800 hover:bg-neutral-800/50"
              >
                <td className="p-2">{idx + 1}</td>
                <td className="p-2 flex items-center gap-2">
                  <img
                    src={getChampionImageUrl(champ.championId, champ.iconUrl)}
                    alt={champ.name}
                    className="w-6 h-6 rounded-full"
                  />
                  {champ.name}
                </td>
                <td className="p-2 text-center">{champ.role}</td>
                <td className="p-2 text-center">{champ.tier}</td>
                <td className="p-2 text-center">{champ.winRate.toFixed(1)}%</td>
                <td className="p-2 text-center">
                  {champ.pickRate.toFixed(1)}%
                </td>
                <td className="p-2 text-center">{champ.banRate.toFixed(1)}%</td>
                <td className="p-2 text-center">
                  {champ.matchesPlayed.toLocaleString()}
                </td>
              </tr>
            ))}

            {/* ✅ Correct way */}
            <tr>
              <td
                colSpan={8}
                className="text-center font-bold py-4 text-cyan-300"
              >
                IN DEVELOPMENT, COMING SOON
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
