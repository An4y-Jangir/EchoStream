"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isInput, setIsInput] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Fast, ultra-responsive spring physics with zero perceptible input lag
  const springConfig = { damping: 32, stiffness: 600, mass: 0.12 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Sync cursor settings on mount & custom events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkEnabled = () => {
      const isEnabled = localStorage.getItem("echo-custom-cursor") !== "false";
      setEnabled(isEnabled);
      if (isEnabled) {
        document.documentElement.classList.remove("disable-custom-cursor");
      } else {
        document.documentElement.classList.add("disable-custom-cursor");
      }
    };

    checkEnabled();
    window.addEventListener("cursor-change", checkEnabled);
    
    return () => {
      window.removeEventListener("cursor-change", checkEnabled);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;

    // Check if device uses fine pointer (mouse/trackpad)
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsPointer(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsPointer(e.matches);
    };
    mediaQuery.addEventListener("change", handleMediaChange);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive = 
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.cursor-pointer') ||
        target.closest('[role="button"]') ||
        target.closest('.glass-card') ||
        target.closest('.nav-item') ||
        target.closest('.group\\/qitem') ||
        target.closest('input[type="range"]'); // range slider

      const isText = 
        (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'range') ||
        target.tagName === 'TEXTAREA' ||
        target.closest('input[type="text"]') ||
        target.closest('input[type="search"]');

      setIsHovered(!!isInteractive);
      setIsInput(!!isText);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible, enabled]);

  if (!enabled || !isPointer || !isVisible) return null;

  return (
    <>
      {/* Outer Follower Ring (GPU transform scale, zero reflow) */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] mix-blend-screen size-11"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
          borderRadius: isInput ? "4px" : "50%",
          border: isInput ? "none" : `1.5px solid var(--theme-accent, #6366f1)`,
          backgroundColor: isInput 
            ? "var(--theme-accent, #6366f1)" 
            : isHovered 
              ? "rgba(99, 102, 241, 0.08)"
              : "transparent",
          boxShadow: isHovered 
            ? "0 0 16px var(--theme-accent, rgba(99, 102, 241, 0.4))"
            : "none",
        }}
        animate={{
          scale: isInput ? 0.4 : isClicked ? 0.75 : isHovered ? 1.05 : 0.5,
          opacity: isInput ? 0.9 : isHovered ? 1 : 0.6,
        }}
        transition={{ type: "spring", stiffness: 550, damping: 28 }}
      />

      {/* Inner Point Dot (Always 1:1 hardware tracked with zero lag) */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] size-1.5"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: "var(--theme-accent, #6366f1)",
          boxShadow: "0 0 6px var(--theme-accent, #6366f1)",
        }}
        animate={{
          scale: isInput ? 0 : isHovered ? 0.8 : 1,
          opacity: isInput ? 0 : 1,
        }}
        transition={{ duration: 0.08 }}
      />
    </>
  );
}
