"use client";

import React, { useState } from "react";
import { ServiceApplication, ApplicationStatus } from "../types";
import { X, Inbox } from "lucide-react";

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
          <span className="inline-block px-3 py-1 rounded-full border border-[#FDE68A] text-[10px] font-black uppercase tracking-wider text-[#B45309] bg-[#FFF7E0]">
            PENDING
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-block px-3 py-1 rounded-full border border-[#00A082]/30 text-[10px] font-black uppercase tracking-wider text-[#00A082] bg-[#E6F6F3]">
            APPROVED
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-block px-3 py-1 rounded-full border border-emerald-300 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50">
            ATTENDED TO ✓
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-block px-3 py-1 rounded-full border border-rose-200 text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50">
            REJECTED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-black text-[#1E1E1E] tracking-tight">
            Recent Applications
          </h3>
          <p className="text-xs text-neutral-500">
            Resident assistance intake requests requiring review
          </p>
        </div>
        <span className="text-xs font-bold text-neutral-500 px-3 py-1 rounded-full bg-neutral-100">
          Total: {applications.length}
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="py-12 px-4 text-center border-2 border-dashed border-neutral-200 rounded-2xl bg-[#FAFAFA]">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 mx-auto mb-3 flex items-center justify-center text-amber-600">
            <Inbox className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-black text-[#1E1E1E]">No Beneficiary Applications Yet</h4>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
            When informal settlement residents apply for this provider&apos;s services from the mobile app, their intake requests will appear here for review and approval.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-neutral-100 text-[11px] font-black uppercase tracking-wider text-[#1E1E1E]">
                <th className="pb-3 pr-4">Applicant Name</th>
                <th className="pb-3 pr-4">Service Requested</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {applications.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className="hover:bg-[#FFFDF7] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 pr-4 font-bold text-[#1E1E1E] group-hover:text-amber-700">
                    {app.applicantName}
                  </td>
                  <td className="py-3.5 pr-4 text-neutral-700 font-medium text-xs">
                    {app.serviceRequested}
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-xs text-neutral-500">
                    {app.date}
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {getStatusBadge(app.status)}
                      {app.status === "APPROVED" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus?.(app.id, "COMPLETED");
                          }}
                          className="px-2.5 py-1 rounded-full border border-emerald-500 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase transition-all cursor-pointer shadow-2xs"
                          title="Click when resident has finished being attended to"
                        >
                          Mark Attended ✓
                        </button>
                      )}
                      {app.status === "COMPLETED" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus?.(app.id, "APPROVED");
                          }}
                          className="px-2.5 py-1 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-black uppercase transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                          title="Revert attended status and revoke rating permission"
                        >
                          <span>Revert ↺</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick View / Status Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h4 className="text-lg font-black text-[#1E1E1E]">Application Details</h4>
              <button
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm">
              <div>
                <span className="text-xs font-bold uppercase text-neutral-500 block">Applicant</span>
                <span className="text-base font-extrabold text-[#1E1E1E]">{selectedApp.applicantName}</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-neutral-500 block">Service</span>
                <span className="text-sm font-semibold text-neutral-800">{selectedApp.serviceRequested}</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-neutral-500 block">Submission Date</span>
                <span className="font-mono text-xs text-neutral-600">{selectedApp.date}</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-neutral-500 block">Current Status</span>
                <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
              </div>
              {selectedApp.notes && (
                <div>
                  <span className="text-xs font-bold uppercase text-neutral-500 block">Intake Notes / Contact</span>
                  <p className="text-xs text-neutral-700 bg-[#FFFBEB] p-3 rounded-xl border border-[#FDE68A] mt-1">
                    {selectedApp.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase text-neutral-600 self-start sm:self-auto">Action:</span>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                {selectedApp.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => {
                        onUpdateStatus?.(selectedApp.id, "APPROVED");
                        setSelectedApp({ ...selectedApp, status: "APPROVED" });
                      }}
                      className="px-3.5 py-1.5 rounded-full border border-[#00A082]/40 bg-[#E6F6F3] hover:bg-[#D5EFEA] text-[#00A082] text-xs font-black uppercase transition-all cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        onUpdateStatus?.(selectedApp.id, "REJECTED");
                        setSelectedApp({ ...selectedApp, status: "REJECTED" });
                      }}
                      className="px-3.5 py-1.5 rounded-full border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black uppercase transition-all cursor-pointer"
                    >
                      Deny / Reject
                    </button>
                  </>
                )}
                {selectedApp.status === "APPROVED" && (
                  <>
                    <button
                      onClick={() => {
                        onUpdateStatus?.(selectedApp.id, "COMPLETED");
                        setSelectedApp({ ...selectedApp, status: "COMPLETED" });
                      }}
                      className="px-3.5 py-1.5 rounded-full border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <span>Mark as Attended to ✓</span>
                    </button>
                    <button
                      onClick={() => {
                        onUpdateStatus?.(selectedApp.id, "REJECTED");
                        setSelectedApp({ ...selectedApp, status: "REJECTED" });
                      }}
                      className="px-3.5 py-1.5 rounded-full border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black uppercase transition-all cursor-pointer"
                    >
                      Cancel / Reject
                    </button>
                  </>
                )}
                {selectedApp.status === "COMPLETED" && (
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-full">
                      Customer Attended to ✓ (Rating Unlocked)
                    </span>
                    <button
                      onClick={() => {
                        onUpdateStatus?.(selectedApp.id, "APPROVED");
                        setSelectedApp({ ...selectedApp, status: "APPROVED" });
                      }}
                      className="px-3.5 py-1.5 rounded-full border border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5"
                      title="Revert attendance back to Approved and revoke rating ability"
                    >
                      <span>Revert Attendance ↺</span>
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-3.5 py-1.5 rounded-full bg-[#FFC244] hover:bg-[#F5B42E] text-[#1E1E1E] text-xs font-black uppercase transition-all cursor-pointer"
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
