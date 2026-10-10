"use client";

import React from "react";
import { LogOut, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  title: string;
  onLogout: () => void;
}

export function Header({ title, onLogout }: HeaderProps) {
  return (
    <header className="flex items-center justify-between pb-6 border-b border-black/10">
      <h2 className="text-2xl font-bold text-black tracking-tight">{title}</h2>

      <div className="flex items-center gap-3">
        {/* System Health Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-black/20 text-xs font-semibold uppercase tracking-wider text-neutral-800 bg-white">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          SYSTEM: OK
        </div>

        {/* Log Out Button */}
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-black text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          LOG OUT
        </button>
      </div>
    </header>
  );
}
