"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface VolumeSliderProps {
  volume: number;
  setVolume: (v: number) => void;
  className?: string;
}

export function VolumeSlider({ volume, setVolume, className }: VolumeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const getVolumeFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(pct);
  }, [setVolume]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    getVolumeFromEvent(e);

    const onMove = (ev: MouseEvent) => {
      if (isDragging.current) getVolumeFromEvent(ev);
    };
    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const icon = volume === 0 ? "volume_off" : volume < 0.5 ? "volume_down" : "volume_up";
  const pct = volume * 100;

  return (
    <div className={cn("flex items-center gap-2.5 group/vol", className)}>
      {/* Mute toggle icon */}
      <button
        onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
        className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
        title={volume === 0 ? "Unmute" : "Mute"}
      >
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        className="relative flex-1 h-1 cursor-pointer flex items-center select-none"
      >
        {/* Background rail */}
        <div className="absolute inset-0 rounded-full bg-white/10" />

        {/* Filled portion */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, rgba(139,92,246,0.5), rgba(139,92,246,1))`,
          }}
        />

        {/* Glow thumb */}
        <div
          className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_12px_3px_rgba(139,92,246,0.6)] -translate-x-1/2 pointer-events-none transition-transform group-hover/vol:scale-110"
          style={{ left: `${pct}%` }}
        />
      </div>

      {/* Level number */}
      <span className="text-[10px] text-white/30 font-bold tabular-nums w-6 text-right">
        {Math.round(pct)}
      </span>
    </div>
  );
}
