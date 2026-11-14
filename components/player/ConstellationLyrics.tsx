"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { LyricLine, LyricWord } from "@/types/music";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";

interface ConstellationLyricsProps {
  lyrics: LyricLine[];
  currentTime: number;
  isZenMode?: boolean;
  onToggleZen?: () => void;
}

interface StarNode {
  id: string;
  word: string;
  time: number;
  duration?: number;
  x: number; // ViewBox x (0 to 1000)
  y: number; // ViewBox y (0 to 560)
  isUpper: boolean;
  lineIndex: number;
  wordIndex: number;
}

interface ConstellationGroup {
  id: string;
  startIndex: number;
  endIndex: number;
  words: StarNode[];
  edges: [number, number][]; // pairs of indices in words array
  startTime: number;
  endTime: number;
}

// Deterministic string hash function for consistent star coordinates
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

// 4-point Diamond Star Sparkle SVG Path
const STAR_PATH_4PT = "M 0,-15 Q 0,0 15,0 Q 0,0 0,15 Q 0,0 -15,0 Q 0,0 0,-15 Z";

export function ConstellationLyrics({
  lyrics,
  currentTime,
  isZenMode = false,
  onToggleZen,
}: ConstellationLyricsProps) {
  const { seek, duration, isPlaying, currentSong } = usePlayer();
  const [hoveredWord, setHoveredWord] = useState<StarNode | null>(null);

  // Smooth time interpolation using requestAnimationFrame for buttery 60/120fps star flaring
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
      const cappedElapsed = Math.min(elapsed, 0.5);
      setSmoothTime(lastTimeRef.current + cappedElapsed);
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  // Pre-calculate celestial constellation clusters from song lyrics
  const constellationGroups = useMemo<ConstellationGroup[]>(() => {
    if (!lyrics || lyrics.length === 0) return [];

    const groups: ConstellationGroup[] = [];
    const VIEW_W = 1000;
    const VIEW_H = 560;
    const MIN_X = 130;
    const MAX_X = 870;

    let currentLines: { line: LyricLine; originalIndex: number }[] = [];
    let currentWordCount = 0;

    // Helper to commit a group of lines into a single constellation cluster
    const commitGroup = (linesChunk: { line: LyricLine; originalIndex: number }[]) => {
      if (linesChunk.length === 0) return;

      const flattenedWords: { word: string; time: number; duration?: number; lineIndex: number; wordIndex: number }[] = [];

      linesChunk.forEach(({ line, originalIndex }) => {
        const nextLine = lyrics[originalIndex + 1];
        const lineDuration = nextLine ? Math.max(1.5, nextLine.time - line.time) : 5;

        const wordsArr =
          line.words && line.words.length > 0
            ? line.words
            : line.text.split(/\s+/).filter(Boolean).map((w, wIdx, arr) => {
                const vocalSpan = Math.min(lineDuration * 0.85, arr.length * 0.45);
                const wSpan = vocalSpan / arr.length;
                return {
                  text: w,
                  time: line.time + wIdx * wSpan,
                  duration: wSpan * 0.9,
                };
              });

        wordsArr.forEach((wObj, wIdx) => {
          flattenedWords.push({
            word: wObj.text,
            time: wObj.time,
            duration: wObj.duration,
            lineIndex: originalIndex,
            wordIndex: wIdx,
          });
        });
      });

      if (flattenedWords.length === 0) return;

      const N = flattenedWords.length;
      const starNodes: StarNode[] = [];

      // Generate organic 2D spatial coordinates for each word node
      for (let i = 0; i < N; i++) {
        const item = flattenedWords[i];
        const progress = N <= 1 ? 0.5 : i / (N - 1);
        const hash = hashString(`${item.word}-${item.lineIndex}-${item.wordIndex}`);

        // Base horizontal position with gentle deterministic jitter
        const baseX = MIN_X + progress * (MAX_X - MIN_X);
        const xJitter = (((hash % 100) / 100) - 0.5) * 45;
        const x = Math.max(MIN_X - 20, Math.min(MAX_X + 20, baseX + xJitter));

        // Alternating altitude (Upper vs Lower) with sinusoidal wave modulation
        const isUpper = i % 2 === 0;
        const wave = Math.sin(progress * Math.PI) * 42;
        const yJitter = ((hash % 70) - 35);
        const y = isUpper ? 165 + yJitter - wave : 385 + yJitter + wave;

        starNodes.push({
          id: `star-${item.lineIndex}-${item.wordIndex}-${i}`,
          word: item.word,
          time: item.time,
          duration: item.duration,
          x: Math.round(x),
          y: Math.round(y),
          isUpper,
          lineIndex: item.lineIndex,
          wordIndex: item.wordIndex,
        });
      }

      // Generate constellation vectors/edges (connecting starlight paths)
      const edges: [number, number][] = [];

      // 1. Primary chronological constellation chain
      for (let i = 0; i < N - 1; i++) {
        edges.push([i, i + 1]);
      }

      // 2. Secondary geometric cross-branches (authentic celestial triangulation)
      for (let i = 0; i < N - 2; i++) {
        const p1 = starNodes[i];
        const p2 = starNodes[i + 2];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Connect if visually harmonious and not spanning too far
        if (dist < 310 && (hashString(`${p1.word}-${p2.word}`) % 3 !== 0)) {
          edges.push([i, i + 2]);
        }
      }

      const firstWord = starNodes[0];
      const lastWord = starNodes[starNodes.length - 1];
      const nextLineAfter = lyrics[linesChunk[linesChunk.length - 1].originalIndex + 1];
      const estimatedEndTime = nextLineAfter ? nextLineAfter.time : lastWord.time + 4.5;

      groups.push({
        id: `constellation-${linesChunk[0].originalIndex}-${linesChunk[linesChunk.length - 1].originalIndex}`,
        startIndex: linesChunk[0].originalIndex,
        endIndex: linesChunk[linesChunk.length - 1].originalIndex,
        words: starNodes,
        edges,
        startTime: firstWord.time,
        endTime: estimatedEndTime,
      });
    };

    // Group lines into balanced constellation sizes (6 to 12 words per constellation)
    lyrics.forEach((line, idx) => {
      const wordsInLine = line.text.split(/\s+/).filter(Boolean).length;
      currentLines.push({ line, originalIndex: idx });
      currentWordCount += wordsInLine;

      // When we hit 6+ words or line has enough substance, seal the cluster
      if (currentWordCount >= 6 || wordsInLine >= 7 || idx === lyrics.length - 1) {
        commitGroup(currentLines);
        currentLines = [];
        currentWordCount = 0;
      }
    });

    if (currentLines.length > 0) {
      commitGroup(currentLines);
    }

    return groups;
  }, [lyrics]);

  // Find the currently active constellation cluster based on smoothTime
  const activeClusterIndex = useMemo(() => {
    if (constellationGroups.length === 0) return -1;

    // Check if smoothTime falls within any cluster window
    const exactMatch = constellationGroups.findIndex((g, i) => {
      const nextGroup = constellationGroups[i + 1];
      const isAfterStart = smoothTime >= g.startTime;
      const isBeforeNext = nextGroup ? smoothTime < nextGroup.startTime : smoothTime <= g.endTime + 2;
      return isAfterStart && isBeforeNext;
    });

    if (exactMatch !== -1) return exactMatch;

    // Fallback: if before first, return 0; if past last, return last
    if (smoothTime < constellationGroups[0].startTime) return 0;
    return constellationGroups.length - 1;
  }, [constellationGroups, smoothTime]);

  const activeGroup = constellationGroups[activeClusterIndex] || constellationGroups[0];

  // Find the currently active word in the active constellation
  const activeWordIndex = useMemo(() => {
    if (!activeGroup || activeGroup.words.length === 0) return -1;

    return activeGroup.words.findIndex((w, idx) => {
      const nextW = activeGroup.words[idx + 1];
      const isAfterStart = smoothTime >= w.time;
      const isBeforeNext = nextW ? smoothTime < nextW.time : smoothTime <= activeGroup.endTime;
      return isAfterStart && isBeforeNext;
    });
  }, [activeGroup, smoothTime]);

  // Interactive seek when clicking a star/word
  const handleWordClick = useCallback(
    (time: number) => {
      if (duration && duration > 0) {
        seek(time / duration);
      }
    },
    [duration, seek]
  );

  // Background ambient twinkle stars
  const backgroundStars = useMemo(() => {
    return Array.from({ length: 48 }).map((_, i) => {
      const x = (i * 21) % 100;
      const y = (i * 37) % 100;
      const size = (i % 3 === 0 ? 2.5 : i % 2 === 0 ? 1.8 : 1.2);
      const delay = (i * 0.17) % 4;
      const durationAnim = 2.5 + ((i * 0.3) % 3);
      return { x, y, size, delay, durationAnim };
    });
  }, []);

  if (!lyrics || lyrics.length === 0 || !activeGroup) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 py-16">
        <span className="material-symbols-outlined text-4xl text-purple-400/50 mb-2 animate-pulse">auto_awesome</span>
        <p className="text-sm font-medium">Constellation star chart mapping in progress...</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full h-[65vh] sm:h-[70vh] lg:h-[78vh] flex flex-col items-center justify-center overflow-hidden rounded-[2.5rem] select-none transition-all duration-700",
        "bg-[#040409]/95 border border-purple-500/20",
        "shadow-[0_0_60px_rgba(168,85,247,0.12)_inset,0_20px_50px_rgba(0,0,0,0.8)]"
      )}
    >
      {/* 1. Deep Space Cosmic Background & Ambient Nebulae */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Violet / Indigo Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full bg-gradient-to-tr from-purple-600/10 via-indigo-500/10 to-transparent blur-3xl" />
        <div className="absolute top-1/4 right-1/4 size-[400px] rounded-full bg-pink-500/8 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-[450px] rounded-full bg-blue-500/8 blur-3xl" />

        {/* Ambient Twinkling Cosmic Micro-Stars */}
        {backgroundStars.map((st, i) => (
          <span
            key={`bg-star-${i}`}
            className="absolute rounded-full bg-white/60 animate-pulse pointer-events-none"
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              width: `${st.size}px`,
              height: `${st.size}px`,
              animationDelay: `${st.delay}s`,
              animationDuration: `${st.durationAnim}s`,
              opacity: 0.25 + (st.size / 3) * 0.4,
            }}
          />
        ))}

        {/* Laptop Purple Ambient Edge Backlight Glow (As seen in reference video) */}
        <div className="absolute inset-0 rounded-[2.5rem] border-2 border-purple-500/25 pointer-events-none shadow-[0_0_30px_rgba(168,85,247,0.25)]" />
      </div>

      {/* 2. Top Status Bar: Track & Navigation */}
      <div className="absolute top-5 left-6 right-6 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <span className="material-symbols-outlined text-xs text-purple-400 animate-spin [animation-duration:8s]">
            auto_awesome
          </span>
          <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">
            Constellation Star Map
          </span>
          <span className="text-white/20">•</span>
          <span className="text-[10px] font-mono text-purple-300">
            {activeClusterIndex + 1} / {constellationGroups.length}
          </span>
        </div>

        {/* Fullscreen / Zen Mode Toggle */}
        {onToggleZen && (
          <button
            onClick={onToggleZen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-white/70 hover:text-white border border-white/10 backdrop-blur-md transition-all text-xs font-semibold"
            title={isZenMode ? "Exit Fullscreen Immersion" : "Fullscreen Immersion"}
          >
            <span className="material-symbols-outlined text-sm">
              {isZenMode ? "close_fullscreen" : "fullscreen"}
            </span>
            <span className="hidden sm:inline text-[11px] font-bold">
              {isZenMode ? "Normal View" : "Zen Immersion"}
            </span>
          </button>
        )}
      </div>

      {/* 3. Main Constellation Interactive Star Map (SVG Canvas) */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGroup.id}
            initial={{ opacity: 0, scale: 0.94, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.94, y: -24, filter: "blur(6px)" }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 24,
              mass: 0.8,
            }}
            className="w-full h-full max-w-[1000px] flex items-center justify-center"
          >
            <svg
              viewBox="0 0 1000 560"
              className="w-full h-full max-h-[560px] overflow-visible"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Glowing starlight linear gradients */}
                <linearGradient id="starlight-active-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#c084fc" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.6" />
                </linearGradient>

                <linearGradient id="starlight-idle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
                </linearGradient>

                {/* Starlight Glow Filter */}
                <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Flare Intense Filter for Active Star */}
                <filter id="flare-intense" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="6" result="blur1" />
                  <feGaussianBlur stdDeviation="14" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* A. Constellation Vector Edges (Connecting Starlight Lines) */}
              <g className="constellation-edges">
                {activeGroup.edges.map(([p1Idx, p2Idx], edgeIdx) => {
                  const node1 = activeGroup.words[p1Idx];
                  const node2 = activeGroup.words[p2Idx];
                  if (!node1 || !node2) return null;

                  // Determine if this path has been traversed by the singer
                  const isTraversed =
                    activeWordIndex >= p1Idx && activeWordIndex >= p2Idx;
                  const isCurrentlyActiveEdge =
                    (activeWordIndex === p1Idx && p2Idx === p1Idx + 1) ||
                    (activeWordIndex === p2Idx && p1Idx === p2Idx - 1);

                  return (
                    <line
                      key={`edge-${edgeIdx}-${node1.id}-${node2.id}`}
                      x1={node1.x}
                      y1={node1.y}
                      x2={node2.x}
                      y2={node2.y}
                      stroke={
                        isCurrentlyActiveEdge
                          ? "url(#starlight-active-grad)"
                          : isTraversed
                          ? "rgba(192, 132, 252, 0.55)"
                          : "url(#starlight-idle-grad)"
                      }
                      strokeWidth={isCurrentlyActiveEdge ? 2.5 : isTraversed ? 1.8 : 1.2}
                      strokeDasharray={isTraversed ? "none" : "3, 3"}
                      filter={isCurrentlyActiveEdge ? "url(#star-glow)" : undefined}
                      className="transition-all duration-300"
                    />
                  );
                })}
              </g>

              {/* B. Constellation Star Nodes & Words */}
              <g className="constellation-nodes">
                {activeGroup.words.map((node, wIdx) => {
                  const isCurrent = wIdx === activeWordIndex;
                  const isVocalizing = isCurrent && (node.duration ? smoothTime < node.time + node.duration : true);
                  const isPast = activeWordIndex > -1 && (wIdx < activeWordIndex || (isCurrent && !isVocalizing));
                  const isUpcoming = activeWordIndex === -1 || wIdx > activeWordIndex;
                  const isHovered = hoveredWord?.id === node.id;

                  // Label Y offset depending on altitude so text never overlaps vectors
                  const textOffsetY = node.isUpper ? -34 : 46;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer group"
                      onClick={() => handleWordClick(node.time)}
                      onMouseEnter={() => setHoveredWord(node)}
                      onMouseLeave={() => setHoveredWord(null)}
                    >
                      {/* Interactive Hit Area */}
                      <circle r={36} fill="transparent" />

                      {/* Active Star Radiant Flare Rays (8-Point Sparkle) */}
                      {isVocalizing && (
                        <g filter="url(#flare-intense)" className="pointer-events-none animate-pulse">
                          {/* Radial bloom ring */}
                          <circle r={28} fill="rgba(192, 132, 252, 0.35)" />
                          <circle r={14} fill="rgba(255, 255, 255, 0.5)" />

                          {/* Long Starlight Flare Spikes */}
                          <line x1={-38} y1={0} x2={38} y2={0} stroke="#ffffff" strokeWidth={1.8} opacity={0.9} />
                          <line x1={0} y1={-38} x2={0} y2={38} stroke="#ffffff" strokeWidth={1.8} opacity={0.9} />

                          {/* Diagonal 45-deg Secondary Spikes */}
                          <line x1={-20} y1={-20} x2={20} y2={20} stroke="#c084fc" strokeWidth={1.4} opacity={0.7} />
                          <line x1={20} y1={-20} x2={-20} y2={20} stroke="#c084fc" strokeWidth={1.4} opacity={0.7} />
                        </g>
                      )}

                      {/* Core 4-Point Diamond Star Sparkle */}
                      <path
                        d={STAR_PATH_4PT}
                        fill={
                          isVocalizing
                            ? "#ffffff"
                            : isPast
                            ? "rgba(224, 231, 255, 0.85)"
                            : "rgba(255, 255, 255, 0.35)"
                        }
                        filter={isVocalizing || isHovered ? "url(#star-glow)" : undefined}
                        transform={`scale(${
                          isVocalizing ? 1.75 : isHovered ? 1.3 : isPast ? 0.95 : 0.65
                        })`}
                        className="transition-transform duration-200 origin-center"
                      />

                      {/* Word Label Typography */}
                      <text
                        x={0}
                        y={textOffsetY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={cn(
                          "transition-all duration-200 font-sans tracking-tight select-none pointer-events-none",
                          isVocalizing
                            ? "font-black text-2xl sm:text-3xl md:text-4xl fill-white"
                            : isPast
                            ? "font-bold text-xs sm:text-sm md:text-base fill-slate-200 opacity-80"
                            : "font-medium text-[11px] sm:text-xs fill-slate-400 opacity-45 group-hover:opacity-85"
                        )}
                        style={
                          isVocalizing
                            ? {
                                filter:
                                  "drop-shadow(0 0 20px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 35px rgba(168, 85, 247, 0.75))",
                              }
                            : undefined
                        }
                      >
                        {node.word}
                      </text>

                      {/* Hover Pill Tooltip */}
                      {isHovered && !isCurrent && (
                        <g transform={`translate(0, ${node.isUpper ? -58 : 68})`}>
                          <rect
                            x={-34}
                            y={-12}
                            width={68}
                            height={24}
                            rx={12}
                            fill="#0e0e17"
                            stroke="rgba(192, 132, 252, 0.5)"
                            strokeWidth={1}
                          />
                          <text
                            x={0}
                            y={2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-[10px] font-mono fill-purple-300 font-bold"
                          >
                            Seek ✦
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. Bottom Constellation Stepper & Timestamp Controls */}
      <div className="absolute bottom-4 left-6 right-6 z-20 flex items-center justify-between text-xs text-slate-400 font-mono pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
            Realtime Star Sync
          </span>
        </div>

        {/* Constellation Stepper Dots */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-xs no-scrollbar py-1">
          {constellationGroups.map((grp, gIdx) => {
            const isGActive = gIdx === activeClusterIndex;
            return (
              <button
                key={grp.id}
                onClick={() => handleWordClick(grp.startTime)}
                className={cn(
                  "h-1.5 rounded-full transition-all cursor-pointer",
                  isGActive
                    ? "w-6 bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]"
                    : "w-1.5 bg-white/20 hover:bg-white/40"
                )}
                title={`Constellation ${gIdx + 1}`}
              />
            );
          })}
        </div>

        {/* Current Phrase Preview Indicator */}
        <div className="text-[11px] text-purple-300/80 font-bold tracking-wider hidden md:block">
          Click any star to jump ✦
        </div>
      </div>
    </div>
  );
}

