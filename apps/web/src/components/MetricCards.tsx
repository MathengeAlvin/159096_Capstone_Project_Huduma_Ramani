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
          className="border border-black/20 bg-white p-5 flex flex-col justify-between hover:border-black transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
              {m.title}
            </span>
          </div>

          <div className="my-2.5">
            <span className="text-3xl font-extrabold tracking-tight text-black">
              {m.value}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {m.title === "AVG RATING" ? (
              <span className="inline-flex items-center gap-1 text-neutral-600 font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                {m.change}
              </span>
            ) : m.isPositive ? (
              <span className="inline-flex items-center gap-1 text-emerald-700">
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
              <span className="text-[10px] text-neutral-400 font-normal ml-auto">
                {m.sublabel}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
