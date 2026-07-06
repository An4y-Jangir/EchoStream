"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SettingsPageProps {
  userName: string;
  setUserName: (name: string) => void;
  userPfp: string;
  setUserPfp: (pfp: string) => void;
  logoStyle: 'default' | 'ripple' | 'infinity' | 'equalizer';
  setLogoStyle: (style: 'default' | 'ripple' | 'infinity' | 'equalizer') => void;
  setActiveTab: (tab: any) => void;
}

const STATIC_ACCENTS = [
  { name: "Neon Indigo", color: "#6366f1" },
  { name: "Emerald Green", color: "#10b981" },
  { name: "Cyberpunk Rose", color: "#f43f5e" },
  { name: "Amber Orange", color: "#f59e0b" },
  { name: "Cyan Spark", color: "#06b6d4" },
  { name: "Vibrant Violet", color: "#8b5cf6" },
];

const PRESET_AVATARS = [
  "/alex_pfp.png",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
];

const EQ_PRESETS = {
  flat: [0, 0, 0, 0, 0],
  bass: [8, 5, 1, 0, -1],
  electronic: [6, 3, -1, 4, 5],
  rock: [4, 2, -2, 1, 3],
  vocal: [-2, -1, 4, 3, 1],
  cyberpunk: [9, 6, 0, 5, 8],
};

export const SettingsPage: React.FC<SettingsPageProps> = ({
  userName,
  setUserName,
  userPfp,
  setUserPfp,
  logoStyle,
  setLogoStyle,
  setActiveTab,
}) => {
  // Audio settings states
  const [audioQuality, setAudioQuality] = useState<"low" | "normal" | "high" | "lossless">("high");
  const [crossfade, setCrossfade] = useState(4);
  const [audioNormalizer, setAudioNormalizer] = useState(true);
  const [autoplayNext, setAutoplayNext] = useState(true);

  // Equalizer states (5-Band: 60Hz, 230Hz, 910Hz, 4kHz, 14kHz)
  const [eqPreset, setEqPreset] = useState<keyof typeof EQ_PRESETS | "custom">("flat");
  const [eqBands, setEqBands] = useState<number[]>([0, 0, 0, 0, 0]);
  const [reverbPreset, setReverbPreset] = useState<"none" | "studio" | "hall" | "club">("none");

  // Visual settings states
  const [dynamicTheme, setDynamicTheme] = useState(true);
  const [staticAccent, setStaticAccent] = useState("#6366f1");
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [particlesDensity, setParticlesDensity] = useState<"low" | "medium" | "high">("medium");

  // Toggles for visual animations
  const [flightEnabled, setFlightEnabled] = useState(true);
  const [cursorEnabled, setCursorEnabled] = useState(true);
  const [lyricsSize, setLyricsSize] = useState<"small" | "medium" | "large">("large");

  const importFileRef = useRef<HTMLInputElement>(null);
  const avatarUploadRef = useRef<HTMLInputElement>(null);

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    // Limit size to 2MB to keep localStorage happy
    if (file.size > 2 * 1024 * 1024) {
      alert("Selected image is too large! Please choose an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        handlePfpChange(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Load settings on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAudioQuality((localStorage.getItem("echo-audio-quality") as any) || "high");
      setCrossfade(Number(localStorage.getItem("echo-crossfade") ?? "4"));
      setAudioNormalizer(localStorage.getItem("echo-audio-normalizer") !== "false");
      setAutoplayNext(localStorage.getItem("echo-autoplay-next") !== "false");

      setDynamicTheme(localStorage.getItem("echo-dynamic-theme") !== "false");
      setStaticAccent(localStorage.getItem("echo-static-accent") || "#6366f1");
      setParticlesEnabled(localStorage.getItem("echo-particles-enabled") !== "false");
      setParticlesDensity((localStorage.getItem("echo-particles-density") as any) || "medium");

      setFlightEnabled(localStorage.getItem("echo-flight-animations") !== "false");
      setCursorEnabled(localStorage.getItem("echo-custom-cursor") !== "false");
      setLyricsSize((localStorage.getItem("echo-lyrics-size") as any) || "large");

      setReverbPreset((localStorage.getItem("echo-reverb-preset") as any) || "none");
      const storedEqPreset = localStorage.getItem("echo-eq-preset") as any;
      if (storedEqPreset) {
        setEqPreset(storedEqPreset);
        if (storedEqPreset in EQ_PRESETS) {
          setEqBands(EQ_PRESETS[storedEqPreset as keyof typeof EQ_PRESETS]);
        }
      }
      const storedEqBands = localStorage.getItem("echo-eq-bands");
      if (storedEqBands && storedEqPreset === "custom") {
        setEqBands(JSON.parse(storedEqBands));
      }
    }
  }, []);

  // Save profile helpers
  const handleNameChange = (val: string) => {
    setUserName(val);
    localStorage.setItem("echo-username", val);
  };

  const handlePfpChange = (val: string) => {
    setUserPfp(val);
    localStorage.setItem("echo-userpfp", val);
  };

  // Visual Event Triggering
  const toggleDynamicTheme = (val: boolean) => {
    setDynamicTheme(val);
    localStorage.setItem("echo-dynamic-theme", String(val));
    window.dispatchEvent(new Event("theme-change"));
  };

  const selectStaticAccent = (color: string) => {
    setStaticAccent(color);
    localStorage.setItem("echo-static-accent", color);
    window.dispatchEvent(new Event("theme-change"));
  };

  const toggleParticles = (val: boolean) => {
    setParticlesEnabled(val);
    localStorage.setItem("echo-particles-enabled", String(val));
    window.dispatchEvent(new Event("particles-change"));
  };

  const selectParticlesDensity = (val: "low" | "medium" | "high") => {
    setParticlesDensity(val);
    localStorage.setItem("echo-particles-density", val);
    window.dispatchEvent(new Event("particles-change"));
  };

  // Cursor & Flight animations
  const toggleCursor = (val: boolean) => {
    setCursorEnabled(val);
    localStorage.setItem("echo-custom-cursor", String(val));
    window.dispatchEvent(new Event("cursor-change"));
  };

  const toggleFlight = (val: boolean) => {
    setFlightEnabled(val);
    localStorage.setItem("echo-flight-animations", String(val));
  };

  const handleLyricsSize = (val: "small" | "medium" | "large") => {
    setLyricsSize(val);
    localStorage.setItem("echo-lyrics-size", val);
    window.dispatchEvent(new Event("lyrics-size-change"));
  };

  // Audio and DSP Settings
  const handleAudioQuality = (val: "low" | "normal" | "high" | "lossless") => {
    setAudioQuality(val);
    localStorage.setItem("echo-audio-quality", val);
  };

  const handleCrossfade = (val: number) => {
    setCrossfade(val);
    localStorage.setItem("echo-crossfade", String(val));
  };

  const toggleNormalizer = (val: boolean) => {
    setAudioNormalizer(val);
    localStorage.setItem("echo-audio-normalizer", String(val));
  };

  const toggleAutoplay = (val: boolean) => {
    setAutoplayNext(val);
    localStorage.setItem("echo-autoplay-next", String(val));
  };

  // EQ and Reverb handlers
  const handleEqPreset = (preset: keyof typeof EQ_PRESETS) => {
    setEqPreset(preset);
    setEqBands(EQ_PRESETS[preset]);
    localStorage.setItem("echo-eq-preset", preset);
    localStorage.setItem("echo-eq-bands", JSON.stringify(EQ_PRESETS[preset]));
  };

  const handleEqBandChange = (idx: number, val: number) => {
    const updated = [...eqBands];
    updated[idx] = val;
    setEqBands(updated);
    setEqPreset("custom");
    localStorage.setItem("echo-eq-preset", "custom");
    localStorage.setItem("echo-eq-bands", JSON.stringify(updated));
  };

  const handleReverbPreset = (preset: "none" | "studio" | "hall" | "club") => {
    setReverbPreset(preset);
    localStorage.setItem("echo-reverb-preset", preset);
  };

  // Backup and Restore library data
  const exportLibraryBackup = () => {
    const data = {
      version: "1.2",
      timestamp: Date.now(),
      playlists: JSON.parse(localStorage.getItem("echo-playlists") || "[]"),
      likedSongs: JSON.parse(localStorage.getItem("echo-likedSongs") || "[]"),
      username: localStorage.getItem("echo-username") || "Alex Rivera",
      userpfp: localStorage.getItem("echo-userpfp") || "/alex_pfp.png",
      preferences: {
        audioQuality: localStorage.getItem("echo-audio-quality") || "high",
        crossfade: localStorage.getItem("echo-crossfade") || "4",
        audioNormalizer: localStorage.getItem("echo-audio-normalizer") !== "false",
        autoplayNext: localStorage.getItem("echo-autoplay-next") !== "false",
        dynamicTheme: localStorage.getItem("echo-dynamic-theme") !== "false",
        staticAccent: localStorage.getItem("echo-static-accent") || "#6366f1",
        particlesEnabled: localStorage.getItem("echo-particles-enabled") !== "false",
        particlesDensity: localStorage.getItem("echo-particles-density") || "medium",
        flightAnimations: localStorage.getItem("echo-flight-animations") !== "false",
        customCursor: localStorage.getItem("echo-custom-cursor") !== "false",
        lyricsSize: localStorage.getItem("echo-lyrics-size") || "large",
        eqPreset: localStorage.getItem("echo-eq-preset") || "flat",
        reverbPreset: localStorage.getItem("echo-reverb-preset") || "none",
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `echostream-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.playlists || !data.likedSongs) {
          throw new Error("Invalid backup format: Missing playlists or liked songs.");
        }

        // Apply playlists and profile details
        localStorage.setItem("echo-playlists", JSON.stringify(data.playlists));
        localStorage.setItem("echo-likedSongs", JSON.stringify(data.likedSongs));
        localStorage.setItem("echo-username", data.username);
        localStorage.setItem("echo-userpfp", data.userpfp);

        // Apply preferences if present
        if (data.preferences) {
          const pref = data.preferences;
          localStorage.setItem("echo-audio-quality", pref.audioQuality);
          localStorage.setItem("echo-crossfade", pref.crossfade);
          localStorage.setItem("echo-audio-normalizer", String(pref.audioNormalizer));
          localStorage.setItem("echo-autoplay-next", String(pref.autoplayNext));
          localStorage.setItem("echo-dynamic-theme", String(pref.dynamicTheme));
          localStorage.setItem("echo-static-accent", pref.staticAccent);
          localStorage.setItem("echo-particles-enabled", String(pref.particlesEnabled));
          localStorage.setItem("echo-particles-density", pref.particlesDensity);
          localStorage.setItem("echo-flight-animations", String(pref.flightAnimations));
          localStorage.setItem("echo-custom-cursor", String(pref.customCursor));
          localStorage.setItem("echo-lyrics-size", pref.lyricsSize);
          localStorage.setItem("echo-eq-preset", pref.eqPreset);
          localStorage.setItem("echo-reverb-preset", pref.reverbPreset);
        }

        alert("Library backup restored successfully! Reloading to apply changes.");
        window.location.reload();
      } catch (err: any) {
        alert("Failed to restore backup: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const clearAppCache = () => {
    if (confirm("Are you sure you want to clear system cache and restore default preferences? Your custom playlists will remain intact.")) {
      localStorage.removeItem("echo-audio-quality");
      localStorage.removeItem("echo-crossfade");
      localStorage.removeItem("echo-audio-normalizer");
      localStorage.removeItem("echo-autoplay-next");
      localStorage.removeItem("echo-dynamic-theme");
      localStorage.removeItem("echo-static-accent");
      localStorage.removeItem("echo-particles-enabled");
      localStorage.removeItem("echo-particles-density");
      localStorage.removeItem("echo-flight-animations");
      localStorage.removeItem("echo-custom-cursor");
      localStorage.removeItem("echo-lyrics-size");
      localStorage.removeItem("echo-username");
      localStorage.removeItem("echo-userpfp");
      localStorage.removeItem("echo-eq-preset");
      localStorage.removeItem("echo-eq-bands");
      localStorage.removeItem("echo-reverb-preset");

      setAudioQuality("high");
      setCrossfade(4);
      setAudioNormalizer(true);
      setAutoplayNext(true);
      setDynamicTheme(true);
      setStaticAccent("#6366f1");
      setParticlesEnabled(true);
      setParticlesDensity("medium");
      setUserName("Alex Rivera");
      setUserPfp("/alex_pfp.png");
      setFlightEnabled(true);
      setCursorEnabled(true);
      setLyricsSize("large");
      setEqPreset("flat");
      setEqBands([0, 0, 0, 0, 0]);
      setReverbPreset("none");

      window.dispatchEvent(new Event("theme-change"));
      window.dispatchEvent(new Event("particles-change"));
      window.dispatchEvent(new Event("cursor-change"));
      window.dispatchEvent(new Event("lyrics-size-change"));

      alert("Cache cleared successfully! Default settings restored.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-12 max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-4xl text-accent">settings</span> Settings
          </h2>
          <p className="text-slate-500 text-sm mt-1">Configure your audio engine and tactile interface defaults.</p>
        </div>
        <button
          onClick={() => setActiveTab("discover")}
          className="text-slate-400 hover:text-white px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-xs font-bold transition-all hover:bg-white/10"
        >
          Back to Discover
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Profile & Audio & EQ */}
        <div className="space-y-8">
          {/* Profile Card */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-accent">account_circle</span> Profile Settings
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  alt="Profile picture"
                  className="size-16 rounded-2xl border border-white/10 object-cover shadow-xl"
                  src={userPfp}
                />
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] text-accent font-extrabold uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded">
                    PRO TIER ACTIVE
                  </span>
                  <p className="text-xs text-slate-500">{userName} • Member since 2024</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Display Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-accent/30 focus:border-accent/30 outline-none text-white transition-all"
                  placeholder="Enter user name..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Choose Avatar</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {PRESET_AVATARS.map((pfp, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePfpChange(pfp)}
                      className={cn(
                        "size-10 rounded-xl overflow-hidden border-2 transition-all hover:scale-105",
                        userPfp === pfp ? "border-accent scale-105 shadow-lg" : "border-white/10 hover:border-white/30"
                      )}
                    >
                      <img src={pfp} className="w-full h-full object-cover" alt="avatar" />
                    </button>
                  ))}
                  
                  {/* Upload custom avatar button */}
                  <button
                    onClick={() => avatarUploadRef.current?.click()}
                    className={cn(
                      "size-10 rounded-xl bg-white/[0.03] border-2 border-dashed border-white/10 hover:border-accent hover:bg-white/[0.06] transition-all flex items-center justify-center group",
                      !PRESET_AVATARS.includes(userPfp) ? "border-accent border-solid shadow-lg scale-105" : ""
                    )}
                    title="Upload Custom Image"
                  >
                    <span className="material-symbols-outlined text-white/50 group-hover:text-accent transition-colors text-lg">
                      add_photo_alternate
                    </span>
                  </button>
                  
                  <input
                    type="file"
                    ref={avatarUploadRef}
                    onChange={handleCustomAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {!PRESET_AVATARS.includes(userPfp) && (
                    <span className="text-[10px] text-accent font-bold uppercase tracking-wider bg-accent/10 px-2.5 py-1 rounded-lg ml-2">
                      Custom Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Audio Engine */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-accent">graphic_eq</span> Audio Engine
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Streaming Quality</label>
                <div className="grid grid-cols-4 gap-2 bg-white/[0.02] border border-white/5 p-1 rounded-xl">
                  {(["low", "normal", "high", "lossless"] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleAudioQuality(q)}
                      className={cn(
                        "py-2 text-[10px] font-bold uppercase rounded-lg transition-all",
                        audioQuality === q
                          ? "bg-accent text-white shadow"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.02]"
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Song Crossfade</label>
                  <span className="text-xs text-accent font-bold">{crossfade}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={crossfade}
                  onChange={(e) => handleCrossfade(Number(e.target.value))}
                  className="w-full accent-accent h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-600 font-medium">
                  <span>Gapless</span>
                  <span>12 seconds</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Audio Normalization</h4>
                  <p className="text-xs text-slate-500">Balances quiet and loud tracks automatically.</p>
                </div>
                <button
                  onClick={() => toggleNormalizer(!audioNormalizer)}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out flex items-center",
                    audioNormalizer ? "bg-accent" : "bg-white/10"
                  )}
                >
                  <div
                    className={cn(
                      "size-4 rounded-full bg-white shadow-md transform transition-transform duration-300",
                      audioNormalizer ? "translate-x-6" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Autoplay next song</h4>
                  <p className="text-xs text-slate-500">Automatically play the next song when current track ends.</p>
                </div>
                <button
                  onClick={() => toggleAutoplay(!autoplayNext)}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out flex items-center",
                    autoplayNext ? "bg-accent" : "bg-white/10"
                  )}
                >
                  <div
                    className={cn(
                      "size-4 rounded-full bg-white shadow-md transform transition-transform duration-300",
                      autoplayNext ? "translate-x-6" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Equalizer and DSP Preset */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-accent">equalizer</span> DSP Equalizer & Reverb
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Equalizer Preset</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(EQ_PRESETS) as Array<keyof typeof EQ_PRESETS>).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleEqPreset(preset)}
                      className={cn(
                        "py-2 text-[10px] font-bold uppercase rounded-lg border transition-all",
                        eqPreset === preset
                          ? "bg-accent text-white border-transparent shadow"
                          : "text-slate-400 border-white/5 hover:text-white hover:bg-white/[0.02]"
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5-Band Interactive EQ Grid */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">5-Band Tuning</label>
                <div className="flex justify-between items-center bg-white/[0.015] border border-white/5 p-4 rounded-2xl h-40">
                  {eqBands.map((val, idx) => {
                    const frequencies = ["60Hz", "230Hz", "910Hz", "4kHz", "14kHz"];
                    return (
                      <div key={idx} className="flex flex-col items-center justify-between h-full w-12">
                        <span className="text-[9px] text-slate-600 font-bold tabular-nums">
                          {val > 0 ? `+${val}` : val}dB
                        </span>
                        
                        <div className="h-24 flex items-center justify-center relative">
                          <input
                            type="range"
                            min="-12"
                            max="12"
                            value={val}
                            onChange={(e) => handleEqBandChange(idx, Number(e.target.value))}
                            className="accent-accent h-1 w-20 transform -rotate-90 appearance-none bg-white/10 rounded-lg cursor-pointer"
                          />
                        </div>

                        <span className="text-[9px] font-bold text-slate-400">{frequencies[idx]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Spatial Reverb Simulation */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Spatial Reverb (Room Mode)</label>
                <div className="grid grid-cols-4 gap-2 bg-white/[0.02] border border-white/5 p-1 rounded-xl">
                  {([
                    { id: "none", label: "None" },
                    { id: "studio", label: "Studio" },
                    { id: "hall", label: "Hall" },
                    { id: "club", label: "Club" },
                  ] as const).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleReverbPreset(preset.id)}
                      className={cn(
                        "py-2 text-[10px] font-bold uppercase rounded-lg transition-all",
                        reverbPreset === preset.id
                          ? "bg-accent text-white shadow"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.02]"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Visual FX, Custom UI & Shortcuts */}
        <div className="space-y-8">
          {/* Visual FX Engine */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-accent">palette</span> Visual FX Engine
            </h3>

            <div className="space-y-6">
              {/* Dynamic Theme Switch */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h4 className="text-sm font-bold text-white">Dynamic Album Artwork Theme</h4>
                  <p className="text-xs text-slate-500">Adapts background colors to active song album art.</p>
                </div>
                <button
                  onClick={() => toggleDynamicTheme(!dynamicTheme)}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out flex items-center",
                    dynamicTheme ? "bg-accent" : "bg-white/10"
                  )}
                >
                  <div
                    className={cn(
                      "size-4 rounded-full bg-white shadow-md transform transition-transform duration-300",
                      dynamicTheme ? "translate-x-6" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Static Accent Selector */}
              {!dynamicTheme && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Static Accent Theme</label>
                  <div className="grid grid-cols-6 gap-2">
                    {STATIC_ACCENTS.map((accent) => (
                      <button
                        key={accent.color}
                        onClick={() => selectStaticAccent(accent.color)}
                        className={cn(
                          "h-10 rounded-xl border border-white/10 flex items-center justify-center transition-all hover:scale-110 relative",
                          staticAccent === accent.color ? "border-white border-2 scale-105" : ""
                        )}
                        style={{ backgroundColor: accent.color }}
                        title={accent.name}
                      >
                        {staticAccent === accent.color && (
                          <span className="material-symbols-outlined text-white text-sm font-bold">check</span>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Logo Animation Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Sidebar Logo Animation</label>
                <div className="grid grid-cols-4 gap-2 bg-white/[0.02] border border-white/5 p-1 rounded-xl">
                  {([
                    { id: "default", label: "Classic" },
                    { id: "ripple", label: "Ripple" },
                    { id: "infinity", label: "Flow" },
                    { id: "equalizer", label: "EQ" },
                  ] as const).map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setLogoStyle(style.id)}
                      className={cn(
                        "py-2 text-[10px] font-bold uppercase rounded-lg transition-all",
                        logoStyle === style.id
                          ? "bg-accent text-white shadow"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.02]"
                      )}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Particles Switch */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Interactive Particles mesh</h4>
                  <p className="text-xs text-slate-500">Floating beat-responsive constellations in background.</p>
                </div>
                <button
                  onClick={() => toggleParticles(!particlesEnabled)}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out flex items-center",
                    particlesEnabled ? "bg-accent" : "bg-white/10"
                  )}
                >
                  <div
                    className={cn(
                      "size-4 rounded-full bg-white shadow-md transform transition-transform duration-300",
                      particlesEnabled ? "translate-x-6" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Particle Density */}
              {particlesEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Constellation Density</label>
                  <div className="grid grid-cols-3 gap-2 bg-white/[0.02] border border-white/5 p-1 rounded-xl">
                    {(["low", "medium", "high"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => selectParticlesDensity(d)}
                        className={cn(
                          "py-2 text-[10px] font-bold uppercase rounded-lg transition-all",
                          particlesDensity === d
                            ? "bg-accent text-white shadow"
                            : "text-slate-400 hover:text-white hover:bg-white/[0.02]"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Tactile Feedback & UI settings */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-accent">touch_app</span> Tactile UI Feedback
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h4 className="text-sm font-bold text-white">Parabolic Flight Animations</h4>
                  <p className="text-xs text-slate-500">Song artwork physically flies towards the target sidebar playlist/queue.</p>
                </div>
                <button
                  onClick={() => toggleFlight(!flightEnabled)}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out flex items-center",
                    flightEnabled ? "bg-accent" : "bg-white/10"
                  )}
                >
                  <div
                    className={cn(
                      "size-4 rounded-full bg-white shadow-md transform transition-transform duration-300",
                      flightEnabled ? "translate-x-6" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h4 className="text-sm font-bold text-white">Custom Animated Cursor</h4>
                  <p className="text-xs text-slate-500">Use a dynamic, glowing cursor trailing your mouse movements.</p>
                </div>
                <button
                  onClick={() => toggleCursor(!cursorEnabled)}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out flex items-center",
                    cursorEnabled ? "bg-accent" : "bg-white/10"
                  )}
                >
                  <div
                    className={cn(
                      "size-4 rounded-full bg-white shadow-md transform transition-transform duration-300",
                      cursorEnabled ? "translate-x-6" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Lyrics Panel Font Size</label>
                <div className="grid grid-cols-3 gap-2 bg-white/[0.02] border border-white/5 p-1 rounded-xl">
                  {(["small", "medium", "large"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleLyricsSize(s)}
                      className={cn(
                        "py-2 text-[10px] font-bold uppercase rounded-lg transition-all",
                        lyricsSize === s
                          ? "bg-accent text-white shadow"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.02]"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Backup, Restore & Storage Card */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-accent">cloud_sync</span> Library Backup & Data Sync
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Export your playlists, favorited tracks, history, and system settings to a local backup file, or restore them in a single click.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={exportLibraryBackup}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">download</span> Export Backup
              </button>

              <button
                onClick={() => importFileRef.current?.click()}
                className="bg-accent/10 hover:bg-accent/20 text-accent border border-accent/15 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">upload</span> Import Backup
              </button>

              <input
                type="file"
                ref={importFileRef}
                onChange={handleImportBackup}
                accept=".json"
                className="hidden"
              />
            </div>

            <button
              onClick={clearAppCache}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">delete_forever</span> Reset Visuals & Audio Cache
            </button>
          </div>

          {/* Keyboard Shortcuts Cheat Sheet */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-accent">keyboard</span> Keyboard Shortcuts
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Play / Pause</span>
                <kbd className="bg-white/10 px-2 py-0.5 rounded border border-white/10 text-[10px] font-mono">Space</kbd>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Toggle Fullscreen</span>
                <kbd className="bg-white/10 px-2 py-0.5 rounded border border-white/10 text-[10px] font-mono">F</kbd>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Toggle Mute</span>
                <kbd className="bg-white/10 px-2 py-0.5 rounded border border-white/10 text-[10px] font-mono">M</kbd>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Toggle Queue</span>
                <kbd className="bg-white/10 px-2 py-0.5 rounded border border-white/10 text-[10px] font-mono">Q</kbd>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Exit Fullscreen</span>
                <kbd className="bg-white/10 px-2 py-0.5 rounded border border-white/10 text-[10px] font-mono">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-8 text-[11px] text-slate-700 font-bold uppercase tracking-widest">
        EchoStream Music Station v1.2 • Designed in Advanced Agentic Environment
      </div>
    </motion.div>
  );
};
