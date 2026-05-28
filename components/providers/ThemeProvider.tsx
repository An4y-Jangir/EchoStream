"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { FastAverageColor } from "fast-average-color";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { currentSong } = usePlayer();
  const facRef = useRef<FastAverageColor | null>(null);

  useEffect(() => {
    if (!facRef.current) {
      facRef.current = new FastAverageColor();
    }
  }, []);

  useEffect(() => {
    if (!currentSong?.albumArt) {
      document.documentElement.style.setProperty("--theme-accent", "#6366f1");
      document.documentElement.style.setProperty("--theme-bg-glow1", "#1e1b4b");
      document.documentElement.style.setProperty("--theme-bg-glow2", "#312e81");
      return;
    }

    const extractColor = async () => {
      try {
        if (!facRef.current) return;

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = currentSong.albumArt;

        const color = await facRef.current.getColorAsync(img);

        const [r, g, b] = color.value;
        const rgb = `rgb(${r}, ${g}, ${b})`;

        const glow1 = `rgba(${Math.min(r + 20, 255)}, ${Math.min(g + 20, 255)}, ${Math.min(b + 20, 255)}, 0.15)`;
        const glow2 = `rgba(${Math.max(r - 20, 0)}, ${Math.max(g - 20, 0)}, ${Math.max(b - 20, 0)}, 0.1)`;

        document.documentElement.style.setProperty("--theme-accent", rgb);
        document.documentElement.style.setProperty("--theme-bg-glow1", glow1);
        document.documentElement.style.setProperty("--theme-bg-glow2", glow2);
      } catch (e) {
        console.warn("Failed to extract color, falling back to default.", e);
        document.documentElement.style.setProperty("--theme-accent", "#6366f1");
        document.documentElement.style.setProperty("--theme-bg-glow1", "#1e1b4b");
        document.documentElement.style.setProperty("--theme-bg-glow2", "#312e81");
      }
    };

    extractColor();

  }, [currentSong?.albumArt]);

  return <>{children}</>;
}
