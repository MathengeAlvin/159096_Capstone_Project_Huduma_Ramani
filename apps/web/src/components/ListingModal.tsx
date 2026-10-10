"use client";

import React, { useState, useEffect } from "react";
import { ServiceListing, ServiceCategory, ListingStatus } from "../types";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white border-2 border-black w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-black">
          <div>
            <h3 className="text-xl font-bold text-black tracking-tight">
              {initialData ? "Edit Service Listing" : "Add New Community Service"}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Publish or update details for residents in informal settlements
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-black font-bold text-xl px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-sm">
          {/* Service Name */}
          <div>
            <label className="block text-xs font-bold uppercase text-black mb-1">
              Service Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kibera Community Health Center"
              className="w-full px-3 py-2 border border-black focus:outline-hidden focus:ring-1 focus:ring-black text-sm"
            />
          </div>

          {/* Category & Settlement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-black mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full px-3 py-2 border border-black bg-white focus:outline-hidden text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-black mb-1">
                Settlement Region *
              </label>
              <select
                value={settlement}
                onChange={(e) => setSettlement(e.target.value as "Kibera" | "Mathare")}
                className="w-full px-3 py-2 border border-black bg-white focus:outline-hidden text-sm"
              >
                <option value="Kibera">Kibera</option>
                <option value="Mathare">Mathare</option>
              </select>
            </div>
          </div>

          {/* Location Landmark & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-black mb-1">
                Location / Landmark *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kibera Sector 4, Olympic"
                className="w-full px-3 py-2 border border-black focus:outline-hidden text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-black mb-1">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ListingStatus)}
                className="w-full px-3 py-2 border border-black bg-white focus:outline-hidden text-sm font-semibold"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          {/* Coordinates (Lat / Lng) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Latitude (GPS)
              </label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="-1.3142"
                className="w-full px-3 py-2 border border-neutral-400 focus:outline-hidden text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Longitude (GPS)
              </label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="36.7865"
                className="w-full px-3 py-2 border border-neutral-400 focus:outline-hidden text-sm font-mono"
              />
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <label className="block text-xs font-bold uppercase text-black mb-1">
              Operating Hours
            </label>
            <input
              type="text"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              placeholder="e.g. Mon - Fri, 8:00 AM - 4:00 PM"
              className="w-full px-3 py-2 border border-black focus:outline-hidden text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase text-black mb-1">
              Description (Used for TF-IDF Keyword Matching)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide descriptive services offered (e.g. healthcare, legal aid, scholarship funding)..."
              className="w-full px-3 py-2 border border-black focus:outline-hidden text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-black flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-black text-xs font-bold uppercase text-black hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 border border-black bg-black text-white text-xs font-bold uppercase hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {initialData ? "Save Changes" : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
