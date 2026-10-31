"use client";

import React, { useState } from "react";
import { AlertCircle, KeyRound, CheckCircle2 } from "lucide-react";

export interface AuthSubmitData {
  email: string;
  password: string;
  isRegister: boolean;
  name?: string;
  settlement?: "Kibera" | "Mathare";
}

interface LoginCardProps {
  onLoginSuccess: (data: AuthSubmitData) => Promise<{ success: boolean; error?: string }>;
}

export function LoginCard({ onLoginSuccess }: LoginCardProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("prv_0007@huduma.org");
  const [password, setPassword] = useState("Huduma@2026");
  const [orgName, setOrgName] = useState("");
  const [settlement, setSettlement] = useState<"Kibera" | "Mathare">("Kibera");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage(null);

    const result = await onLoginSuccess({
      email,
      password,
      isRegister,
      name: orgName.trim() || undefined,
      settlement,
    });

    setIsLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || "Authentication failed. Please verify credentials.");
    }
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
            Provider Portal — {isRegister ? "Register" : "Cloud Firestore Log In"}
          </p>
        </div>

        {/* Credentials Tip for existing 242 providers */}
        {!isRegister && (
          <div className="mt-4 p-3 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-left flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
            <div className="text-[11px] text-neutral-700 leading-snug">
              <span className="font-bold text-[#1E1E1E]">242 Directory Accounts Ready:</span> All facility providers have accounts in Cloud Firestore with default password{" "}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#FDE68A] text-[#1E1E1E] font-bold">
                Huduma@2026
              </code>
            </div>
          </div>
        )}

        {/* Error message alert */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-left flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="text-xs text-red-800 font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-neutral-100 my-5"></div>

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
                    placeholder="e.g. Kibera Community Health Care"
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
              placeholder="e.g. prv_0007@huduma.org or organization@example.com"
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
              disabled={isLoading}
              className={`w-full py-3.5 rounded-full bg-[#FFC244] hover:bg-[#F5B42E] text-[#1E1E1E] text-sm font-black uppercase tracking-wider transition-all shadow-md shadow-[#FFC244]/25 cursor-pointer ${
                isLoading ? "opacity-75 cursor-wait" : ""
              }`}
            >
              {isLoading
                ? "Validating with Firestore..."
                : isRegister
                ? "Register Organization"
                : "Log In to Dashboard"}
            </button>
          </div>

          <div className="pt-3 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMessage(null);
              }}
              className="text-xs font-bold text-neutral-600 hover:text-[#1E1E1E] transition-colors cursor-pointer"
            >
              {isRegister
                ? "Already registered? Log In"
                : "Register a new organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
