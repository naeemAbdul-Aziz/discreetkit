import React from "react";

export function LifestylePaymentIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
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

        {/* Floating primary lifestyle token */}
        <circle cx="50" cy="45" r="30" fill="currentColor" opacity="0.1" />
        <circle cx="50" cy="45" r="26" fill="currentColor" opacity="0.25" />

        {/* Abstract chip / currency core */}
        <rect x="38" y="32" width="24" height="26" rx="6" fill="currentColor" opacity="0.8" />
        <line x1="42" y1="38" x2="58" y2="38" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <line x1="42" y1="46" x2="52" y2="46" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

        {/* Encapsulating Ring representing security & vault */}
        <path
          d="M20 45 A30 30 0 0 1 80 45"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.9"
          transform="rotate(15 50 45)"
        />
        
        {/* Verification Checkmark orbiting the token */}
        <path 
          d="M75 60 L82 68 L92 52" 
          stroke="currentColor" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          opacity="0.95" 
        />
        <circle cx="83" cy="62" r="16" fill="currentColor" opacity="0.1" />
      </g>
    </svg>
  );
}
