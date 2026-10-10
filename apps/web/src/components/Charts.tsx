"use client";

import React, { useState } from "react";
import { viewsOverTimeData, engagementByServiceData } from "../data/mockData";

export function Charts() {
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; views: number } | null>(null);
  const [hoveredBar, setHoveredBar] = useState<{ service: string; views: number; clicks: number } | null>(null);

  // Calculate coordinates for SVG line chart
  const maxViews = Math.max(...viewsOverTimeData.map((d) => d.views));
  const svgWidth = 500;
  const svgHeight = 180;
  const padding = 30;

  const points = viewsOverTimeData.map((d, index) => {
    const x = padding + (index / (viewsOverTimeData.length - 1)) * (svgWidth - padding * 2);
    const y = svgHeight - padding - (d.views / maxViews) * (svgHeight - padding * 2);
    return { ...d, x, y };
  });

  const pathD = points.reduce(
    (acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`),
    ""
  );

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`;

  // Bar chart measurements
  const maxEngagement = Math.max(
    ...engagementByServiceData.map((d) => Math.max(d.views, d.clicks))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Views Over Time (Line Chart) */}
      <div className="border border-black/20 bg-white p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wider">
              Views Over Time
            </h3>
            <p className="text-xs text-neutral-500">30-day organic discovery volume</p>
          </div>
          {hoveredPoint && (
            <div className="text-xs font-semibold px-2 py-0.5 border border-black/20 bg-neutral-50">
              {hoveredPoint.day}: <span className="font-bold text-black">{hoveredPoint.views} views</span>
            </div>
          )}
        </div>

        <div className="border border-dashed border-neutral-300 p-2 relative bg-neutral-50/50">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-44 overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Horizontal Grid lines */}
            <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#e5e5e5" strokeWidth="1" />
            <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="#e5e5e5" strokeWidth="1" />
            <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#000000" strokeWidth="1" />

            {/* Gradient Area Fill */}
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#viewsGradient)" />

            {/* Trend Line */}
            <path d={pathD} fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data Points */}
            {points.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill="#ffffff"
                stroke="#000000"
                strokeWidth="2"
                className="cursor-pointer hover:r-6 transition-all"
                onMouseEnter={() => setHoveredPoint({ day: pt.day, views: pt.views })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </svg>

          <div className="flex justify-between px-3 text-[10px] text-neutral-500 font-medium mt-1">
            <span>Day 1</span>
            <span>Day 15</span>
            <span>Day 30</span>
          </div>
        </div>
      </div>

      {/* 2. Engagement by Service (Bar Chart) */}
      <div className="border border-black/20 bg-white p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wider">
              Engagement by Service
            </h3>
            <p className="text-xs text-neutral-500">Breakdown of impressions & interactions</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-black"></span> Views
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-neutral-300 border border-black/30"></span> Clicks
            </span>
          </div>
        </div>

        <div className="border border-dashed border-neutral-300 p-4 bg-neutral-50/50 flex flex-col justify-between h-48">
          <div className="flex items-end justify-between gap-3 h-36 pt-2">
            {engagementByServiceData.map((item, idx) => {
              const viewHeight = (item.views / maxEngagement) * 100;
              const clickHeight = (item.clicks / maxEngagement) * 100;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center justify-end h-full gap-1 group cursor-pointer"
                  onMouseEnter={() => setHoveredBar(item)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div className="flex items-end gap-1 w-full justify-center h-full">
                    {/* Views Bar (solid black) */}
                    <div
                      className="w-3.5 bg-black rounded-t-2xs transition-all group-hover:opacity-80"
                      style={{ height: `${viewHeight}%` }}
                      title={`${item.service} Views: ${item.views}`}
                    ></div>
                    {/* Clicks Bar (pattern/gray) */}
                    <div
                      className="w-3.5 bg-neutral-300 border border-black/30 rounded-t-2xs transition-all group-hover:opacity-80"
                      style={{ height: `${clickHeight}%` }}
                      title={`${item.service} Clicks: ${item.clicks}`}
                    ></div>
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-600 truncate max-w-[65px] text-center">
                    {item.service}
                  </span>
                </div>
              );
            })}
          </div>

          {hoveredBar && (
            <div className="text-[11px] text-center font-medium text-neutral-700 pt-1 border-t border-neutral-200">
              <span className="font-bold text-black">{hoveredBar.service}</span>: {hoveredBar.views} views, {hoveredBar.clicks} clicks (CTR: {((hoveredBar.clicks / hoveredBar.views) * 100).toFixed(1)}%)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
