"use client";

import { useState, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { cn } from "@/lib/utils";
import { VolumeSlider } from "./VolumeSlider";
import { TearAnimation } from "./QueueItem";
import { Song } from "@/types/music";
import { MOCK_SONGS } from "@/lib/mockData";

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
    isQueueLanding,
    userQueue,
    contextQueue,
    history,
    reorderUserQueue,
    removeFromUserQueue,
    playSong,
    isAlbumVisible,
    toggleAlbum,
    setViewingAlbumName,
    currentAlbumSongs,
    currentAlbumLoading,
    localSongs,
    searchResults,
    playlists
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

  // Aggregate all unique songs across all known sources
  const allAvailableSongs = [
    ...MOCK_SONGS,
    ...localSongs,
    ...likedSongs,
    ...playlists.flatMap(p => p.songs),
    ...searchResults,
    ...userQueue,
    ...contextQueue,
    ...history,
    ...(currentSong ? [currentSong] : [])
  ];

  // Unique songs by ID, filter out any undefined elements
  const uniqueSongs = Array.from(new Map(allAvailableSongs.filter(Boolean).map(s => [s.id, s])).values());

  // currentAlbumSongs is retrieved from PlayerContext

  // Group unique songs to form suggested albums
  const albumsMap = new Map<string, { name: string; artist: string; coverArt: string; albumId?: string; songs: Song[] }>();
  uniqueSongs.forEach(s => {
    if (!s || !s.album || s.album === "Unknown Album" || s.album === "Local Folder" || s.album === "Local Device") return;
    const albumKey = s.album.toLowerCase();
    if (!albumsMap.has(albumKey)) {
      albumsMap.set(albumKey, {
        name: s.album,
        artist: s.artist,
        coverArt: s.albumArt,
        albumId: s.albumId,
        songs: []
      });
    }
    albumsMap.get(albumKey)!.songs.push(s);
  });

  const allAlbums = Array.from(albumsMap.values());
  const similarAlbums = allAlbums.filter(a => a && a.name.toLowerCase() !== currentSong.album.toLowerCase());

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
          {/* Floating Album Sidebar */}
          <AnimatePresence>
            {isAlbumVisible && (
              <motion.div
                initial={{ x: -20, y: 20, scale: 0.9, opacity: 0, transformOrigin: "bottom left" }}
                animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                exit={{ x: -20, y: 20, scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
                className="absolute bottom-[110%] left-10 mb-2 w-96 max-h-[60vh] glass-panel bg-black/40 backdrop-blur-xl z-[100] rounded-[2.5rem] p-6 overflow-y-auto no-scrollbar pointer-events-auto flex flex-col text-white"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Album Info</h3>
                  <button onClick={toggleAlbum} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
                {/* Current Album Square Tile */}
                <div
                  onClick={() => {
                    setViewingAlbumName(currentSong.album, currentSong.albumId);
                    if (isAlbumVisible) toggleAlbum();
                  }}
                  className="relative w-full aspect-square rounded-[1.8rem] overflow-hidden border border-white/10 cursor-pointer group shadow-2xl mb-6 flex-shrink-0"
                >
                  <img
                    src={currentSong.albumArt}
                    alt={currentSong.album}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Glass overlay with album name only */}
                  <div className="absolute inset-x-3 bottom-3 bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex flex-col justify-center text-left transition-all group-hover:bg-black/60">
                    <h4 className="font-bold text-white text-sm truncate leading-snug group-hover:text-accent transition-colors">
                      {currentSong.album}
                    </h4>
                  </div>
                </div>

                {/* Album Tracks */}
                <div className="flex flex-col gap-2 mb-6">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-accent mb-1">Album Tracks</span>
                  <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto no-scrollbar">
                    {currentAlbumLoading ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-2">
                        <span className="material-symbols-outlined text-lg text-accent animate-spin">sync</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Loading tracks...</span>
                      </div>
                    ) : currentAlbumSongs.length === 0 ? (
                      <div className="text-slate-500 text-xs py-2 italic text-center">No tracks found</div>
                    ) : (
                      currentAlbumSongs.map((s, i) => (
                        <div
                          key={`bottomalbum-${s.id}-${i}`}
                          onClick={() => playSong(s, currentAlbumSongs)}
                          className={cn(
                            "p-2 rounded-xl flex items-center gap-3 cursor-pointer transition-all border border-transparent text-xs",
                            s.id === currentSong.id
                              ? "bg-accent/15 border-accent/20 text-accent font-bold"
                              : "bg-white/5 hover:bg-white/10 opacity-70 hover:opacity-100"
                          )}
                        >
                          <span className="tabular-nums text-[10px] w-4 text-center">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="truncate">{s.title}</p>
                          </div>
                          {s.id === currentSong.id && isPlaying && (
                            <span className="material-symbols-outlined text-[10px] animate-spin">sync</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Suggested Albums */}
                {similarAlbums.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1 flex items-center gap-2">
                      Suggested Albums <span className="h-px bg-white/10 flex-1"></span>
                    </span>
                    <div className="flex flex-col gap-2 pb-2">
                      {similarAlbums.map((album, i) => (
                        <div
                          key={`bottom-sim-album-${album.name}-${i}`}
                          onClick={() => {
                            setViewingAlbumName(album.name, album.albumId);
                            if (isAlbumVisible) toggleAlbum();
                          }}
                          className="p-2 bg-white/5 hover:bg-white/10 cursor-pointer rounded-xl flex items-center gap-3 transition-all border border-white/5 hover:border-white/10 group"
                        >
                          <img
                            src={album.coverArt}
                            alt={album.name}
                            className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                          />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-bold text-white truncate text-xs group-hover:text-accent transition-colors">{album.name}</span>
                            <span className="text-[9px] text-white/50 truncate">{album.artist} • {album.songs.length} Tracks</span>
                          </div>
                          <span className="material-symbols-outlined text-white/30 group-hover:text-white transition-colors text-sm">arrow_forward</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Queue Sidebar */}
          <AnimatePresence>
            {isQueueVisible && (
              <motion.div
                initial={{ x: 20, y: 20, scale: 0.9, opacity: 0, transformOrigin: "bottom right" }}
                animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                exit={{ x: 20, y: 20, scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
                className="absolute bottom-[110%] right-10 mb-2 w-96 max-h-[60vh] glass-panel bg-black/40 backdrop-blur-xl z-[100] rounded-[2.5rem] p-6 overflow-y-auto no-scrollbar pointer-events-auto flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Up Next</h3>
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

          <footer className="w-full max-w-7xl glass-panel bg-black/10 backdrop-blur-xl rounded-[2.5rem] p-3 px-8 shadow-2xl flex items-center justify-between pointer-events-auto transition-all">
            {/* Now Playing */}
            <div className="flex items-center gap-4 w-1/4">
              <div
                className="size-16 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-accent/20 cursor-pointer"
                onClick={toggleExpanded}
              >
                <img alt={currentSong.title} className="w-full h-full object-cover" src={currentSong.albumArt} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <a
                  className="text-sm font-bold text-white hover:text-accent truncate transition-colors cursor-pointer"
                  onClick={(e) => { e.preventDefault(); toggleExpanded(); }}
                >
                  {currentSong.title}
                </a>
                <a className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hover:text-white truncate transition-colors cursor-pointer">{currentSong.artist}</a>
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
                <button onClick={playPrevious} className="text-white/80 hover:text-white hover:scale-110 transition-all">
                  <span className="material-symbols-outlined text-3xl">skip_previous</span>
                </button>
                <button
                  onClick={togglePlay}
                  className="size-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  <span className="material-symbols-outlined fill-[1] text-3xl">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <button onClick={playNext} className="text-white/80 hover:text-white hover:scale-110 transition-all">
                  <span className="material-symbols-outlined text-3xl">skip_next</span>
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
                  className="h-1 flex-1 bg-white/5 rounded-full relative group cursor-pointer overflow-hidden"
                  onClick={handleSeek}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-accent rounded-full pointer-events-none shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    style={{ width: `${progress * 100}%` }}
                  ></div>
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
                <span className="text-[10px] text-slate-500 font-bold tabular-nums w-8">
                  {formatTime(displayDuration)}
                </span>
              </div>
            </div>

            {/* Volume & Tools */}
            <div className="flex items-center justify-end gap-5 w-1/4">
              <button
                id="bottom-queue-btn"
                onClick={(e) => { e.stopPropagation(); toggleQueue(); }}
                className={cn("relative transition-colors p-1.5 rounded-lg", isQueueVisible ? "text-accent" : "text-slate-400 hover:text-white")}
              >
                <span className="material-symbols-outlined text-2xl relative z-10">queue_music</span>
                <AnimatePresence>
                  {isQueueLanding && (
                    <motion.div 
                      key="queue-landing-pulse"
                      className="absolute inset-0 bg-accent/20 rounded-lg z-0"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: [0, 1, 0], scale: [0.8, 1.4, 1.1] }}
                      transition={{ duration: 0.6 }}
                    />
                  )}
                </AnimatePresence>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleAlbum(); }}
                className={cn("transition-colors", isAlbumVisible ? "text-accent" : "text-slate-400 hover:text-white")}
                title="Album panel"
              >
                <span className="material-symbols-outlined text-2xl">album</span>
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
