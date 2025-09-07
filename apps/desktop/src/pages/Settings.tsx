import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AppSettings } from "@lightning/types";
import { mockSettings } from "@lightning/mock";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(mockSettings);

  // Local staging for credentials
  const [tempClientId, setTempClientId] = useState(settings.clientId);
  const [tempClientSecret, setTempClientSecret] = useState(
    settings.clientSecret
  );
  const [editingCreds, setEditingCreds] = useState(false);

  // Load credentials from backend on startup
  useEffect(() => {
    invoke<[string, string]>("load_credentials")
      .then(([id, secret]) => {
        setSettings((prev) => ({
          ...prev,
          clientId: id,
          clientSecret: secret,
        }));
      })
      .catch(() => {
        console.log("No credentials stored yet");
      });
  }, []);

  const toggle = (key: keyof AppSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleOverlay = (overlay: keyof AppSettings["overlays"]) => {
    setSettings((prev) => ({
      ...prev,
      overlays: { ...prev.overlays, [overlay]: !prev.overlays[overlay] },
    }));
  };

  const saveCredentials = async () => {
    try {
      // Call Rust backend to securely store
      await invoke("save_credentials", {
        clientId: tempClientId,
        clientSecret: tempClientSecret,
      });

      // Update local state for UI
      setSettings((prev) => ({
        ...prev,
        clientId: tempClientId,
        clientSecret: tempClientSecret,
      }));

      setEditingCreds(false);
    } catch (err) {
      console.error("Failed to save credentials:", err);
      alert("Failed to save credentials. Check logs.");
    }
  };

  return (
    <div className="p-6 text-white max-w-xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-6">⚙️ Settings</h1>

      {/* General */}
      <div className="bg-gray-800 rounded-lg p-5 shadow space-y-4">
        <h2 className="text-xl font-semibold">General</h2>
        <div className="flex items-center justify-between">
          <span>Auto-start with Windows</span>
          <button
            onClick={() => toggle("autoStart")}
            className={`button relative w-12 h-6 rounded-full transition-colors ${
              settings.autoStart ? "bg-green-500" : "bg-gray-600"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                settings.autoStart ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span>Enable Notifications</span>
          <button
            onClick={() => toggle("notifications")}
            className={`button relative w-12 h-6 rounded-full transition-colors ${
              settings.notifications ? "bg-green-500" : "bg-gray-600"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                settings.notifications ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Overlays */}
      <div className="bg-gray-800 rounded-lg p-5 shadow space-y-4">
        <h2 className="text-xl font-semibold">Overlays</h2>
        {Object.keys(settings.overlays).map((overlay) => (
          <div
            key={overlay}
            className="flex items-center justify-between capitalize"
          >
            <span>{overlay.replace(/([A-Z])/g, " $1")}</span>
            <button
              onClick={() =>
                toggleOverlay(overlay as keyof AppSettings["overlays"])
              }
              className={`button relative w-12 h-6 rounded-full transition-colors ${
                settings.overlays[overlay as keyof AppSettings["overlays"]]
                  ? "bg-green-500"
                  : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                  settings.overlays[overlay as keyof AppSettings["overlays"]]
                    ? "translate-x-6"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* API Credentials */}
      <div className="bg-gray-800 rounded-lg p-5 shadow space-y-4">
        <h2 className="text-xl font-semibold">API Credentials</h2>

        {!editingCreds ? (
          <div className="space-y-3">
            <div>
              <span className="block text-sm text-gray-400">Client ID</span>
              <span className="font-mono">
                {settings.clientId ? "••••••••" : "Not set"}
              </span>
            </div>
            <div>
              <span className="block text-sm text-gray-400">Client Secret</span>
              <span className="font-mono">
                {settings.clientSecret ? "••••••••••••" : "Not set"}
              </span>
            </div>
            <button
              onClick={() => setEditingCreds(true)}
              className="button px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
            >
              Edit Credentials
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Client ID
              </label>
              <input
                type="text"
                value={tempClientId}
                onChange={(e) => setTempClientId(e.target.value)}
                className="input w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-white"
                placeholder="Enter your client ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Client Secret
              </label>
              <input
                type="password"
                value={tempClientSecret}
                onChange={(e) => setTempClientSecret(e.target.value)}
                className="input w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-white"
                placeholder="Enter your client secret"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveCredentials}
                className="button px-4 py-2 bg-green-600 rounded hover:bg-green-500"
              >
                Save
              </button>
              <button
                onClick={() => setEditingCreds(false)}
                className="button px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save all settings */}
      <div className="flex justify-end">
        <button className="button px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 font-semibold">
          Save Settings
        </button>
      </div>
    </div>
  );
}
