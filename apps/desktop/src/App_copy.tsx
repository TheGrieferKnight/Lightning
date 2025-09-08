// src/App_copy.tsx
import { SpellGrid, useCooldowns, useGameData } from "@lightning/ui";
import { useState } from "react";
import {
  Navigate,
  Route,
  HashRouter as Router,
  Routes,
} from "react-router-dom";
import "./styles/App_copy.css";

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
    <Router>
      <Routes>
        <Route
          path="/"
          element={
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
          }
        />
        {/* Redirect unknown routes back to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
