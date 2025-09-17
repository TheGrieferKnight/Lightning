import { useState } from "react";
import { useSettings, useSaveSettings } from "@lightning/client";

export function SettingsPage() {
  const { data: settings, isLoading, error } = useSettings();
  const saveMutation = useSaveSettings();

  const [editingCreds, setEditingCreds] = useState(false);
  const [tempClientId, setTempClientId] = useState("");
  const [tempClientSecret, setTempClientSecret] = useState("");

  if (isLoading) return <p>Loading settings...</p>;
  if (error) return <p>Failed to load settings</p>;
  if (!settings) return null;

  const toggle = (key: keyof typeof settings) => {
    saveMutation.mutate({
      ...settings,
      [key]: !settings[key],
    });
  };

  const toggleOverlay = (overlay: keyof (typeof settings)["overlays"]) => {
    saveMutation.mutate({
      ...settings,
      overlays: {
        ...settings.overlays,
        [overlay]: !settings.overlays[overlay],
      },
    });
  };

  const saveCredentials = () => {
    saveMutation.mutate({
      ...settings,
      clientId: tempClientId,
      clientSecret: tempClientSecret,
    });
    setEditingCreds(false);
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
                toggleOverlay(overlay as keyof (typeof settings)["overlays"])
              }
              className={`button relative w-12 h-6 rounded-full transition-colors ${
                settings.overlays[
                  overlay as keyof (typeof settings)["overlays"]
                ]
                  ? "bg-green-500"
                  : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                  settings.overlays[
                    overlay as keyof (typeof settings)["overlays"]
                  ]
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
            <span className="block">
              Client ID: {settings.clientId ? "•••••" : "Not set"}
            </span>
            <span className="block">
              Client Secret: {settings.clientSecret ? "••••••••••" : "Not set"}
            </span>
            <button
              onClick={() => {
                setEditingCreds(true);
                setTempClientId(settings.clientId);
                setTempClientSecret(settings.clientSecret);
              }}
              className="button px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
            >
              Edit Credentials
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              value={tempClientId}
              onChange={(e) => setTempClientId(e.target.value)}
              className="input w-full bg-gray-700 border p-2"
              placeholder="Enter your client ID"
            />
            <input
              type="password"
              value={tempClientSecret}
              onChange={(e) => setTempClientSecret(e.target.value)}
              className="input w-full bg-gray-700 border p-2"
              placeholder="Enter your client secret"
            />
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
    </div>
  );
}
