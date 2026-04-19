"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Song, Playlist } from "@/types/music";
import { parseLrc } from "@/lib/lrcParser";
import YouTube from 'react-youtube';

// ---------------------------------------------------------------------------
// PlaybackSource: tracks which playlist/context the current song came from.
// This allows Next/Previous to stay within that exact source.
// ---------------------------------------------------------------------------
export interface PlaybackSource {
  /** Human-readable ID, e.g. 'search', 'liked', 'local', 'playlist-xyz' */
  sourceId: string;
  /** The FULL ordered list of songs in this source */
  originalArray: Song[];
}

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  isExpanded: boolean;
  togglePlay: () => void;
  seek: (progress: number) => void;
  toggleExpanded: () => void;
  volume: number;
  setVolume: (v: number) => void;
  isShuffle: boolean;
  toggleShuffle: () => void;
  isRepeat: boolean;
  toggleRepeat: () => void;
  userQueue: Song[];
  contextQueue: Song[];
  history: Song[];
  playbackSource: PlaybackSource | null;
  playSong: (song: Song, source?: any) => void;
  addToQueue: (song: Song) => void;
  reorderUserQueue: (newQueue: Song[]) => void;
  removeFromUserQueue: (songId: string) => void;
  playNext: () => void;
  playPrevious: () => void;
  likedSongs: Song[];
  toggleLike: (song: Song) => void;
  playlists: Playlist[];
  createPlaylist: (title: string) => void;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  lyricsMode: 'word' | 'line' | 'hidden';
  isLyricsVisible: boolean;
  toggleLyrics: () => void;
  isQueueVisible: boolean;
  toggleQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // YouTube Player
  const [ytPlayer, setYtPlayer] = useState<any>(null);
  const [ytVideoId, setYtVideoId] = useState<string | null>(null);

  const [userQueue, setUserQueue] = useState<Song[]>([]);
  const [contextQueue, setContextQueue] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);

  // Synchronous tracking refs — never read stale state from closures
  const currentSongRef = useRef<Song | null>(null);
  const userQueueRef = useRef<Song[]>([]);
  const contextQueueRef = useRef<Song[]>([]);
  const historyRef = useRef<Song[]>([]);
  const isShuffleRef = useRef(isShuffle);
  const isRepeatRef = useRef(isRepeat);

  // PlaybackSource: the full roster of the active playlist/context
  const [playbackSource, setPlaybackSource] = useState<PlaybackSource | null>(null);
  const playbackSourceRef = useRef<PlaybackSource | null>(null);

  // UI States for toggles
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [lyricsMode, setLyricsMode] = useState<'word' | 'line' | 'hidden'>('word');
  const [isQueueVisible, setIsQueueVisible] = useState(false);

  const isLyricsVisible = lyricsMode !== 'hidden';

  const toggleLike = (song: Song) => {
    setLikedSongs(prev =>
      prev.some(s => s.id === song.id) ? prev.filter(s => s.id !== song.id) : [...prev, song]
    );
  };
  const toggleLyrics = () => {
    setLyricsMode(prev => {
      if (prev === 'word') return 'line';
      if (prev === 'line') return 'hidden';
      return 'word';
    });
  };
  const createPlaylist = (title: string) => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      title,
      description: "Custom playlist",
      coverArt: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f4a7?q=80&w=500&auto=format&fit=crop",
      songs: []
    };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const addSongToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        // Avoid duplicates
        if (p.songs.some(s => s.id === song.id)) return p;
        const newSongs = [...p.songs, song];
        // Dynamic cover art from first song
        const coverArt = p.songs.length === 0 ? song.albumArt : p.coverArt;
        return { ...p, songs: newSongs, coverArt };
      }
      return p;
    }));
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(s => s.id !== songId) };
      }
      return p;
    }));
  };

  const toggleQueue = () => {
    setIsQueueVisible(prev => !prev);
  };

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  const setVolume = (v: number) => setVolumeState(v);
  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setIsRepeat(!isRepeat);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isYoutubeModeRef = useRef(false);

  // Use Refs to avoid stale closures in event listeners
  const playNextRef = useRef<() => void>(() => { });
  useEffect(() => {
    playNextRef.current = playNext;
  });

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  // Stable refs for keyboard shortcut callbacks
  const togglePlayRef = useRef<() => void>(() => { });
  const isExpandedRef = useRef(isExpanded);
  useEffect(() => { isExpandedRef.current = isExpanded; }, [isExpanded]);

  // Handle YouTube Time Update loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && isYoutubeModeRef.current && ytPlayer) {
      interval = setInterval(async () => {
        try {
          const cTime = await ytPlayer.getCurrentTime();
          const dur = await ytPlayer.getDuration();
          if (dur > 0) {
            setCurrentTime(cTime);
            setDuration(dur);
            setProgress(cTime / dur);
          }
        } catch (e) { }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, ytPlayer]);

  // Initialize audio element only on client
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setDuration(audio.duration);
        setProgress(audio.currentTime / audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setProgress(1);
      // Advance to next song automatically
      playNextRef.current();
    };

    const handleError = () => {
      console.warn("Failed to load audio source.");
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Persistence: Load from localStorage
  useEffect(() => {
    const savedLiked = localStorage.getItem('echo-likedSongs');
    if (savedLiked) setLikedSongs(JSON.parse(savedLiked));

    const savedPlaylists = localStorage.getItem('echo-playlists');
    if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));
  }, []);

  // Persistence: Save to localStorage
  useEffect(() => {
    localStorage.setItem('echo-likedSongs', JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem('echo-playlists', JSON.stringify(playlists));
  }, [playlists]);

  // Sync volume state to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    try {
      if (ytPlayer && ytPlayer.getIframe()) {
        ytPlayer.setVolume(volume * 100);
      }
    } catch (e) { }
  }, [volume, ytPlayer]);

  const handleYtStateChange = (event: any) => {
    // YT.PlayerState.PLAYING = 1, ENDED = 0, PAUSED = 2
    if (event.data === 1) {
      setIsPlaying(true);
    } else if (event.data === 2) {
      setIsPlaying(false);
    } else if (event.data === 0) {
      setProgress(1);
      // Advance to next song when current one ends, respecting isRepeat in playNext
      playNextRef.current();
    }
  };

  const playSongInstance = async (song: Song) => {
    // Attempt auto-fetching lyrics if file has none
    let enhancedSong = { ...song };
    if (!song.lyrics || song.lyrics.length === 0) {
      try {
        const query = new URLSearchParams({
          track_name: song.title,
          artist_name: song.artist === "Local Device" || song.artist === "Local Folder" ? "" : song.artist,
          album_name: song.album === "Local Folder" ? "" : song.album
        }).toString();

        const res = await fetch(`https://lrclib.net/api/get?${query}`);
        if (res.ok) {
          const data = await res.json();
          if (data.syncedLyrics) {
            enhancedSong.lyrics = parseLrc(data.syncedLyrics);
          } else if (data.plainLyrics) {
            enhancedSong.lyrics = [{ time: 0, text: data.plainLyrics }];
          }
        }
      } catch (e) {
        console.warn("Failed to fetch lyrics automatically", e);
      }
    }

    if (!enhancedSong.lyrics) {
      enhancedSong.lyrics = [];
    }

    // Synchronous ref update for rapid clicks
    const isYoutube = enhancedSong.audioUrl.startsWith("youtube:");
    isYoutubeModeRef.current = isYoutube;

    // Synchronous ref update for rapid clicks
    // Synchronous ref update for rapid clicks
    currentSongRef.current = enhancedSong;
    setCurrentSong(enhancedSong);

    if (isYoutube) {
      if (audioRef.current) audioRef.current.pause();

      const vId = enhancedSong.audioUrl.split(":")[1];
      setYtVideoId(vId);

      if (ytPlayer) {
        try {
          ytPlayer.loadVideoById(vId);
          ytPlayer.playVideo();
        } catch (e) { }
      }
    } else {
      setYtVideoId(null);
      if (ytPlayer) {
        try { ytPlayer.pauseVideo(); } catch (e) { }
      }
      setYtPlayer(null);

      if (audioRef.current) {
        audioRef.current.src = enhancedSong.audioUrl;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsPlaying(true);
          }).catch((err) => {
            console.warn("Autoplay was prevented or audio failed:", err);
            setIsPlaying(false);
          });
        }
      } else {
        setIsPlaying(true);
      }
    }
  };

  /**
   * playSong — play a specific song with an optional source list.
   */
  const playSong = (song: Song, source?: any) => {
    // 1. Push current song to history before switching
    if (currentSongRef.current) {
      const newHistory = [...historyRef.current, currentSongRef.current];
      historyRef.current = newHistory;
      setHistory(newHistory);
    }

    // Update PlaybackSource + contextQueue
    let ps: PlaybackSource;
    if (source) {
      // Handle both { id, list } and plain Song[] array formats
      if (Array.isArray(source)) {
        ps = { sourceId: 'source-' + Date.now(), originalArray: source };
      } else if (source.list) {
        ps = { sourceId: source.id || 'source-' + Date.now(), originalArray: source.list };
      } else {
        ps = { sourceId: 'standalone', originalArray: [song] };
      }
    } else {
      // If we already have a source, and the new song is part of it, KEEP IT.
      const currentArr = playbackSourceRef.current?.originalArray || [];
      const foundIdx = currentArr.findIndex(s => String(s?.id) === String(song.id));
      if (foundIdx !== -1) {
        ps = playbackSourceRef.current!;
      } else {
        // Fallback to singleton source only if absolutely necessary
        ps = { sourceId: 'standalone-' + Date.now(), originalArray: [song] };
      }
    }

    playbackSourceRef.current = ps;
    setPlaybackSource(ps);

    // Update contextQueue (songs coming after this one in the source)
    const list = ps?.originalArray || [song];
    const songIdStr = String(song?.id);
    const idx = list.findIndex(s => String(s?.id) === songIdStr);
    
    // Safety: If the song isn't in the list for some reason, we must add it or we'll get stuck
    if (idx === -1 && ps.originalArray.length > 0) {
       // This shouldn't happen with the logic above, but safety first.
    }

    const remaining = idx !== -1 ? list.slice(idx + 1) : [];
    contextQueueRef.current = remaining;
    setContextQueue(remaining);

    currentSongRef.current = song;
    playSongInstance(song);
  };

  const addToQueue = (song: Song) => {
    setUserQueue(prev => [...prev, song]);
    userQueueRef.current = [...userQueueRef.current, song];
  };

  const reorderUserQueue = (newQueue: Song[]) => {
    setUserQueue(newQueue);
    userQueueRef.current = newQueue;
  };

  const removeFromUserQueue = (songId: string) => {
    const newQueue = userQueueRef.current.filter(s => s.id !== songId);
    userQueueRef.current = newQueue;
    setUserQueue(newQueue);
  };

  const playNext = () => {
    // 1. Prioritize User Queue (Manual)
    if (userQueueRef.current.length > 0) {
      if (currentSongRef.current) {
        setHistory(prev => [...prev, currentSongRef.current!]);
        historyRef.current = [...historyRef.current, currentSongRef.current!];
      }
      const [next, ...rest] = userQueueRef.current;
      userQueueRef.current = rest;
      setUserQueue(rest);
      playSongInstance(next);
      return;
    }

    // 2. Playlist Navigation
    const ps = playbackSourceRef.current;
    if (ps && ps.originalArray && ps.originalArray.length > 0) {
      const arr = ps.originalArray;
      const curId = currentSongRef.current?.id;
      const curIdx = arr.findIndex(s => String(s?.id) === String(curId));
      
      let nextIdx: number;

      if (isShuffleRef.current) {
        if (arr.length > 1) {
          nextIdx = curIdx;
          while (nextIdx === curIdx) {
            nextIdx = Math.floor(Math.random() * arr.length);
          }
        } else {
          nextIdx = 0;
        }
      } else {
        // Sequential - If we can't find the current song, start from 0
        nextIdx = curIdx === -1 ? 0 : curIdx + 1;

        // Loop back to start if we exceed the length
        if (nextIdx >= arr.length) {
          nextIdx = 0;
        }
      }

      const next = arr[nextIdx];
      
      // Update history
      if (currentSongRef.current) {
         setHistory(prev => [...prev, currentSongRef.current!]);
         historyRef.current = [...historyRef.current, currentSongRef.current!];
      }

      // Update remaining queue display
      const remaining = arr.slice(nextIdx + 1);
      contextQueueRef.current = remaining;
      setContextQueue(remaining);

      playSongInstance(next);
      return;
    }

    // Fallback: If absolutely no source, just stop
    setIsPlaying(false);
    if (isYoutubeModeRef.current && ytPlayer) try { ytPlayer.pauseVideo(); } catch(e) {}
  };

  const playPrevious = () => {
    // 1. Smart Restart
    if (currentTime > 3) {
      if (isYoutubeModeRef.current && ytPlayer) try { ytPlayer.seekTo(0); } catch(e) {}
      else if (audioRef.current) audioRef.current.currentTime = 0;
      return;
    }

    // 2. History Navigation
    if (historyRef.current.length > 0) {
      const prevSong = historyRef.current[historyRef.current.length - 1];
      const newHistory = historyRef.current.slice(0, -1);
      historyRef.current = newHistory;
      setHistory(newHistory);
      
      playSongInstance(prevSong);
      return;
    }

    // 3. Fallback to Playlist Order
    const ps = playbackSourceRef.current;
    if (ps && ps.originalArray.length > 0) {
       const arr = ps.originalArray;
       const curIdx = arr.findIndex(s => String(s?.id) === String(currentSongRef.current?.id));
       const prevIdx = (curIdx - 1 + arr.length) % arr.length;
       playSongInstance(arr[prevIdx]);
       return;
    }

    if (isYoutubeModeRef.current && ytPlayer) try { ytPlayer.seekTo(0); } catch(e) {}
    else if (audioRef.current) audioRef.current.currentTime = 0;
  };


  const togglePlay = () => {
    if (!currentSong) return;

    if (isYoutubeModeRef.current && ytPlayer) {
      if (isPlaying) {
        ytPlayer.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayer.playVideo();
        setIsPlaying(true);
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    }
  };

  useEffect(() => { togglePlayRef.current = togglePlay; });

  const seek = (newProgress: number) => {
    if (isYoutubeModeRef.current && ytPlayer && duration) {
      const newTime = newProgress * duration;
      ytPlayer.seekTo(newTime);
      setCurrentTime(newTime);
      setProgress(newProgress);
    } else if (audioRef.current && audioRef.current.duration) {
      const newTime = newProgress * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(newProgress);
    }
  };

  // Moved higher up

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        togglePlayRef.current();
      }

      if (e.key === 'Escape') {
        setIsExpanded(false);
      }

      if (e.key.toLowerCase() === 'f') {
        setIsExpanded(prev => !prev);
      }

      if (e.key.toLowerCase() === 'q') {
        setIsQueueVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        progress,
        currentTime,
        duration,
        isExpanded,
        playSong,
        togglePlay,
        seek,
        toggleExpanded,
        volume,
        setVolume,
        isShuffle,
        toggleShuffle,
        isRepeat,
        toggleRepeat,
        userQueue,
        contextQueue,
        history,
        playbackSource,
        addToQueue,
        reorderUserQueue,
        removeFromUserQueue,
        playNext,
        playPrevious,
        likedSongs,
        toggleLike,
        playlists,
        createPlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        lyricsMode,
        isLyricsVisible,
        toggleLyrics,
        isQueueVisible,
        toggleQueue,
      }}
    >
      <div className="hidden">
        {ytVideoId && (
          <YouTube
            videoId={ytVideoId}
            opts={{
              height: '0',
              width: '0',
              playerVars: {
                autoplay: 1,
                controls: 0,
                modestbranding: 1,
                playsinline: 1,
              }
            }}
            onReady={(event: any) => {
              setYtPlayer(event.target);
              event.target.setVolume(volume * 100);
            }}
            onStateChange={handleYtStateChange}
          />
        )}
      </div>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
