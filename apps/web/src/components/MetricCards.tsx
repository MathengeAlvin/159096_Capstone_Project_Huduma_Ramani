"use client";

import React from "react";
import { Star, TrendingUp, TrendingDown } from "lucide-react";
import { MetricCardData } from "../types";

interface MetricCardsProps {
  metrics?: MetricCardData[];
}

export function MetricCards({ metrics }: MetricCardsProps) {
  const defaultMetrics: MetricCardData[] = [
    {
      title: "TOTAL VIEWS",
      value: "1,248",
      change: "+12%",
      isPositive: true,
    },
    {
      title: "REC. IMPRESSIONS",
      value: "24,802",
      change: "+8%",
      isPositive: true,
    },
    {
      title: "CLICK-THROUGH RATE",
      value: "5.03%",
      change: "-2%",
      isPositive: false,
    },
    {
      title: "AVG RATING",
      value: "4.8",
      change: "5 stars",
      isPositive: true,
      sublabel: "Bayesian prior adjusted",
    },
  ];

  const items = metrics || defaultMetrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((m, index) => (
        <div
          key={index}
          className="rounded-2xl border border-neutral-200/80 bg-white p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#FDE68A] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
              {m.title}
            </span>
            <span className="w-2 h-2 rounded-full bg-[#FFC244] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="my-2.5">
            <span className="text-3xl font-black tracking-tight text-[#1E1E1E]">
              {m.value}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold">
            {m.title === "AVG RATING" ? (
              <span className="inline-flex items-center gap-1 text-neutral-700 font-bold">
                <Star className="w-3.5 h-3.5 fill-[#FFC244] text-[#F59E0B]" />
                {m.change}
              </span>
            ) : m.isPositive ? (
              <span className="inline-flex items-center gap-1 text-[#00A082]">
                <TrendingUp className="w-3.5 h-3.5" />
                {m.change}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-rose-600">
                <TrendingDown className="w-3.5 h-3.5" />
                {m.change}
              </span>
            )}
            {m.sublabel && (
              <span className="text-[10px] text-neutral-400 font-medium ml-auto">
                {m.sublabel}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
