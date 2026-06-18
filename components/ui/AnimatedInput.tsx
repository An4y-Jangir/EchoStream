"use client";

import React, { useRef, forwardRef, useImperativeHandle, type ComponentPropsWithRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedInputProps extends Omit<ComponentPropsWithRef<"input">, "value" | "defaultValue"> {
  wrapperClassName?: string;
  icon?: React.ReactNode;
  value?: string;
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, wrapperClassName, icon, value, onChange, onKeyDown, placeholder = "Search...", ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const inputValue = value || "";
    const chars = inputValue.split("");

    return (
      <div className={cn("relative w-full flex items-center", wrapperClassName)}>
        {/* Left Icon (Search icon) */}
        {icon && (
          <div className="absolute left-4 pointer-events-none z-20 flex items-center text-slate-400">
            {icon}
          </div>
        )}

        {/* Real input element (transparent text, visible native caret) */}
        <input
          ref={inputRef}
          type="text"
          className={cn(
            "w-full bg-white/[0.03] border border-white/[0.02] rounded-xl py-2.5 pl-11 pr-4 text-xs focus:ring-1 focus:ring-accent/30 focus:border-accent/30 focus:bg-white/[0.06] outline-none transition-all text-transparent caret-white placeholder-transparent", 
            className
          )}
          value={inputValue}
          onChange={onChange}
          onKeyDown={onKeyDown}
          {...props}
        />

        {/* Animated visual overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center pl-11 pr-4 z-10 overflow-hidden select-none">
          {inputValue === "" && (
            <span className="absolute text-xs text-slate-600 transition-opacity duration-200">
              {placeholder}
            </span>
          )}
          <div className="flex items-center">
            <AnimatePresence mode="popLayout">
              {chars.map((char, index) => (
                <motion.span
                  key={`${char}-${index}`}
                  className="text-xs text-white whitespace-pre inline-block"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                >
                  {char}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";
