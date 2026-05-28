"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface TrashAnimationProps {
  startRect: DOMRect | null;
  imageUrl: string;
  onComplete: () => void;
}

export function TrashAnimation({ startRect, imageUrl, onComplete }: TrashAnimationProps) {
  const onCompleteRef = useRef(onComplete);
  
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Total animation time is around 1.8s
    const timer = setTimeout(() => {
      onCompleteRef.current();
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!startRect) return null;

  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top + startRect.height / 2;
  const targetX = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
  const targetY = typeof window !== 'undefined' ? window.innerHeight / 2 : 500;

  return (
    <div className="fixed inset-0 z-[300] pointer-events-none flex items-center justify-center">
      {/* The Dustbin */}
      <motion.div
        className="relative flex flex-col items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1, 1, 1, 0], opacity: [0, 1, 1, 1, 0] }}
        transition={{
          duration: 1.6,
          times: [0, 0.15, 0.8, 0.85, 1], // Appear at 0-0.24s, disappear at 1.36-1.6s
        }}
      >
        {/* Lid */}
        <motion.div
          className="absolute -top-[45px] z-20 origin-bottom-left"
          initial={{ rotate: 0, y: 0 }}
          animate={{ rotate: [0, -45, -45, 0], y: [0, -20, -20, 0] }}
          transition={{
            duration: 1.0,
            delay: 0.2, // Starts opening at 0.2s, stays open, closes at 1.2s
            times: [0, 0.2, 0.8, 1],
          }}
        >
          <svg viewBox="0 0 24 10" width="100" height="40" className="drop-shadow-2xl">
            <path
              d="M2 8h20 M8 8V4c0-1 1-2 2-2h4c1 0 2 1 2 2v4"
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#334155"
            />
          </svg>
        </motion.div>

        {/* Bin Body */}
        <div className="z-30 mt-2">
          <svg viewBox="0 0 24 18" width="100" height="80" className="drop-shadow-2xl">
            <path
              d="M4 0v14a2 2 0 002 2h12a2 2 0 002-2V0H4z"
              stroke="#cbd5e1"
              strokeWidth="2"
              fill="#1e293b"
            />
            <path d="M9 4v8 M15 4v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </motion.div>

      {/* The Crumpling Song */}
      <motion.div
        className="absolute top-0 left-0 overflow-hidden shadow-2xl z-10"
        style={{
          width: startRect.width,
          height: startRect.height,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transformOrigin: "center center",
        }}
        initial={{
          x: startX - startRect.width / 2,
          y: startY - startRect.height / 2,
          scale: 1,
          opacity: 1,
          rotate: 0,
          borderRadius: "1rem",
          filter: "contrast(100%) grayscale(0%)",
        }}
        animate={{
          x: targetX - startRect.width / 2,
          y: targetY - startRect.height / 2 - 20, // Aim for the top of the bin
          scale: [1, 0.5, 0.1], // Shrinks heavily
          opacity: [1, 1, 0], // Fades out at the very end as it drops in
          rotate: [0, 180, 720], // Tumbles
          borderRadius: ["1rem", "2rem", "50%"], // Crumples into a ball
          filter: ["contrast(100%) grayscale(0%)", "contrast(150%) grayscale(30%)", "contrast(200%) grayscale(50%)"],
        }}
        transition={{
          duration: 0.6,
          delay: 0.4, // Waits for dustbin to appear and lid to open
          ease: "backIn",
          times: [0, 0.6, 1],
        }}
      >
        {/* Paper texture overlay for the crumple effect */}
        <motion.div
          className="absolute inset-0 bg-white mix-blend-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.8] }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />
      </motion.div>
    </div>
  );
}
