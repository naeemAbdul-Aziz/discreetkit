"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { wrap } from "@motionone/utils";

interface ScrollVelocityProps {
  velocity: number;
  className?: string;
  children: React.ReactNode;
}

interface ParallaxProps {
  children: React.ReactNode;
  baseVelocity: number;
  className?: string;
}

export const ScrollVelocityContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("w-full overflow-hidden", className)}>{children}</div>;
};

export const ScrollVelocityRow = ({
  children,
  baseVelocity = 10,
  className,
}: ParallaxProps) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const [repetitions, setRepetitions] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateRepetitions = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.offsetWidth;
        const newRepetitions = Math.ceil(containerWidth / textWidth) + 2;
        setRepetitions(newRepetitions);
      }
    };

    calculateRepetitions();

    window.addEventListener("resize", calculateRepetitions);
    return () => window.removeEventListener("resize", calculateRepetitions);
  }, [children]);

  const x = useTransform(baseX, (v) => `${wrap(-100 / repetitions, 0, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div
      className={cn("w-full overflow-hidden whitespace-nowrap", className)}
      ref={containerRef}
    >
      <motion.div className="inline-block" style={{ x }}>
        {Array.from({ length: repetitions }).map((_, i) => (
          <div key={i} className="inline-block" ref={i === 0 ? textRef : null}>
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
};
