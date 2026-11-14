"use client";

import { useEffect, useRef, useState } from "react";
import { LyricLine } from "@/types/music";
import { motion } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";
import { ConstellationLyrics } from "./ConstellationLyrics";

interface LiveLyricsProps {
  lyrics: LyricLine[];
  currentTime: number;
  isZenMode?: boolean;
  onToggleZen?: () => void;
}

export function LiveLyrics({
  lyrics,
  currentTime,
  isZenMode,
  onToggleZen,
}: LiveLyricsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { seek, duration, lyricsMode, isPlaying } = usePlayer();
  const [lyricsSize, setLyricsSize] = useState("large");
  const [lyricsStyle, setLyricsStyle] = useState<"classic" | "constellation">("classic");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkSize = () => {
      setLyricsSize(localStorage.getItem("echo-lyrics-size") || "large");
    };
    const checkStyle = () => {
      setLyricsStyle((localStorage.getItem("echo-lyrics-style") as any) || "classic");
    };
    checkSize();
    checkStyle();
    window.addEventListener("lyrics-size-change", checkSize);
    window.addEventListener("lyrics-style-change", checkStyle);
    return () => {
      window.removeEventListener("lyrics-size-change", checkSize);
      window.removeEventListener("lyrics-style-change", checkStyle);
    };
  }, []);

  const handleStyleChange = (style: "classic" | "constellation") => {
    setLyricsStyle(style);
    if (typeof window !== "undefined") {
      localStorage.setItem("echo-lyrics-style", style);
      window.dispatchEvent(new Event("lyrics-style-change"));
    }
  };

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
    if (containerRef.current && activeIndex !== -1 && lyricsStyle === "classic") {
      const activeElement = containerRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [activeIndex, lyricsStyle]);

  const handleLyricClick = (time: number) => {
    if (duration) {
      seek(time / duration);
    }
  };

  // Switcher UI Pill element
  const renderModeSwitcher = () => (
    <div className="absolute top-3 right-4 sm:right-8 z-30 flex items-center gap-1 p-1 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-lg">
      <button
        onClick={() => handleStyleChange("classic")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
          lyricsStyle === "classic"
            ? "bg-white/20 text-white shadow"
            : "text-slate-400 hover:text-white"
        )}
        title="Classic Apple Music Karaoke Flow"
      >
        <span className="material-symbols-outlined text-sm">format_align_left</span>
        <span>Classic</span>
      </button>
      <button
        onClick={() => handleStyleChange("constellation")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
          lyricsStyle === "constellation"
            ? "bg-gradient-to-r from-purple-500/50 to-indigo-500/50 text-white border border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.35)]"
            : "text-slate-400 hover:text-white"
        )}
        title="Cosmic Star Map Constellation Lyrics"
      >
        <span className="material-symbols-outlined text-sm text-purple-300">auto_awesome</span>
        <span>Constellation</span>
      </button>
    </div>
  );

  // If Constellation Mode is selected, render the Cosmic Constellation Visualizer
  if (lyricsStyle === "constellation") {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {renderModeSwitcher()}
        <ConstellationLyrics
          lyrics={lyrics}
          currentTime={currentTime}
          isZenMode={isZenMode}
          onToggleZen={onToggleZen}
        />
      </div>
    );
  }

  // Classic OG Lyrics view (100% identical to original with scroll, font sizes, word/line sync)
  return (
    <div className="relative w-full h-full flex flex-col justify-center">
      {renderModeSwitcher()}
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
          const words =
            line.words && line.words.length > 0
              ? line.words
              : line.text.split(/\s+/).filter(Boolean).map((word, wIndex, arr) => {
                  const vocalSpan = Math.min(lineDuration * 0.85, arr.length * 0.45);
                  const wSpan = arr.length > 0 ? vocalSpan / arr.length : 0.4;
                  return {
                    text: word,
                    time: line.time + wIndex * wSpan,
                    duration: wSpan * 0.9,
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
                font-bold tracking-tight break-words cursor-pointer transition-all w-[85%] flex flex-wrap gap-x-[0.3em] gap-y-2
                ${lyricsSize === "small" ? "text-2xl md:text-3xl lg:text-4xl" : ""}
                ${lyricsSize === "medium" ? "text-3xl md:text-4xl lg:text-5xl" : ""}
                ${lyricsSize === "large" ? "text-4xl md:text-5xl lg:text-7xl" : ""}
                ${isAlternate ? 'ml-auto justify-end text-right' : 'mr-auto justify-start text-left'}
              `}
              style={{ originX: isAlternate ? 1 : 0 }}
              whileHover={{ scale: 1.02, opacity: 0.8 }}
            >
              {words.map((wordObj, wIndex) => {
                const isVocalizing = isActive && wIndex === currentWordIndex && (
                  wordObj.duration ? smoothTime < wordObj.time + wordObj.duration : true
                );
                const isWordCurrent = isVocalizing;
                const isWordPast = isPast || (isActive && (wIndex < currentWordIndex || (wIndex === currentWordIndex && !isVocalizing)));

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
                    wordOpacity = 0.95;
                  } else if (isWordCurrent) {
                    wordColor = "#818cf8"; // Light indigo accent color
                    wordOpacity = 1;
                    wordScale = 1.1;
                    wordShadow = "0 0 30px rgba(99, 102, 241, 0.9), 0 0 10px #ffffff";
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
    </div>
  );
}
