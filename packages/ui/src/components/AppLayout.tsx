// src/components/AppLayout.tsx
import React from "react";
import { SidebarNav } from "./SidebarNav";
import { Titlebar } from "./Titlebar";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen w-full bg-app-gradient-smooth has-noise text-white flex">
      {/* Sidebar */}
      <SidebarNav className="z-20" />

      {/* Main Content */}
      <div className="flex-1 relative">
        <Titlebar />
        <main className="pt-9 px-6">{children}</main>
      </div>
    </div>
  );
};
