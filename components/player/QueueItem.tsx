"use client";

import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Song } from "@/types/music";
import { useEffect, useState } from "react";

const STRIPS = [
  { y1: 0,  y2: 17, tx: -28, ty: 80,  rot: -6,  delay: 0    },
  { y1: 17, y2: 34, tx: 22,  ty: 105, rot: 5,   delay: 0.04 },
  { y1: 34, y2: 51, tx: -18, ty: 130, rot: -8,  delay: 0.02 },
  { y1: 51, y2: 68, tx: 30,  ty: 150, rot: 7,   delay: 0.05 },
  { y1: 68, y2: 84, tx: -22, ty: 165, rot: -4,  delay: 0.03 },
  { y1: 84, y2: 100,tx: 18,  ty: 185, rot: 9,   delay: 0.06 },
];

interface TearAnimationProps {
  rect: DOMRect;
  song: Song;
}

export function TearAnimation({ rect, song }: TearAnimationProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const h = rect.height;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {STRIPS.map((strip, i) => {
        const top    = rect.top  + (strip.y1 / 100) * h;
        const height = ((strip.y2 - strip.y1) / 100) * h;
        return (
          <motion.div
            key={i}
            style={{
              position: "fixed",
              left: rect.left,
              top,
              width: rect.width,
              height,
              overflow: "hidden",
            }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scaleX: 1 }}
            animate={{ x: strip.tx, y: strip.ty + i * 10, rotate: strip.rot, opacity: 0, scaleX: 0.88 }}
            transition={{ duration: 0.6, delay: strip.delay, ease: [0.4, 0, 0.9, 1] }}
          >
            {/* Card content mirrored inside each strip */}
            <div
              style={{ position: "absolute", left: 0, top: -(strip.y1 / 100) * h, width: rect.width, height: rect.height }}
              className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-3 p-2"
            >
              <span className="material-symbols-outlined text-white/20 text-sm flex-shrink-0">drag_indicator</span>
              <img src={song.albumArt} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold text-white text-sm truncate">{song.title}</span>
                <span className="text-xs text-white/50 truncate">{song.artist}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>,
    document.body
  );
}
