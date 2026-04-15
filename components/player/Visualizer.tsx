"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";

export function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isPlaying } = usePlayer();
  const requestRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // A simple mock visualizer that bounces randomly simulating audio frequency
    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (isPlaying) {
        const barWidth = 4;
        const spacing = 2;
        const totalBars = Math.floor(width / (barWidth + spacing));

        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        for (let i = 0; i < totalBars; i++) {
          // Fake amplitude based on time to make it look smooth instead of purely random
          const time = Date.now() / 200;
          const noise = Math.sin(time + i * 0.2) + Math.cos(time * 0.7 + i * 0.5);
          // Scale to 0-1 range roughly, add some randomness
          const amplitude = Math.max(0, Math.min(1, (noise + 1) / 2 + (Math.random() * 0.2 - 0.1)));
          
          const barHeight = amplitude * (height * 0.8);
          
          ctx.beginPath();
          ctx.roundRect(
            i * (barWidth + spacing),
            height - barHeight,
            barWidth,
            barHeight,
            2
          );
          ctx.fill();
        }
      } else {
        // Draw flat line when paused
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(0, height / 2, width, 2);
      }

      requestRef.current = requestAnimationFrame(draw);
    };

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    requestRef.current = requestAnimationFrame(draw);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  return <canvas ref={canvasRef} className="w-full h-16 opacity-50" />;
}
