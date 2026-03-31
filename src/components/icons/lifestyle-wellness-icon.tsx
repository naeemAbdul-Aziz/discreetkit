import React from "react";

export function LifestyleWellnessIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      {...props}
    >
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        {/* Soft elegant shadow */}
        <ellipse fill="currentColor" opacity="0.1" cx="50" cy="85" rx="36" ry="8" />

        {/* Primary geometric droplet/leaf foundation representing lifestyle wellness */}
        <path
          d="M50 25 C25 25 15 50 25 70 C30 80 50 80 50 80 C50 80 70 80 75 70 C85 50 75 25 50 25 Z"
          fill="currentColor"
          opacity="0.15"
        />

        {/* Core intersecting ring symbolizing balance & health symmetry */}
        <circle cx="42" cy="55" r="15" fill="currentColor" opacity="0.3" />
        <circle cx="58" cy="55" r="15" fill="currentColor" opacity="0.1" />

        {/* Crisp vector lines for modern aesthetic */}
        <path
          d="M25 45 Q50 65 75 45"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Ascent line / holistic energy */}
        <line x1="50" y1="35" x2="50" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
        <circle cx="50" cy="18" r="4" fill="currentColor" opacity="0.85" />

      </g>
    </svg>
  );
}
