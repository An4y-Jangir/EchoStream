"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  alpha: number;
  depth: number;
  noiseOffset: number;
}

export function CanvasParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentSong, isPlaying } = usePlayer();

  // Animation frame and timing refs
  const animationFrameId = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const beatTimeRef = useRef<number>(0);

  // Synchronous refs for the loop to avoid closure capture issues
  const isPlayingRef = useRef(isPlaying);
  const currentSongRef = useRef(currentSong);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI screens
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Helper to parse CSS color variables (e.g. "rgb(99, 102, 241)")
    const getThemeColors = () => {
      if (typeof window === "undefined") return { r: 99, g: 102, b: 241 };
      const rootStyle = getComputedStyle(document.documentElement);
      const accent = rootStyle.getPropertyValue("--theme-accent").trim() || "rgb(99, 102, 241)";
      
      const numbers = accent.match(/\d+/g);
      if (numbers && numbers.length >= 3) {
        return {
          r: parseInt(numbers[0], 10),
          g: parseInt(numbers[1], 10),
          b: parseInt(numbers[2], 10)
        };
      }
      return { r: 99, g: 102, b: 241 };
    };

    // Instantiate particles
    const particles: Particle[] = [];

    const initParticles = () => {
      const enabled = localStorage.getItem("echo-particles-enabled") !== "false";
      const density = localStorage.getItem("echo-particles-density") || "medium";
      let particleCount = 80;
      if (density === "low") particleCount = 30;
      if (density === "high") particleCount = 150;

      particles.length = 0;
      if (!enabled) return;

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          baseRadius: Math.random() * 2 + 1,
          radius: 0,
          alpha: Math.random() * 0.35 + 0.15,
          depth: Math.random() * 0.8 + 0.3, // 3D depth speed scaling
          noiseOffset: Math.random() * 1000
        });
      }
    };

    initParticles();
    window.addEventListener("particles-change", initParticles);

    lastTimeRef.current = performance.now() / 1000;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const playing = isPlayingRef.current;
      const song = currentSongRef.current;
      const tempo = song?.tempo || 120;
      const bps = tempo / 60; // Beats per second

      // Calculate elapsed time and beat sync
      const now = performance.now() / 1000;
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if (playing) {
        timeRef.current += delta * 1000; // time goes faster when playing
        beatTimeRef.current += delta * bps;
      } else {
        timeRef.current += delta * 150; // slow drift when paused
      }

      // Compute beat pulse factor
      const beatPhase = beatTimeRef.current % 1.0;
      const beatPulse = Math.pow(1 - beatPhase, 4); // Exp decay: peak on beat

      // Fetch active dynamic theme color
      const { r, g, b } = getThemeColors();

      // Update and draw particles
      particles.forEach((p) => {
        // Flow field vector using trignometric waves
        const timeFactor = timeRef.current * 0.0003;
        const angle =
          Math.sin(p.x * 0.003 + timeFactor + p.noiseOffset) *
          Math.cos(p.y * 0.003 + timeFactor - p.noiseOffset) *
          Math.PI * 2;

        const speedScale = playing ? 0.3 * (tempo / 120) : 0.05;
        p.vx += Math.cos(angle) * 0.02 * speedScale * p.depth;
        p.vy += Math.sin(angle) * 0.02 * speedScale * p.depth;

        // Friction / Speed limits
        const maxSpeed = (playing ? 0.8 : 0.15) * p.depth;
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }

        // Apply velocities
        p.x += p.vx;
        p.y += p.vy;

        // Wrapping boundaries
        const boundaryMargin = 30;
        if (p.x < -boundaryMargin) p.x = w + boundaryMargin;
        if (p.x > w + boundaryMargin) p.x = -boundaryMargin;
        if (p.y < -boundaryMargin) p.y = h + boundaryMargin;
        if (p.y > h + boundaryMargin) p.y = -boundaryMargin;

        // Beat scale modulation
        p.radius = p.baseRadius * (1 + beatPulse * 0.8 * p.depth);

        // Determine opacity dynamically based on music state & beat pulse
        const stateAlphaMult = playing ? 1.3 : 0.65; // Dimmer when paused, glowing when playing
        const targetAlpha = p.alpha * stateAlphaMult * (1 + beatPulse * 1.6 * p.depth);
        const color = `rgba(${r}, ${g}, ${b}, ${Math.min(1, targetAlpha)})`;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Extra glowing halo around active particles when playing
        if (playing) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * (2.2 + beatPulse * 1.6), 0, Math.PI * 2);
          // Halo expands and brightens in response to the beat
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.28 * beatPulse})`;
          ctx.fill();
        }
      });

      // Draw faint connections between particles (Constellation mesh)
      const maxDistance = 90;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pi = particles[i];
          const pj = particles[j];

          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            // Lines are closer/stronger based on depth grouping similarities
            const depthFactor = 1 - Math.abs(pi.depth - pj.depth);
            if (depthFactor > 0.7) {
              const alphaScale = (1 - dist / maxDistance) * 0.05 * depthFactor;
              // Pulsate connection lines subtly on beat
              const lineAlpha = alphaScale * (1 + beatPulse * 0.6);
              
              ctx.beginPath();
              ctx.moveTo(pi.x, pi.y);
              ctx.lineTo(pj.x, pj.y);
              ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("particles-change", initParticles);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 mix-blend-screen opacity-70"
    />
  );
}
