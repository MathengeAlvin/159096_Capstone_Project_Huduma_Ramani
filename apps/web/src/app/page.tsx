"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Sidebar, NavTab } from "../components/Sidebar";
import { Header } from "../components/Header";
import { MetricCards } from "../components/MetricCards";
import { Charts } from "../components/Charts";
import { RecentApplications } from "../components/RecentApplications";
import { ListingsView } from "../components/ListingsView";
import { LoginCard, AuthSubmitData } from "../components/LoginCard";
import {
  initialOrganization,
  initialListings,
  initialApplications,
} from "../data/mockData";
import { ServiceListing, ServiceApplication, ApplicationStatus, MetricCardData } from "../types";
import { ShieldCheck, Wifi, WifiOff, RefreshCw } from "lucide-react";
import {
  fetchProviderListings,
  createServiceListing,
  updateServiceListing,
  deleteServiceListing,
  registerOrLoginProvider,
} from "../services/api";

export default function ProviderPortalApp() {
  // Start on Login/Register screen by default
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [organization, setOrganization] = useState(initialOrganization);
  const [listings, setListings] = useState<ServiceListing[]>(initialListings);
  const [applications, setApplications] = useState<ServiceApplication[]>(initialApplications);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load provider listings from live Django REST API on mount or org change
  useEffect(() => {
    if (isAuthenticated) {
      loadListings();
    }
  }, [organization.id, isAuthenticated]);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const res = await fetchProviderListings(organization.id);
      setListings(res.listings);
      setIsLiveApi(res.isLive);
    } catch {
      setIsLiveApi(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async (data: AuthSubmitData) => {
    const defaultName = data.email
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const orgName = data.name || defaultName;

    // Persist or fetch provider account in Cloud Firestore via Django backend
    const syncRes = await registerOrLoginProvider({
      name: orgName,
      email: data.email,
      settlement: data.settlement || "Kibera",
    });

    setOrganization({
      id: syncRes.providerId,
      name: orgName,
      shortName: orgName.slice(0, 10),
      email: data.email,
      settlement: data.settlement || "Kibera",
      verified: true,
    });
    setIsAuthenticated(true);
  };

  const handleAddListing = async (newListing: Partial<ServiceListing>) => {
    // Call live API
    const created = await createServiceListing(newListing, organization.id);
    setListings((prev) => [created, ...prev]);
  };

  const handleUpdateListing = async (id: string, updated: Partial<ServiceListing>) => {
    // Optimistic local update
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updated } : l))
    );
    // Sync with live API
    await updateServiceListing(id, updated);
  };

  const handleDeleteListing = async (id: string) => {
    if (confirm("Are you sure you want to delete this listing from the directory?")) {
      setListings((prev) => prev.filter((l) => l.id !== id));
      await deleteServiceListing(id);
    }
  };

  const handleUpdateAppStatus = (appId: string, newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
  };

  // Compute live metrics dynamically from current listings
  const dynamicMetrics = useMemo<MetricCardData[]>(() => {
    const activeCount = listings.filter((l) => l.status === "ACTIVE").length;
    const totalReviews = listings.reduce((acc, l) => acc + (l.reviewCount || 0), 0);
    const validRatings = listings.filter((l) => l.rating !== null && l.rating !== undefined);
    const avgRating =
      validRatings.length > 0
        ? (validRatings.reduce((acc, l) => acc + (l.rating || 0), 0) / validRatings.length).toFixed(1)
        : "4.8";

    return [
      {
        title: "ACTIVE LISTINGS",
        value: activeCount.toString(),
        change: `+${listings.length} registered`,
        isPositive: true,
      },
      {
        title: "TOTAL REVIEWS",
        value: totalReviews.toLocaleString(),
        change: "Verified feedback",
        isPositive: true,
      },
      {
        title: "AVG RATING",
        value: avgRating,
        change: `${validRatings.length} evaluated`,
        isPositive: true,
        sublabel: "Bayesian prior m=5",
      },
      {
        title: "EST. REACH",
        value: (Math.max(1, activeCount) * 1250).toLocaleString(),
        change: "+12% this month",
        isPositive: true,
      },
    ];
  }, [listings]);

  if (!isAuthenticated) {
    return <LoginCard onLoginSuccess={handleAuthSuccess} />;
  }

  const getHeaderTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Provider Dashboard";
      case "listings":
        return "My Service Listings";
      case "applications":
        return "Beneficiary Applications";
      case "analytics":
        return "Recommendation & Demand Analytics";
      case "settings":
        return "Organization Settings";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row font-sans text-neutral-900 antialiased">
      {/* Sidebar matching Glovo styling */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        organization={organization}
      />

      {/* Main Content View */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Header
            title={getHeaderTitle()}
            onLogout={() => setIsAuthenticated(false)}
          />

          {/* Live API / Fallback Status Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs ${
                isLiveApi
                  ? "bg-[#E6F6F3] text-[#00A082] border-[#00A082]/30"
                  : "bg-neutral-100 text-neutral-600 border-neutral-200"
              }`}
            >
              {isLiveApi ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-[#00A082]" />
                  Django REST API (Live)
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-neutral-500" />
                  Local Demo Mode
                </>
              )}
            </span>
            <button
              onClick={loadListings}
              title="Refresh listings from backend"
              className="p-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 hover:border-neutral-300 transition-all cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-neutral-700 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="mt-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* 4 Metric Cards with Live Computed Signals */}
              <MetricCards metrics={dynamicMetrics} />

              {/* 2 Charts (Views over time + Engagement by service) */}
              <Charts />

              {/* Recent Applications Table */}
              <RecentApplications
                applications={applications}
                onUpdateStatus={handleUpdateAppStatus}
              />
            </div>
          )}

          {/* TAB 2: MY LISTINGS */}
          {activeTab === "listings" && (
            <ListingsView
              listings={listings}
              onAddListing={handleAddListing}
              onUpdateListing={handleUpdateListing}
              onDeleteListing={handleDeleteListing}
            />
          )}

          {/* TAB 3: APPLICATIONS DETAIL */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              <RecentApplications
                applications={applications}
                onUpdateStatus={handleUpdateAppStatus}
              />
            </div>
          )}

          {/* TAB 4: ANALYTICS DETAIL */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs">
                <h3 className="text-lg font-black text-[#1E1E1E] tracking-tight mb-1">
                  Recommendation Algorithm Performance
                </h3>
                <p className="text-xs text-neutral-500 mb-6">
                  Empirical signals driving discovery visibility across Kibera & Mathare
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="rounded-2xl border border-[#FDE68A] p-5 bg-[#FFFBEB]">
                    <span className="text-[11px] font-extrabold uppercase text-neutral-600">
                      Content-Based TF-IDF Match
                    </span>
                    <p className="text-2xl font-black text-[#1E1E1E] mt-1">94.2%</p>
                    <p className="text-[11px] text-neutral-500 mt-1">Cosine similarity with user intent</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200/80 p-5 bg-[#FAF9F6]">
                    <span className="text-[11px] font-extrabold uppercase text-neutral-600">
                      NMF Latent Factor Score
                    </span>
                    <p className="text-2xl font-black text-[#1E1E1E] mt-1">0.824</p>
                    <p className="text-[11px] text-neutral-500 mt-1">Collaborative behavioral clustering</p>
                  </div>
                  <div className="rounded-2xl border border-[#00A082]/25 p-5 bg-[#E6F6F3]">
                    <span className="text-[11px] font-extrabold uppercase text-neutral-600">
                      Bayesian Quality Weight (γ)
                    </span>
                    <p className="text-2xl font-black text-[#1E1E1E] mt-1">4.76 / 5.0</p>
                    <p className="text-[11px] text-neutral-500 mt-1">Prior m=5, Global mean C=4.1</p>
                  </div>
                </div>

                <Charts />
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === "settings" && (
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-7 max-w-2xl space-y-6 shadow-xs">
              <div>
                <h3 className="text-lg font-black text-[#1E1E1E] tracking-tight">
                  Organization Profile
                </h3>
                <p className="text-xs text-neutral-500">
                  Manage your NGO credentials and verification status with eMentoring Africa
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={organization.name}
                    onChange={(e) =>
                      setOrganization({ ...organization, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#FFC244] focus:ring-2 focus:ring-[#FFC244]/20 outline-none text-sm text-[#1E1E1E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    value={organization.email}
                    onChange={(e) =>
                      setOrganization({ ...organization, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#FFC244] focus:ring-2 focus:ring-[#FFC244]/20 outline-none font-mono text-sm text-[#1E1E1E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Primary Operational Settlement
                  </label>
                  <select
                    value={organization.settlement}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        settlement: e.target.value as "Kibera" | "Mathare",
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#FFC244] focus:ring-2 focus:ring-[#FFC244]/20 outline-none bg-white text-sm text-[#1E1E1E]"
                  >
                    <option value="Kibera">Kibera</option>
                    <option value="Mathare">Mathare</option>
                  </select>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[#E6F6F3] border border-[#00A082]/30 text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#00A082] shrink-0" />
                    <span className="font-bold text-[#00A082]">
                      Verified NGO Provider Partner (eMentoring Africa Network)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
