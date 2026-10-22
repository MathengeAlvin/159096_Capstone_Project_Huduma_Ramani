"use client";

import React, { useState, useEffect } from "react";
import { ServiceListing, ServiceCategory, ListingStatus } from "../types";
import { X } from "lucide-react";

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (listing: Partial<ServiceListing>) => void;
  initialData?: ServiceListing | null;
}

const CATEGORIES: ServiceCategory[] = [
  "Healthcare",
  "Legal Aid",
  "Education",
  "Mentorship",
  "Vocational Training",
  "Scholarships",
  "Digital Literacy",
  "Mental Health",
];

export function ListingModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ListingModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("Healthcare");
  const [settlement, setSettlement] = useState<"Kibera" | "Mathare">("Kibera");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ListingStatus>("ACTIVE");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setSettlement(initialData.settlement);
      setLocation(initialData.location);
      setLat(initialData.lat ? initialData.lat.toString() : "");
      setLng(initialData.lng ? initialData.lng.toString() : "");
      setOperatingHours(initialData.operatingHours);
      setDescription(initialData.description);
      setStatus(initialData.status);
      setContactEmail(initialData.contactEmail || "");
      setContactPhone(initialData.contactPhone || "");
    } else {
      setName("");
      setCategory("Healthcare");
      setSettlement("Kibera");
      setLocation("");
      setLat("");
      setLng("");
      setOperatingHours("Mon - Fri, 8:00 AM - 5:00 PM");
      setDescription("");
      setStatus("ACTIVE");
      setContactEmail("contact@kiberaaid.org");
      setContactPhone("+254 700 000 000");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) return;

    onSave({
      name,
      category,
      settlement,
      location,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      operatingHours,
      description,
      status,
      contactEmail,
      contactPhone,
      reviewCount: initialData ? initialData.reviewCount : 0,
      rating: initialData ? initialData.rating : null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-neutral-200/80 w-full max-w-xl p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-xl font-black text-[#1E1E1E] tracking-tight">
              {initialData ? "Edit Service Listing" : "Add Community Service"}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Publish or update details for residents across Kibera & Mathare
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Service / Center Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kibera Community Health Clinic"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#FFC244] focus:ring-2 focus:ring-[#FFC244]/20 outline-none text-sm text-[#1E1E1E]"
            />
          </div>

          {/* Category & Settlement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#FFC244] focus:ring-2 focus:ring-[#FFC244]/20 outline-none bg-white text-sm text-[#1E1E1E]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Settlement
              </label>
              <select
                value={settlement}
                onChange={(e) => setSettlement(e.target.value as "Kibera" | "Mathare")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#FFC244] focus:ring-2 focus:ring-[#FFC244]/20 outline-none bg-white text-sm text-[#1E1E1E]"
              >
                <option value="Kibera">Kibera</option>
                <option value="Mathare">Mathare</option>
              </select>
            </div>
          </div>

          {/* Specific Landmark Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Specific Landmark Location *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Olympic Stage, Near DC Grounds"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#FFC244] focus:ring-2 focus:ring-[#FFC244]/20 outline-none text-sm text-[#1E1E1E]"
            />
          </div>

          {/* Lat / Lng Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Latitude (OpenStreetMap)
              </label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="-1.3142"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#FFC244] focus:ring-2 focus:ring-[#FFC244]/20 outline-none font-mono text-xs text-[#1E1E1E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Longitude (OpenStreetMap)
              </label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="36.7865"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#FFC244] focus:ring-2 focus:ring-[#FFC244]/20 outline-none font-mono text-xs text-[#1E1E1E]"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+254 7..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#FFC244] focus:ring-2 focus:ring-[#FFC244]/20 outline-none text-sm text-[#1E1E1E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="info@provider.org"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#FFC244] focus:ring-2 focus:ring-[#FFC244]/20 outline-none text-sm text-[#1E1E1E]"
              />
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Operating Hours
            </label>
            <input
              type="text"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              placeholder="e.g. Mon - Fri, 8:00 AM - 4:00 PM"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#FFC244] focus:ring-2 focus:ring-[#FFC244]/20 outline-none text-sm text-[#1E1E1E]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Description (Used for TF-IDF Keyword Matching)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide descriptive services offered (e.g. healthcare, legal aid, scholarship funding)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#FFC244] focus:ring-2 focus:ring-[#FFC244]/20 outline-none text-sm text-[#1E1E1E]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-neutral-300 text-xs font-bold uppercase text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#FFC244] hover:bg-[#F5B42E] text-[#1E1E1E] text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
            >
              {initialData ? "Save Changes" : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
