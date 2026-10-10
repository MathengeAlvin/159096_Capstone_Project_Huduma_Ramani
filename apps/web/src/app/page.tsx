"use client";

import React, { useState } from "react";
import { Sidebar, NavTab } from "../components/Sidebar";
import { Header } from "../components/Header";
import { MetricCards } from "../components/MetricCards";
import { Charts } from "../components/Charts";
import { RecentApplications } from "../components/RecentApplications";
import { ListingsView } from "../components/ListingsView";
import { LoginCard } from "../components/LoginCard";
import {
  initialOrganization,
  initialListings,
  initialApplications,
} from "../data/mockData";
import { ServiceListing, ServiceApplication, ApplicationStatus } from "../types";
import { Building, ShieldCheck, MapPin, Mail, Phone, Info } from "lucide-react";

export default function ProviderPortalApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [organization, setOrganization] = useState(initialOrganization);
  const [listings, setListings] = useState<ServiceListing[]>(initialListings);
  const [applications, setApplications] = useState<ServiceApplication[]>(initialApplications);

  const handleAddListing = (newListing: Partial<ServiceListing>) => {
    const created: ServiceListing = {
      id: `srv-${Date.now().toString().slice(-4)}`,
      name: newListing.name || "Untitled Service",
      category: newListing.category || "Healthcare",
      settlement: newListing.settlement || "Kibera",
      location: newListing.location || "Central Sector",
      operatingHours: newListing.operatingHours || "Mon - Fri, 8:00 AM - 5:00 PM",
      description: newListing.description || "",
      status: newListing.status || "ACTIVE",
      rating: null,
      reviewCount: 0,
      contactEmail: newListing.contactEmail || organization.email,
      contactPhone: newListing.contactPhone || "+254 700 000 000",
      lat: newListing.lat,
      lng: newListing.lng,
    };
    setListings([created, ...listings]);
  };

  const handleUpdateListing = (id: string, updated: Partial<ServiceListing>) => {
    setListings(
      listings.map((l) => (l.id === id ? { ...l, ...updated } : l))
    );
  };

  const handleDeleteListing = (id: string) => {
    if (confirm("Are you sure you want to delete this listing from the directory?")) {
      setListings(listings.filter((l) => l.id !== id));
    }
  };

  const handleUpdateAppStatus = (appId: string, newStatus: ApplicationStatus) => {
    setApplications(
      applications.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
  };

  if (!isAuthenticated) {
    return <LoginCard onLoginSuccess={() => setIsAuthenticated(true)} />;
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
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row font-sans text-neutral-900 antialiased">
      {/* Sidebar matching Wireframes 9 & 10 */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        organization={organization}
      />

      {/* Main Content View */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl overflow-y-auto">
        <Header
          title={getHeaderTitle()}
          onLogout={() => setIsAuthenticated(false)}
        />

        <div className="mt-6">
          {/* TAB 1: DASHBOARD (Screenshot 142500) */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* 4 Metric Cards */}
              <MetricCards />

              {/* 2 Charts (Views over time + Engagement by service) */}
              <Charts />

              {/* Recent Applications Table */}
              <RecentApplications
                applications={applications}
                onUpdateStatus={handleUpdateAppStatus}
              />
            </div>
          )}

          {/* TAB 2: MY LISTINGS (Screenshot 142514) */}
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
              <div className="border border-black/20 bg-white p-6">
                <h3 className="text-lg font-bold text-black tracking-tight mb-2">
                  Recommendation Algorithm Performance
                </h3>
                <p className="text-xs text-neutral-600 mb-6">
                  Empirical signals driving discovery visibility across Kibera & Mathare
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="border border-black/15 p-4 bg-neutral-50">
                    <span className="text-[11px] font-bold uppercase text-neutral-500">
                      Content-Based TF-IDF Match
                    </span>
                    <p className="text-2xl font-extrabold text-black mt-1">94.2%</p>
                    <p className="text-[11px] text-neutral-500 mt-1">Cosine similarity with user intent</p>
                  </div>
                  <div className="border border-black/15 p-4 bg-neutral-50">
                    <span className="text-[11px] font-bold uppercase text-neutral-500">
                      NMF Latent Factor Score
                    </span>
                    <p className="text-2xl font-extrabold text-black mt-1">0.824</p>
                    <p className="text-[11px] text-neutral-500 mt-1">Collaborative behavioral clustering</p>
                  </div>
                  <div className="border border-black/15 p-4 bg-neutral-50">
                    <span className="text-[11px] font-bold uppercase text-neutral-500">
                      Bayesian Quality Weight (γ)
                    </span>
                    <p className="text-2xl font-extrabold text-black mt-1">4.76 / 5.0</p>
                    <p className="text-[11px] text-neutral-500 mt-1">Prior m=5, Global mean C=4.1</p>
                  </div>
                </div>

                <Charts />
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === "settings" && (
            <div className="border border-black/20 bg-white p-6 max-w-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-black tracking-tight">
                  Organization Profile
                </h3>
                <p className="text-xs text-neutral-500">
                  Manage your NGO credentials and verification status with eMentoring Africa
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={organization.name}
                    onChange={(e) =>
                      setOrganization({ ...organization, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-black text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    value={organization.email}
                    onChange={(e) =>
                      setOrganization({ ...organization, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-black font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
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
                    className="w-full px-3 py-2 border border-black bg-white text-sm"
                  >
                    <option value="Kibera">Kibera</option>
                    <option value="Mathare">Mathare</option>
                  </select>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 p-3 bg-neutral-50 border border-black/15 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-neutral-800">
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
