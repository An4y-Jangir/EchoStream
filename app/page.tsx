"use client";

import { MOCK_MIXES, MOCK_SONGS } from "@/lib/mockData";
import { usePlayer } from "@/context/PlayerContext";
import { BottomPlayer } from "@/components/player/BottomPlayer";
import { ExpandedPlayer } from "@/components/player/ExpandedPlayer";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Song, Playlist } from "@/types/music";
import { motion, AnimatePresence } from "framer-motion";
import { AddToPlaylistModal } from "@/components/modals/AddToPlaylistModal";
import { GlowWrapper } from "@/components/ui/GlowWrapper";
import { TextRoll } from "@/components/ui/TextRoll";
import { SettingsPage } from "@/components/ui/SettingsPage";
import { FlightAnimation } from "@/components/animations/FlightAnimation";
import { TrashDeleteAnimation } from "@/components/animations/TrashDeleteAnimation";
import { CanvasParticles } from "@/components/ui/CanvasParticles";
// import { SmoothInput } from "@/components/ui/SmoothInput";
import { AnimatedInput } from "@/components/ui/AnimatedInput";

const jsmediatags = typeof window !== "undefined" ? require("jsmediatags/dist/jsmediatags.min.js") : null;

const PREMADE_COVERS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500&auto=format&fit=crop", // Synthwave Neon
  "https://images.unsplash.com/photo-1535478044878-3ed83d5456ef?q=80&w=500&auto=format&fit=crop", // Retro Pink Cassette (New)
  "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=500&auto=format&fit=crop", // Abstract Glow
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=500&auto=format&fit=crop", // Cosmic Space
  "https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=500&auto=format&fit=crop", // Spinning Vinyl Record (New)
];

export default function Home() {
  const { 
    playSong, 
    currentSong, 
    history, 
    likedSongs, 
    addToQueue, 
    viewingAlbumName, 
    viewingAlbumId,
    setViewingAlbumName,
    viewedAlbumSongs,
    viewedAlbumLoading,
    viewingArtistName,
    viewingArtistId,
    viewedArtistDetails,
    viewedArtistLoading,
    setViewingArtist,
    playlists,
    addSongToPlaylist,
    createPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    localSongs,
    setLocalSongs,
    searchResults,
    setSearchResults,
    userQueue,
    contextQueue,
    triggerQueueLanding,
  } = usePlayer();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'discover'|'recent'|'favorites'|'local'|'playlist'|'browse'|'album'|'artist'|'settings'>('discover');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [landingPlaylistId, setLandingPlaylistId] = useState<string | null>(null);

  const [userName, setUserName] = useState("Alex Rivera");
  const [userPfp, setUserPfp] = useState("/alex_pfp.png");

  const [isDynamicTheme, setIsDynamicTheme] = useState(true);
  const [staticAccent, setStaticAccent] = useState("#6366f1");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserName(localStorage.getItem("echo-username") || "Alex Rivera");
      setUserPfp(localStorage.getItem("echo-userpfp") || "/alex_pfp.png");
      
      const storedLogo = localStorage.getItem("echo-logostyle") as any;
      if (storedLogo) setLogoStyle(storedLogo);

      const checkTheme = () => {
        setIsDynamicTheme(localStorage.getItem("echo-dynamic-theme") !== "false");
        setStaticAccent(localStorage.getItem("echo-static-accent") || "#6366f1");
      };
      checkTheme();
      window.addEventListener("theme-change", checkTheme);
      return () => {
        window.removeEventListener("theme-change", checkTheme);
      };
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Navigation History Stack
  const [navHistory, setNavHistory] = useState<Array<{
    tab: 'discover'|'recent'|'favorites'|'local'|'playlist'|'browse'|'album'|'artist'|'settings';
    playlistId: string | null;
    albumName: string | null;
    albumId: string | null;
    artistName: string | null;
    artistId: string | null;
  }>>([{
    tab: 'discover',
    playlistId: null,
    albumName: null,
    albumId: null,
    artistName: null,
    artistId: null
  }]);
  const [navIndex, setNavIndex] = useState(0);
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
      return;
    }

    const currentEntry = {
      tab: activeTab,
      playlistId: selectedPlaylistId,
      albumName: viewingAlbumName,
      albumId: viewingAlbumId,
      artistName: viewingArtistName,
      artistId: viewingArtistId
    };

    setNavHistory(prev => {
      const last = prev[navIndex];
      if (last && 
          last.tab === activeTab && 
          last.playlistId === selectedPlaylistId && 
          last.albumName === viewingAlbumName && 
          last.artistName === viewingArtistName) {
        return prev;
      }
      
      const nextHistory = prev.slice(0, navIndex + 1);
      nextHistory.push(currentEntry);
      setNavIndex(nextHistory.length - 1);
      return nextHistory;
    });
  }, [activeTab, selectedPlaylistId, viewingAlbumName, viewingAlbumId, viewingArtistName, viewingArtistId]);

  const goBack = () => {
    if (navIndex > 0) {
      isNavigatingRef.current = true;
      const prevEntry = navHistory[navIndex - 1];
      setNavIndex(navIndex - 1);
      
      setActiveTab(prevEntry.tab);
      setSelectedPlaylistId(prevEntry.playlistId);
      setViewingAlbumName(prevEntry.albumName, prevEntry.albumId);
      setViewingArtist(prevEntry.artistName, prevEntry.artistId);
    }
  };

  const goForward = () => {
    if (navIndex < navHistory.length - 1) {
      isNavigatingRef.current = true;
      const nextEntry = navHistory[navIndex + 1];
      setNavIndex(navIndex + 1);

      setActiveTab(nextEntry.tab);
      setSelectedPlaylistId(nextEntry.playlistId);
      setViewingAlbumName(nextEntry.albumName, nextEntry.albumId);
      setViewingArtist(nextEntry.artistName, nextEntry.artistId);
    }
  };

  // Playlist states
  const [addingSong, setAddingSong] = useState<Song | null>(null);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const plCoverUploadRef = useRef<HTMLInputElement>(null);
  const [flightData, setFlightData] = useState<{ start: DOMRect, end: DOMRect } | null>(null);
  const [deletingSongData, setDeletingSongData] = useState<{ song: Song, playlistId: string, startRect: DOMRect } | null>(null);
  const [animatingDeleteIds, setAnimatingDeleteIds] = useState<string[]>([]);
  const playlistHeaderRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showAllArtistSongs, setShowAllArtistSongs] = useState(false);
  const [hoveredAlbumIdx, setHoveredAlbumIdx] = useState<number | null>(null);

  // Synchronize activeTab with viewingAlbumName context state
  useEffect(() => {
    if (viewingAlbumName) {
      setActiveTab('album');
    }
  }, [viewingAlbumName]);

  useEffect(() => {
    if (activeTab !== 'album') {
      setViewingAlbumName(null);
    }
  }, [activeTab, setViewingAlbumName]);

  // Synchronize activeTab with viewingArtistName context state
  useEffect(() => {
    if (viewingArtistName) {
      setActiveTab('artist');
      setShowAllArtistSongs(false); // Reset to false when switching artist profiles
      setHoveredAlbumIdx(null); // Reset when switching artist profiles
    }
  }, [viewingArtistName]);

  useEffect(() => {
    if (activeTab !== 'artist') {
      setViewingArtist(null);
    }
  }, [activeTab, setViewingArtist]);

  // Album fetching is managed globally in PlayerContext

  const [logoStyle, setLogoStyle] = useState<'default' | 'ripple' | 'infinity' | 'equalizer'>('equalizer');
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const handleLogoStyleChange = (style: 'default' | 'ripple' | 'infinity' | 'equalizer') => {
    setLogoStyle(style);
    localStorage.setItem("echo-logostyle", style);
  };
  const cycleLogo = () => {
    const styles: ('default' | 'ripple' | 'infinity' | 'equalizer')[] = ['default', 'ripple', 'infinity', 'equalizer'];
    const nextIdx = (styles.indexOf(logoStyle) + 1) % styles.length;
    handleLogoStyleChange(styles[nextIdx]);
  };

  const hasHistory = (history || []).length > 0;
  const hasPersonal = (likedSongs || []).length > 0 || (playlists || []).length > 0;
  const showFeatures = !(hasHistory && hasPersonal);

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const query = searchQuery;
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    setActiveTab('browse');
    try {
      const res = await fetch('/api/search?q=' + encodeURIComponent(query));
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav'));
    
    if (audioFiles.length === 0) {
      alert("No audio files found in the selected folder.");
      return;
    }

    const newLocalSongs = await Promise.all(audioFiles.map((file, index) => {
      return new Promise<Song>((resolve) => {
        jsmediatags.read(file, {
          onSuccess: function(tag: any) {
            const tags = tag.tags;
            const url = URL.createObjectURL(file);
            let albumArtUrl = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500&auto=format&fit=crop";
            
            if (tags.picture) {
              const data = tags.picture.data;
              const format = tags.picture.format;
              let base64String = "";
              for (let i = 0; i < data.length; i++) {
                base64String += String.fromCharCode(data[i]);
              }
              albumArtUrl = `data:${format};base64,${window.btoa(base64String)}`;
            }

            // Fallback for metadata if ID3 fields are empty
            const pathParts = file.webkitRelativePath ? file.webkitRelativePath.split('/') : [];
            const parentFolder = pathParts.length > 1 ? pathParts[pathParts.length - 2] : "Local Folder";
            const artistFolder = pathParts.length > 2 ? pathParts[pathParts.length - 3] : "Local Device";

            resolve({
              id: `local-${Date.now()}-${index}`,
              title: tags.title || file.name.replace(/\.[^/.]+$/, ""),
              artist: tags.artist || artistFolder,
              album: tags.album || parentFolder,
              albumArt: albumArtUrl,
              audioUrl: url,
              genre: tags.genre || "Unknown",
              tempo: 120,
              lyrics: []
            });
          },
          onError: function(error: any) {
            // fallback to path approach
            const pathParts = file.webkitRelativePath ? file.webkitRelativePath.split('/') : [];
            const parentFolder = pathParts.length > 1 ? pathParts[pathParts.length - 2] : "Local Folder";
            const artistFolder = pathParts.length > 2 ? pathParts[pathParts.length - 3] : "Local Device";
            resolve({
              id: `local-${Date.now()}-${index}`,
              title: file.name.replace(/\.[^/.]+$/, ""),
              artist: artistFolder,
              album: parentFolder,
              albumArt: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500&auto=format&fit=crop",
              audioUrl: URL.createObjectURL(file),
              genre: "Unknown",
              tempo: 120,
              lyrics: []
            });
          }
        });
      });
    }));
    
    setLocalSongs(newLocalSongs);
    // Auto-play removed per user request
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /*
  const RADIO_STATIONS = [
    {
      id: 'live',
      title: 'EchoStream Live',
      subtitle: 'The absolute best of global hits',
      seed: 'top charts 2024 hits',
      gradient: 'from-accent to-pink-500',
      icon: 'podcasts'
    },
    {
      id: 'midnight',
      title: 'Midnight Melancholy',
      subtitle: 'Slow, soulful, and introspective soul',
      seed: 'sad soul chill lo-fi',
      gradient: 'from-indigo-600 to-[#1e1b4b]',
      icon: 'nights_stay'
    },
    {
      id: 'cyberpunk',
      title: 'Cyberpunk Pulse',
      subtitle: 'High-energy synth and futuristic beats',
      seed: 'dark synthwave retrowave cyberpunk',
      gradient: 'from-cyan-500 to-fuchsia-600',
      icon: 'bolt'
    },
    {
      id: 'focus',
      title: 'Deep Focus',
      subtitle: 'Pure ambient textures for productivity',
      seed: 'ambient drone focus study music',
      gradient: 'from-emerald-500 to-teal-900',
      icon: 'psychology'
    },
    {
      id: 'lofi',
      title: 'Coffee Shop Lo-Fi',
      subtitle: 'The perfect background for relaxation',
      seed: 'lofi hip hop jazzhop beats',
      gradient: 'from-[#fb923c] to-[#78350f]',
      icon: 'coffee'
    }
  ];

  const startRadio = async (station: typeof RADIO_STATIONS[0]) => {
    setIsSearching(true);
    try {
      const res = await fetch('/api/search?q=' + encodeURIComponent(station.seed));
      if (res.ok) {
        const data = await res.json();
        const songs = data.results || [];
        if (songs.length > 0) {
          // Play first song, provide full list as source tagged as radio
          playSong(songs[0], { id: `radio-${station.id}`, list: songs });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };
  */

  const currentPlaylist = playlists.find(p => p.id === selectedPlaylistId);
  const [flightImageUrl, setFlightImageUrl] = useState("");

  const triggerFlight = (song: Song, startRect: DOMRect, playlistId: string) => {
    const flightEnabled = localStorage.getItem("echo-flight-animations") !== "false";
    if (!flightEnabled) {
      setLandingPlaylistId(playlistId);
      setTimeout(() => setLandingPlaylistId(null), 1000);
      return;
    }

    const sidebarPl = document.getElementById(`sidebar-pl-${playlistId}`);
    if (sidebarPl) {
      const endRect = sidebarPl.getBoundingClientRect();
      setFlightImageUrl(song.albumArt);
      setFlightData({ start: startRect, end: endRect });
      // Schedule the landing pulse
      setTimeout(() => {
        setLandingPlaylistId(playlistId);
        setTimeout(() => setLandingPlaylistId(null), 1000);
      }, 900); // Wait for flight duration
    } else if (playlistHeaderRef.current) {
      // Fallback to header if item not found (e.g. initial creation)
      const endRect = playlistHeaderRef.current.getBoundingClientRect();
      setFlightImageUrl(song.albumArt);
      setFlightData({ start: startRect, end: endRect });
    }
  };

  const triggerQueueFlight = (song: Song, startRect: DOMRect) => {
    const flightEnabled = localStorage.getItem("echo-flight-animations") !== "false";
    if (!flightEnabled) {
      triggerQueueLanding();
      return;
    }

    const queueBtn = document.getElementById("bottom-queue-btn") || document.getElementById("expanded-queue-btn");
    if (queueBtn) {
      const endRect = queueBtn.getBoundingClientRect();
      setFlightImageUrl(song.albumArt);
      setFlightData({ start: startRect, end: endRect });
      setTimeout(() => {
        triggerQueueLanding();
      }, 900);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-1000 ease-in-out">
          {currentSong && isDynamicTheme ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000 opacity-60 scale-105"
                style={{ backgroundImage: `url(${currentSong.albumArt})` }}
              />
              <div className="absolute inset-0 bg-black/50 backdrop-blur-xl" />
            </>
          ) : (
            <>
              {/* Static theme ambient mesh gradient */}
              <div className="absolute inset-0 bg-[#09090b]" />
              <div 
                className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-[0.25] blur-[130px] transition-all duration-1000 ease-in-out"
                style={{ backgroundColor: staticAccent }}
              />
              <div 
                className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-[0.18] blur-[130px] transition-all duration-1000 ease-in-out"
                style={{ backgroundColor: staticAccent }}
              />
            </>
          )}
          <CanvasParticles />
        </div>

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col p-6 gap-6 z-20 relative bg-black/10 backdrop-blur-md">
        <div 
          onClick={cycleLogo}
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
          className="px-2 flex items-center gap-3.5 mb-2 group cursor-pointer select-none"
          title="Click to cycle logo style!"
        >
          <div className="size-10 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center shadow-lg group-hover:border-accent/40 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {logoStyle === 'default' && (
              <svg viewBox="0 0 24 24" className="size-5 overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                  <filter id="logo-glow">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <motion.path 
                  d="M 8,6 L 16,6 C 19,6 19,12 16,12 L 8,12 C 5,12 5,18 8,18 L 16,18" 
                  stroke="url(#logo-grad)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  filter="url(#logo-glow)"
                  animate={isLogoHovered ? {
                    pathLength: [0, 1],
                    stroke: ["#6366f1", "#ec4899", "#6366f1"]
                  } : {
                    pathLength: [0.9, 1, 0.9],
                    stroke: "#6366f1"
                  }}
                  transition={isLogoHovered ? {
                    pathLength: { duration: 0.8, ease: "easeOut" },
                    stroke: { duration: 1.5, repeat: Infinity, ease: "linear" }
                  } : {
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut"
                  }}
                />
                <motion.path 
                  d="M 8,6 L 8,18" 
                  stroke="url(#logo-grad)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  filter="url(#logo-glow)"
                  animate={isLogoHovered ? {
                    scaleY: [1, 1.2, 1],
                    opacity: 1
                  } : {
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={isLogoHovered ? {
                    scaleY: { repeat: Infinity, duration: 0.5, ease: "easeInOut" }
                  } : {
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut"
                  }}
                />
              </svg>
            )}

            {logoStyle === 'ripple' && (
              <svg viewBox="0 0 24 24" className="size-5 overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="ripple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <motion.circle 
                  cx="12" cy="12" 
                  r="3" 
                  fill="url(#ripple-grad)" 
                  animate={isLogoHovered ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                  transition={isLogoHovered ? { repeat: Infinity, duration: 0.8, ease: "easeInOut" } : {}}
                />
                <motion.circle 
                  cx="12" cy="12" r="5" 
                  stroke="url(#ripple-grad)" strokeWidth="1.5"
                  animate={isLogoHovered ? {
                    scale: [1, 1.7, 1],
                    opacity: [0.9, 0.2, 0.9]
                  } : {
                    scale: [1, 1.25, 1],
                    opacity: [0.5, 0.9, 0.5]
                  }}
                  transition={{ repeat: Infinity, duration: isLogoHovered ? 0.8 : 2.5, ease: "easeInOut" }}
                />
                <motion.circle 
                  cx="12" cy="12" r="8" 
                  stroke="url(#ripple-grad)" strokeWidth="1" strokeDasharray="2 2"
                  animate={isLogoHovered ? {
                    scale: [1, 2.0, 1],
                    opacity: [0.7, 0, 0.7]
                  } : {
                    scale: [1, 1.35, 1],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{ repeat: Infinity, duration: isLogoHovered ? 0.8 : 2.5, ease: "easeInOut", delay: isLogoHovered ? 0.1 : 0.5 }}
                />
              </svg>
            )}

            {logoStyle === 'infinity' && (
              <svg viewBox="0 0 24 24" className="size-6 overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="infinity-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <motion.path 
                  d="M 6,12 C 6,8.5 10,8.5 12,12 C 14,15.5 18,15.5 18,12 C 18,8.5 14,8.5 12,12 C 10,15.5 6,15.5 6,12 Z" 
                  stroke="url(#infinity-grad)" 
                  strokeWidth={isLogoHovered ? 3.0 : 2.2} 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={isLogoHovered ? {
                    rotate: 360,
                    scale: 1.15
                  } : {
                    pathLength: [0.9, 1, 0.9]
                  }}
                  transition={isLogoHovered ? {
                    rotate: { repeat: Infinity, duration: 1.2, ease: "linear" },
                    scale: { duration: 0.3 }
                  } : {
                    repeat: Infinity,
                    duration: 2.5,
                    ease: "easeInOut"
                  }}
                />
              </svg>
            )}

            {logoStyle === 'equalizer' && (
              <div className="flex items-end gap-1 h-4 overflow-visible">
                <motion.div 
                  className="w-1 bg-gradient-to-t from-accent to-purple-500 rounded-full" 
                  animate={isLogoHovered ? { height: ["20%", "100%", "20%"] } : { height: ["40%", "100%", "40%"] }} 
                  transition={{ repeat: Infinity, duration: isLogoHovered ? 0.4 : 1.0, ease: "easeInOut" }}
                  style={{ minHeight: '4px' }}
                />
                <motion.div 
                  className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full" 
                  animate={isLogoHovered ? { height: ["90%", "10%", "90%"] } : { height: ["70%", "20%", "90%", "70%"] }} 
                  transition={{ repeat: Infinity, duration: isLogoHovered ? 0.5 : 1.3, ease: "easeInOut" }}
                  style={{ minHeight: '4px' }}
                />
                <motion.div 
                  className="w-1 bg-gradient-to-t from-pink-500 to-accent rounded-full" 
                  animate={isLogoHovered ? { height: ["10%", "100%", "10%"] } : { height: ["30%", "85%", "30%"] }} 
                  transition={{ repeat: Infinity, duration: isLogoHovered ? 0.3 : 0.8, ease: "easeInOut" }}
                  style={{ minHeight: '4px' }}
                />
                <motion.div 
                  className="w-1 bg-gradient-to-t from-accent to-purple-500 rounded-full" 
                  animate={isLogoHovered ? { height: ["100%", "20%", "100%"] } : { height: ["80%", "30%", "80%"] }} 
                  transition={{ repeat: Infinity, duration: isLogoHovered ? 0.45 : 1.2, ease: "easeInOut" }}
                  style={{ minHeight: '4px' }}
                />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center font-space-grotesk">
              Echo<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-purple-500 to-pink-500 font-stomic">Stream</span>
            </h1>
            <p className="text-[7.5px] text-slate-500 font-extrabold tracking-[0.35em] uppercase mt-0.5 group-hover:text-accent transition-colors">
              {logoStyle === 'default' && "Premium System"}
              {logoStyle === 'ripple' && "Ripple System"}
              {logoStyle === 'infinity' && "Infinity Flow"}
              {logoStyle === 'equalizer' && "Visual System"}
            </p>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          <p className="px-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2">Menu</p>
          <a onClick={() => setActiveTab('discover')} className={`nav-item flex items-center gap-4 px-4 py-2.5 rounded-xl cursor-pointer ${activeTab === 'discover' ? 'text-white active-nav bg-white/5' : 'text-slate-400 hover:text-white'}`}>
            <span className="material-symbols-outlined text-lg">grid_view</span>
            <span className="text-sm font-medium">Discover</span>
          </a>
          <a onClick={() => setActiveTab('browse')} className={`nav-item flex items-center gap-4 px-4 py-2.5 rounded-xl cursor-pointer ${activeTab === 'browse' ? 'text-white active-nav bg-white/5' : 'text-slate-400 hover:text-white'}`}>
            <span className="material-symbols-outlined text-lg">explore</span>
            <span className="text-sm font-medium">Browse</span>
          </a>

        </nav>
        <div className="flex flex-col gap-1">
          <p className="px-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2">Library</p>
          <a onClick={() => setActiveTab('recent')} className={`nav-item flex items-center gap-4 px-4 py-2.5 rounded-xl cursor-pointer ${activeTab === 'recent' ? 'text-white active-nav bg-white/5' : 'text-slate-400 hover:text-white'}`}>
            <span className="material-symbols-outlined text-lg">history</span>
            <span className="text-sm font-medium">Recent</span>
          </a>
          <a onClick={() => setActiveTab('favorites')} className={`nav-item flex items-center gap-4 px-4 py-2.5 rounded-xl cursor-pointer ${activeTab === 'favorites' ? 'text-white active-nav bg-white/5' : 'text-slate-400 hover:text-white'}`}>
            <span className="material-symbols-outlined text-lg">favorite</span>
            <span className="text-sm font-medium">Favorites</span>
          </a>
          <a onClick={() => setActiveTab('local')} className={`nav-item flex items-center gap-4 px-4 py-2.5 rounded-xl cursor-pointer ${activeTab === 'local' ? 'text-white active-nav bg-white/5' : 'text-slate-400 hover:text-white'}`}>
            <span className="material-symbols-outlined text-lg">folder</span>
            <span className="text-sm font-medium">Local Music</span>
          </a>
          <div onClick={() => fileInputRef.current?.click()} className="nav-item flex items-center gap-4 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white cursor-pointer mt-1 transition-all hover:bg-white/5">
            <span className="material-symbols-outlined text-lg text-accent">upload_file</span>
            <span className="text-sm font-medium">Import Files</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-h-0">
          <div ref={playlistHeaderRef} className="px-4 flex items-center justify-between mb-2 flex-shrink-0">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Playlists</p>
            <button 
              onClick={() => {
                const name = prompt("Enter playlist name:");
                if (name) createPlaylist(name);
              }}
              className="text-slate-500 hover:text-accent transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
            {playlists.length === 0 ? (
              <div className="px-4 py-3 bg-white/5 rounded-xl border border-dashed border-white/10 mx-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase text-center">No playlists yet</p>
              </div>
            ) : (
              playlists.map(p => (
                <motion.a 
                  key={p.id}
                  id={`sidebar-pl-${p.id}`}
                  onClick={() => { setActiveTab('playlist'); setSelectedPlaylistId(p.id); }} 
                  initial="initial"
                  whileHover="hovered"
                  className={`nav-item flex items-center gap-4 px-4 py-2.5 rounded-xl cursor-pointer relative transition-all duration-300 ${selectedPlaylistId === p.id && activeTab === 'playlist' ? 'text-white active-nav bg-white/5' : 'text-slate-400 hover:text-white'}`}
                >
                  <span className="material-symbols-outlined text-lg flex-shrink-0">playlist_play</span>
                  <TextRoll className="text-sm font-medium flex-1 min-w-0">{p.title}</TextRoll>
                  <AnimatePresence>
                    {landingPlaylistId === p.id && (
                      <motion.div 
                        key="landing-pulse"
                        className="absolute bg-accent/20 rounded-xl pointer-events-none"
                        initial={{ inset: 0, opacity: 0 }}
                        animate={{ inset: [-4, -8, -4], opacity: [0, 1, 0] }}
                        transition={{ duration: 0.6 }}
                      />
                    )}
                  </AnimatePresence>
                </motion.a>
              ))
            )}
          </div>
        </div>
        <div className="mt-auto pt-6">
          <motion.div 
            onClick={() => setActiveTab('settings')}
            initial="initial"
            whileHover="hovered"
            className={`px-3 py-3 flex items-center gap-3 rounded-xl cursor-pointer transition-all duration-300 group ${activeTab === 'settings' ? 'text-white active-nav bg-white/5' : 'text-slate-400 hover:text-white'}`}
          >
            <img alt="User avatar" className="size-8 rounded-lg border border-white/10 object-cover" src={userPfp}/>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold truncate">{userName}</p>
              <p className="text-[9px] text-slate-600 font-bold uppercase">Pro Tier</p>
            </div>
            <motion.span 
              variants={{
                initial: { rotate: 0, scale: 1, color: "#475569" }, // slate-600
                hovered: { rotate: 180, scale: 1.15, color: "#94a3b8" } // slate-400
              }}
              transition={{ type: "spring", stiffness: 150, damping: 12 }}
              className="material-symbols-outlined text-lg"
            >
              settings
            </motion.span>
          </motion.div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative z-10">
        <header className="sticky top-0 z-30 flex items-center justify-between px-10 py-5 bg-background-dark/20 backdrop-blur-md">
          <div className="flex items-center gap-6 flex-1">
            {/* View Navigation Buttons */}
            <div className="flex items-center gap-3.5 mr-3">
              <button
                onClick={goBack}
                disabled={navIndex <= 0}
                className={cn(
                  "p-1 transition-all flex items-center justify-center select-none outline-none",
                  navIndex > 0
                    ? "text-white cursor-pointer"
                    : "text-slate-700 cursor-not-allowed opacity-35"
                )}
                title="Go back"
              >
                <motion.span
                  variants={{
                    initial: { x: 0, scale: 1 },
                    hovered: navIndex > 0 ? { x: -3, scale: 1.2, color: "var(--theme-accent, #6366f1)" } : {},
                    tap: navIndex > 0 ? { scale: 0.9 } : {}
                  }}
                  initial="initial"
                  whileHover="hovered"
                  whileTap="tap"
                  className="material-symbols-outlined text-2xl font-bold select-none"
                >
                  chevron_left
                </motion.span>
              </button>
              <button
                onClick={goForward}
                disabled={navIndex >= navHistory.length - 1}
                className={cn(
                  "p-1 transition-all flex items-center justify-center select-none outline-none",
                  navIndex < navHistory.length - 1
                    ? "text-white cursor-pointer"
                    : "text-slate-700 cursor-not-allowed opacity-35"
                )}
                title="Go forward"
              >
                <motion.span
                  variants={{
                    initial: { x: 0, scale: 1 },
                    hovered: navIndex < navHistory.length - 1 ? { x: 3, scale: 1.2, color: "var(--theme-accent, #6366f1)" } : {},
                    tap: navIndex < navHistory.length - 1 ? { scale: 0.9 } : {}
                  }}
                  initial="initial"
                  whileHover="hovered"
                  whileTap="tap"
                  className="material-symbols-outlined text-2xl font-bold select-none"
                >
                  chevron_right
                </motion.span>
              </button>
            </div>

            <div className="relative w-full max-w-md group">
              <AnimatedInput 
                className="w-full bg-white/[0.03] border border-white/[0.02] rounded-xl py-2.5 pl-11 pr-4 text-xs focus:ring-1 focus:ring-accent/30 focus:border-accent/30 focus:bg-white/[0.06] outline-none transition-all text-transparent caret-white placeholder-transparent" 
                icon={<span className="material-symbols-outlined text-lg">search</span>}
                placeholder="Search..." 
                type="text"
                value={searchQuery}
                ref={searchInputRef}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <svg viewBox="0 0 100 50" className="w-10 h-5 overflow-visible">
                    <defs>
                      <linearGradient id="infinityGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                      <filter id="glow-infinity">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <motion.path
                      d="M 50,25 C 35,50 10,40 10,25 C 10,10 35,0 50,25 C 65,50 90,40 90,25 C 90,10 65,0 50,25"
                      fill="none"
                      stroke="url(#infinityGrad)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      filter="url(#glow-infinity)"
                      initial={{ pathLength: 0.35, pathOffset: 0 }}
                      animate={{ pathOffset: [0, 1] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="px-10 py-10 pb-40 space-y-20">
          {activeTab === 'discover' && (
            <>
              {/* Features Section - Active Onboarding */}
              {showFeatures && (
                <motion.section 
                  key="features-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-16 mt-8"
                >
                  <div className="flex flex-col mb-10">
                    <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.4em] mb-2 opacity-80 text-center">Getting Started</h2>
                    <h3 className="text-4xl font-black tracking-tighter text-white text-center">Make EchoStream Yours</h3>
                    <p className="text-slate-500 text-sm mt-3 text-center max-w-lg mx-auto">Import your library to unlock the full power of your personal music engine.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <GlowWrapper className="rounded-3xl" glowOpacity={0.3}>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="glass-card p-6 h-full flex flex-col gap-4 group cursor-pointer border-white/5 hover:border-accent/30 transition-all"
                      >
                        <div className="size-14 bg-accent/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-accent text-3xl">upload_file</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white mb-1">Import Media</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">Bring your local collection into EchoStream with full metadata support.</p>
                        </div>
                        <div className="mt-auto pt-4 flex items-center gap-2 text-accent text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                          Open Picker <span className="material-symbols-outlined text-sm">east</span>
                        </div>
                      </div>
                    </GlowWrapper>

                    <GlowWrapper className="rounded-3xl" glowOpacity={0.3}>
                      <div 
                        onClick={() => {
                          const name = prompt("Enter playlist name:");
                          if (name) createPlaylist(name);
                        }}
                        className="glass-card p-6 h-full flex flex-col gap-4 group cursor-pointer border-white/5 hover:border-accent/30 transition-all"
                      >
                        <div className="size-14 bg-pink-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-pink-500 text-3xl">add_circle</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white mb-1">New Playlist</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">Organize your vibes into beautiful collections instantly.</p>
                        </div>
                        <div className="mt-auto pt-4 flex items-center gap-2 text-pink-500 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                          Create Now <span className="material-symbols-outlined text-sm">east</span>
                        </div>
                      </div>
                    </GlowWrapper>

                    <GlowWrapper className="rounded-3xl" glowOpacity={0.3}>
                      <div 
                        onClick={() => searchInputRef.current?.focus()}
                        className="glass-card p-6 h-full flex flex-col gap-4 group cursor-pointer border-white/5 hover:border-accent/30 transition-all"
                      >
                        <div className="size-14 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-blue-500 text-3xl">search</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white mb-1">Advanced Search</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">Search across our global database or your local device.</p>
                        </div>
                        <div className="mt-auto pt-4 flex items-center gap-2 text-blue-500 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                          Focus Search <span className="material-symbols-outlined text-sm">east</span>
                        </div>
                      </div>
                    </GlowWrapper>

                    <GlowWrapper className="rounded-3xl" glowOpacity={0.3}>
                      <div 
                        className="glass-card p-6 h-full flex flex-col gap-4 group cursor-pointer border-white/5 hover:border-accent/30 transition-all"
                      >
                        <div className="size-14 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-purple-500 text-3xl">flare</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white mb-1">Spotlight Flow</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">Our tactile interface reacts to your every move in real-time.</p>
                        </div>
                        <div className="mt-auto pt-4 flex items-center gap-2 text-purple-500 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                          Active Interface <span className="material-symbols-outlined text-sm">check</span>
                        </div>
                      </div>
                    </GlowWrapper>
                  </div>
                </motion.section>
              )}

              {/* Personalized Section */}
              {hasPersonal && (
                <motion.section 
                  key="personalized-section"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="mb-12"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.4em] mb-1.5 opacity-80">Personalized</h2>
                      <h3 className="text-2xl font-bold tracking-tight text-white">Made For You</h3>
                    </div>
                    <button className="text-[10px] font-bold text-slate-500 hover:text-accent flex items-center gap-1 transition-colors uppercase tracking-widest">
                      View all <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <GlowWrapper className="rounded-[2rem]">
                      <div className="glass-card p-4 group cursor-pointer border-accent/20 bg-accent/5" onClick={() => setActiveTab('favorites')}>
                        <div className="relative mb-4 aspect-square rounded-[1.5rem] overflow-hidden shadow-2xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-6xl fill-[1] opacity-80 group-hover:scale-110 transition-transform duration-500">favorite</span>
                          </div>
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <button className="size-16 bg-white text-black rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                              <span className="material-symbols-outlined text-4xl fill-[1]">play_arrow</span>
                            </button>
                          </div>
                        </div>
                        <div className="px-2">
                          <h4 className="font-bold text-white/90 mb-0.5 truncate text-sm">Your Favorites</h4>
                          <p className="text-[10px] text-slate-600 font-medium truncate italic">Everything you love</p>
                        </div>
                      </div>
                    </GlowWrapper>

                    {(playlists || []).map((playlist) => (
                      <GlowWrapper key={playlist.id} className="rounded-[2rem]">
                        <div className="glass-card p-4 group cursor-pointer border-white/5 bg-white/5" onClick={() => { setActiveTab('playlist'); setSelectedPlaylistId(playlist.id); }}>
                          <div className="relative mb-4 aspect-square rounded-[1.5rem] overflow-hidden shadow-2xl bg-white/5 flex items-center justify-center">
                            {playlist.songs.length > 0 ? (
                              <img alt={playlist.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={playlist.songs[0].albumArt}/>
                            ) : (
                              <span className="material-symbols-outlined text-5xl text-white/10">playlist_play</span>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <button className="size-16 bg-white text-black rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                <span className="material-symbols-outlined text-4xl fill-[1]">play_arrow</span>
                              </button>
                            </div>
                          </div>
                          <div className="px-2">
                            <h4 className="font-bold text-white/90 mb-0.5 truncate text-sm">{playlist.title}</h4>
                            <p className="text-[10px] text-slate-600 font-medium truncate italic">{playlist.songs.length} Tracks • Mixed</p>
                          </div>
                        </div>
                      </GlowWrapper>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Recents Section on Discover */}
              {hasHistory && (
                <motion.section
                  key="recents-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-white">Recently Played</h2>
                      <p className="text-slate-500 text-xs mt-1">Jump back into your favorites</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from(new Set((history || []).map(s => s.id))).map(id => history.find(s => s.id === id)!).reverse().slice(0, 8).map((song, i) => (
                      <GlowWrapper key={`recents-discover-${song.id}-${i}`} className="rounded-2xl">
                        <div onClick={() => playSong(song, history)} className="glass-card flex items-center gap-4 p-3 group cursor-pointer">
                          <div className="size-20 flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
                            <img alt={song.title} className="w-full h-full object-cover" src={song.albumArt}/>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h3 className="font-semibold text-white/90 truncate text-sm">{song.title}</h3>
                            <p 
                              onClick={(e) => { e.stopPropagation(); setViewingArtist(song.artist, song.artistId); }} 
                              className="text-[10px] text-slate-500 font-bold hover:text-accent hover:underline cursor-pointer uppercase tracking-wider truncate"
                            >
                              {song.artist}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              id={`add-btn-${song.id}`}
                              onClick={(e) => { e.stopPropagation(); setAddingSong(song); }} 
                              className="size-8 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" 
                              title="Add to Playlist"
                            >
                              <span className="material-symbols-outlined text-sm">playlist_add</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); addToQueue(song); triggerQueueFlight(song, e.currentTarget.getBoundingClientRect()); }} className="size-8 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" title="Add to Queue">
                              <span className="material-symbols-outlined fill-[1] text-sm">queue_music</span>
                            </button>
                            <button className="size-8 bg-accent text-white rounded-full flex items-center justify-center shadow-lg pointer-events-none">
                              <span className="material-symbols-outlined fill-[1] text-base">play_arrow</span>
                            </button>
                          </div>
                        </div>
                      </GlowWrapper>
                    ))}
                  </div>
                </motion.section>
              )}
            </>
          )}

          {activeTab === 'browse' && (
            <section className="space-y-12">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-white tracking-tight">
                  {searchResults.length > 0 ? "Search Results" : "Explore Content"}
                </h2>
                <p className="text-slate-500 text-sm">
                  {searchQuery ? `Showing results for "${searchQuery}"` : "Discover artists, tracks, and more"}
                </p>
              </div>

              {searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] rounded-[2rem] border border-dashed border-white/5">
                  <span className="material-symbols-outlined text-6xl text-slate-700 mb-4">search_off</span>
                  <p className="text-slate-500 font-medium italic">
                    {searchQuery ? "No results found. Try a different search term?" : "Type in the search bar above to find music."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {searchResults.map((song, i) => (
                    <GlowWrapper key={`search-results-${song.id}-${i}`} className="rounded-2xl">
                      <div onClick={() => playSong(song, searchResults)} className="glass-card flex items-center gap-4 p-3 group cursor-pointer">
                        <div className="size-20 flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
                          <img alt={song.title} className="w-full h-full object-cover" src={song.albumArt}/>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h3 className="font-semibold text-white/90 truncate text-sm">{song.title}</h3>
                          <p 
                            onClick={(e) => { e.stopPropagation(); setViewingArtist(song.artist, song.artistId); }} 
                            className="text-[10px] text-slate-500 font-bold hover:text-accent hover:underline cursor-pointer uppercase tracking-wider truncate"
                          >
                            {song.artist}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            id={`add-btn-${song.id}`}
                            onClick={(e) => { e.stopPropagation(); setAddingSong(song); }} 
                            className="size-8 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" 
                            title="Add to Playlist"
                          >
                            <span className="material-symbols-outlined text-sm">playlist_add</span>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); addToQueue(song); triggerQueueFlight(song, e.currentTarget.getBoundingClientRect()); }} className="size-8 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" title="Add to Queue">
                            <span className="material-symbols-outlined fill-[1] text-sm">queue_music</span>
                          </button>
                          <button className="size-8 bg-accent text-white rounded-full flex items-center justify-center shadow-lg pointer-events-none">
                            <span className="material-symbols-outlined fill-[1] text-base">play_arrow</span>
                          </button>
                        </div>
                      </div>
                    </GlowWrapper>
                  ))}
                </div>
              )}
            </section>
          )}



          {activeTab === 'local' && (
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white px-2">Local Music</h2>
                  <p className="text-slate-400 text-sm mt-1">{localSongs.length} tracks found on your device</p>
                </div>
              </div>
              {localSongs.length === 0 ? (
                <div className="text-slate-500">{"You haven't imported any local files yet. Click 'Import Files' to begin!"}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {localSongs.map((song) => (
                    <GlowWrapper key={song.id} className="rounded-2xl">
                      <div onClick={() => playSong(song, localSongs)} className="glass-card flex items-center gap-4 p-3 group cursor-pointer">
                        <div className="size-20 flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
                          <img alt={song.title} className="w-full h-full object-cover" src={song.albumArt}/>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h3 className="font-bold text-white truncate">{song.title}</h3>
                          <p 
                            onClick={(e) => { e.stopPropagation(); setViewingArtist(song.artist, song.artistId); }} 
                            className="text-[10px] text-slate-500 font-bold hover:text-accent hover:underline cursor-pointer uppercase tracking-wider truncate"
                          >
                            {song.artist}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            id={`add-btn-${song.id}`}
                            onClick={(e) => { e.stopPropagation(); setAddingSong(song); }} 
                            className="size-10 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" 
                            title="Add to Playlist"
                          >
                            <span className="material-symbols-outlined text-sm">playlist_add</span>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); addToQueue(song); triggerQueueFlight(song, e.currentTarget.getBoundingClientRect()); }} className="size-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" title="Add to Queue">
                            <span className="material-symbols-outlined fill-[1] text-[20px]">queue_music</span>
                          </button>
                          <button className="size-10 bg-accent text-white rounded-full flex items-center justify-center shadow-lg pointer-events-none">
                            <span className="material-symbols-outlined fill-[1]">play_arrow</span>
                          </button>
                        </div>
                      </div>
                    </GlowWrapper>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'favorites' && (
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-white">Your Favorite Songs</h2>
                  <p className="text-slate-400 text-sm mt-1">{likedSongs.length} tracks</p>
                </div>
              </div>
              {likedSongs.length === 0 ? (
                <div className="text-slate-500">{"You haven't liked any songs yet. Play a song and click the heart icon!"}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {likedSongs.map((song, i) => (
                    <GlowWrapper key={`favpage-${song.id}-${i}`} className="rounded-2xl">
                      <div onClick={() => playSong(song, likedSongs)} className="glass-card flex items-center gap-4 p-3 group cursor-pointer">
                        <div className="size-20 flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
                          <img alt={song.title} className="w-full h-full object-cover" src={song.albumArt}/>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h3 className="font-bold text-white truncate">{song.title}</h3>
                          <p 
                            onClick={(e) => { e.stopPropagation(); setViewingArtist(song.artist, song.artistId); }} 
                            className="text-[10px] text-slate-500 font-bold hover:text-accent hover:underline cursor-pointer uppercase tracking-wider truncate"
                          >
                            {song.artist}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            id={`add-btn-${song.id}-fav`}
                            onClick={(e) => { e.stopPropagation(); setAddingSong(song); }} 
                            className="size-10 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" 
                            title="Add to Playlist"
                          >
                            <span className="material-symbols-outlined text-sm">playlist_add</span>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); addToQueue(song); triggerQueueFlight(song, e.currentTarget.getBoundingClientRect()); }} className="size-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" title="Add to Queue">
                            <span className="material-symbols-outlined fill-[1] text-[20px]">queue_music</span>
                          </button>
                          <button className="size-10 bg-accent text-white rounded-full flex items-center justify-center shadow-lg pointer-events-none">
                            <span className="material-symbols-outlined fill-[1]">play_arrow</span>
                          </button>
                        </div>
                      </div>
                    </GlowWrapper>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'recent' && (
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-white">Recently Played</h2>
                  <p className="text-slate-400 text-sm mt-1">Your detailed listening history</p>
                </div>
              </div>
              {history.length === 0 ? (
                <div className="text-slate-500">Your play history is empty. Go discover some music!</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(() => {
                    const recentSongs = Array.from(new Map(history.filter(Boolean).map(s => [s.id, s])).values()).reverse();
                    return recentSongs.map((song, i) => (
                      <GlowWrapper key={`recpage-${song.id}-${i}`} className="rounded-2xl">
                        <div onClick={() => playSong(song, recentSongs)} className="glass-card flex items-center gap-4 p-3 group cursor-pointer">
                          <div className="size-20 flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
                            <img alt={song.title} className="w-full h-full object-cover" src={song.albumArt}/>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h3 className="font-bold text-white truncate">{song.title}</h3>
                            <p 
                              onClick={(e) => { e.stopPropagation(); setViewingArtist(song.artist, song.artistId); }} 
                              className="text-[10px] text-slate-500 font-bold hover:text-accent hover:underline cursor-pointer uppercase tracking-wider truncate"
                            >
                              {song.artist}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); addToQueue(song); triggerQueueFlight(song, e.currentTarget.getBoundingClientRect()); }} className="size-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" title="Add to Queue">
                              <span className="material-symbols-outlined fill-[1] text-[20px]">queue_music</span>
                            </button>
                            <button className="size-10 bg-accent text-white rounded-full flex items-center justify-center shadow-lg pointer-events-none">
                              <span className="material-symbols-outlined fill-[1]">play_arrow</span>
                            </button>
                          </div>
                        </div>
                      </GlowWrapper>
                    ));
                  })()}
                </div>
              )}
            </section>
          )}

          {activeTab === 'playlist' && currentPlaylist && (
            <section>
              <div className="flex items-center gap-8 mb-12">
                <div className="size-48 rounded-[2.5rem] overflow-hidden glass-panel shadow-2xl relative group">
                  <img alt={currentPlaylist.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={currentPlaylist.coverArt}/>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="size-16 bg-white text-black rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <span className="material-symbols-outlined text-4xl fill-[1]">play_arrow</span>
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mb-2">Playlist</p>
                    <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">{currentPlaylist.title}</h2>
                    <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                      <span>{currentPlaylist.songs.length} tracks</span>
                      <span className="size-1 bg-slate-700 rounded-full"></span>
                      <span>Created by you</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setEditingPlaylist(currentPlaylist)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10 hover:scale-105 active:scale-95 transition-all text-xs font-bold uppercase tracking-wider"
                      title="Edit Playlist"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      Edit Details
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete the playlist "${currentPlaylist.title}"?`)) {
                          deletePlaylist(currentPlaylist.id);
                          setActiveTab('discover');
                          setSelectedPlaylistId(null);
                        }
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/40 hover:scale-105 active:scale-95 transition-all text-xs font-bold uppercase tracking-wider"
                      title="Delete Playlist"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                      Delete Playlist
                    </button>
                  </div>
                </div>
              </div>

              {currentPlaylist.songs.length === 0 ? (
                <div className="text-slate-500">This playlist is empty. Add some songs to get started!</div>
              ) : (
                <div className="space-y-2">
                  {currentPlaylist.songs.map((song: Song, i: number) => (
                    <div 
                      key={`plsong-${song.id}-${i}`} 
                      onClick={() => playSong(song, currentPlaylist.songs)} 
                      className={`glass-card flex items-center gap-4 p-3 rounded-2xl group cursor-pointer hover:bg-white/5 border-transparent transition-all duration-500 ${
                        animatingDeleteIds.includes(song.id) ? 'opacity-10 scale-95 pointer-events-none translate-x-2' : ''
                      }`}
                    >
                      <div className="w-8 text-center text-slate-600 font-bold group-hover:text-accent transition-colors tabular-nums">{i + 1}</div>
                      <div className="size-12 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                        <img alt={song.title} className="w-full h-full object-cover" src={song.albumArt}/>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h3 className="font-semibold text-white/90 truncate text-sm">{song.title}</h3>
                        <p 
                          onClick={(e) => { e.stopPropagation(); setViewingArtist(song.artist, song.artistId); }} 
                          className="text-[10px] text-slate-500 font-bold hover:text-accent hover:underline cursor-pointer uppercase tracking-wider truncate"
                        >
                          {song.artist}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 px-4 text-slate-500 text-xs font-bold w-32 truncate">
                        {song.album}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToQueue(song); triggerQueueFlight(song, e.currentTarget.getBoundingClientRect()); }} 
                          className="size-10 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" 
                          title="Add to Queue"
                        >
                          <span className="material-symbols-outlined fill-[1] text-[20px]">queue_music</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const row = e.currentTarget.closest('.glass-card');
                            const rect = row ? row.getBoundingClientRect() : e.currentTarget.getBoundingClientRect();
                            setAnimatingDeleteIds(prev => [...prev, song.id]);
                            setDeletingSongData({
                              song,
                              playlistId: currentPlaylist.id,
                              startRect: rect
                            });
                          }} 
                          className="size-10 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center transition-all" 
                          title="Remove from Playlist"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'album' && viewingAlbumName && (
            <section>
              {/* Back Navigation */}
              <button 
                onClick={() => {
                  setViewingAlbumName(null);
                  setActiveTab('discover');
                }} 
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-xs font-bold uppercase tracking-widest transition-colors"
              >
                <span className="material-symbols-outlined text-sm">west</span>
                Back
              </button>

              {(() => {
                const uniqueAlbumSongs = viewedAlbumSongs;
                const albumCover = uniqueAlbumSongs[0]?.albumArt || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745";
                const albumArtist = uniqueAlbumSongs[0]?.artist || "Unknown Artist";

                if (viewedAlbumLoading) {
                  return (
                    <div className="flex flex-col items-center justify-center py-20">
                      <span className="material-symbols-outlined text-4xl text-accent animate-spin mb-4">sync</span>
                      <p className="text-slate-500 italic font-medium">Fetching tracks from YouTube Music...</p>
                    </div>
                  );
                }

                if (uniqueAlbumSongs.length === 0) {
                  return (
                    <div className="text-slate-500 py-10">
                      No songs found for this album.
                    </div>
                  );
                }

                return (
                  <>
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                      <div className="size-48 rounded-[2.5rem] overflow-hidden glass-panel shadow-2xl relative group flex-shrink-0">
                        <img 
                          alt={viewingAlbumName} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          src={albumCover}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button 
                            onClick={() => playSong(uniqueAlbumSongs[0], uniqueAlbumSongs)}
                            className="size-16 bg-white text-black rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300"
                          >
                            <span className="material-symbols-outlined text-4xl fill-[1]">play_arrow</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <p className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mb-2">Album</p>
                        <h2 className="text-5xl font-black text-white mb-4 tracking-tighter leading-none">{viewingAlbumName}</h2>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 text-sm font-medium">
                          <span className="text-white font-semibold">{albumArtist}</span>
                          <span className="size-1 bg-slate-700 rounded-full"></span>
                          <span>{uniqueAlbumSongs.length} tracks</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {uniqueAlbumSongs.map((song: Song, i: number) => {
                        const isCurrent = currentSong?.id === song.id;
                        return (
                          <div 
                            key={`albumsong-${song.id}-${i}`} 
                            onClick={() => playSong(song, uniqueAlbumSongs)} 
                            className={cn(
                              "glass-card flex items-center gap-4 p-3 rounded-2xl group cursor-pointer hover:bg-white/5 border-transparent transition-all duration-500",
                              isCurrent ? "bg-white/5 border-accent/20" : ""
                            )}
                          >
                            <div className={cn(
                              "w-8 text-center font-bold transition-colors tabular-nums",
                              isCurrent ? "text-accent animate-pulse" : "text-slate-600 group-hover:text-accent"
                            )}>{i + 1}</div>
                            <div className="size-12 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                              <img alt={song.title} className="w-full h-full object-cover" src={song.albumArt}/>
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <h3 className={cn(
                                "font-semibold truncate text-sm",
                                isCurrent ? "text-accent" : "text-white/90"
                              )}>{song.title}</h3>
                              <p 
                                onClick={(e) => { e.stopPropagation(); setViewingArtist(song.artist, song.artistId); }} 
                                className="text-[10px] text-slate-500 font-bold hover:text-accent hover:underline cursor-pointer uppercase tracking-wider truncate"
                              >
                                {song.artist}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 px-4 text-slate-500 text-xs font-bold w-32 truncate">
                              {song.genre}
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                id={`add-btn-${song.id}-album`}
                                onClick={(e) => { e.stopPropagation(); setAddingSong(song); }} 
                                className="size-10 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" 
                                title="Add to Playlist"
                              >
                                <span className="material-symbols-outlined text-sm">playlist_add</span>
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); addToQueue(song); triggerQueueFlight(song, e.currentTarget.getBoundingClientRect()); }} 
                                className="size-10 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" 
                                title="Add to Queue"
                              >
                                <span className="material-symbols-outlined fill-[1] text-[20px]">queue_music</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </section>
          )}

          {activeTab === 'artist' && viewingArtistName && (
            <section>
              {/* Back Navigation */}
              <button 
                onClick={() => {
                  setViewingArtist(null);
                  setActiveTab('discover');
                }} 
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-xs font-bold uppercase tracking-widest transition-colors"
              >
                <span className="material-symbols-outlined text-sm">west</span>
                Back
              </button>

              {(() => {
                if (viewedArtistLoading) {
                  return (
                    <div className="flex flex-col items-center justify-center py-20">
                      <span className="material-symbols-outlined text-4xl text-accent animate-spin mb-4">sync</span>
                      <p className="text-slate-500 italic font-medium">Fetching artist profile...</p>
                    </div>
                  );
                }

                // Fallback construction
                let artist = viewedArtistDetails;
                if (!artist) {
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
                  const uniqueSongs = Array.from(new Map(allAvailableSongs.filter(Boolean).map(s => [s.id, s])).values());
                  const artistSongsFallback = uniqueSongs.filter(s => s && s.artist && s.artist.toLowerCase() === viewingArtistName.toLowerCase());
                  
                  if (artistSongsFallback.length > 0) {
                    artist = {
                      id: `local-${viewingArtistName}`,
                      name: viewingArtistName,
                      thumbnail: artistSongsFallback[0].albumArt,
                      topSongs: artistSongsFallback,
                      topAlbums: [],
                      similarArtists: []
                    };
                  }
                }

                if (!artist) {
                  return (
                    <div className="text-slate-500 py-10">
                      No songs or profile details found for this artist.
                    </div>
                  );
                }

                return (
                  <div className="space-y-12">
                    {/* Premium Banner Header */}
                    <div className="relative h-80 rounded-[3rem] overflow-hidden shadow-2xl flex items-end p-10 group">
                      {/* Blurred backdrop banner */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center scale-105 transition-all duration-700 group-hover:scale-100" 
                        style={{ backgroundImage: `url(${artist.thumbnail})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      
                      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                        <div className="size-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl flex-shrink-0">
                          <img alt={artist.name} className="w-full h-full object-cover" src={artist.thumbnail} />
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-3">
                          <span className="text-[10px] text-accent font-extrabold uppercase tracking-[0.35em] bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                            Verified Artist
                          </span>
                          <h1 className="text-5xl font-black tracking-tighter text-white font-space-grotesk">{artist.name}</h1>
                          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{artist.topSongs?.length || 0} tracks available on this node</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      {/* Left: Top Songs */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                            Top Tracks <span className="h-px bg-white/10 flex-grow w-24"></span>
                          </h3>
                          {artist.topSongs?.length > 5 && (
                            <button 
                              onClick={() => setShowAllArtistSongs(!showAllArtistSongs)}
                              className="text-xs text-slate-500 hover:text-accent font-bold uppercase tracking-wider transition-colors"
                            >
                              {showAllArtistSongs ? "Show Less" : "Show All"}
                            </button>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {(showAllArtistSongs ? artist.topSongs : artist.topSongs.slice(0, 5)).map((song: any, index: number) => {
                            const isCurrent = currentSong?.id === song.id;
                            const isAnimatingDelete = animatingDeleteIds.includes(song.id);
                            return (
                              <div 
                                key={`art-song-${song.id}-${index}`}
                                className={cn(
                                  "flex items-center gap-4 p-3 rounded-2xl border border-white/5 bg-white/[0.015] hover:bg-white/[0.03] transition-all group",
                                  isCurrent ? "border-accent/30 bg-accent/5" : "",
                                  isAnimatingDelete ? "opacity-30 pointer-events-none scale-95" : ""
                                )}
                              >
                                <span className="w-6 text-center text-xs font-bold text-slate-650 group-hover:text-white transition-colors">{index + 1}</span>
                                
                                <div className="size-11 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-md">
                                  <img src={song.albumArt} alt={song.title} className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <span className={cn(
                                    "font-semibold text-sm truncate block transition-colors duration-300",
                                    isCurrent ? "text-accent" : "text-white/90"
                                  )}>
                                    {song.title}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mt-0.5">{song.album}</span>
                                </div>

                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    id={`add-btn-${song.id}`}
                                    onClick={(e) => { e.stopPropagation(); setAddingSong(song); }} 
                                    className="size-8 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" 
                                    title="Add to Playlist"
                                  >
                                    <span className="material-symbols-outlined text-sm">playlist_add</span>
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); addToQueue(song); triggerQueueFlight(song, e.currentTarget.getBoundingClientRect()); }} 
                                    className="size-8 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" 
                                    title="Add to Queue"
                                  >
                                    <span className="material-symbols-outlined fill-[1] text-sm">queue_music</span>
                                  </button>
                                  <button 
                                    onClick={() => playSong(song, artist?.topSongs || [])}
                                    className="size-8 bg-accent text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                                  >
                                    <span className="material-symbols-outlined fill-[1] text-base">play_arrow</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Sidebar: Albums & Similar Artists */}
                      <div className="space-y-10">
                        {/* Albums list (Vertical Accordion) */}
                        {artist.topAlbums?.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                              Albums <span className="h-px bg-white/10 flex-1"></span>
                            </h3>
                            <div 
                              className="flex flex-col gap-2.5 w-full overflow-visible"
                              onMouseLeave={() => setHoveredAlbumIdx(null)}
                            >
                              {artist.topAlbums.slice(0, 5).map((album: any, idx: number) => {
                                const isHovered = hoveredAlbumIdx === idx;
                                return (
                                  <motion.div
                                    key={`art-alb-${album.id}-${idx}`}
                                    onMouseEnter={() => setHoveredAlbumIdx(idx)}
                                    onClick={() => setViewingAlbumName(album.name, album.id)}
                                    className="relative w-full cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-white/[0.015] hover:bg-white/[0.03] hover:border-accent/40 backdrop-blur-md transition-colors duration-300"
                                    animate={{
                                      height: isHovered ? 180 : 54,
                                    }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 300,
                                      damping: 25,
                                    }}
                                  >
                                    {/* Blurred cover art as low opacity background */}
                                    <div 
                                      className="absolute inset-0 bg-cover bg-center pointer-events-none filter blur-xl scale-110 transition-opacity duration-500"
                                      style={{ 
                                        backgroundImage: `url(${album.coverArt})`,
                                        opacity: isHovered ? 0.12 : 0 
                                      }}
                                    />

                                    {/* Card Content Container */}
                                    <div className="relative z-10 flex flex-col justify-between h-full p-2.5">
                                      {/* Always visible header */}
                                      <div className="flex items-center gap-3 w-full">
                                        {/* Album Art Icon */}
                                        <div className="size-8 rounded-lg overflow-hidden shrink-0 shadow-md border border-white/5">
                                          <img src={album.coverArt} alt={album.name} className="w-full h-full object-cover" />
                                        </div>

                                        {/* Text Info */}
                                        <div className="flex-1 min-w-0">
                                          <h4 className={cn(
                                            "font-bold text-xs truncate leading-tight transition-colors duration-300",
                                            isHovered ? "text-accent" : "text-white/80"
                                          )}>
                                            {album.name}
                                          </h4>
                                          <p className="text-[8.5px] text-slate-500 font-bold uppercase mt-0.5">
                                            {album.year || "Album"}
                                          </p>
                                        </div>

                                        {/* Action indicator */}
                                        <span className={cn(
                                          "material-symbols-outlined text-[16px] text-slate-600 transition-all duration-300",
                                          isHovered ? "rotate-90 text-accent font-bold scale-110" : ""
                                        )}>
                                          chevron_right
                                        </span>
                                      </div>

                                      {/* Expanded Body details */}
                                      <AnimatePresence>
                                        {isHovered && (
                                          <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                            className="flex gap-3.5 items-center mt-2.5 overflow-hidden"
                                          >
                                            {/* Larger Cover */}
                                            <div className="size-20 rounded-xl overflow-hidden shrink-0 shadow-lg border border-white/10">
                                              <img src={album.coverArt} alt={album.name} className="w-full h-full object-cover" />
                                            </div>

                                            {/* Extra details & action */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
                                              <p className="text-[10px] text-slate-400 font-medium leading-relaxed line-clamp-2">
                                                Browse this album to view all songs, play tracks, and add to your playlists.
                                              </p>
                                              
                                              <div className="flex items-center gap-2 mt-auto">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setViewingAlbumName(album.name, album.id);
                                                  }}
                                                  className="px-2.5 py-1 bg-accent/20 hover:bg-accent text-accent hover:text-white border border-accent/25 hover:border-transparent rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1 shadow-md hover:scale-105 active:scale-95"
                                                >
                                                  <span className="material-symbols-outlined text-xs">explore</span>
                                                  View Album
                                                </button>
                                              </div>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Similar Artists */}
                        {artist.similarArtists?.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                              Similar Artists <span className="h-px bg-white/10 flex-1"></span>
                            </h3>
                            <div className="flex flex-col gap-2.5">
                              {artist.similarArtists.slice(0, 5).map((sim: any, idx: number) => (
                                <div 
                                  key={`sim-art-${sim.id}-${idx}`}
                                  onClick={() => setViewingArtist(sim.name, sim.id)}
                                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent/10 cursor-pointer rounded-xl flex items-center gap-3 transition-all group"
                                >
                                  <img 
                                    src={sim.thumbnail} 
                                    alt={sim.name} 
                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/10" 
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className="font-bold text-white text-xs truncate group-hover:text-accent transition-colors block">{sim.name}</span>
                                    <span className="text-[9px] text-slate-500 font-bold uppercase block mt-0.5">Artist</span>
                                  </div>
                                  <span className="material-symbols-outlined text-white/30 group-hover:text-white transition-colors text-sm">arrow_forward</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </section>
          )}

          {activeTab === 'settings' && (
            <SettingsPage 
              userName={userName}
              setUserName={setUserName}
              userPfp={userPfp}
              setUserPfp={setUserPfp}
              logoStyle={logoStyle}
              setLogoStyle={handleLogoStyleChange}
              setActiveTab={setActiveTab}
            />
          )}
        </div>
      </main>

      <AnimatePresence>
        {addingSong && (
          <AddToPlaylistModal 
            song={addingSong} 
            onClose={() => setAddingSong(null)} 
            onAdded={(playlistId) => {
              addSongToPlaylist(playlistId, addingSong);
              // Store rect for flight
              const btn = document.getElementById(`add-btn-${addingSong.id}`);
              if (btn) {
                // Ensure sidebar rendered the new playlist if it was just created
                // In a real app we might need a small timeout or useEffect, 
                // but since state update triggers re-render, we'll try immediately.
                triggerFlight(addingSong, btn.getBoundingClientRect(), playlistId);
              }
              setAddingSong(null);
            }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {flightData && (
          <FlightAnimation 
            startRect={flightData.start} 
            endRect={flightData.end} 
            imageUrl={flightImageUrl}
            onComplete={() => setFlightData(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingSongData && (
          <TrashDeleteAnimation 
            song={deletingSongData.song}
            startRect={deletingSongData.startRect}
            onComplete={() => {
              removeSongFromPlaylist(deletingSongData.playlistId, deletingSongData.song.id);
              setAnimatingDeleteIds(prev => prev.filter(id => id !== deletingSongData.song.id));
              setDeletingSongData(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingPlaylist && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-lg rounded-3xl p-6 relative overflow-hidden border border-white/10"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-accent">edit</span> Edit Playlist Details
              </h3>

              <div className="space-y-6">
                {/* Playlist Name Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Playlist Name</label>
                  <input
                    type="text"
                    defaultValue={editingPlaylist.title}
                    id="edit-pl-name-input"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-accent/30 focus:border-accent/30 outline-none text-white transition-all font-bold"
                    placeholder="Enter playlist name..."
                  />
                </div>

                {/* Cover Art selection */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cover Art</label>
                  
                  {/* Selected cover preview */}
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      id="edit-pl-cover-preview"
                      src={editingPlaylist.coverArt}
                      className="size-20 rounded-2xl object-cover border border-white/10 shadow-lg"
                      alt="Playlist Cover Preview"
                    />
                    <div>
                      <span className="text-[10px] text-accent font-extrabold uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded">
                        Active Cover
                      </span>
                      <p className="text-xs text-slate-500 mt-1">Select from presets below or upload your own.</p>
                    </div>
                  </div>

                  {/* Preset Covers Grid */}
                  <div className="grid grid-cols-6 gap-2">
                    {PREMADE_COVERS.map((cover, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const img = document.getElementById("edit-pl-cover-preview") as HTMLImageElement;
                          if (img) img.src = cover;
                        }}
                        className="aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all hover:scale-105 active:scale-95"
                      >
                        <img src={cover} className="w-full h-full object-cover" alt="cover option" />
                      </button>
                    ))}

                    {/* Upload custom cover button */}
                    <button
                      onClick={() => plCoverUploadRef.current?.click()}
                      className="aspect-square rounded-xl bg-white/[0.03] border-2 border-dashed border-white/10 hover:border-accent hover:bg-white/[0.06] transition-all flex items-center justify-center group"
                      title="Upload custom cover"
                    >
                      <span className="material-symbols-outlined text-white/50 group-hover:text-accent transition-colors text-lg">add_photo_alternate</span>
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={plCoverUploadRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!file.type.startsWith("image/")) {
                        alert("Please select a valid image file.");
                        return;
                      }
                      if (file.size > 2 * 1024 * 1024) {
                        alert("Selected image is too large! Please choose an image smaller than 2MB.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64 = event.target?.result as string;
                        const img = document.getElementById("edit-pl-cover-preview") as HTMLImageElement;
                        if (img && base64) img.src = base64;
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                  <button
                    onClick={() => setEditingPlaylist(null)}
                    className="bg-white/5 hover:bg-white/10 text-white border border-white/5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const nameInput = document.getElementById("edit-pl-name-input") as HTMLInputElement;
                      const img = document.getElementById("edit-pl-cover-preview") as HTMLImageElement;
                      if (nameInput && nameInput.value.trim() && img) {
                        updatePlaylist(editingPlaylist.id, nameInput.value.trim(), img.src);
                        setEditingPlaylist(null);
                      } else {
                        alert("Playlist name cannot be empty!");
                      }
                    }}
                    className="bg-accent text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 uppercase tracking-wider shadow-lg shadow-accent/25"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomPlayer />
      <ExpandedPlayer />
      <input 
        type="file" 
        accept="audio/*" 
        {...({ webkitdirectory: "true", directory: "" } as any)} 
        multiple
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileUpload} 
      />
    </div>
  );
}
