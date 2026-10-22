"use client";

import React from "react";
import { LogOut } from "lucide-react";

interface HeaderProps {
  title: string;
  onLogout: () => void;
}

export function Header({ title, onLogout }: HeaderProps) {
  return (
    <header className="flex items-center justify-between pb-6 border-b border-neutral-200/80">
      <h2 className="text-2xl font-black text-[#1E1E1E] tracking-tight">{title}</h2>

      <div className="flex items-center gap-3">
        {/* System Health Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#00A082] animate-pulse"></span>
          SYSTEM: OK
        </div>

        {/* Log Out Button */}
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-700 bg-white hover:bg-neutral-100 hover:border-neutral-300 transition-all cursor-pointer shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5 text-neutral-500" />
          LOG OUT
        </button>
      </div>
    </header>
  );
}
