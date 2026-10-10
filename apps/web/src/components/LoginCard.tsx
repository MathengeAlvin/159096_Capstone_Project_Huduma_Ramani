"use client";

import React, { useState } from "react";
import { Lock, Mail, Building2 } from "lucide-react";

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
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 p-4">
      {/* Centered Box matching Screenshot 142444 */}
      <div className="w-full max-w-md bg-white border-2 border-black p-8 shadow-sm">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-black">
            Huduma Ramani
          </h1>
          <p className="text-xs uppercase tracking-wider text-neutral-600 font-semibold mt-1">
            Provider Portal — {isRegister ? "Register" : "Log In"}
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-black/20 my-6"></div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-1">
                  Organization Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Kibera Community Foundation"
                    className="w-full px-3 py-2.5 border border-black text-sm focus:outline-hidden bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-1">
                  Primary Settlement
                </label>
                <select
                  value={settlement}
                  onChange={(e) => setSettlement(e.target.value as "Kibera" | "Mathare")}
                  className="w-full px-3 py-2.5 border border-black text-sm focus:outline-hidden bg-white"
                >
                  <option value="Kibera">Kibera</option>
                  <option value="Mathare">Mathare</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-1">
              Organization Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="organization@example.com"
              className="w-full px-3 py-2.5 border border-black text-sm focus:outline-hidden bg-white font-mono placeholder-neutral-400"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-black text-sm focus:outline-hidden bg-white font-mono"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 border border-black bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {isRegister ? "Register Organization" : "Log In"}
            </button>
          </div>

          <div className="pt-3 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs font-semibold text-black underline underline-offset-4 hover:text-neutral-600 transition-colors cursor-pointer"
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
