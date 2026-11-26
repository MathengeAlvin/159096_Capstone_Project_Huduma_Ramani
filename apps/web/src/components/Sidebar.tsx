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
    <aside className="w-64 border-r border-neutral-200/80 bg-white min-h-screen flex flex-col justify-between shrink-0 select-none shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FFC244] flex items-center justify-center font-black text-sm text-[#1E1E1E] shadow-sm">
              H
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-[#1E1E1E] flex items-center">
                Huduma Ramani
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-[#00A082] font-extrabold">
                Provider Portal
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-extrabold rounded-2xl transition-all text-left cursor-pointer ${
                  isActive
                    ? "bg-[#FFC244] text-[#1E1E1E] shadow-sm"
                    : "text-neutral-600 hover:bg-[#FFF9E6] hover:text-[#1E1E1E]"
                }`}
              >
                <span className={isActive ? "text-[#1E1E1E]" : "text-neutral-500"}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Organization Badge Footer */}
      <div className="p-4 border-t border-neutral-100">
        {(() => {
          const initials =
            (organization.name || organization.shortName || "HR")
              .trim()
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((w) => w[0].toUpperCase())
              .join("") || "HR";
          return (
            <div className="flex items-center gap-3 p-3 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#FFC244] flex items-center justify-center font-black text-sm tracking-tight text-[#1E1E1E] shrink-0 shadow-xs overflow-hidden">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-xs font-extrabold text-[#1E1E1E] truncate"
                  title={organization.name}
                >
                  {organization.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-neutral-500 font-mono truncate">
                    {organization.id}
                  </span>
                  {organization.settlement && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white border border-[#FDE68A] text-amber-800 shrink-0">
                      {organization.settlement}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </aside>
  );
}
