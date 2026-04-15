"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Song } from "@/types/music";
import { parseLrc } from "@/lib/lrcParser";

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
  
  const [userQueue, setUserQueue] = useState<Song[]>([]);
  const [contextQueue, setContextQueue] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Use Refs to avoid stale closures in event listeners
  const playNextRef = useRef<() => void>(() => {});
  useEffect(() => {
    playNextRef.current = playNext;
  });

  const isRepeatRef = useRef(isRepeat);
  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  // Initialize audio element only on client
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setProgress(1);
      if (isRepeatRef.current && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
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
  }, [volume]);

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
    }
  };

  const playPrevious = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    if (history.length > 0) {
      const prevSong = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      
      if (currentSong) {
        setContextQueue(prev => [currentSong, ...prev]);
      }

      playSongInstance(prevSong);
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const togglePlay = () => {
    if (currentSong && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    } else if (currentSong) {
      setIsPlaying(!isPlaying);
    }
  };

  const seek = (newProgress: number) => {
    if (audioRef.current && audioRef.current.duration) {
      const newTime = newProgress * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(newProgress);
    }
  };

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  
  const setVolume = (v: number) => {
    setVolumeState(v);
  };
  
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
