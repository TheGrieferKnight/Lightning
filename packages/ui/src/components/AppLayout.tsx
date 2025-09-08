// src/components/AppLayout.tsx
import { Suspense } from "react";
import { SidebarNav } from "./SidebarNav";
import { isTauri } from "@lightning/utils";
import React from "react";

// Dynamically load the appropriate titlebar based on environment.
// This avoids importing any Tauri-related modules in the web build.
const Titlebar = React.lazy(async () => {
  if (isTauri) {
    const mod = await import("./Titlebar");
    return { default: mod.Titlebar };
  } else {
    const mod = await import("./WebTitlebar");
    return { default: mod.WebTitlebar };
  }
});

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen w-full bg-app-gradient-smooth has-noise text-white flex">
      {/* Sidebar */}
      <SidebarNav className="z-20" />

      {/* Main Content */}
      <div className="flex-1 relative">
        <Suspense
          fallback={
            <div className="fixed top-0 left-0 right-0 h-9 z-10" aria-hidden />
          }
        >
          <Titlebar />
        </Suspense>
        <main className="pt-9 px-6">{children}</main>
      </div>
    </div>
  );
};
