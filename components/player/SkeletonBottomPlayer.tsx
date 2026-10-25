"use client";

import { AsciiSkeleton } from "ascii-reveal";

interface SkeletonBottomPlayerProps {
  onPlayDefault?: () => void;
}

export function SkeletonBottomPlayer({ onPlayDefault }: SkeletonBottomPlayerProps) {
  return (
    <>
      {/* Desktop Skeleton */}
      <footer className="hidden md:flex w-full max-w-7xl glass-panel bg-black/10 backdrop-blur-xl rounded-[2.5rem] p-3 px-8 shadow-2xl items-center justify-between pointer-events-auto transition-all border border-white/5 select-none">
        {/* Left: Track Info Placeholder */}
        <div className="flex items-center gap-4 w-1/4">
          <div className="size-16 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] flex items-center justify-center relative shadow-inner">
            <AsciiSkeleton variant="dither" rows={4} width={64} height={64} className="opacity-30" />
            <span className="material-symbols-outlined text-white/20 text-2xl absolute pointer-events-none">
              graphic_eq
            </span>
          </div>
          <div className="flex flex-col justify-center min-w-0 flex-1 overflow-hidden h-12 gap-2">
            <AsciiSkeleton
              variant="terminal"
              lines={1}
              widths={['140px']}
              className="text-xs text-white/40 font-mono"
            />
            <AsciiSkeleton
              variant="scan"
              lines={1}
              widths={['90px']}
              className="text-[10px] text-white/20 uppercase tracking-wider font-mono"
            />
          </div>
          <span className="material-symbols-outlined text-2xl text-white/15 ml-2 select-none cursor-default">
            favorite
          </span>
        </div>

        {/* Center: Controls & Progress Placeholder */}
        <div className="flex flex-col items-center gap-3 flex-1 max-w-xl">
          <div className="flex items-center gap-8">
            <span className="material-symbols-outlined text-2xl text-white/20 select-none cursor-default">
              shuffle
            </span>
            <span className="material-symbols-outlined text-3xl text-white/20 select-none cursor-default">
              skip_previous
            </span>
            <button
              onClick={onPlayDefault}
              className="size-12 bg-white/10 hover:bg-white text-white/50 hover:text-black rounded-full flex items-center justify-center transition-all shadow-xl group border border-white/10 hover:border-white cursor-pointer active:scale-95"
              title="Click to start playback"
            >
              <span className="material-symbols-outlined fill-[1] text-3xl group-hover:scale-110 transition-transform">
                play_arrow
              </span>
            </button>
            <span className="material-symbols-outlined text-3xl text-white/20 select-none cursor-default">
              skip_next
            </span>
            <span className="material-symbols-outlined text-2xl text-white/20 select-none cursor-default">
              repeat
            </span>
          </div>

          <div className="flex items-center gap-3 w-full">
            <span className="text-[10px] text-white/30 font-bold tabular-nums w-8 text-right font-mono">
              0:00
            </span>
            <div className="h-1 flex-1 bg-white/5 rounded-full relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1/4 bg-white/10 rounded-full animate-pulse" />
            </div>
            <span className="text-[10px] text-white/30 font-bold tabular-nums w-8 font-mono">
              --:--
            </span>
          </div>
        </div>

        {/* Right: Volume & Tools Placeholder */}
        <div className="flex items-center justify-end gap-5 w-1/4">
          <span className="material-symbols-outlined text-2xl text-white/20 select-none cursor-default">
            queue_music
          </span>
          <span className="material-symbols-outlined text-2xl text-white/20 select-none cursor-default">
            album
          </span>
          <div className="flex items-center gap-2.5 w-36 ml-1 opacity-40">
            <span className="material-symbols-outlined text-xl text-white/30">volume_up</span>
            <div className="h-1 flex-1 bg-white/10 rounded-full" />
          </div>
          <span className="material-symbols-outlined text-2xl text-white/20 select-none cursor-default">
            fullscreen
          </span>
        </div>
      </footer>

      {/* Mobile Skeleton */}
      <footer className="relative flex md:hidden w-full glass-panel bg-black/80 backdrop-blur-xl rounded-2xl p-2 px-4 shadow-2xl items-center justify-between pointer-events-auto border border-white/5 overflow-hidden select-none">
        {/* Progress line placeholder */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5 rounded-t-2xl overflow-hidden pointer-events-none" />

        <div className="flex items-center gap-3 min-w-0 flex-1 py-1">
          <div className="size-10 rounded-lg overflow-hidden border border-white/10 bg-white/[0.02] flex items-center justify-center flex-shrink-0">
            <AsciiSkeleton variant="dither" rows={3} width={40} height={40} className="opacity-30" />
          </div>
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <AsciiSkeleton variant="terminal" lines={1} widths={['110px']} className="text-xs text-white/40" />
            <AsciiSkeleton variant="scan" lines={1} widths={['75px']} className="text-[9px] text-white/20" />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="material-symbols-outlined text-lg text-white/20">favorite</span>
          <button
            onClick={onPlayDefault}
            className="size-8 bg-white/10 hover:bg-white text-white/60 hover:text-black rounded-full flex items-center justify-center shadow-lg transition-all border border-white/10"
            title="Start playback"
          >
            <span className="material-symbols-outlined fill-[1] text-lg">play_arrow</span>
          </button>
          <span className="material-symbols-outlined text-lg text-white/20">skip_next</span>
        </div>
      </footer>
    </>
  );
}
