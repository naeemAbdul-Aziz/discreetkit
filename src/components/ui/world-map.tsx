"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

interface MapProps {
  dots?: {
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }[];
  lineColor?: string;
}

export default function WorldMap({
  dots = [],
  lineColor = "#10b981", // Emerald-500
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Projection configuration for Ghana (Southern Focus)
  const mapConfig = {
    width: 800,
    height: 400,
    minLng: -3.5,
    maxLng: 1.5,
    minLat: 4.5,
    maxLat: 8.0,
  };

  const project = (lat: number, lng: number) => {
    const x = ((lng - mapConfig.minLng) / (mapConfig.maxLng - mapConfig.minLng)) * mapConfig.width;
    const y = mapConfig.height - ((lat - mapConfig.minLat) / (mapConfig.maxLat - mapConfig.minLat)) * mapConfig.height;
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const curveOffset = -40; // Slightly subtler curve
    
    return `M ${start.x} ${start.y} Q ${midX} ${midY + curveOffset} ${end.x} ${end.y}`;
  };

  return (
    <div className="w-full h-full bg-[#020617] rounded-3xl overflow-hidden relative border border-slate-800 shadow-2xl">
      {/* Premium Grid Background */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:24px_24px]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#1e293b,transparent)] opacity-50"></div>
      
      {/* Map SVG */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${mapConfig.width} ${mapConfig.height}`}
        className="w-full h-full pointer-events-none relative z-10"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Render Lines */}
        {dots.map((dot, i) => {
          const start = project(dot.start.lat, dot.start.lng);
          const end = project(dot.end.lat, dot.end.lng);
          const path = createCurvedPath(start, end);

          return (
            <g key={`path-${i}`}>
              {/* Base Line */}
              <motion.path
                d={path}
                fill="none"
                stroke={lineColor}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                }}
              />
              {/* Active Data Stream (Animated) */}
              <motion.path
                d={path}
                fill="none"
                stroke={lineColor}
                strokeWidth="2"
                strokeDasharray="8 8"
                filter="url(#glow)"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -32 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                opacity="0.8"
              />
            </g>
          );
        })}

        {/* Render Points */}
        {dots.flatMap((dot, i) => [
          { ...dot.start, ...project(dot.start.lat, dot.start.lng), key: `start-${i}` },
          { ...dot.end, ...project(dot.end.lat, dot.end.lng), key: `end-${i}` }
        ]).filter((v, i, a) => a.findIndex(t => t.key === v.key) === i) // Unique points
          .map((point) => (
          <g key={point.key}>
            {/* Pulsing Beacon */}
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="8"
              fill={lineColor}
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 2.5 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Core Dot */}
            <circle cx={point.x} cy={point.y} r="3" fill="#fff" className="stroke-slate-900 stroke-2" />
            
            {/* Label */}
            {point.label && (
               <text 
                x={point.x} 
                y={point.y + 20} 
                textAnchor="middle" 
                className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest font-mono" 
                style={{ fontSize: '10px' }}
               >
                {point.label}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Live Status Panel (Restored & Elevated) */}
      <div className="absolute top-6 left-6 bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-2xl z-20">
        <div className="flex items-center gap-3 mb-2">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-xs font-black text-white uppercase tracking-widest">DiscreetNet™ Live</span>
        </div>
        <div className="space-y-1 pl-6 border-l border-slate-800">
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Active Routes</p>
            <p className="text-lg font-bold text-white leading-none">{dots.length}</p>
        </div>
      </div>
    </div>
  );
}
