"use client";

import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";

interface TextRevealProps {
  text: string;
  className?: string;
  children?: React.ReactNode;
}

export const TextReveal = ({ text, className, children }: TextRevealProps) => {
  const targetRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const words = text ? text.split(" ") : [];

  return (
    <div ref={targetRef} className={cn("relative z-0 h-[200vh]", className)}>
      <div
        className={
          "sticky top-0 mx-auto flex h-[50%] max-w-4xl items-center bg-transparent px-[1rem] py-[5rem]"
        }
      >
        <p
          ref={targetRef}
          className={
            "flex flex-wrap p-5 text-2xl font-bold text-black/20 dark:text-white/20 md:text-3xl lg:p-10 lg:text-4xl xl:text-5xl"
          }
        >
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
           {children && <span className="inline-block">{children}</span>}
        </p>
       
      </div>
    </div>
  );
};

interface WordProps {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word = ({ children, progress, range }: WordProps) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="xl:lg-3 relative mx-1 lg:mx-2.5">
      <span className={"absolute opacity-30"}>{children}</span>
      <motion.span style={{ opacity: opacity }} className={"text-black dark:text-white"}>
        {children}
      </motion.span>
    </span>
  );
};
