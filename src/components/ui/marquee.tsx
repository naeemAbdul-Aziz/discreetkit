'use client';

import * as React from 'react';

type MarqueeProps = {
  children: React.ReactNode;
  pauseOnHover?: boolean;
  speed?: number; // pixels per second
  ariaLabel?: string;
};

export function Marquee({ children, pauseOnHover = true, speed = 40, ariaLabel }: MarqueeProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = React.useState(false);

  // Inline CSS variables control speed
  const duration = 100 / (speed / 40); // normalize against default 40

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      aria-roledescription="marquee"
      aria-label={ariaLabel}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div
        className="flex min-w-full items-center gap-8"
        style={{
          animation: `marquee-scroll ${duration}s linear infinite`,
          animationPlayState: isPaused ? 'paused' as const : 'running' as const,
        }}
      >
        {/* Duplicate content for seamless loop */}
        <div className="flex items-center gap-8" aria-hidden="true">{children}</div>
        <div className="flex items-center gap-8" aria-hidden="true">{children}</div>
      </div>
      <style jsx>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}


