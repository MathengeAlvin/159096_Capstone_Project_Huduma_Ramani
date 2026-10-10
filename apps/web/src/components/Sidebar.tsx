"use client";

import React from "react";
import {
  LayoutDashboard,
  Layers,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";
import { ProviderOrganization } from "../types";

export type NavTab = "dashboard" | "listings" | "applications" | "analytics" | "settings";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  organization: ProviderOrganization;
}

export function Sidebar({ activeTab, setActiveTab, organization }: SidebarProps) {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "listings", label: "My Listings", icon: <Layers className="w-5 h-5" /> },
    { id: "applications", label: "Applications", icon: <FileText className="w-5 h-5" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 border-r border-black/15 bg-white min-h-screen flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-black/10">
          <h1 className="text-xl font-bold tracking-tight text-black">Huduma Ramani</h1>
          <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mt-0.5">
            Provider Portal
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-md transition-colors text-left ${
                  isActive
                    ? "bg-neutral-100 text-black border border-black/15 shadow-2xs"
                    : "text-neutral-700 hover:bg-neutral-50 hover:text-black"
                }`}
              >
                <span className={isActive ? "text-black" : "text-neutral-500"}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Organization Badge Footer */}
      <div className="p-4 border-t border-black/10">
        <div className="flex items-center gap-3 p-2.5 rounded-lg border border-black/15 bg-neutral-50">
          <div className="w-9 h-9 border border-black flex items-center justify-center font-bold text-sm bg-white text-black shrink-0">
            {organization.shortName}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-black truncate">{organization.name}</p>
            <p className="text-[11px] text-neutral-500 font-mono">ID: {organization.id}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
