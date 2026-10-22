"use client";

import React, { useState } from "react";
import { ServiceListing, ListingStatus } from "../types";
import { ListingModal } from "./ListingModal";
import { Plus, Search, Star } from "lucide-react";

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
          <span className="inline-block px-3 py-1 rounded-full border border-[#00A082]/30 text-[10px] font-black uppercase tracking-wider text-[#00A082] bg-[#E6F6F3]">
            ACTIVE
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-block px-3 py-1 rounded-full border border-[#FDE68A] text-[10px] font-black uppercase tracking-wider text-[#B45309] bg-[#FFF7E0]">
            PENDING
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-block px-3 py-1 rounded-full border border-neutral-200 text-[10px] font-black uppercase tracking-wider text-neutral-400 bg-neutral-100">
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
          <h2 className="text-2xl font-black text-[#1E1E1E] tracking-tight">
            My Service Listings
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage community service offerings, coordinates, and operational statuses
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FFC244] hover:bg-[#F5B42E] text-[#1E1E1E] text-xs font-black uppercase tracking-wider transition-all shadow-sm hover:shadow cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Listing
        </button>
      </div>

      {/* Search / Filter helper */}
      <div className="flex items-center gap-2.5 border border-neutral-200/80 bg-white rounded-full px-4 py-2.5 max-w-sm shadow-xs focus-within:border-[#FFC244] focus-within:ring-2 focus-within:ring-[#FFC244]/20 transition-all">
        <Search className="w-4 h-4 text-neutral-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Filter by name, category, or sector..."
          className="w-full text-xs bg-transparent focus:outline-hidden text-[#1E1E1E] placeholder-neutral-400 font-medium"
        />
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-neutral-100 text-[11px] font-black uppercase tracking-wider text-[#1E1E1E]">
                <th className="pb-3.5 pr-4">Service Name</th>
                <th className="pb-3.5 pr-4">Category</th>
                <th className="pb-3.5 pr-4">Location</th>
                <th className="pb-3.5 pr-4">Status</th>
                <th className="pb-3.5 pr-4">Rating</th>
                <th className="pb-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginatedListings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-neutral-500 font-medium">
                    No services found matching &quot;{searchQuery}&quot;
                  </td>
                </tr>
              ) : (
                paginatedListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-[#FFFDF7] transition-colors">
                    {/* Service Name */}
                    <td className="py-4 pr-4">
                      <div className="font-extrabold text-[#1E1E1E] text-sm">{listing.name}</div>
                      <div className="text-[11px] text-neutral-500 line-clamp-1 max-w-xs mt-0.5">
                        {listing.description}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 pr-4 text-neutral-700 text-xs font-semibold">
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
                    <td className="py-4 pr-4 text-xs font-bold">
                      {listing.rating !== null ? (
                        <span className="inline-flex items-center gap-1 text-[#1E1E1E]">
                          <Star className="w-3.5 h-3.5 fill-[#FFC244] text-[#F59E0B]" />
                          {listing.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-neutral-400 font-mono text-xs">N/A</span>
                      )}
                    </td>

                    {/* Actions Edit / Delete */}
                    <td className="py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleEdit(listing)}
                          className="px-3 py-1 rounded-full border border-neutral-200 text-[11px] font-bold text-[#1E1E1E] bg-white hover:bg-[#FFF7E0] hover:border-[#FDE68A] transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteListing(listing.id)}
                          className="px-3 py-1 rounded-full border border-neutral-200 text-[11px] font-bold text-neutral-600 bg-white hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching Glovo pill styling */}
        <div className="pt-6 mt-2 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500 font-medium">
            Showing {filteredListings.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredListings.length)} of {filteredListings.length} listings
          </p>

          <div className="inline-flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-1.5 rounded-full border border-neutral-200 text-xs font-bold uppercase text-[#1E1E1E] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    currentPage === pageNum
                      ? "bg-[#FFC244] text-[#1E1E1E] shadow-2xs"
                      : "border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3.5 py-1.5 rounded-full border border-neutral-200 text-xs font-bold uppercase text-[#1E1E1E] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors"
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
