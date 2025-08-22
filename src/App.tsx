// src/App.tsx
import {
  HashRouter as Router, // ✅ use HashRouter
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SidebarNav } from "./components/SidebarNav";
import DashboardPage from "./pages/Dashboard";
import ChampionsPage from "./pages/Champions";
import SettingsPage from "./pages/Settings";
import { Titlebar } from "./components/Titlebar";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen bg-app-gradient-smooth has-noise">
        <Titlebar />
        <div className="flex flex-1 overflow-hidden">
          <SidebarNav />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/champions" element={<ChampionsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Redirect unknown routes to Dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
