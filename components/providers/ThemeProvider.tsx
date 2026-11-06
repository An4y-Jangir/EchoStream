"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { FastAverageColor } from "fast-average-color";

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  h /= 360;
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255)
  ];
}

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
        const [h, s, l] = rgbToHsl(r, g, b);
        const [r2, g2, b2] = hslToRgb((h + 45) % 360, Math.min(s * 1.1, 0.9), Math.max(l, 0.45));
        const [r3, g3, b3] = hslToRgb((h + 160) % 360, Math.min(s * 1.1, 0.9), Math.max(l, 0.45));

        document.documentElement.style.setProperty("--theme-accent", `rgb(${r}, ${g}, ${b})`);
        document.documentElement.style.setProperty("--theme-glow-1", `rgba(${r}, ${g}, ${b}, 0.75)`);
        document.documentElement.style.setProperty("--theme-glow-2", `rgba(${r2}, ${g2}, ${b2}, 0.65)`);
        document.documentElement.style.setProperty("--theme-glow-3", `rgba(${r3}, ${g3}, ${b3}, 0.55)`);
        document.documentElement.style.setProperty("--theme-bg-glow1", `rgba(${r}, ${g}, ${b}, 0.25)`);
        document.documentElement.style.setProperty("--theme-bg-glow2", `rgba(${r2}, ${g2}, ${b2}, 0.2)`);
        return;
      }

      if (!currentSong?.albumArt) {
        document.documentElement.style.setProperty("--theme-accent", "rgb(129, 140, 248)");
        document.documentElement.style.setProperty("--theme-glow-1", "rgba(99, 102, 241, 0.75)");
        document.documentElement.style.setProperty("--theme-glow-2", "rgba(236, 72, 153, 0.65)");
        document.documentElement.style.setProperty("--theme-glow-3", "rgba(59, 130, 246, 0.55)");
        document.documentElement.style.setProperty("--theme-bg-glow1", "rgba(99, 102, 241, 0.25)");
        document.documentElement.style.setProperty("--theme-bg-glow2", "rgba(236, 72, 153, 0.2)");
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

        // Derive harmonic multi-color palette for the Apple Music liquid ambient mesh
        const [h, s, l] = rgbToHsl(r, g, b);
        const [r2, g2, b2] = hslToRgb((h + 45) % 360, Math.min(s * 1.15, 0.95), Math.min(Math.max(l, 0.4), 0.65));
        const [r3, g3, b3] = hslToRgb((h + 160) % 360, Math.min(s * 1.15, 0.95), Math.min(Math.max(l, 0.4), 0.65));

        const glow1 = `rgba(${r}, ${g}, ${b}, 0.8)`;
        const glow2 = `rgba(${r2}, ${g2}, ${b2}, 0.7)`;
        const glow3 = `rgba(${r3}, ${g3}, ${b3}, 0.6)`;

        document.documentElement.style.setProperty("--theme-accent", rgb);
        document.documentElement.style.setProperty("--theme-glow-1", glow1);
        document.documentElement.style.setProperty("--theme-glow-2", glow2);
        document.documentElement.style.setProperty("--theme-glow-3", glow3);
        document.documentElement.style.setProperty("--theme-bg-glow1", glow1);
        document.documentElement.style.setProperty("--theme-bg-glow2", glow2);
      } catch (e) {
        console.warn("Failed to extract color, falling back to default.", e);
        document.documentElement.style.setProperty("--theme-accent", "rgb(129, 140, 248)");
        document.documentElement.style.setProperty("--theme-glow-1", "rgba(99, 102, 241, 0.75)");
        document.documentElement.style.setProperty("--theme-glow-2", "rgba(236, 72, 153, 0.65)");
        document.documentElement.style.setProperty("--theme-glow-3", "rgba(59, 130, 246, 0.55)");
        document.documentElement.style.setProperty("--theme-bg-glow1", "rgba(99, 102, 241, 0.25)");
        document.documentElement.style.setProperty("--theme-bg-glow2", "rgba(236, 72, 153, 0.2)");
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
