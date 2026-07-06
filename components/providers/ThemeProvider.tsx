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
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 99, g: 102, b: 241 };
    };

    const applyTheme = async () => {
      const isDynamic = localStorage.getItem("echo-dynamic-theme") !== "false";
      const staticAccent = localStorage.getItem("echo-static-accent") || "#6366f1";

      if (!isDynamic) {
        const { r, g, b } = hexToRgb(staticAccent);
        document.documentElement.style.setProperty("--theme-accent", `rgb(${r}, ${g}, ${b})`);
        document.documentElement.style.setProperty("--theme-bg-glow1", `rgba(${r}, ${g}, ${b}, 0.15)`);
        document.documentElement.style.setProperty("--theme-bg-glow2", `rgba(${r}, ${g}, ${b}, 0.1)`);
        return;
      }

      if (!currentSong?.albumArt) {
        document.documentElement.style.setProperty("--theme-accent", "#6366f1");
        document.documentElement.style.setProperty("--theme-bg-glow1", "#1e1b4b");
        document.documentElement.style.setProperty("--theme-bg-glow2", "#312e81");
        return;
      }

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

    window.addEventListener("theme-change", applyTheme);
    applyTheme();

    return () => {
      window.removeEventListener("theme-change", applyTheme);
    };
  }, [currentSong?.albumArt]);

  return <>{children}</>;
}
