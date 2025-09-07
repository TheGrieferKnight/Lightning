import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SidebarNav, WebTitlebar } from "@lightning/ui";
import DashboardPage from "./pages/Dashboard";
import ChampionsPage from "./pages/Champions";
import SettingsPage from "./pages/Settings";

export default function App() {
  return (
    <Router>
      <div className="flex h-screen flex-col bg-app-gradient-smooth has-noise text-white">
        <WebTitlebar />
        <div className="flex flex-1 overflow-hidden">
          <SidebarNav />
          <main className="flex-1 overflow-y-auto px-6 py-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/champions" element={<ChampionsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
