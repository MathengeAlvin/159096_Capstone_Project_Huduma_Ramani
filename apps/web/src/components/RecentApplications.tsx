"use client";

import React, { useState } from "react";
import { ServiceApplication, ApplicationStatus } from "../types";
import { CheckCircle, Clock, Check, X } from "lucide-react";

interface RecentApplicationsProps {
  applications: ServiceApplication[];
  onUpdateStatus?: (appId: string, newStatus: ApplicationStatus) => void;
}

export function RecentApplications({
  applications,
  onUpdateStatus,
}: RecentApplicationsProps) {
  const [selectedApp, setSelectedApp] = useState<ServiceApplication | null>(null);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-block px-2.5 py-0.5 border border-black text-[11px] font-bold uppercase tracking-wider text-black bg-amber-50">
            PENDING
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-block px-2.5 py-0.5 border border-black text-[11px] font-bold uppercase tracking-wider text-black bg-emerald-50">
            APPROVED
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-block px-2.5 py-0.5 border border-black text-[11px] font-bold uppercase tracking-wider text-black bg-neutral-100">
            COMPLETED
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-block px-2.5 py-0.5 border border-neutral-400 text-[11px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-50">
            REJECTED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border border-black/20 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-black tracking-tight">
            Recent Applications
          </h3>
          <p className="text-xs text-neutral-500">
            Resident assistance intake requests requiring review
          </p>
        </div>
        <span className="text-xs font-semibold text-neutral-500">
          Total: {applications.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-black text-[11px] font-extrabold uppercase tracking-wider text-black">
              <th className="pb-3 pr-4">Applicant Name</th>
              <th className="pb-3 pr-4">Service Requested</th>
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {applications.map((app) => (
              <tr
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="hover:bg-neutral-50 transition-colors cursor-pointer group"
              >
                <td className="py-3.5 pr-4 font-bold text-black group-hover:underline">
                  {app.applicantName}
                </td>
                <td className="py-3.5 pr-4 text-neutral-700">
                  {app.serviceRequested}
                </td>
                <td className="py-3.5 pr-4 font-mono text-xs text-neutral-600">
                  {app.date}
                </td>
                <td className="py-3.5 text-right">
                  {getStatusBadge(app.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick View / Status Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border-2 border-black p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-black">
              <h4 className="text-lg font-bold text-black">Application Details</h4>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-neutral-500 hover:text-black font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm">
              <div>
                <span className="text-xs font-bold uppercase text-neutral-500 block">Applicant</span>
                <span className="text-base font-bold text-black">{selectedApp.applicantName}</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-neutral-500 block">Service</span>
                <span className="text-sm font-semibold text-neutral-800">{selectedApp.serviceRequested}</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-neutral-500 block">Submission Date</span>
                <span className="font-mono text-xs text-neutral-700">{selectedApp.date}</span>
              </div>
              {selectedApp.notes && (
                <div>
                  <span className="text-xs font-bold uppercase text-neutral-500 block">Intake Notes</span>
                  <p className="text-xs text-neutral-600 bg-neutral-50 p-2.5 border border-neutral-200 mt-1">
                    {selectedApp.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-black flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase text-neutral-600">Change Status:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onUpdateStatus?.(selectedApp.id, "APPROVED");
                    setSelectedApp({ ...selectedApp, status: "APPROVED" });
                  }}
                  className="px-3 py-1.5 border border-black bg-emerald-50 hover:bg-emerald-100 text-xs font-bold uppercase"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    onUpdateStatus?.(selectedApp.id, "COMPLETED");
                    setSelectedApp({ ...selectedApp, status: "COMPLETED" });
                  }}
                  className="px-3 py-1.5 border border-black bg-neutral-100 hover:bg-neutral-200 text-xs font-bold uppercase"
                >
                  Complete
                </button>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-3 py-1.5 border border-black bg-black text-white text-xs font-bold uppercase"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
