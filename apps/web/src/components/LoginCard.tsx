"use client";

import React, { useState } from "react";

interface LoginCardProps {
  onLoginSuccess: (email: string) => void;
}

export function LoginCard({ onLoginSuccess }: LoginCardProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("organization@example.com");
  const [password, setPassword] = useState("password123");
  const [orgName, setOrgName] = useState("Kibera Aid Org");
  const [settlement, setSettlement] = useState<"Kibera" | "Mathare">("Kibera");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    onLoginSuccess(email);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FA] p-4">
      {/* Centered Box matching Glovo style */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200/80 p-8 shadow-xl">
        {/* Brand Icon & Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#FFC244] mx-auto mb-3 flex items-center justify-center font-black text-xl text-[#1E1E1E] shadow-xs">
            H
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#1E1E1E]">
            Huduma Ramani
          </h1>
          <p className="text-xs uppercase tracking-wider text-neutral-500 font-bold mt-1">
            Provider Portal — {isRegister ? "Register" : "Log In"}
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-neutral-100 my-6"></div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Organization Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Kibera Community Foundation"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#FFC244] focus:ring-2 focus:ring-[#FFC244]/20 outline-none bg-white text-[#1E1E1E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Primary Settlement
                </label>
                <select
                  value={settlement}
                  onChange={(e) => setSettlement(e.target.value as "Kibera" | "Mathare")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#FFC244] focus:ring-2 focus:ring-[#FFC244]/20 outline-none bg-white text-[#1E1E1E]"
                >
                  <option value="Kibera">Kibera</option>
                  <option value="Mathare">Mathare</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Organization Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="organization@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#FFC244] focus:ring-2 focus:ring-[#FFC244]/20 outline-none bg-white font-mono placeholder-neutral-400 text-[#1E1E1E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-[#FFC244] focus:ring-2 focus:ring-[#FFC244]/20 outline-none bg-white font-mono text-[#1E1E1E]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#FFC244] hover:bg-[#F5B42E] text-[#1E1E1E] text-sm font-black uppercase tracking-wider transition-all shadow-md shadow-[#FFC244]/25 cursor-pointer"
            >
              {isRegister ? "Register Organization" : "Log In"}
            </button>
          </div>

          <div className="pt-3 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs font-bold text-neutral-600 hover:text-[#1E1E1E] transition-colors cursor-pointer"
            >
              {isRegister
                ? "Already registered? Log In"
                : "Register your organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
