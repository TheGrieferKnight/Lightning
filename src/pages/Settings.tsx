import { useState } from "react";
import { AppSettings } from "../types/settings";
import { mockSettings } from "../data/mockSettings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(mockSettings);

  const toggle = (key: keyof AppSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleOverlay = (overlay: keyof AppSettings["overlays"]) => {
    setSettings((prev) => ({
      ...prev,
      overlays: { ...prev.overlays, [overlay]: !prev.overlays[overlay] },
    }));
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">General</h2>
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={settings.autoStart}
            onChange={() => toggle("autoStart")}
          />
          Auto-start with Windows
        </label>
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={() => toggle("notifications")}
          />
          Enable Notifications
        </label>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Overlays</h2>
        {Object.keys(settings.overlays).map((overlay) => (
          <label key={overlay} className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={
                settings.overlays[overlay as keyof AppSettings["overlays"]]
              }
              onChange={() =>
                toggleOverlay(overlay as keyof AppSettings["overlays"])
              }
            />
            {overlay}
          </label>
        ))}
      </div>
    </div>
  );
}
