"use client";

import { usePlayer } from "@/context/PlayerContext";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { cn } from "@/lib/utils";
import { VolumeSlider } from "./VolumeSlider";
import { TearAnimation } from "./QueueItem";
import { useState, useRef } from "react";
import { Song } from "@/types/music";

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
    playPrevious,
    likedSongs,
    toggleLike,
    isLyricsVisible,
    toggleLyrics,
    isQueueVisible,
    toggleQueue,
    userQueue,
    contextQueue,
    reorderUserQueue,
    removeFromUserQueue,
    playSong
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

  // Tear animation state — lives in parent so it survives queue item unmounting
  const [tears, setTears] = useState<Array<{ id: string; rect: DOMRect; song: Song }>>([]);

  const snipSong = (song: Song, ref: HTMLElement | null) => {
    if (!ref) { removeFromUserQueue(song.id); return; }
    const rect = ref.getBoundingClientRect();
    const id = `${song.id}-${Date.now()}`;
    setTears(prev => [...prev, { id, rect, song }]);
    removeFromUserQueue(song.id);
    setTimeout(() => setTears(prev => prev.filter(t => t.id !== id)), 900);
  };

  const formatTime = (timeInSeconds: number) => {
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  // Assuming a mock duration of 200 for calculation from context
  const displayCurrentTime = isNaN(currentTime) ? 0 : currentTime;
  const displayDuration = isNaN(duration) || duration === 0 ? 0 : duration;

  return (
    <AnimatePresence>
      {!isExpanded && currentSong && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-center py-6 px-10 pointer-events-none"
        >
          {/* Floating Queue Sidebar */}
          <AnimatePresence>
            {isQueueVisible && (
              <motion.div
                 initial={{ x: 20, y: 20, scale: 0.9, opacity: 0, transformOrigin: "bottom right" }}
                 animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                 exit={{ x: 20, y: 20, scale: 0.9, opacity: 0 }}
                 transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
                 className="absolute bottom-[100%] right-10 mb-2 w-[400px] max-h-[60vh] bg-black/70 backdrop-blur-3xl z-[100] rounded-3xl p-6 overflow-y-auto no-scrollbar shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.5)] border border-white/10 pointer-events-auto flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Up Next</h3>
                  <button onClick={toggleQueue} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>

                {userQueue.length === 0 && contextQueue.length === 0 ? (
                  <div className="text-white/40 text-center mt-6 text-sm">Your queue is empty.</div>
                ) : (
                  <div className="flex flex-col gap-6 flex-1 pb-4">
                    {/* User Queue (Reorderable) */}
                    {userQueue.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-accent mb-1">Queued</span>
                        <Reorder.Group axis="y" values={userQueue} onReorder={reorderUserQueue} className="flex flex-col gap-2">
                          {userQueue.map((s) => {
                            let itemRef: HTMLDivElement | null = null;
                            return (
                              <Reorder.Item key={s.id} value={s}>
                                <div
                                  ref={el => { itemRef = el; }}
                                  className="group/qitem p-2 bg-white/5 hover:bg-white/10 cursor-grab active:cursor-grabbing rounded-xl flex items-center gap-3 transition-colors border border-white/5"
                                >
                                  <span className="material-symbols-outlined text-white/20 text-sm cursor-grab active:cursor-grabbing flex-shrink-0">drag_indicator</span>
                                  <img src={s.albumArt} alt={s.title} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span className="font-bold text-white truncate text-sm">{s.title}</span>
                                    <span className="text-xs text-white/50 truncate font-medium">{s.artist}</span>
                                  </div>
                                  <button
                                    onPointerDown={e => e.stopPropagation()}
                                    onClick={e => { e.stopPropagation(); snipSong(s, itemRef); }}
                                    className="opacity-0 group-hover/qitem:opacity-100 transition-all text-white/40 hover:text-red-400 hover:rotate-12 active:scale-90 flex-shrink-0"
                                    title="Snip from queue"
                                  >
                                    <span className="material-symbols-outlined text-lg">content_cut</span>
                                  </button>
                                </div>
                              </Reorder.Item>
                            );
                          })}
                        </Reorder.Group>
                      </div>
                    )}
                    {/* TearAnimations live OUTSIDE the conditional — survive last-song removal */}
                    {tears.map(t => <TearAnimation key={t.id} rect={t.rect} song={t.song} />)}

                    {/* Context Queue (Static) */}
                    {contextQueue.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 mt-2 mb-1 flex items-center gap-2">
                          Coming up <span className="h-px bg-white/10 flex-1"></span>
                        </span>
                        {contextQueue.map((s, i) => (
                          <div key={`cq-${s.id}-${i}`} onClick={() => playSong(s, contextQueue)} className="p-2 bg-white/5 hover:bg-white/10 cursor-pointer rounded-xl flex items-center gap-3 opacity-60 hover:opacity-100 transition-all">
                            <span className="tabular-nums text-[10px] font-bold text-white/30 w-4 text-center">{i + 1}</span>
                            <img src={s.albumArt} alt={s.title} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="font-bold text-white truncate text-sm">{s.title}</span>
                              <span className="text-xs text-white/50 truncate font-medium">{s.artist}</span>
                            </div>
                            <button className="material-symbols-outlined text-white/0 hover:text-white transition-colors text-lg absolute right-4">play_arrow</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="w-full max-w-7xl glass-panel bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 px-8 shadow-xl flex items-center justify-between pointer-events-auto">
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
              <button 
                onClick={(e) => { e.stopPropagation(); toggleLike(currentSong); }}
                className={cn("hover:scale-110 active:scale-95 transition-all ml-2", likedSongs.some(s => s.id === currentSong.id) ? "text-accent" : "text-slate-400 hover:text-white")}
              >
                <span className={cn("material-symbols-outlined text-2xl", likedSongs.some(s => s.id === currentSong.id) ? "fill-[1]" : "")}>favorite</span>
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
              <button 
                onClick={(e) => { e.stopPropagation(); toggleLyrics(); }}
                className={cn("transition-colors", isLyricsVisible ? "text-accent" : "text-slate-400 hover:text-white")}
              >
                <span className="material-symbols-outlined text-2xl">lyrics</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); toggleQueue(); }}
                className={cn("transition-colors", isQueueVisible ? "text-accent" : "text-slate-400 hover:text-white")}
              >
                <span className="material-symbols-outlined text-2xl">queue_music</span>
              </button>
              <VolumeSlider volume={volume} setVolume={setVolume} className="w-36 ml-1" />
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
