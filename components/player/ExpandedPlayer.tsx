"use client";

import { usePlayer } from "@/context/PlayerContext";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { LiveLyrics } from "./LiveLyrics";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { VolumeSlider } from "./VolumeSlider";
import { TearAnimation } from "./QueueItem";
import { Song } from "@/types/music";

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentSong?.title || "Listen to this song",
          text: `Listening to ${currentSong?.title} on EchoStream!`,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleMoreOptions = () => {
    alert("More options module coming soon!");
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
              <button onClick={handleShare} className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors shadow-lg backdrop-blur-md">
                <span className="material-symbols-outlined text-sm">share</span>
              </button>
              <button onClick={handleMoreOptions} className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors shadow-lg backdrop-blur-md">
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

            {/* Right: Lyrics Only */}
            <div className="w-full lg:w-[55%] h-[80vh] flex flex-col justify-center max-w-[800px]">
               <LiveLyrics lyrics={currentSong.lyrics} currentTime={currentTime} />
            </div>
          </div>

          {/* Left: Up Next Bouncy Sidebar */}
          <AnimatePresence>
            {isQueueVisible && (
              <motion.div
                 initial={{ x: '-100%', borderTopRightRadius: '100%', borderBottomRightRadius: '100%' }}
                 animate={{ x: 0, borderTopRightRadius: '0%', borderBottomRightRadius: '0%' }}
                 exit={{ x: '-100%', borderTopRightRadius: '100%', borderBottomRightRadius: '100%' }}
                 transition={{ type: 'spring', bounce: 0.35, duration: 0.6 }}
                 className="absolute left-0 top-0 bottom-0 w-80 bg-black/60 backdrop-blur-3xl z-40 p-6 pt-24 overflow-y-auto no-scrollbar shadow-[20px_0_40px_-10px_rgba(0,0,0,0.5)] border-r border-white/5 flex flex-col"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-white">Up Next</h3>
                  <button onClick={toggleQueue} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>

                {userQueue.length === 0 && contextQueue.length === 0 ? (
                  <div className="text-white/40 text-center mt-10">Your queue is empty.</div>
                ) : (
                  <div className="flex flex-col gap-6 mask-image-bottom-fade flex-1 pb-40">
                    {/* User Queue (Reorderable) */}
                    {userQueue.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-accent mb-2">Queued</span>
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
                    {/* TearAnimations outside conditional — survives last-song removal */}
                    {tears.map(t => <TearAnimation key={t.id} rect={t.rect} song={t.song} />)}
                    {/* Context Queue (Static) */}
                    {contextQueue.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2 mt-4 flex items-center gap-2">
                          Coming up <span className="h-px bg-white/10 flex-1"></span>
                        </span>
                        {contextQueue.map((s, i) => (
                          <div key={`cq-${s.id}-${i}`} onClick={() => playSong(s, contextQueue)} className="p-2 bg-white/5 hover:bg-white/10 cursor-pointer rounded-xl flex items-center gap-3 opacity-60 hover:opacity-100 transition-all">
                            <span className="tabular-nums text-xs font-bold text-white/30 w-4 text-center">{i + 1}</span>
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
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleLike(currentSong); }}
                    className={cn("hover:scale-110 active:scale-95 transition-all ml-2", likedSongs.some(s => s.id === currentSong.id) ? "text-accent" : "text-white")}
                  >
                    <span className={cn("material-symbols-outlined text-2xl", likedSongs.some(s => s.id === currentSong.id) ? "fill-[1]" : "")}>favorite</span>
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
                  <button onClick={toggleLyrics} className={`transition-colors ${isLyricsVisible ? "text-accent" : "text-white/50 hover:text-white"}`}>
                    <span className="material-symbols-outlined text-xl">lyrics</span>
                  </button>
                  <button onClick={toggleQueue} className={`transition-colors ${isQueueVisible ? "text-accent" : "text-white/50 hover:text-white"}`}>
                    <span className="material-symbols-outlined text-xl">queue_music</span>
                  </button>
                  <VolumeSlider volume={volume} setVolume={setVolume} className="w-36 ml-2" />
                </div>

              </div>
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
