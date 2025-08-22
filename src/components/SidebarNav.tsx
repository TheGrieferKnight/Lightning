import React from "react";
import { Home, Sword, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarNavProps {
  className?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ className = "" }) => {
  const navItems = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/champions", label: "Champions", icon: Sword },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav
      className={`bg-header-gradient-smooth supports-[backdrop-filter]:backdrop-blur-sm w-56 h-full flex flex-col p-3 border-r border-neutral-800/60 has-noise ${className}`}
    >
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
              isActive
                ? "bg-blue-600/80 text-white shadow-md"
                : "text-cyan-300 hover:bg-blue-500/20 hover:text-white"
            }`
          }
        >
          <Icon className="w-5 h-5" />
          <span className="font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
