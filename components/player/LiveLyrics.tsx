"use client";

import { useEffect, useRef } from "react";
import { LyricLine } from "@/types/music";
import { motion } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext";

interface LiveLyricsProps {
  lyrics: LyricLine[];
  currentTime: number;
}

export function LiveLyrics({ lyrics, currentTime }: LiveLyricsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { seek, duration, lyricsMode } = usePlayer();
  
  const activeIndex = lyrics.findIndex((line, index) => {
    const nextLine = lyrics[index + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  });

  // Reset scroll to top when a new song's lyrics load
  useEffect(() => {
    if (containerRef.current) {
       containerRef.current.scrollTop = 0;
    }
  }, [lyrics]);

  // Smooth scroll to the active line
  useEffect(() => {
    if (containerRef.current && activeIndex !== -1) {
      const activeElement = containerRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [activeIndex]);

  const handleLyricClick = (time: number) => {
     if (duration) {
       seek(time / duration);
     }
  };

  return (
    <div 
      ref={containerRef}
      className="h-[80vh] overflow-y-auto w-full px-4 md:px-12 py-[40vh] space-y-10 no-scrollbar relative"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
        scrollBehavior: 'smooth'
      }}
    >
      {lyrics.map((line, index) => {
        const isActive = index === activeIndex;
        const isPast = index < activeIndex;
        const nextLine = lyrics[index + 1];
        const lineDuration = nextLine ? Math.min(nextLine.time - line.time, 10) : 5;
        
        // Detect dual singers based on standard LRC cues (Bracketed text or Name:)
        const isAlternate = line.text.trim().startsWith('(') || line.text.trim().startsWith('[') || /^[A-Za-z]+:/.test(line.text.trim());
        const words = line.text.split(' ');

        return (
          <motion.div
            key={index}
            onClick={() => handleLyricClick(line.time)}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isActive ? 1 : isPast ? 0.3 : 0.2,
              filter: isActive ? "blur(0px)" : isPast ? "blur(0.5px)" : "blur(2px)",
              scale: isActive ? 1.05 : 1,
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`
              font-bold tracking-tight break-words cursor-pointer transition-all
              text-4xl md:text-5xl lg:text-7xl w-[85%] flex flex-wrap gap-x-[0.3em] gap-y-2
              ${isAlternate ? 'ml-auto justify-end text-right' : 'mr-auto justify-start text-left'}
            `}
            style={{ originX: isAlternate ? 1 : 0 }}
            whileHover={{ scale: 1.02, opacity: 0.8 }}
          >
            {words.map((word, wIndex) => {
               // Calculate word illumination timing strictly linearly across the line's duration
               const activeProgress = isActive ? Math.max(0, currentTime - line.time) : 0;
               const wordTimeWindow = lineDuration / Math.max(1, words.length);
               
               // A word is active if the line is past, OR if the line is currently active and the time has reached this word
               let isWordActive = isPast || (isActive && activeProgress >= (wIndex * wordTimeWindow * 0.8)); // 0.8 modifier makes it light up slightly ahead of pacing

               if (lyricsMode === 'line') {
                  isWordActive = isPast || isActive;
               }

               return (
                  <motion.span
                    key={wIndex}
                    animate={{
                      color: isWordActive ? "#ffffff" : "#666666",
                      opacity: isWordActive ? 1 : (isActive ? 0.5 : 1), 
                      textShadow: isWordActive && isActive ? "0 0 30px rgba(255,255,255,0.4)" : "none"
                    }}
                    transition={{
                      duration: Math.max(0.3, wordTimeWindow),
                      ease: "linear"
                    }}
                  >
                    {word}
                  </motion.span>
               )
            })}
          </motion.div>
        );
      })}
      {/* Spacer to allow scrolling cleanly off the end */}
      <div className="h-[40vh]" />
    </div>
  );
}
