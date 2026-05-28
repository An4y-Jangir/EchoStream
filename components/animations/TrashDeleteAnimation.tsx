"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Song } from "@/types/music";

interface TrashDeleteAnimationProps {
  song: Song;
  startRect: DOMRect | null;
  onComplete: () => void;
}

export function TrashDeleteAnimation({ song, startRect, onComplete }: TrashDeleteAnimationProps) {
  const [phase, setPhase] = useState<'idle' | 'enter' | 'open' | 'flight' | 'close' | 'exit'>('idle');

  useEffect(() => {
    // Start sequence
    setPhase('enter');

    // 1. Enter finishes, open lid
    const tOpen = setTimeout(() => {
      setPhase('open');
    }, 300);

    // 2. Lid open finishes, fly song in
    const tFlight = setTimeout(() => {
      setPhase('flight');
    }, 500);

    // 3. Flight finishes, close lid and slam
    const tClose = setTimeout(() => {
      setPhase('close');
    }, 1100);

    // 4. Lid shut impact finished, exit trash can
    const tExit = setTimeout(() => {
      setPhase('exit');
    }, 1350);

    // 5. Exit finishes, complete deletion
    const tComplete = setTimeout(() => {
      onComplete();
    }, 1650);

    return () => {
      clearTimeout(tOpen);
      clearTimeout(tFlight);
      clearTimeout(tClose);
      clearTimeout(tExit);
      clearTimeout(tComplete);
    };
  }, [onComplete]);

  if (!startRect) return null;

  // Calculate coordinates
  const screenW = typeof window !== "undefined" ? window.innerWidth : 1000;
  const screenH = typeof window !== "undefined" ? window.innerHeight : 800;

  // Let the flight start from where the album art is situated in the row (approx left + 50px)
  const startX = startRect.left + 50;
  const startY = startRect.top + startRect.height / 2;

  // Trash mouth targets
  const targetX = screenW / 2;
  const targetY = screenH - 170; // Position above the mouth of the trash can

  return (
    <div className="fixed inset-0 z-[250] pointer-events-none overflow-hidden">
      {/* 1. Flying Song Miniature (only during flight phase) */}
      <AnimatePresence>
        {phase === 'flight' && (
          <motion.div
            initial={{ 
              x: startX, 
              y: startY, 
              scale: 1, 
              opacity: 1, 
              rotate: 0,
              borderRadius: "0.75rem"
            }}
            animate={{
              x: [startX, (startX + targetX) / 2, targetX],
              y: [startY, Math.min(startY, targetY) - 140, targetY], // Beautiful arched projectile
              scale: [1, 0.7, 0.05],
              opacity: [1, 0.9, 0],
              rotate: [0, 180, 540],
              borderRadius: ["0.75rem", "0.5rem", "50%"]
            }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1] // Snappy ease-in-out curve
            }}
            className="absolute top-0 left-0 size-14 border-2 border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.5)] z-[260] overflow-hidden"
            style={{
              transform: "translate(-50%, -50%)",
              backgroundImage: `url(${song.albumArt})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            {/* Glowing overlay */}
            <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Cyber-Trash Can HUD Overlay */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{
            y: phase === 'exit' ? 200 : 0,
            opacity: phase === 'exit' ? 0 : 1
          }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 18
          }}
          className="flex flex-col items-center mb-[110px]" // Raised to float cleanly above bottom elements
        >
          {/* White Trash Lid */}
          <motion.div
            animate={
              phase === 'open' || phase === 'flight'
                ? { y: -15, x: -12, rotate: -40 }
                : { y: 0, x: 0, rotate: 0 }
            }
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 14
            }}
            className="w-16 h-4 flex justify-center items-end origin-bottom-left filter drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
          >
            <svg width="64" height="16" viewBox="0 0 64 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Lid Handle */}
              <path d="M 24,10 L 26,4 C 27,2 37,2 38,4 L 40,10" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              {/* Lid Plate */}
              <path d="M 6,12 L 58,12" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
            </svg>
          </motion.div>

          {/* White Trash Body */}
          <motion.div
            animate={
              phase === 'close'
                ? { 
                    y: [0, 6, -3, 2, 0],
                    rotate: [0, 2, -1, 0.5, 0],
                    scaleX: [1, 1.05, 0.98, 1.01, 1] 
                  }
                : {}
            }
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-16 h-20 glass-panel border border-white/20 rounded-b-2xl relative flex items-center justify-center filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] overflow-hidden"
            style={{
              background: "rgba(20, 20, 20, 0.85)",
              borderTopColor: "rgba(255, 255, 255, 0.4)"
            }}
          >
            {/* Trash Body Accents */}
            <svg width="48" height="60" viewBox="0 0 48 60" fill="none" className="opacity-80" xmlns="http://www.w3.org/2000/svg">
              <path d="M 6,2 L 42,2 L 36,54 L 12,54 Z" stroke="#ffffff" strokeWidth="2.2" strokeLinejoin="round" />
              <line x1="16" y1="12" x2="18" y2="44" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
              <line x1="24" y1="12" x2="24" y2="44" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
              <line x1="32" y1="12" x2="30" y2="44" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
            </svg>

            {/* Glowing Trash Interior Vibe */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
