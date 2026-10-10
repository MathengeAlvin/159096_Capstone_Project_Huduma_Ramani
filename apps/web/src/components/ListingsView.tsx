"use client";

import React, { useState } from "react";
import { ServiceListing, ListingStatus } from "../types";
import { ListingModal } from "./ListingModal";
import { Plus, Search, Star, Trash2, Edit3 } from "lucide-react";

interface ListingsViewProps {
  listings: ServiceListing[];
  onAddListing: (newListing: Partial<ServiceListing>) => void;
  onUpdateListing: (id: string, updated: Partial<ServiceListing>) => void;
  onDeleteListing: (id: string) => void;
}

export function ListingsView({
  listings,
  onAddListing,
  onUpdateListing,
  onDeleteListing,
}: ListingsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<ServiceListing | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredListings = listings.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedListings = filteredListings.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (listing: ServiceListing) => {
    setEditingListing(listing);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingListing(null);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Partial<ServiceListing>) => {
    if (editingListing) {
      onUpdateListing(editingListing.id, data);
    } else {
      onAddListing(data);
    }
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: ListingStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-block px-2 py-0.5 border border-black text-[10px] font-bold uppercase tracking-wider text-black bg-white">
            ACTIVE
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-block px-2 py-0.5 border border-neutral-600 text-[10px] font-bold uppercase tracking-wider text-neutral-700 bg-neutral-100">
            PENDING
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-block px-2 py-0.5 border border-neutral-400 text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-white">
            INACTIVE
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header bar with + Add New Listing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black tracking-tight">
            My Service Listings
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage NGO service offerings, coordinates, and operational statuses
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-black bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          + Add New Listing
        </button>
      </div>

      {/* Search / Filter helper */}
      <div className="flex items-center gap-2 border border-black/20 bg-white px-3 py-2 max-w-sm">
        <Search className="w-4 h-4 text-neutral-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Filter by name, category, or sector..."
          className="w-full text-xs bg-transparent focus:outline-hidden text-black placeholder-neutral-400"
        />
      </div>

      {/* Main Table (Matching Screenshot 142514) */}
      <div className="border border-black/20 bg-white p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-black text-[11px] font-extrabold uppercase tracking-wider text-black">
                <th className="pb-3 pr-4">Service Name</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Location</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Rating</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {paginatedListings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-neutral-500 font-medium">
                    No services found matching &quot;{searchQuery}&quot;
                  </td>
                </tr>
              ) : (
                paginatedListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-neutral-50/70 transition-colors">
                    {/* Service Name */}
                    <td className="py-4 pr-4">
                      <div className="font-bold text-black text-sm">{listing.name}</div>
                      <div className="text-[11px] text-neutral-500 line-clamp-1 max-w-xs mt-0.5">
                        {listing.description}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 pr-4 text-neutral-700 text-xs font-medium">
                      {listing.category}
                    </td>

                    {/* Location */}
                    <td className="py-4 pr-4 text-neutral-700 text-xs font-mono">
                      {listing.location} ({listing.settlement})
                    </td>

                    {/* Status */}
                    <td className="py-4 pr-4">
                      {getStatusBadge(listing.status)}
                    </td>

                    {/* Rating */}
                    <td className="py-4 pr-4 text-xs font-semibold">
                      {listing.rating !== null ? (
                        <span className="inline-flex items-center gap-1 text-black">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          {listing.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-neutral-400 font-mono text-xs">N/A</span>
                      )}
                    </td>

                    {/* Actions [Edit] [Delete] */}
                    <td className="py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(listing)}
                          className="px-2.5 py-1 border border-black text-[11px] font-bold text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                        >
                          [Edit]
                        </button>
                        <button
                          onClick={() => onDeleteListing(listing.id)}
                          className="px-2.5 py-1 border border-neutral-400 text-[11px] font-bold text-neutral-600 hover:border-rose-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          [Delete]
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching wireframe footer */}
        <div className="pt-6 mt-2 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500 font-medium">
            Showing {filteredListings.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredListings.length)} of {filteredListings.length} listings
          </p>

          <div className="inline-flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border border-black text-xs font-bold uppercase text-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 flex items-center justify-center border text-xs font-bold transition-colors ${
                    currentPage === pageNum
                      ? "border-black bg-black text-white"
                      : "border-black text-black hover:bg-neutral-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 border border-black text-xs font-bold uppercase text-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Listing Modal */}
      <ListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingListing}
      />
    </div>
  );
}
