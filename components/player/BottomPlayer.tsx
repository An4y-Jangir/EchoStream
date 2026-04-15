"use client";

import { usePlayer } from "@/context/PlayerContext";
import { motion, AnimatePresence } from "framer-motion";

export function BottomPlayer() {
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

  // Assuming a mock duration of 200 for calculation from context
  // Use real `currentTime` and `duration` safely
  const displayCurrentTime = isNaN(currentTime) ? 0 : currentTime;
  const displayDuration = isNaN(duration) || duration === 0 ? 0 : duration;

  return (
    <AnimatePresence>
      {!isExpanded && (
        <motion.div
          initial={{ y: 100, x: "-50%", opacity: 0 }}
          animate={{ y: 0, x: "-50%", opacity: 1 }}
          exit={{ y: 100, x: "-50%", opacity: 0 }}
          className="fixed bottom-8 left-1/2 w-[95%] max-w-7xl z-50"
        >
          <footer className="glass-panel rounded-3xl p-4 px-8 flex items-center justify-between shadow-2xl shadow-black/60 ring-1 ring-white/10">
            {/* Now Playing */}
            <div className="flex items-center gap-4 w-1/4">
              <div 
                className="size-16 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-accent/20 cursor-pointer" 
                onClick={toggleExpanded}
              >
                <img alt={currentSong.title} className="w-full h-full object-cover" src={currentSong.albumArt}/>
              </div>
              <div className="flex flex-col overflow-hidden">
                <a 
                  className="text-base font-bold text-white hover:text-accent truncate transition-colors cursor-pointer" 
                  onClick={(e) => { e.preventDefault(); toggleExpanded(); }}
                >
                  {currentSong.title}
                </a>
                <a className="text-xs text-slate-400 font-medium hover:text-white truncate transition-colors cursor-pointer">{currentSong.artist}</a>
              </div>
              <button className="text-accent hover:scale-110 active:scale-95 transition-all ml-2">
                <span className="material-symbols-outlined fill-[1] text-2xl">favorite</span>
              </button>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-col items-center gap-3 flex-1 max-w-xl">
              <div className="flex items-center gap-8">
                <button 
                  onClick={toggleShuffle} 
                  className={`${isShuffle ? 'text-accent' : 'text-slate-400 hover:text-white'} transition-colors`}
                >
                  <span className="material-symbols-outlined text-2xl">shuffle</span>
                </button>
                <button onClick={playPrevious} className="text-white hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl">skip_previous</span>
                </button>
                <button 
                  onClick={togglePlay}
                  className="size-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  <span className="material-symbols-outlined fill-[1] text-4xl">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <button onClick={playNext} className="text-white hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl">skip_next</span>
                </button>
                <button 
                  onClick={toggleRepeat} 
                  className={`${isRepeat ? 'text-accent' : 'text-slate-400 hover:text-white'} transition-colors`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {isRepeat ? 'repeat_one' : 'repeat'}
                  </span>
                </button>
              </div>
              
              <div className="flex items-center gap-3 w-full">
                <span className="text-[10px] text-slate-500 font-bold tabular-nums w-8 text-right">
                  {formatTime(displayCurrentTime)}
                </span>
                <div 
                  className="h-1.5 flex-1 bg-white/5 rounded-full relative group cursor-pointer overflow-hidden" 
                  onClick={handleSeek}
                >
                  <div 
                    className="absolute inset-y-0 left-0 bg-accent rounded-full pointer-events-none" 
                    style={{ width: `${progress * 100}%` }}
                  ></div>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
                <span className="text-[10px] text-slate-500 font-bold tabular-nums w-8">
                  {formatTime(displayDuration)}
                </span>
              </div>
            </div>

            {/* Volume & Tools */}
            <div className="flex items-center justify-end gap-5 w-1/4">
              <button className="text-slate-400 hover:text-accent transition-colors">
                <span className="material-symbols-outlined text-2xl">lyrics</span>
              </button>
              <button className="text-slate-400 hover:text-accent transition-colors">
                <span className="material-symbols-outlined text-2xl">queue_music</span>
              </button>
              <div className="flex items-center gap-3 w-32 ml-2">
                <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)}>
                  <span className="material-symbols-outlined text-slate-400 text-xl">
                    {volume === 0 ? 'volume_off' : 'volume_up'}
                  </span>
                </button>
                <div 
                  className="h-1.5 flex-1 bg-white/5 rounded-full relative group cursor-pointer overflow-hidden" 
                  onClick={handleVolume}
                >
                  <div 
                    className="absolute inset-y-0 left-0 bg-white/60 group-hover:bg-accent rounded-full transition-colors pointer-events-none" 
                    style={{ width: `${volume * 100}%` }}
                  ></div>
                </div>
              </div>
              <button onClick={toggleExpanded} className="text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-2xl">fullscreen</span>
              </button>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
