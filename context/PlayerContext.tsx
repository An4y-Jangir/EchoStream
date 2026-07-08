"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { Song, Playlist } from "@/types/music";
import { parseLrc } from "@/lib/lrcParser";
import YouTube from 'react-youtube';
import { MOCK_SONGS } from "@/lib/mockData";

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
  playNext: (isAutoEnd?: boolean | any) => void;
  playPrevious: () => void;
  likedSongs: Song[];
  toggleLike: (song: Song) => void;
  playlists: Playlist[];
  createPlaylist: (title: string) => void;
  deletePlaylist: (id: string) => void;
  updatePlaylist: (id: string, title: string, coverArt: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  lyricsMode: 'word' | 'line' | 'hidden';
  isLyricsVisible: boolean;
  toggleLyrics: () => void;
  isQueueVisible: boolean;
  toggleQueue: () => void;
  isQueueLanding: boolean;
  triggerQueueLanding: () => void;
  isAlbumVisible: boolean;
  toggleAlbum: () => void;
  viewingAlbumName: string | null;
  viewingAlbumId: string | null;
  setViewingAlbumName: (albumName: string | null, albumId?: string | null) => void;
  localSongs: Song[];
  setLocalSongs: React.Dispatch<React.SetStateAction<Song[]>>;
  searchResults: Song[];
  setSearchResults: React.Dispatch<React.SetStateAction<Song[]>>;
  crossfadeDuration: number;
  setCrossfadeDuration: (duration: number) => void;
  viewedAlbumSongs: Song[];
  viewedAlbumLoading: boolean;
  currentAlbumSongs: Song[];
  currentAlbumLoading: boolean;
  viewingArtistName: string | null;
  viewingArtistId: string | null;
  viewedArtistDetails: any | null;
  viewedArtistLoading: boolean;
  setViewingArtist: (name: string | null, id?: string | null) => void;
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

  // Cache for prefetched lyrics
  const prefetchedLyricsCache = useRef<Map<string, any[]>>(new Map());
  const currentlyFetchingLyrics = useRef<Set<string>>(new Set());

  // PlaybackSource: the full roster of the active playlist/context
  const [playbackSource, setPlaybackSource] = useState<PlaybackSource | null>(null);
  const playbackSourceRef = useRef<PlaybackSource | null>(null);

  // UI States for toggles
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [lyricsMode, setLyricsMode] = useState<'word' | 'line' | 'hidden'>('word');
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [isAlbumVisible, setIsAlbumVisible] = useState(false);
  const [viewingAlbumName, setViewingAlbumNameState] = useState<string | null>(null);
  const [viewingAlbumId, setViewingAlbumId] = useState<string | null>(null);

  const setViewingAlbumName = useCallback((albumName: string | null, albumId?: string | null) => {
    setViewingAlbumNameState(albumName);
    setViewingAlbumId(albumId || null);
  }, []);

  const [viewingArtistName, setViewingArtistNameState] = useState<string | null>(null);
  const [viewingArtistId, setViewingArtistId] = useState<string | null>(null);
  const [viewedArtistDetails, setViewedArtistDetails] = useState<any | null>(null);
  const [viewedArtistLoading, setViewedArtistLoading] = useState(false);

  const setViewingArtist = useCallback((artistName: string | null, artistId?: string | null) => {
    setViewingArtistNameState(artistName);
    setViewingArtistId(artistId || null);
  }, []);

  const [localSongs, setLocalSongs] = useState<Song[]>([]);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [crossfadeDuration, setCrossfadeDurationState] = useState(3);
  const [viewedAlbumSongs, setViewedAlbumSongs] = useState<Song[]>([]);
  const [viewedAlbumLoading, setViewedAlbumLoading] = useState(false);
  const [currentAlbumSongs, setCurrentAlbumSongs] = useState<Song[]>([]);
  const [currentAlbumLoading, setCurrentAlbumLoading] = useState(false);

  const crossfadeDurationRef = useRef(crossfadeDuration);
  useEffect(() => {
    crossfadeDurationRef.current = crossfadeDuration;
  }, [crossfadeDuration]);

  const getNextSong = (): Song | null => {
    // 1. Repeat Mode (single song repeat)
    if (isRepeatRef.current && currentSongRef.current) {
      return currentSongRef.current;
    }

    // 2. User Queue
    if (userQueueRef.current.length > 0) {
      return userQueueRef.current[0];
    }

    // 3. Playback Source
    const ps = playbackSourceRef.current;
    if (ps && ps.originalArray && ps.originalArray.length > 0) {
      const arr = ps.originalArray;
      const curId = currentSongRef.current?.id;
      const curIdx = arr.findIndex(s => String(s?.id) === String(curId));
      
      if (isShuffleRef.current) {
        if (arr.length > 1) {
          let nextIdx = curIdx;
          while (nextIdx === curIdx) {
            nextIdx = Math.floor(Math.random() * arr.length);
          }
          return arr[nextIdx];
        }
      } else {
        const nextIdx = curIdx === -1 ? 0 : curIdx + 1;
        if (nextIdx < arr.length) {
          return arr[nextIdx];
        } else {
          const autoplay = typeof window !== "undefined" ? localStorage.getItem("echo-autoplay-next") !== "false" : true;
          if (autoplay) {
            // Loop the playlist: wrap around to the first song
            return arr[0];
          } else {
            return null;
          }
        }
      }
    }
    return null;
  };

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

  const updatePlaylist = (id: string, title: string, coverArt: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, title, coverArt };
      }
      return p;
    }));
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

  const [isQueueLanding, setIsQueueLanding] = useState(false);
  const triggerQueueLanding = () => {
    setIsQueueLanding(true);
    setTimeout(() => setIsQueueLanding(false), 1000);
  };

  const toggleAlbum = () => {
    setIsAlbumVisible(prev => !prev);
  };

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  const setVolume = (v: number) => setVolumeState(v);
  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setIsRepeat(!isRepeat);

  const audioRef1 = useRef<HTMLAudioElement | null>(null);
  const audioRef2 = useRef<HTMLAudioElement | null>(null);
  const activeAudioIndexRef = useRef<1 | 2>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isYoutubeModeRef = useRef(false);
  const isCrossfadingRef = useRef(false);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use Refs to avoid stale closures in event listeners
  const playNextRef = useRef<(isAutoEnd?: boolean | any) => void>(() => { });
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
  const fetchLyrics = async (song: Song): Promise<any[]> => {
    if (song.lyrics && song.lyrics.length > 0) return song.lyrics;

    const cached = prefetchedLyricsCache.current.get(song.id);
    if (cached) return cached;

    const query = new URLSearchParams({
      track_name: song.title,
      artist_name: song.artist === "Local Device" || song.artist === "Local Folder" ? "" : song.artist,
      album_name: song.album === "Local Folder" ? "" : song.album
    }).toString();

    try {
      const res = await fetch(`https://lrclib.net/api/get?${query}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      let lyricsList: any[] = [];
      if (data.syncedLyrics) {
        lyricsList = parseLrc(data.syncedLyrics);
      } else if (data.plainLyrics) {
        lyricsList = [{ time: 0, text: data.plainLyrics }];
      } else {
        lyricsList = [{ time: 0, text: "Lyrics unavailable" }];
      }
      prefetchedLyricsCache.current.set(song.id, lyricsList);
      return lyricsList;
    } catch (e) {
      console.warn("Failed to fetch lyrics:", e);
      const fallback = [{ time: 0, text: "Lyrics unavailable" }];
      prefetchedLyricsCache.current.set(song.id, fallback);
      return fallback;
    }
  };

  const prefetchLyrics = (song: Song) => {
    if (!song || (song.lyrics && song.lyrics.length > 0)) return;
    if (currentlyFetchingLyrics.current.has(song.id)) return;
    currentlyFetchingLyrics.current.add(song.id);
    fetchLyrics(song)
      .then(lyrics => {
        song.lyrics = lyrics;
      })
      .catch(() => {})
      .finally(() => {
        currentlyFetchingLyrics.current.delete(song.id);
      });
  };

  const triggerCrossfade = (nextSong: Song) => {
    if (isCrossfadingRef.current) return;
    isCrossfadingRef.current = true;

    // Clear any existing interval
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    // Determine active and inactive elements
    const activeAudio = activeAudioIndexRef.current === 1 ? audioRef1.current : audioRef2.current;
    const nextAudio = activeAudioIndexRef.current === 1 ? audioRef2.current : audioRef1.current;
    const nextIndex = activeAudioIndexRef.current === 1 ? 2 : 1;

    if (!activeAudio || !nextAudio) {
      isCrossfadingRef.current = false;
      return;
    }

    nextAudio.src = nextSong.audioUrl;
    nextAudio.volume = 0;
    
    // Play nextAudio immediately, transition UI and volume in parallel
    nextAudio.play()
      .then(() => {
        // Swap active references so the UI immediately switches to the next song
        if (currentSongRef.current) {
          const newHistory = [...historyRef.current, currentSongRef.current!];
          historyRef.current = newHistory;
          setHistory(newHistory);
        }

        if (userQueueRef.current.length > 0 && userQueueRef.current[0].id === nextSong.id) {
          const [_, ...rest] = userQueueRef.current;
          userQueueRef.current = rest;
          setUserQueue(rest);
        } else {
          const ps = playbackSourceRef.current;
          if (ps && ps.originalArray) {
            const idx = ps.originalArray.findIndex(s => String(s?.id) === String(nextSong.id));
            if (idx !== -1) {
              const remaining = ps.originalArray.slice(idx + 1);
              contextQueueRef.current = remaining;
              setContextQueue(remaining);
            }
          }
        }

        // Initialize currentSong with standard nextSong details
        currentSongRef.current = nextSong;
        setCurrentSong(nextSong);
        activeAudioIndexRef.current = nextIndex;
        audioRef.current = nextAudio;

        // Fetch lyrics for nextSong in background
        if (!nextSong.lyrics || nextSong.lyrics.length === 0) {
          fetchLyrics(nextSong).then(lyrics => {
            if (currentSongRef.current?.id === nextSong.id) {
              const updatedSong = { ...nextSong, lyrics };
              currentSongRef.current = updatedSong;
              setCurrentSong(updatedSong);
            }
          });
        }

        // Begin crossfade volume ramp
        const durationMs = crossfadeDurationRef.current * 1000;
        const intervalMs = 50;
        const steps = durationMs / intervalMs;
        let currentStep = 0;
        const startVolume = activeAudio.volume;
        const targetVolume = volume;

        fadeIntervalRef.current = setInterval(() => {
          currentStep++;
          const ratio = currentStep / steps;

          activeAudio.volume = Math.max(0, startVolume * (1 - ratio));
          nextAudio.volume = Math.min(targetVolume, targetVolume * ratio);

          if (currentStep >= steps) {
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
            
            activeAudio.pause();
            activeAudio.src = "";
            activeAudio.volume = targetVolume;
            isCrossfadingRef.current = false;
          }
        }, intervalMs);
      })
      .catch(err => {
        console.warn("Failed to play next audio during crossfade:", err);
        isCrossfadingRef.current = false;
      });
  };

  // Initialize audio elements only on client
  useEffect(() => {
    audioRef1.current = new Audio();
    audioRef2.current = new Audio();
    audioRef.current = audioRef1.current; // Start with element 1 active

    audioRef1.current.preload = "auto";
    audioRef2.current.preload = "auto";

    audioRef1.current.volume = volume;
    audioRef2.current.volume = volume;

    const setupAudioListeners = (audio: HTMLAudioElement, index: 1 | 2) => {
      const handleTimeUpdate = () => {
        // Only update state if this audio is the active one
        if (activeAudioIndexRef.current !== index) return;
        
        setCurrentTime(audio.currentTime);
        if (audio.duration) {
          setDuration(audio.duration);
          setProgress(audio.currentTime / audio.duration);
        }

        // Trigger crossfade if nearing the end
        const remainingTime = audio.duration - audio.currentTime;
        if (
          crossfadeDurationRef.current > 0 &&
          remainingTime <= crossfadeDurationRef.current &&
          !isCrossfadingRef.current &&
          !isYoutubeModeRef.current
        ) {
          const nextSong = getNextSong();
          if (nextSong) {
            triggerCrossfade(nextSong);
          }
        }
      };

      const handleLoadedMetadata = () => {
        if (activeAudioIndexRef.current !== index) return;
        setDuration(audio.duration);
      };

      const handleEnded = () => {
        if (activeAudioIndexRef.current !== index) return;
        setProgress(1);
        playNextRef.current(true);
      };

      const handleError = () => {
        console.warn(`Failed to load audio source on element ${index}.`);
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
      };
    };

    const cleanup1 = setupAudioListeners(audioRef1.current, 1);
    const cleanup2 = setupAudioListeners(audioRef2.current, 2);

    return () => {
      cleanup1();
      cleanup2();
      if (audioRef1.current) {
        audioRef1.current.pause();
        audioRef1.current.src = "";
      }
      if (audioRef2.current) {
        audioRef2.current.pause();
        audioRef2.current.src = "";
      }
    };
  }, []);



  // Persistence: Load from localStorage
  useEffect(() => {
    const savedLiked = localStorage.getItem('echo-likedSongs');
    if (savedLiked) setLikedSongs(JSON.parse(savedLiked));

    const savedPlaylists = localStorage.getItem('echo-playlists');
    if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));

    const savedCrossfade = localStorage.getItem('echo-crossfade');
    if (savedCrossfade) setCrossfadeDurationState(parseInt(savedCrossfade, 10));
  }, []);

  const setCrossfadeDuration = (d: number) => {
    setCrossfadeDurationState(d);
    localStorage.setItem('echo-crossfade', String(d));
  };

  // Persistence: Save to localStorage
  useEffect(() => {
    localStorage.setItem('echo-likedSongs', JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem('echo-playlists', JSON.stringify(playlists));
  }, [playlists]);

  // Fetch viewed artist details when viewingArtistName or viewingArtistId changes
  useEffect(() => {
    if (viewingArtistName || viewingArtistId) {
      const fetchArtistDetails = async () => {
        setViewedArtistLoading(true);
        try {
          const query = viewingArtistId
            ? `id=${viewingArtistId}`
            : `name=${encodeURIComponent(viewingArtistName!)}`;
          const res = await fetch(`/api/artist?${query}`);
          if (res.ok) {
            const data = await res.json();
            setViewedArtistDetails(data.results || null);
          } else {
            setViewedArtistDetails(null);
          }
        } catch (e) {
          console.error("Failed to fetch artist details:", e);
          setViewedArtistDetails(null);
        } finally {
          setViewedArtistLoading(false);
        }
      };
      fetchArtistDetails();
    } else {
      setViewedArtistDetails(null);
    }
  }, [viewingArtistName, viewingArtistId]);

  // Fetch viewed album songs when viewingAlbumId changes
  useEffect(() => {
    if (viewingAlbumName && viewingAlbumId) {
      const fetchAlbumSongs = async () => {
        setViewedAlbumLoading(true);
        try {
          const res = await fetch(`/api/album?id=${viewingAlbumId}`);
          if (res.ok) {
            const data = await res.json();
            setViewedAlbumSongs(data.results || []);
          } else {
            setViewedAlbumSongs([]);
          }
        } catch (e) {
          console.error("Failed to fetch viewed album tracks:", e);
          setViewedAlbumSongs([]);
        } finally {
          setViewedAlbumLoading(false);
        }
      };
      fetchAlbumSongs();
    } else {
      // Fallback: filter local/mock/cached songs matching viewingAlbumName
      if (viewingAlbumName) {
        const allAvailableSongs = [
          ...MOCK_SONGS,
          ...localSongs,
          ...likedSongs,
          ...playlists.flatMap(p => p.songs),
          ...searchResults,
          ...userQueue,
          ...contextQueue,
          ...history,
          ...(currentSongRef.current ? [currentSongRef.current] : [])
        ];
        const uniqueSongs = Array.from(new Map(allAvailableSongs.filter(Boolean).map(s => [s.id, s])).values());
        const filtered = uniqueSongs.filter(s => s && s.album && s.album.toLowerCase() === viewingAlbumName.toLowerCase());
        setViewedAlbumSongs(filtered);
      } else {
        setViewedAlbumSongs([]);
      }
    }
  }, [viewingAlbumName, viewingAlbumId, localSongs, likedSongs, playlists, searchResults, userQueue, contextQueue, history]);

  // Fetch current song's album songs when album panel is visible and currentSong has an albumId
  useEffect(() => {
    const activeSong = currentSong;
    if (isAlbumVisible && activeSong?.albumId) {
      const fetchCurrentAlbumSongs = async () => {
        setCurrentAlbumLoading(true);
        try {
          const res = await fetch(`/api/album?id=${activeSong.albumId}`);
          if (res.ok) {
            const data = await res.json();
            setCurrentAlbumSongs(data.results || []);
          } else {
            setCurrentAlbumSongs([]);
          }
        } catch (e) {
          console.error("Failed to fetch current album tracks:", e);
          setCurrentAlbumSongs([]);
        } finally {
          setCurrentAlbumLoading(false);
        }
      };
      fetchCurrentAlbumSongs();
    } else {
      // Fallback: filter local/mock/cached songs matching currentSong.album
      if (activeSong?.album) {
        const allAvailableSongs = [
          ...MOCK_SONGS,
          ...localSongs,
          ...likedSongs,
          ...playlists.flatMap(p => p.songs),
          ...searchResults,
          ...userQueue,
          ...contextQueue,
          ...history,
          activeSong
        ];
        const uniqueSongs = Array.from(new Map(allAvailableSongs.filter(Boolean).map(s => [s.id, s])).values());
        const filtered = uniqueSongs.filter(s => s && s.album && s.album.toLowerCase() === activeSong.album.toLowerCase());
        setCurrentAlbumSongs(filtered);
      } else {
        setCurrentAlbumSongs([]);
      }
    }
  }, [isAlbumVisible, currentSong, localSongs, likedSongs, playlists, searchResults, userQueue, contextQueue, history]);

  // Sync volume state to audio element
  useEffect(() => {
    if (!isCrossfadingRef.current) {
      if (audioRef1.current) audioRef1.current.volume = volume;
      if (audioRef2.current) audioRef2.current.volume = volume;
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
      playNextRef.current(true);
    }
  };

  const playSongInstance = (song: Song) => {
    const isYoutube = song.audioUrl.startsWith("youtube:");
    isYoutubeModeRef.current = isYoutube;

    currentSongRef.current = song;
    setCurrentSong(song);

    // Clear any active crossfade when loading a new song directly
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    isCrossfadingRef.current = false;

    // Reset volume of both audio elements to target volume
    if (audioRef1.current) audioRef1.current.volume = volume;
    if (audioRef2.current) audioRef2.current.volume = volume;

    if (isYoutube) {
      if (audioRef1.current) audioRef1.current.pause();
      if (audioRef2.current) audioRef2.current.pause();

      const vId = song.audioUrl.split(":")[1];
      setYtVideoId(vId);

      if (ytPlayer) {
        try {
          ytPlayer.loadVideoById(vId);
          ytPlayer.playVideo();
        } catch (e) { }
      }
    } else {
      if (ytPlayer) {
        try { ytPlayer.pauseVideo(); } catch (e) { }
      }

      // Stop the inactive element completely
      const activeAudio = activeAudioIndexRef.current === 1 ? audioRef1.current : audioRef2.current;
      const inactiveAudio = activeAudioIndexRef.current === 1 ? audioRef2.current : audioRef1.current;
      if (inactiveAudio) {
        inactiveAudio.pause();
        inactiveAudio.src = "";
      }

      if (activeAudio) {
        activeAudio.src = song.audioUrl;
        const playPromise = activeAudio.play();
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

    // Fetch lyrics asynchronously in the background so audio playback starts instantly
    if (!song.lyrics || song.lyrics.length === 0) {
      fetchLyrics(song).then(lyrics => {
        if (currentSongRef.current?.id === song.id) {
          const updatedSong = { ...song, lyrics };
          currentSongRef.current = updatedSong;
          setCurrentSong(updatedSong);
        }
      });
    }

    // Prefetch next song's lyrics in the background after 1 second
    setTimeout(() => {
      const nextSong = getNextSong();
      if (nextSong) {
        prefetchLyrics(nextSong);
      }
    }, 1000);
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

  const playNext = (isAutoEnd: boolean | any = false) => {
    // 0. Repeat Mode (Auto-end only)
    if (isAutoEnd === true && isRepeatRef.current && currentSongRef.current) {
      playSongInstance(currentSongRef.current);
      return;
    }

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
          // If only 1 song and shuffle is on, stop playing on next
          setIsPlaying(false);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          if (isYoutubeModeRef.current && ytPlayer) {
            try { ytPlayer.pauseVideo(); } catch (e) {}
          }
          setProgress(0);
          setCurrentTime(0);
          return;
        }
      } else {
        // Sequential - If we can't find the current song, start from 0
        nextIdx = curIdx === -1 ? 0 : curIdx + 1;

        // Loop the playlist: wrap around to the first song
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
    let prevVolume = 0.8;

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

      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setVolumeState(prev => {
          if (prev > 0) {
            prevVolume = prev;
            return 0;
          } else {
            return prevVolume > 0 ? prevVolume : 0.8;
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Media Session API integration
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator) || !currentSong) return;

    // Set metadata
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist,
      album: currentSong.album || "EchoStream",
      artwork: [
        { src: currentSong.albumArt, sizes: "96x96", type: "image/jpeg" },
        { src: currentSong.albumArt, sizes: "128x128", type: "image/jpeg" },
        { src: currentSong.albumArt, sizes: "192x192", type: "image/jpeg" },
        { src: currentSong.albumArt, sizes: "256x256", type: "image/jpeg" },
        { src: currentSong.albumArt, sizes: "384x384", type: "image/jpeg" },
        { src: currentSong.albumArt, sizes: "512x512", type: "image/jpeg" },
      ]
    });

    // Sync playback state
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [currentSong, isPlaying]);

  // Media Session Action Handlers
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler("play", () => {
        setIsPlaying(true);
        if (isYoutubeModeRef.current && ytPlayer) {
          try { ytPlayer.playVideo(); } catch (e) {}
        } else {
          const activeAudio = activeAudioIndexRef.current === 1 ? audioRef1.current : audioRef2.current;
          if (activeAudio) activeAudio.play().catch(() => {});
        }
      });

      navigator.mediaSession.setActionHandler("pause", () => {
        setIsPlaying(false);
        if (isYoutubeModeRef.current && ytPlayer) {
          try { ytPlayer.pauseVideo(); } catch (e) {}
        } else {
          const activeAudio = activeAudioIndexRef.current === 1 ? audioRef1.current : audioRef2.current;
          if (activeAudio) activeAudio.pause();
        }
      });

      navigator.mediaSession.setActionHandler("previoustrack", () => {
        playPrevious();
      });

      navigator.mediaSession.setActionHandler("nexttrack", () => {
        playNext();
      });

      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime !== undefined && details.seekTime !== null) {
          const activeAudio = activeAudioIndexRef.current === 1 ? audioRef1.current : audioRef2.current;
          if (isYoutubeModeRef.current && ytPlayer) {
            try { ytPlayer.seekTo(details.seekTime, true); } catch (e) {}
          } else if (activeAudio && activeAudio.duration) {
            activeAudio.currentTime = details.seekTime;
          }
        }
      });
    } catch (e) {
      console.warn("Failed to set Media Session actions:", e);
    }

    return () => {
      if (typeof window !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
        navigator.mediaSession.setActionHandler("seekto", null);
      }
    };
  }, [playNext, playPrevious, ytPlayer]);

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
        updatePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        lyricsMode,
        isLyricsVisible,
        toggleLyrics,
        isQueueVisible,
        toggleQueue,
        isQueueLanding,
        triggerQueueLanding,
        isAlbumVisible,
        toggleAlbum,
        viewingAlbumName,
        viewingAlbumId,
        setViewingAlbumName,
        localSongs,
        setLocalSongs,
        searchResults,
        setSearchResults,
        crossfadeDuration,
        setCrossfadeDuration,
        viewedAlbumSongs,
        viewedAlbumLoading,
        currentAlbumSongs,
        currentAlbumLoading,
        viewingArtistName,
        viewingArtistId,
        viewedArtistDetails,
        viewedArtistLoading,
        setViewingArtist,
      }}
    >
      <div className="hidden">
        <YouTube
          videoId={ytVideoId || ""}
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

            // If the user already clicked a YouTube song, load and play it now
            if (currentSongRef.current && currentSongRef.current.audioUrl.startsWith("youtube:")) {
              const vId = currentSongRef.current.audioUrl.split(":")[1];
              try {
                event.target.loadVideoById(vId);
                event.target.playVideo();
                setIsPlaying(true);
              } catch (e) {
                console.warn("Failed to autoplay YouTube song on ready:", e);
              }
            }
          }}
          onStateChange={handleYtStateChange}
        />
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
