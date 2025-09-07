// src/components/SidebarNav.tsx
import React from "react";
import { Home, Sword, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarNavProps {
  className?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ className = "" }) => {
  const topItems = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/champions", label: "Champions", icon: Sword },
  ];

  const bottomItems = [{ to: "/settings", label: "Settings", icon: Settings }];

  return (
    <aside
      className={`w-60 h-full flex flex-col pt-6 pb-0.5 px-3 pl-0 
         backdrop-blur-md shadow-lg ${className}`}
    >
      {/* Top Nav Items */}
      <nav className="flex flex-col gap-2">
        {topItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 relative
              ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/80 to-blue-600/80 text-white shadow-md"
                  : "text-cyan-200 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-400" />
                )}
                <Icon className="w-5 h-5" />
                <span className="text-gray-200">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Nav Items */}
      <nav className="flex flex-col gap-2 mt-auto">
        {bottomItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 relative
              ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/80 to-blue-600/80 text-white shadow-md"
                  : "text-cyan-200 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-400" />
                )}
                <Icon className="w-5 h-5" />
                <span className="text-gray-200">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
