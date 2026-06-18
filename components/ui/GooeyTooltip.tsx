"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface GooeyTooltipProps {
  text: string;
  className?: string;
  maxLengthClass?: string;
}

export function GooeyTooltip({ text, className, maxLengthClass = "max-w-[150px] sm:max-w-[200px]" }: GooeyTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const checkTruncation = () => {
    if (triggerRef.current) {
      return triggerRef.current.scrollWidth > triggerRef.current.clientWidth;
    }
    return false;
  };

  const handleMouseEnter = () => {
    if (checkTruncation()) {
      setIsOpen(true);
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Gooey SVG Filter */}
      <svg className="absolute w-0 h-0" style={{ visibility: "hidden", position: "absolute" }}>
        <defs>
          <filter id="gooey-text-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* 1. BACKGROUND MORPH LAYER (Gooey Filtered) */}
      <div
        style={{ filter: "url(#gooey-text-filter)" }}
        className="absolute inset-0 pointer-events-none z-0"
      >


        {/* Tooltip Background Shape (uses transparent text to auto-size) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ y: 0, scale: 0.8, opacity: 0 }}
              animate={{
                y: -36,
                scale: 1,
                opacity: 1,
              }}
              exit={{
                y: 0,
                scale: 0.8,
                opacity: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 22,
              }}
              className="absolute left-0 bottom-0 bg-accent px-3 py-1 text-[11px] font-bold rounded-xl whitespace-nowrap text-transparent select-none border border-white/5"
            >
              {text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. FOREGROUND TEXT LAYER (Crisp & Sharp - Unfiltered) */}
      <div className="relative z-10">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ y: 0, scale: 0.8, opacity: 0 }}
              animate={{
                y: -36,
                scale: 1,
                opacity: 1,
              }}
              exit={{
                y: 0,
                scale: 0.8,
                opacity: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 22,
              }}
              className="absolute left-0 bottom-0 px-3 py-1 text-white text-[11px] font-bold pointer-events-none whitespace-nowrap z-50"
            >
              {text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Base Trigger Element (The truncated text) */}
        <div
          ref={triggerRef}
          className={cn(
            "cursor-pointer truncate text-white select-none",
            maxLengthClass,
            className
          )}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
