"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CipherRevealProps {
  text: string;
  revealText: string;
  className?: string;
  onRevealComplete?: () => void;
  isRevealing: boolean;
}

const CHARACTERS = "0123456789ABCDEFxX";

export function CipherReveal({
  text,
  revealText,
  className,
  onRevealComplete,
  isRevealing,
}: CipherRevealProps) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRevealing) {
      let iteration = 0;
      const totalIterations = 20; // How long the scramble lasts

      interval = setInterval(() => {
        setDisplayText((prev) =>
          prev
            .split("")
            .map((char, index) => {
              if (index < iteration) {
                return revealText[index];
              }
              return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
            })
            .join("")
        );

        if (iteration >= revealText.length) {
          clearInterval(interval);
          if (onRevealComplete) onRevealComplete();
        }

        iteration += 1 / 3; // Speed of reveal
      }, 30);
    } else {
        // Reset to initial text when not revealing
       setDisplayText(text);
    }

    return () => clearInterval(interval);
  }, [isRevealing, text, revealText, onRevealComplete]);

  return (
    <span className={cn("font-mono", className)}>
      {displayText}
    </span>
  );
}
