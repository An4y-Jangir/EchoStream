"use client";

import { usePlayer } from "@/context/PlayerContext";
import { motion, AnimatePresence } from "framer-motion";
import { LiveLyrics } from "./LiveLyrics";
import { useEffect, useState } from "react";

export function ExpandedPlayer() {
  const { 
    currentSong, 
    isPlaying, 
    togglePlay, 
    progress, 
    toggleExpanded, 
    isExpanded, 
    currentTime, 
    seek,
    volume,
    setVolume,
    isShuffle,
    toggleShuffle,
    isRepeat,
    toggleRepeat,
    duration,
    playNext,
    playPrevious
  } = usePlayer();

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(1, percent)));
  };

  const handleVolume = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setVolume(Math.max(0, Math.min(1, percent)));
  };

  const formatTime = (timeInSeconds: number) => {
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  const displayCurrentTime = isNaN(currentTime) ? 0 : currentTime;
  const displayDuration = isNaN(duration) || duration === 0 ? 0 : duration;

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto origin-bottom text-white no-scrollbar"
        >
          {/* Dynamic Background Blur */}
          <div 
            className="fixed inset-0 z-0 scale-125 transition-all duration-1000"
            style={{ 
              backgroundImage: `url(${currentSong.albumArt})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              filter: 'blur(80px) brightness(0.5)'
            }}
          />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between px-10 pt-8 pb-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleExpanded}
                className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors shadow-lg backdrop-blur-md"
              >
                <span className="material-symbols-outlined text-white">expand_more</span>
              </button>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">Now Playing</span>
                <span className="text-sm font-semibold">{currentSong.title}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors shadow-lg backdrop-blur-md">
                <span className="material-symbols-outlined text-sm">share</span>
              </button>
              <button className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors shadow-lg backdrop-blur-md">
                <span className="material-symbols-outlined text-sm">more_horiz</span>
              </button>
            </div>
          </div>

          {/* Main Content (Split Screen) */}
          <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center px-10 gap-16 min-h-0 w-full max-w-[100rem] mx-auto pb-40">
            {/* Left: Album Cover */}
            <div className="w-full lg:w-[45%] flex items-center justify-end shrink-0 max-w-[600px]">
              <motion.img 
                src={currentSong.albumArt} 
                alt={currentSong.title}
                className="w-[85%] aspect-square rounded-[2rem] object-cover"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                  boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.7)'
                }}
              />
            </div>

            {/* Right: Lyrics */}
            <div className="w-full lg:w-[55%] h-[80vh] flex items-center max-w-[800px]">
               <LiveLyrics lyrics={currentSong.lyrics} currentTime={currentTime} />
            </div>
          </div>

          {/* Bottom Player Bar */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-[60] flex flex-col">
            <div className="glass-panel bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
              
              {/* Progress Bar Container */}
              <div className="flex items-center gap-4 w-full">
                <span className="text-xs font-semibold tabular-nums text-white/50">{formatTime(displayCurrentTime)}</span>
                <div 
                  className="flex-1 h-1.5 bg-white/10 hover:bg-white/20 hover:h-2 transition-all rounded-full overflow-hidden cursor-pointer relative group"
                  onClick={handleSeek}
                >
                  <div 
                    className="absolute inset-y-0 left-0 bg-white rounded-full transition-all pointer-events-none"
                    style={{ width: `${progress * 100}%` }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" 
                    style={{ left: `calc(${progress * 100}% - 6px)` }} 
                  />
                </div>
                <span className="text-xs font-semibold tabular-nums text-white/50">{formatTime(displayDuration)}</span>
              </div>

              {/* Controls Section */}
              <div className="flex items-center justify-between w-full">
                
                {/* Left: Song Info */}
                <div className="flex items-center gap-4 w-1/4">
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-base truncate">{currentSong.title}</span>
                    <span className="text-sm text-white/50 font-medium truncate">{currentSong.artist}</span>
                  </div>
                  <button className="text-accent hover:scale-110 active:scale-95 transition-all ml-2">
                    <span className="material-symbols-outlined fill-[1] text-xl">favorite</span>
                  </button>
                </div>

                {/* Center: Play Controls */}
                <div className="flex items-center gap-8 justify-center flex-1">
                  <button onClick={toggleShuffle} className={`${isShuffle ? 'text-accent' : 'text-white/50 hover:text-white'} transition-colors`}>
                    <span className="material-symbols-outlined text-xl">shuffle</span>
                  </button>
                  <button onClick={playPrevious} className="text-white hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">skip_previous</span>
                  </button>
                  <button 
                    onClick={togglePlay}
                    className="size-[52px] bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
                  >
                    <span className="material-symbols-outlined fill-[1] text-3xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
                  </button>
                  <button onClick={playNext} className="text-white hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">skip_next</span>
                  </button>
                  <button onClick={toggleRepeat} className={`${isRepeat ? 'text-accent' : 'text-white/50 hover:text-white'} transition-colors`}>
                    <span className="material-symbols-outlined text-xl">{isRepeat ? 'repeat_one' : 'repeat'}</span>
                  </button>
                </div>

                {/* Right: Tools & Volume */}
                <div className="flex items-center justify-end gap-5 w-1/4">
                  <button className="text-white/80 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">lyrics</span>
                  </button>
                  <button className="text-white/80 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">queue_music</span>
                  </button>
                  <div className="flex items-center gap-2 w-28 ml-2 group">
                    <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)}>
                      <span className="material-symbols-outlined text-white/80 text-lg">{volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}</span>
                    </button>
                    <div 
                      className="h-1 flex-1 bg-white/20 rounded-full relative cursor-pointer group-hover:h-1.5 transition-all" 
                      onClick={handleVolume}
                    >
                      <div className="absolute inset-y-0 left-0 bg-white rounded-full transition-all pointer-events-none" style={{ width: `${volume * 100}%` }} />
                      <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" style={{ left: `calc(${volume * 100}% - 5px)` }} />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
