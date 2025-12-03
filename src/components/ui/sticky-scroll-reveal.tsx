"use client";
import React, { useRef } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode | any;
    step?: number;
    details?: string[];
    cta?: React.ReactNode;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  return (
    <motion.div
      className="flex justify-center relative space-x-10 rounded-md p-10"
      ref={ref}
    >
      <div className="div relative flex items-start px-4">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-20">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                className="flex items-center gap-4 mb-4"
              >
                {item.step && (
                  <span className="text-4xl font-bold text-primary/20 font-headline">
                    0{item.step}
                  </span>
                )}
                <h2 className="text-2xl font-bold text-foreground">
                  {item.title}
                </h2>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
              >
                <p className="text-kg text-muted-foreground max-w-sm">
                  {item.description}
                </p>
                {item.details && (
                  <ul className="mt-4 space-y-2">
                    {item.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
                {item.cta && (
                  <div className="mt-6">
                    {item.cta}
                  </div>
                )}
              </motion.div>
            </div>
          ))}
          <div className="h-40" />
        </div>
      </div>
      <div
        className={cn(
          "hidden lg:block h-60 w-80 rounded-md bg-background sticky top-10 overflow-hidden border border-border",
          contentClassName
        )}
      >
        {content[activeCard].content ?? null}
      </div>
    </motion.div>
  );
};
