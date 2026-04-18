"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Song } from "@/types/music";
import { parseLrc } from "@/lib/lrcParser";
import YouTube from 'react-youtube';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number; // 0 to 1
  currentTime: number; // in seconds
  duration: number; // in seconds
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
  playSong: (song: Song, context?: Song[]) => void;
  addToQueue: (song: Song) => void;
  playNext: () => void;
  playPrevious: () => void;
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isYoutubeModeRef = useRef(false);

  // Use Refs to avoid stale closures in event listeners
  const playNextRef = useRef<() => void>(() => {});
  useEffect(() => {
    playNextRef.current = playNext;
  });

  const isRepeatRef = useRef(isRepeat);
  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

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
        } catch (e) {}
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
      if (isRepeatRef.current && audioRef.current) {
         if (isYoutubeModeRef.current && ytPlayer) {
            ytPlayer.seekTo(0);
            ytPlayer.playVideo();
         } else {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
         }
      } else {
        playNextRef.current();
      }
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

  // Sync volume state to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    try {
      if (ytPlayer && ytPlayer.getIframe()) {
        ytPlayer.setVolume(volume * 100);
      }
    } catch (e) {}
  }, [volume, ytPlayer]);

  const handleYtStateChange = (event: any) => {
    // YT.PlayerState.PLAYING = 1, ENDED = 0, PAUSED = 2
    if (event.data === 1) {
      setIsPlaying(true);
    } else if (event.data === 2) {
      setIsPlaying(false);
    } else if (event.data === 0) {
      setProgress(1);
      if (isRepeatRef.current && ytPlayer) {
        ytPlayer.seekTo(0);
        ytPlayer.playVideo();
      } else {
        playNextRef.current();
      }
    }
  };

  const playSongInstance = async (song: Song) => {
    // Attempt auto-fetching lyrics if local file has none
    let enhancedSong = { ...song };
    if (song.id.startsWith("local-") && song.lyrics.length === 0) {
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

    setCurrentSong(enhancedSong);
    
    const isYoutube = enhancedSong.audioUrl.startsWith("youtube:");
    isYoutubeModeRef.current = isYoutube;

    if (isYoutube) {
      if (audioRef.current) audioRef.current.pause();
      
      const vId = enhancedSong.audioUrl.split(":")[1];
      setYtVideoId(vId);

      if (ytPlayer) {
        try {
          ytPlayer.loadVideoById(vId);
          ytPlayer.playVideo();
        } catch (e) {}
      }
      // state changes handled by handleYtStateChange
    } else {
      setYtVideoId(null);
      if (ytPlayer) {
         try { ytPlayer.pauseVideo(); } catch(e) {}
      }
      setYtPlayer(null); // Clear orphaned player reference when unmounted

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

  const playSong = (song: Song, context?: Song[]) => {
    if (currentSong) {
      setHistory(prev => [...prev, currentSong]);
    }

    if (context) {
      const songIndex = context.findIndex(s => s.id === song.id);
      if (songIndex !== -1) {
        setContextQueue(context.slice(songIndex + 1));
      } else {
        setContextQueue([]);
      }
    }

    playSongInstance(song);
  };

  const addToQueue = (song: Song) => {
    setUserQueue(prev => [...prev, song]);
  };

  const playNext = () => {
    if (currentSong) {
      setHistory(prev => [...prev, currentSong]);
    }

    if (userQueue.length > 0) {
      const nextSong = userQueue[0];
      setUserQueue(prev => prev.slice(1));
      playSongInstance(nextSong);
    } else if (contextQueue.length > 0) {
      let nextSong = contextQueue[0];
      if (isShuffle) {
         const randomIndex = Math.floor(Math.random() * contextQueue.length);
         nextSong = contextQueue[randomIndex];
         setContextQueue(prev => prev.filter((_, i) => i !== randomIndex));
      } else {
         setContextQueue(prev => prev.slice(1));
      }
      playSongInstance(nextSong);
    } else {
       setIsPlaying(false);
       if (isYoutubeModeRef.current && ytPlayer) ytPlayer.pauseVideo();
    }
  };

  const playPrevious = () => {
    if (currentTime > 3) {
      if (isYoutubeModeRef.current && ytPlayer) {
        ytPlayer.seekTo(0);
      } else if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      return;
    }

    if (history.length > 0) {
      const prevSong = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      
      if (currentSong) {
        setContextQueue(prev => [currentSong, ...prev]);
      }

      playSongInstance(prevSong);
    } else {
      if (isYoutubeModeRef.current && ytPlayer) ytPlayer.seekTo(0);
      else if (audioRef.current) audioRef.current.currentTime = 0;
    }
  };


  const togglePlay = () => {
    if (!currentSong) return;
    
    if (isYoutubeModeRef.current && ytPlayer) {
      if (isPlaying) {
        ytPlayer.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayer.playVideo();
        setIsPlaying(true); // Will be synced by state change anyway
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

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  const setVolume = (v: number) => setVolumeState(v);
  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setIsRepeat(!isRepeat);

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
        addToQueue,
        playNext,
        playPrevious,
      }}
    >
      {/* Hidden YouTube Engine */}
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
