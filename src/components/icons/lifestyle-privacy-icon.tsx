import React from "react";

export function LifestylePrivacyIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      {...props}
    >
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        {/* Soft Aura/Glow */}
        <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.05" />
        <circle cx="50" cy="50" r="28" fill="currentColor" opacity="0.1" />
        
        {/* Outer biometric loop */}
        <path
          d="M50 20C33.4 20 20 33.4 20 50C20 66.6 33.4 80 50 80C66.6 80 80 66.6 80 50"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.2"
        />
        
        {/* Inner eye / fluid shape */}
        <path
          d="M30 50C30 50 40 35 50 35C60 35 70 50 70 50C70 50 60 65 50 65C40 65 30 50 30 50Z"
          fill="currentColor"
          opacity="0.15"
        />
        <path
          d="M30 50C30 50 40 35 50 35C60 35 70 50 70 50C70 50 60 65 50 65C40 65 30 50 30 50Z"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinejoin="round"
          opacity="0.8"
        />
        
        {/* Abstract pupil / iris layer */}
        <circle cx="50" cy="50" r="6" fill="currentColor" opacity="0.9" />
        
        {/* Subtle closure/security dot representing a lock/keyhole abstraction */}
        <path d="M49 55 L49 60 L51 60 L51 55 Z" fill="currentColor" opacity="0.9" />
      </g>
    </svg>
  );
}
