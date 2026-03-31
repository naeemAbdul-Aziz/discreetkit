import React from "react";

export function LifestyleCourierIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      {...props}
    >
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        {/* Speed blur shadows */}
        <ellipse fill="currentColor" opacity="0.05" cx="45" cy="80" rx="40" ry="10" />
        <ellipse fill="currentColor" opacity="0.1" cx="55" cy="80" rx="20" ry="6" />

        {/* Dynamic primary swoosh simulating forward motion and discreet flight */}
        <path
          d="M85 45 C75 35 50 40 35 45 C20 50 10 65 15 75 C20 85 40 70 85 45"
          fill="currentColor"
          opacity="0.25"
        />

        {/* Sharp vector trace for precision and lifestyle elegance */}
        <path
          d="M10 50 Q40 5 95 30"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.8"
        />
        
        {/* Core payload (The Box/Package) moving fast */}
        <rect x="50" y="32" width="20" height="20" rx="6" fill="currentColor" opacity="0.9" transform="rotate(20 60 42)" />
        <path d="M50 32 L70 32" stroke="#fff" strokeWidth="2.5" opacity="0.5" transform="rotate(20 60 42)" />
        
        {/* Wind lines for speed */}
        <line x1="15" y1="35" x2="35" y2="35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
        <line x1="5" y1="45" x2="20" y2="45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <line x1="25" y1="65" x2="55" y2="65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      </g>
    </svg>
  );
}
