"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext";
import { Song } from "@/types/music";
import { cn } from "@/lib/utils";

interface StoryCardModalProps {
  songOverride?: Song | null;
}

type CardTheme = "aurora" | "vinyl" | "cyberpunk" | "minimal";

const VIBE_BADGES = [
  "ON REPEAT 🔁",
  "LATE NIGHT VIBES 🌙",
  "CURRENT OBSESSION ✨",
  "SYNTHWAVE FLOW ⚡",
  "PURE FOCUS 🎧",
  "CHILL FREQUENCIES 🌊",
];

export function StoryCardModal({ songOverride }: StoryCardModalProps) {
  const { isStoryModalOpen, closeStoryModal, storySong, currentSong, currentTime, duration } = usePlayer();
  const activeSong = songOverride || storySong || currentSong;

  const [selectedTheme, setSelectedTheme] = useState<CardTheme>("aurora");
  const [selectedBadge, setSelectedBadge] = useState<string>("ON REPEAT 🔁");
  const [customQuote, setCustomQuote] = useState<string>("");
  const [showWaveform, setShowWaveform] = useState(true);
  const [showVinylPeek, setShowVinylPeek] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const cardPreviewRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isStoryModalOpen) {
        closeStoryModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isStoryModalOpen, closeStoryModal]);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds <= 0) return "0:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const displayTime = formatTime(currentTime);
  const totalDuration = activeSong?.durationText || formatTime(duration) || "3:30";

  // Function to load image safely via proxy or direct
  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Fallback to proxy
        const proxyImg = new Image();
        proxyImg.crossOrigin = "anonymous";
        proxyImg.onload = () => resolve(proxyImg);
        proxyImg.onerror = () => reject(new Error("Image failed to load"));
        proxyImg.src = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      };
      img.src = url.startsWith("data:") ? url : `/api/proxy-image?url=${encodeURIComponent(url)}`;
    });
  };

  // Generate 1080x1920 High-Res Canvas
  const generateStoryCanvas = async (): Promise<HTMLCanvasElement> => {
    const width = 1080;
    const height = 1920;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas context");

    // 1. Background Fill
    ctx.fillStyle = selectedTheme === "minimal" ? "#09090b" : "#07070a";
    ctx.fillRect(0, 0, width, height);

    // 2. Theme Ambient Mesh Lighting
    if (selectedTheme === "aurora" || selectedTheme === "vinyl") {
      // Top-Left Orb
      const grad1 = ctx.createRadialGradient(250, 350, 50, 250, 350, 700);
      grad1.addColorStop(0, "rgba(99, 102, 241, 0.7)");
      grad1.addColorStop(0.5, "rgba(99, 102, 241, 0.25)");
      grad1.addColorStop(1, "transparent");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Bottom-Right Orb
      const grad2 = ctx.createRadialGradient(850, 1500, 50, 850, 1500, 750);
      grad2.addColorStop(0, "rgba(236, 72, 153, 0.65)");
      grad2.addColorStop(0.5, "rgba(236, 72, 153, 0.2)");
      grad2.addColorStop(1, "transparent");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Center Bloom
      const grad3 = ctx.createRadialGradient(540, 960, 50, 540, 960, 600);
      grad3.addColorStop(0, "rgba(59, 130, 246, 0.4)");
      grad3.addColorStop(1, "transparent");
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);
    } else if (selectedTheme === "cyberpunk") {
      // Hot Neon Cyan & Magenta Orbs
      const grad1 = ctx.createRadialGradient(300, 400, 50, 300, 400, 650);
      grad1.addColorStop(0, "rgba(244, 63, 94, 0.8)");
      grad1.addColorStop(0.5, "rgba(244, 63, 94, 0.25)");
      grad1.addColorStop(1, "transparent");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(800, 1400, 50, 800, 1400, 700);
      grad2.addColorStop(0, "rgba(6, 182, 212, 0.8)");
      grad2.addColorStop(0.5, "rgba(6, 182, 212, 0.2)");
      grad2.addColorStop(1, "transparent");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Minimalist Radial Center Spotlight
      const grad = ctx.createRadialGradient(540, 960, 100, 540, 960, 800);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // 3. Header Branding (EchoStream + made by Anay)
    const headerY = 160;

    // Glowing Equalizer Logo Mark
    ctx.save();
    ctx.shadowColor = "#6366f1";
    ctx.shadowBlur = 20;
    const barWidth = 6;
    const barGap = 6;
    const startX = 140;
    const barHeights = [24, 38, 54, 32, 46, 20];
    barHeights.forEach((h, idx) => {
      const bx = startX + idx * (barWidth + barGap);
      const by = headerY - h / 2;
      ctx.fillStyle = "#818cf8";
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, barWidth, h, 3) : ctx.rect(bx, by, barWidth, h);
      ctx.fill();
    });
    ctx.restore();

    // App Name: EchoStream
    ctx.font = "900 48px 'Space Grotesk', system-ui, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText("EchoStream", startX + barHeights.length * 12 + 16, headerY - 6);

    // Subtitle: made by Anay
    ctx.font = "700 20px system-ui, sans-serif";
    ctx.fillStyle = "rgba(165, 180, 252, 0.85)"; // Soft accent indigo
    ctx.fillText("MADE BY ANAY", startX + barHeights.length * 12 + 18, headerY + 24);

    // Right-aligned Quality Badge: LOSSLESS AUDIO
    const badgeText = "LOSSLESS AUDIO";
    ctx.font = "700 18px system-ui, sans-serif";
    const badgeWidth = ctx.measureText(badgeText).width + 44;
    const badgeX = width - 140 - badgeWidth;
    const badgeY = headerY - 24;

    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(badgeX, badgeY, badgeWidth, 42, 21) : ctx.rect(badgeX, badgeY, badgeWidth, 42);
    ctx.fill();
    ctx.stroke();

    // Green Audio Pulse Indicator Dot
    ctx.fillStyle = "#34d399";
    ctx.beginPath();
    ctx.arc(badgeX + 22, badgeY + 21, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillText(badgeText, badgeX + 36, badgeY + 27);

    // 4. Center Artwork & Vinyl Disc
    const artSize = 680;
    const artX = (width - artSize) / 2;
    const artY = 320;

    if (activeSong?.albumArt) {
      try {
        const artImg = await loadImage(activeSong.albumArt);

        // Optional Vinyl Record Disc Peek in "vinyl" theme
        if (selectedTheme === "vinyl" && showVinylPeek) {
          ctx.save();
          const vinylCenterX = artX + artSize * 0.72;
          const vinylCenterY = artY + artSize * 0.45;
          const vinylRadius = artSize * 0.45;

          // Vinyl Outer Body
          ctx.beginPath();
          ctx.arc(vinylCenterX, vinylCenterY, vinylRadius, 0, Math.PI * 2);
          ctx.fillStyle = "#111113";
          ctx.fill();
          ctx.strokeStyle = "#27272a";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Vinyl Grooves
          [0.85, 0.72, 0.58, 0.45].forEach((ratio) => {
            ctx.beginPath();
            ctx.arc(vinylCenterX, vinylCenterY, vinylRadius * ratio, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
            ctx.lineWidth = 1.5;
            ctx.stroke();
          });

          // Center Label (Mini Artwork)
          ctx.save();
          ctx.beginPath();
          ctx.arc(vinylCenterX, vinylCenterY, vinylRadius * 0.35, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(artImg, vinylCenterX - vinylRadius * 0.35, vinylCenterY - vinylRadius * 0.35, vinylRadius * 0.7, vinylRadius * 0.7);
          ctx.restore();

          // Center Spindle Hole
          ctx.beginPath();
          ctx.arc(vinylCenterX, vinylCenterY, 14, 0, Math.PI * 2);
          ctx.fillStyle = "#09090b";
          ctx.fill();
          ctx.restore();
        }

        // Drop shadow for album sleeve
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
        ctx.shadowBlur = 60;
        ctx.shadowOffsetY = 30;

        // Rounded Album Cover
        ctx.beginPath();
        const artRadius = 36;
        ctx.roundRect ? ctx.roundRect(artX, artY, artSize, artSize, artRadius) : ctx.rect(artX, artY, artSize, artSize);
        ctx.fillStyle = "#1e1e24";
        ctx.fill();
        ctx.clip();
        ctx.drawImage(artImg, artX, artY, artSize, artSize);
        ctx.restore();

        // Subtle cover glossy border
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(artX, artY, artSize, artSize, 36) : ctx.rect(artX, artY, artSize, artSize);
        ctx.stroke();
        ctx.restore();
      } catch (err) {
        console.warn("Could not render artwork onto canvas:", err);
      }
    }

    // 5. Track Information
    const infoY = artY + artSize + 110;

    // Song Title
    ctx.textAlign = "left";
    ctx.font = "900 58px 'Space Grotesk', system-ui, sans-serif";
    ctx.fillStyle = "#ffffff";
    const songTitle = activeSong?.title || "Unknown Track";
    const maxTitleWidth = width - 280;
    let truncatedTitle = songTitle;
    if (ctx.measureText(truncatedTitle).width > maxTitleWidth) {
      while (ctx.measureText(truncatedTitle + "...").width > maxTitleWidth && truncatedTitle.length > 0) {
        truncatedTitle = truncatedTitle.slice(0, -1);
      }
      truncatedTitle += "...";
    }
    ctx.fillText(truncatedTitle, 140, infoY);

    // Artist Name
    ctx.font = "700 38px system-ui, sans-serif";
    ctx.fillStyle = selectedTheme === "cyberpunk" ? "#f43f5e" : "#818cf8";
    const artistName = activeSong?.artist || "Unknown Artist";
    ctx.fillText(artistName, 140, infoY + 56);

    // Album Name
    if (activeSong?.album) {
      ctx.font = "500 28px system-ui, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fillText(activeSong.album, 140, infoY + 104);
    }

    // 6. Audio Waveform Visualizer
    const waveY = infoY + 160;
    if (showWaveform) {
      ctx.save();
      const waveBars = 36;
      const wBarWidth = 14;
      const wBarGap = 8;
      const totalWaveWidth = waveBars * wBarWidth + (waveBars - 1) * wBarGap;
      const waveStartX = (width - totalWaveWidth) / 2;

      for (let i = 0; i < waveBars; i++) {
        const factor = Math.sin((i / waveBars) * Math.PI) * 0.7 + 0.3;
        const randomHeight = (Math.sin(i * 1.5) * 0.4 + 0.6) * 75 * factor + 12;
        const bx = waveStartX + i * (wBarWidth + wBarGap);
        const by = waveY + 45 - randomHeight / 2;

        const waveGrad = ctx.createLinearGradient(0, by, 0, by + randomHeight);
        waveGrad.addColorStop(0, selectedTheme === "cyberpunk" ? "#f43f5e" : "#818cf8");
        waveGrad.addColorStop(1, selectedTheme === "cyberpunk" ? "#06b6d4" : "#ec4899");

        ctx.fillStyle = waveGrad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, wBarWidth, randomHeight, 7) : ctx.rect(bx, by, wBarWidth, randomHeight);
        ctx.fill();
      }
      ctx.restore();
    }

    // 7. Progress Bar and Timestamps
    const progressY = waveY + 110;
    const pStartX = 140;
    const pEndX = width - 140;
    const pWidth = pEndX - pStartX;

    // Track Background
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(pStartX, progressY, pWidth, 8, 4) : ctx.rect(pStartX, progressY, pWidth, 8);
    ctx.fill();

    // Active Progress Fill (40%)
    const activeFillWidth = pWidth * 0.45;
    const fillGrad = ctx.createLinearGradient(pStartX, 0, pStartX + activeFillWidth, 0);
    fillGrad.addColorStop(0, "#818cf8");
    fillGrad.addColorStop(1, "#ec4899");
    ctx.fillStyle = fillGrad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(pStartX, progressY, activeFillWidth, 8, 4) : ctx.rect(pStartX, progressY, activeFillWidth, 8);
    ctx.fill();

    // Progress Handle
    ctx.save();
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(pStartX + activeFillWidth, progressY + 4, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Timestamps
    ctx.font = "600 24px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.textAlign = "left";
    ctx.fillText(displayTime, pStartX, progressY + 40);
    ctx.textAlign = "right";
    ctx.fillText(totalDuration, pEndX, progressY + 40);

    // 8. Vibe Badge / Custom Quote Pill
    const stickerText = customQuote.trim() || selectedBadge;
    if (stickerText) {
      const stickerY = progressY + 95;
      ctx.font = "800 26px system-ui, sans-serif";
      ctx.textAlign = "center";
      const sWidth = ctx.measureText(stickerText).width + 60;
      const sX = (width - sWidth) / 2;

      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(sX, stickerY, sWidth, 58, 29) : ctx.rect(sX, stickerY, sWidth, 58);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.fillText(stickerText, width / 2, stickerY + 39);
      ctx.restore();
    }

    // 9. Bottom Footer: Spotify-style sound wave barcodes & listen link
    const footerY = height - 120;

    // Mini Sound Wave Barcode pattern
    ctx.save();
    const barcodeBars = 48;
    const bBarWidth = 5;
    const bBarGap = 5;
    const totalBWidth = barcodeBars * bBarWidth + (barcodeBars - 1) * bBarGap;
    const bStartX = (width - totalBWidth) / 2;

    for (let i = 0; i < barcodeBars; i++) {
      const bHeight = ((i * 13) % 28) + 10;
      const bx = bStartX + i * (bBarWidth + bBarGap);
      const by = footerY - bHeight / 2;

      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, bBarWidth, bHeight, 2) : ctx.rect(bx, by, bBarWidth, bHeight);
      ctx.fill();
    }
    ctx.restore();

    ctx.font = "700 20px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "center";
    ctx.fillText("LISTEN ON ECHOSTREAM", width / 2, footerY + 50);

    return canvas;
  };

  // Download Story Action
  const handleDownloadPNG = async () => {
    try {
      setIsExporting(true);
      const canvas = await generateStoryCanvas();
      const imageURL = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      const safeTitle = (activeSong?.title || "echostream-story")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");
      link.download = `${safeTitle}-echostream-story.png`;
      link.href = imageURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to generate story card PNG:", err);
      alert("Could not export image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Copy to Clipboard Action
  const handleCopyToClipboard = async () => {
    try {
      setIsExporting(true);
      const canvas = await generateStoryCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Could not create image blob");
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopiedSuccess(true);
          setTimeout(() => setCopiedSuccess(false), 2500);
        } catch (clipErr) {
          console.warn("ClipboardItem write not supported, falling back to download", clipErr);
          handleDownloadPNG();
        }
      }, "image/png");
    } catch (err) {
      console.error("Failed to copy story card:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Native Web Share Action
  const handleNativeShare = async () => {
    try {
      setIsExporting(true);
      const canvas = await generateStoryCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `${activeSong?.title || "echostream"}-story.png`, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${activeSong?.title} on EchoStream`,
            text: `Listening to ${activeSong?.title} by ${activeSong?.artist} on EchoStream!`,
          });
        } else {
          handleDownloadPNG();
        }
      }, "image/png");
    } catch (err) {
      console.error("Native share failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isStoryModalOpen || !activeSong) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto no-scrollbar">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeStoryModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-2xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 450, damping: 28 }}
          className="relative z-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto no-scrollbar rounded-[2.5rem] bg-[#0c0c10]/95 border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.8)] p-6 md:p-8 backdrop-blur-3xl flex flex-col lg:flex-row gap-8 items-center"
        >
          {/* Close Button */}
          <button
            onClick={closeStoryModal}
            className="absolute top-5 right-5 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20 cursor-pointer"
            title="Close"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          {/* LEFT: Live 9:16 Interactive Phone Preview */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div
              ref={cardPreviewRef}
              className={cn(
                "relative w-[280px] sm:w-[320px] aspect-[9/16] rounded-[2.2rem] overflow-hidden border border-white/15 shadow-2xl p-6 flex flex-col justify-between transition-all duration-500",
                selectedTheme === "aurora" && "bg-gradient-to-b from-[#0e0e18] via-[#09090f] to-[#050508]",
                selectedTheme === "vinyl" && "bg-gradient-to-b from-[#121016] via-[#0a0a0f] to-[#040406]",
                selectedTheme === "cyberpunk" && "bg-gradient-to-b from-[#180a14] via-[#0a0614] to-[#030610] border-pink-500/30",
                selectedTheme === "minimal" && "bg-[#09090b] border-white/10"
              )}
            >
              {/* Background Ambient Orbs in Preview */}
              {selectedTheme === "aurora" && (
                <>
                  <div className="absolute -top-12 -left-12 size-48 rounded-full bg-accent/40 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -right-12 size-52 rounded-full bg-pink-500/35 blur-3xl pointer-events-none" />
                </>
              )}
              {selectedTheme === "cyberpunk" && (
                <>
                  <div className="absolute -top-12 -left-12 size-48 rounded-full bg-rose-500/40 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -right-12 size-52 rounded-full bg-cyan-500/40 blur-3xl pointer-events-none" />
                </>
              )}

              {/* Story Header: EchoStream + made by Anay */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white text-base">graphic_eq</span>
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm tracking-tight leading-none">EchoStream</h4>
                    <p className="text-[9px] font-bold tracking-[0.22em] text-accent/90 uppercase mt-0.5">made by Anay</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[8px] font-bold text-white uppercase tracking-wider">Lossless</span>
                </div>
              </div>

              {/* Center Artwork & Vinyl */}
              <div className="relative z-10 my-auto flex items-center justify-center">
                {selectedTheme === "vinyl" && showVinylPeek && (
                  <div className="absolute right-2 size-44 rounded-full bg-[#111113] border border-white/10 shadow-2xl flex items-center justify-center animate-spin [animation-duration:12s]">
                    <div className="size-20 rounded-full border border-white/10 flex items-center justify-center">
                      <img src={activeSong.albumArt} alt="" className="size-14 rounded-full object-cover" />
                    </div>
                  </div>
                )}

                <div className="relative size-48 sm:size-52 rounded-2xl overflow-hidden shadow-2xl border border-white/20 group">
                  <img src={activeSong.albumArt} alt={activeSong.title} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Track Details & Waveform */}
              <div className="relative z-10 space-y-3">
                <div>
                  <h3 className="font-black text-white text-base sm:text-lg truncate leading-tight">{activeSong.title}</h3>
                  <p className="text-xs font-bold text-accent truncate mt-0.5">{activeSong.artist}</p>
                </div>

                {/* Waveform graphic */}
                {showWaveform && (
                  <div className="flex items-center justify-between gap-1 h-6">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const h = Math.sin((i / 24) * Math.PI) * 16 + (i % 3) * 3 + 4;
                      return (
                        <span
                          key={`wave-${i}`}
                          className="w-1 rounded-full bg-gradient-to-t from-accent to-pink-500 opacity-80"
                          style={{ height: `${h}px` }}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-2/5 bg-gradient-to-r from-accent to-pink-500 rounded-full" />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>{displayTime}</span>
                    <span>{totalDuration}</span>
                  </div>
                </div>

                {/* Vibe / Quote Sticker */}
                <div className="pt-1 flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black text-white uppercase tracking-wider backdrop-blur-md shadow-lg truncate max-w-full">
                    {customQuote.trim() || selectedBadge}
                  </span>
                </div>

                {/* Bottom Soundwave barcode & Link */}
                <div className="pt-1 flex flex-col items-center">
                  <span className="text-[8px] font-bold text-slate-500 tracking-[0.25em] uppercase">LISTEN ON ECHOSTREAM</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-2">1080 × 1920 (9:16 Instagram Story Format)</p>
          </div>

          {/* RIGHT: Customization Controls & Export Actions */}
          <div className="flex-1 space-y-6 w-full">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-accent text-xl">palette</span>
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-accent">Studio Export</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Social Story Card</h2>
              <p className="text-xs text-slate-400 mt-1">
                Generate an aesthetic, high-resolution story graphic for Instagram Stories, TikTok, WhatsApp, or Twitter.
              </p>
            </div>

            {/* Visual Style Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Aesthetic Theme</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "aurora", label: "Liquid Aurora", icon: "flare" },
                  { id: "vinyl", label: "Vinyl Groove", icon: "album" },
                  { id: "cyberpunk", label: "Cyber Neon", icon: "bolt" },
                  { id: "minimal", label: "Minimalist", icon: "contrast" },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setSelectedTheme(th.id as CardTheme)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                      selectedTheme === th.id
                        ? "bg-accent/20 border-accent text-white shadow-md shadow-accent/20"
                        : "bg-white/[0.03] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.06]"
                    )}
                  >
                    <span className="material-symbols-outlined text-base">{th.icon}</span>
                    <span className="truncate">{th.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vibe / Quote Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Vibe Sticker</label>
              <div className="flex flex-wrap gap-2">
                {VIBE_BADGES.map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      setSelectedBadge(b);
                      setCustomQuote("");
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border",
                      selectedBadge === b && !customQuote
                        ? "bg-white text-black border-white shadow-md"
                        : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Lyric / Quote Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Custom Caption / Lyric (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 'Late night highway energy...' or favorite lyric"
                value={customQuote}
                onChange={(e) => setCustomQuote(e.target.value)}
                maxLength={45}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
              />
            </div>

            {/* Visual Feature Toggles */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={showWaveform}
                  onChange={(e) => setShowWaveform(e.target.checked)}
                  className="rounded bg-white/10 border-white/20 text-accent focus:ring-0 cursor-pointer"
                />
                Audio Waveform
              </label>

              {selectedTheme === "vinyl" && (
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={showVinylPeek}
                    onChange={(e) => setShowVinylPeek(e.target.checked)}
                    className="rounded bg-white/10 border-white/20 text-accent focus:ring-0 cursor-pointer"
                  />
                  Spinning Vinyl Peek
                </label>
              )}
            </div>

            {/* Export Buttons */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadPNG}
                disabled={isExporting}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-lg">download</span>
                )}
                Download Story (1080×1920)
              </button>

              <button
                onClick={handleCopyToClipboard}
                disabled={isExporting}
                className={cn(
                  "flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl border font-bold text-xs transition-all cursor-pointer disabled:opacity-50",
                  copiedSuccess
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/15 hover:scale-[1.02] active:scale-[0.98]"
                )}
                title="Copy image directly to paste into WhatsApp, Discord, or Telegram"
              >
                <span className="material-symbols-outlined text-lg">
                  {copiedSuccess ? "done" : "content_copy"}
                </span>
                {copiedSuccess ? "Copied!" : "Copy Image"}
              </button>

              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <button
                  onClick={handleNativeShare}
                  disabled={isExporting}
                  className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-accent hover:bg-accent/90 text-white font-bold text-xs transition-all cursor-pointer shadow-lg shadow-accent/25 hover:scale-[1.02] active:scale-[0.98]"
                  title="Share directly via mobile share sheet"
                >
                  <span className="material-symbols-outlined text-lg">share</span>
                  Share
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

