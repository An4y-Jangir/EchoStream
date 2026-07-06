"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STAGGER = 0.025; // Sleek staggered delay

interface TextRollProps {
  children: string;
  className?: string;
  center?: boolean;
}

export const TextRoll: React.FC<TextRollProps> = ({
  children,
  className,
  center = false,
}) => {
  return (
    <span
      className={cn("relative block overflow-hidden whitespace-nowrap", className)}
      style={{
        lineHeight: 1.2,
      }}
    >
      <span className="flex">
        {children.split("").map((l, i) => {
          const delay = center
            ? STAGGER * Math.abs(i - (children.length - 1) / 2)
            : STAGGER * i;

          return (
            <motion.span
              variants={{
                initial: { y: 0 },
                hovered: { y: "-100%" },
              }}
              transition={{
                ease: [0.16, 1, 0.3, 1], // Premium spring-like cubic bezier
                duration: 0.4,
                delay,
              }}
              className="inline-block"
              key={i}
            >
              {l === " " ? "\u00A0" : l}
            </motion.span>
          );
        })}
      </span>
      <span className="absolute inset-0 flex pointer-events-none">
        {children.split("").map((l, i) => {
          const delay = center
            ? STAGGER * Math.abs(i - (children.length - 1) / 2)
            : STAGGER * i;

          return (
            <motion.span
              variants={{
                initial: { y: "100%" },
                hovered: { y: 0 },
              }}
              transition={{
                ease: [0.16, 1, 0.3, 1], // Matches the first row exactly
                duration: 0.4,
                delay,
              }}
              className="inline-block"
              key={i}
            >
              {l === " " ? "\u00A0" : l}
            </motion.span>
          );
        })}
      </span>
    </span>
  );
};
