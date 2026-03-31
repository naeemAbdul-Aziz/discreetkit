import React from "react";

export function DiscreetBoxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
      {...props}
    >
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        {/* Subtle shadow glow */}
        <ellipse fill="currentColor" opacity="0.1" cx="50" cy="85" rx="35" ry="8"></ellipse>
        
        {/* Main box base */}
        <path
          d="M50,22 L82,38 L82,74 L50,90 L18,74 L18,38 L50,22 Z"
          fill="currentColor"
          opacity="0.2"
        ></path>
        
        {/* Left pane */}
        <path
          d="M18,38 L50,54 L50,90 L18,74 L18,38 Z"
          fill="currentColor"
          opacity="0.08"
        ></path>

        {/* Right pane */}
        <path
          d="M50,54 L82,38 L82,74 L50,90 L50,54 Z"
          fill="currentColor"
          opacity="0.15"
        ></path>

        {/* Top pane */}
        <path
          d="M50,22 L18,38 L50,54 L82,38 L50,22 Z"
          fill="currentColor"
          opacity="0.4"
        ></path>
        
        {/* Sleek tape across the top */}
        <polygon
          fill="currentColor"
          opacity="0.8"
          points="35,46 45,51 65,41 55,36"
        ></polygon>
        
        {/* Wireframe Accents for modern sleek feel */}
        <path
          d="M50,22 L82,38 L82,74 L50,90 L18,74 L18,38 L50,22 Z M50,54 L50,90 M18,38 L50,54 L82,38"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>

        {/* Minimalist discreet check symbol on front right panel */}
        <path
          d="M58,62 L64,68 L74,55"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        ></path>
      </g>
    </svg>
  );
}
