"use client";

import { motion, AnimatePresence } from "framer-motion";

interface FlightAnimationProps {
  startRect: DOMRect | null;
  endRect: DOMRect | null;
  imageUrl: string;
  onComplete: () => void;
}

export function FlightAnimation({ startRect, endRect, imageUrl, onComplete }: FlightAnimationProps) {
  if (!startRect || !endRect) return null;

  // Calculate start and end centers
  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top + startRect.height / 2;
  const targetX = endRect.left + endRect.width / 2;
  const targetY = endRect.top + endRect.height / 2;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      <motion.div
        initial={{ 
          x: startX, 
          y: startY, 
          scale: 1, 
          opacity: 1,
          rotate: 0,
          borderRadius: "1rem"
        }}
        animate={{
          x: targetX,
          y: targetY,
          scale: [1, 1.2, 0.1], // Pulsate slightly then shrink
          opacity: [1, 1, 0],
          rotate: [0, -10, 360],
          borderRadius: ["1rem", "0.5rem", "50%"]
        }}
        transition={{
          duration: 0.9,
          ease: "circIn", // Accelerates towards the end
          times: [0, 0.2, 1]
        }}
        onAnimationComplete={onComplete}
        className="absolute top-0 left-0 overflow-hidden shadow-2xl border border-white/20"
        style={{ 
          width: startRect.width, 
          height: startRect.height,
          transform: "translate(-50%, -50%)",
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-accent/20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
      </motion.div>
    </div>
  );
}
