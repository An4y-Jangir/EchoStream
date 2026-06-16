"use client";

import { useEffect, useRef, useState } from "react";
import { LyricLine } from "@/types/music";
import { motion } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext";

interface LiveLyricsProps {
  lyrics: LyricLine[];
  currentTime: number;
}

export function LiveLyrics({ lyrics, currentTime }: LiveLyricsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { seek, duration, lyricsMode, isPlaying } = usePlayer();

  // Smooth time interpolation using requestAnimationFrame to bypass the slow 250ms/500ms updates
  const [smoothTime, setSmoothTime] = useState(currentTime);
  const lastTimeRef = useRef(currentTime);
  const lastUpdatedRef = useRef(performance.now());

  useEffect(() => {
    setSmoothTime(currentTime);
    lastTimeRef.current = currentTime;
    lastUpdatedRef.current = performance.now();
  }, [currentTime]);

  useEffect(() => {
    if (!isPlaying) return;

    let frameId: number;
    const update = () => {
      const now = performance.now();
      const elapsed = (now - lastUpdatedRef.current) / 1000;
      // Cap the elapsed time to prevent weird jumps when tab goes out of focus
      const cappedElapsed = Math.min(elapsed, 0.5);
      setSmoothTime(lastTimeRef.current + cappedElapsed);
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  // Find active line using smoothTime for instantaneous scrolling
  const activeIndex = lyrics.findIndex((line, index) => {
    const nextLine = lyrics[index + 1];
    return smoothTime >= line.time && (!nextLine || smoothTime < nextLine.time);
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
        const lineDuration = nextLine ? nextLine.time - line.time : 5;

        // Detect dual singers based on standard LRC cues (Bracketed text or Name:)
        const isAlternate = line.text.trim().startsWith('(') || line.text.trim().startsWith('[') || /^[A-Za-z]+:/.test(line.text.trim());

        // Use line.words if available, otherwise construct it on the fly (for standard LRC fallback)
        const words = line.words || line.text.split(' ').map((word, wIndex, arr) => {
          const timeWindow = lineDuration / Math.max(1, arr.length);
          return {
            text: word,
            time: line.time + (wIndex * timeWindow)
          };
        });

        // Find the index of the currently active word in the active line
        let currentWordIndex = -1;
        if (isActive) {
          currentWordIndex = words.findIndex((w, wIdx) => {
            const nextW = words[wIdx + 1];
            return smoothTime >= w.time && (!nextW || smoothTime < nextW.time);
          });
        }

        return (
          <motion.div
            key={index}
            onClick={() => handleLyricClick(line.time)}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isActive ? 1 : isPast ? 0.35 : 0.2,
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
            {words.map((wordObj, wIndex) => {
              const isWordPast = isPast || (isActive && wIndex < currentWordIndex);
              const isWordCurrent = isActive && wIndex === currentWordIndex;

              // If lyricsMode is 'line', then highlight the whole line together
              let wordColor = "#666666";
              let wordOpacity = 0.3;
              let wordScale = 1;
              let wordShadow = "none";

              if (lyricsMode === 'line') {
                if (isPast || isActive) {
                  wordColor = "#ffffff";
                  wordOpacity = 1;
                }
              } else {
                if (isWordPast) {
                  wordColor = "#ffffff";
                  wordOpacity = 0.85;
                } else if (isWordCurrent) {
                  wordColor = "#818cf8"; // Light indigo accent color
                  wordOpacity = 1;
                  wordScale = 1.08;
                  wordShadow = "0 0 30px rgba(99, 102, 241, 0.8)";
                } else {
                  wordColor = "#666666";
                  wordOpacity = 0.3;
                }
              }

              return (
                <motion.span
                  key={wIndex}
                  animate={{
                    color: wordColor,
                    opacity: wordOpacity,
                    scale: wordScale,
                    textShadow: wordShadow
                  }}
                  transition={{
                    duration: isWordCurrent ? 0.15 : 0.35,
                    ease: "easeOut"
                  }}
                  className="inline-block origin-center"
                >
                  {wordObj.text}
                </motion.span>
              );
            })}
          </motion.div>
        );
      })}
      {/* Spacer to allow scrolling cleanly off the end */}
      <div className="h-[40vh]" />
    </div>
  );
}
