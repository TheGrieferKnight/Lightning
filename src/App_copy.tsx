// src/App_copy.tsx

import "./styles/App_copy.css";
import { useState } from "react";
import { SpellGrid } from "./components/SpellGrid";
import { useGameData } from "./hooks/useGameData";
import { useCooldowns } from "./hooks/useCooldowns";

function App() {
  const { summonerSpells, setSummonerSpells, path } = useGameData();
  const { activeCooldowns, handleSpellClick } = useCooldowns();
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  const handleChampionDoubleClick = (rowIndex: number) => {
    if (selectedRowIndex === null) {
      setSelectedRowIndex(rowIndex);
    } else {
      if (selectedRowIndex !== rowIndex) {
        setSummonerSpells((prev) => {
          const newSpells = [...prev];
          [newSpells[selectedRowIndex], newSpells[rowIndex]] = [
            newSpells[rowIndex],
            newSpells[selectedRowIndex],
          ];
          return newSpells;
        });
      }
      setSelectedRowIndex(null);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <SpellGrid
        summonerSpells={summonerSpells}
        selectedRowIndex={selectedRowIndex}
        activeCooldowns={activeCooldowns}
        path={path}
        onChampionDoubleClick={handleChampionDoubleClick}
        onSpellClick={handleSpellClick}
      />
    </div>
  );
}

export default App;
