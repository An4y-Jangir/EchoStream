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
import { StoryCardModal } from "@/components/ui/StoryCardModal";

const jsmediatags = typeof window !== "undefined" ? require("jsmediatags/dist/jsmediatags.min.js") : null;

const PREMADE_COVERS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500&auto=format&fit=crop", // Synthwave Neon
  "https://images.unsplash.com/photo-1535478044878-3ed83d5456ef?q=80&w=500&auto=format&fit=crop", // Retro Pink Cassette (New)
  "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=500&auto=format&fit=crop", // Abstract Glow
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=500&auto=format&fit=crop", // Cosmic Space
  "https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=500&auto=format&fit=crop", // Spinning Vinyl Record (New)
];

const SPOTLIGHT_TRACKS = [
  {
    song: MOCK_SONGS[0], // Midnight City
    badge: "EDITORIAL SPOTLIGHT",
    accentColor: "from-pink-500/20 via-purple-600/15 to-indigo-950/40",
    quote: "The quintessential neon synthwave anthem that defined a decade. Soaring saxophone solos and late-night highway energy.",
    vibeTag: "Synthwave / Electronic",
  },
  {
    song: MOCK_SONGS[1], // Blinding Lights
    badge: "GLOBAL TOP HIT",
    accentColor: "from-rose-500/20 via-red-600/15 to-slate-950/40",
    quote: "An unstoppable 80s-inspired stadium synthpop sensation powered by relentless drum machines and vocal brilliance.",
    vibeTag: "Synthpop / 80s Retro",
  },
  {
    song: MOCK_SONGS[4], // Resonance
    badge: "ANALOG VIBE",
    accentColor: "from-cyan-500/20 via-blue-600/15 to-slate-950/40",
    quote: "Warm analog synthesizer pads, tape saturation, and timeless nostalgic warmth for deep focus and introspection.",
    vibeTag: "Chillwave / Lo-Fi",
  },
];

const MOOD_FILTERS = [
  { id: "all", label: "All Vibes", icon: "bolt", genre: null },
  { id: "synthwave", label: "Synthwave", icon: "flare", genre: "Synthwave" },
  { id: "electronic", label: "Electronic", icon: "graphic_eq", genre: "Electronic" },
  { id: "disco", label: "Disco & Funk", icon: "album", genre: "Disco" },
  { id: "chill", label: "Lo-Fi & Chill", icon: "spa", genre: "Chillwave" },
  { id: "darkwave", label: "Darkwave", icon: "nightlight", genre: "Darkwave" },
];

const MOOD_THEMES: Record<string, { accent: string; glow1: string; glow2: string; glow3: string }> = {
  all: {
    accent: "rgb(99, 102, 241)",
    glow1: "rgba(99, 102, 241, 0.75)",
    glow2: "rgba(236, 72, 153, 0.65)",
    glow3: "rgba(59, 130, 246, 0.55)",
  },
  synthwave: {
    accent: "rgb(244, 63, 94)",
    glow1: "rgba(244, 63, 94, 0.8)",
    glow2: "rgba(168, 85, 247, 0.7)",
    glow3: "rgba(14, 165, 233, 0.6)",
  },
  electronic: {
    accent: "rgb(6, 182, 212)",
    glow1: "rgba(6, 182, 212, 0.8)",
    glow2: "rgba(139, 92, 246, 0.7)",
    glow3: "rgba(16, 185, 129, 0.6)",
  },
  disco: {
    accent: "rgb(245, 158, 11)",
    glow1: "rgba(245, 158, 11, 0.8)",
    glow2: "rgba(249, 115, 22, 0.7)",
    glow3: "rgba(225, 29, 72, 0.6)",
  },
  chill: {
    accent: "rgb(16, 185, 129)",
    glow1: "rgba(16, 185, 129, 0.75)",
    glow2: "rgba(14, 165, 233, 0.65)",
    glow3: "rgba(139, 92, 246, 0.55)",
  },
  darkwave: {
    accent: "rgb(168, 85, 247)",
    glow1: "rgba(126, 34, 206, 0.8)",
    glow2: "rgba(225, 29, 72, 0.7)",
    glow3: "rgba(30, 58, 138, 0.65)",
  },
};

export default function Home() {
  const { 
    playSong, 
    currentSong, 
    isPlaying,
    togglePlay,
    toggleExpanded,
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
    openStoryModal,
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

  // Discover page states & logic
  const [selectedMood, setSelectedMood] = useState<string>("all");
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [greeting, setGreeting] = useState<{ title: string; subtitle: string; icon: string }>({
    title: "Welcome back",
    subtitle: "Your personal high-fidelity music universe",
    icon: "graphic_eq"
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting({
        title: `Good morning, ${userName}`,
        subtitle: "Kickstart your flow with crisp rhythms and morning frequencies",
        icon: "wb_sunny"
      });
    } else if (hour >= 12 && hour < 18) {
      setGreeting({
        title: `Good afternoon, ${userName}`,
        subtitle: "Lock in with energetic grooves and atmospheric focus",
        icon: "wb_twilight"
      });
    } else if (hour >= 18 && hour < 22) {
      setGreeting({
        title: `Good evening, ${userName}`,
        subtitle: "Unwind with sunset synthesizers and late-night highway soundscapes",
        icon: "nights_stay"
      });
    } else {
      setGreeting({
        title: `Midnight Sessions, ${userName}`,
        subtitle: "Deep synthwave, ambient echoes, and after-hours vibrations",
        icon: "dark_mode"
      });
    }
  }, [userName]);

  // Dynamically illuminate the background with the selected vibe's ambient color palette
  useEffect(() => {
    if (!currentSong) {
      const theme = MOOD_THEMES[selectedMood] || MOOD_THEMES.all;
      document.documentElement.style.setProperty("--theme-accent", theme.accent);
      document.documentElement.style.setProperty("--theme-glow-1", theme.glow1);
      document.documentElement.style.setProperty("--theme-glow-2", theme.glow2);
      document.documentElement.style.setProperty("--theme-glow-3", theme.glow3);
      document.documentElement.style.setProperty("--theme-bg-glow1", theme.glow1);
      document.documentElement.style.setProperty("--theme-bg-glow2", theme.glow2);
    }
  }, [selectedMood, currentSong]);

  // Dynamic Top Listened songs from our music search engine with instant in-memory cache
  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [isLoadingTopSongs, setIsLoadingTopSongs] = useState<boolean>(true);
  const moodCacheRef = useRef<Record<string, Song[]>>({});

  useEffect(() => {
    let isMounted = true;

    // Instant zero-lag switch if already loaded in client cache
    if (moodCacheRef.current[selectedMood] && moodCacheRef.current[selectedMood].length > 0) {
      setTopSongs(moodCacheRef.current[selectedMood]);
      setIsLoadingTopSongs(false);
      return;
    }

    setIsLoadingTopSongs(true);

    fetch(`/api/top-listened?mood=${encodeURIComponent(selectedMood)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Search engine error");
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.results && data.results.length > 0) {
          moodCacheRef.current[selectedMood] = data.results;
          setTopSongs(data.results);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch top listened songs:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingTopSongs(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMood]);

  const filteredSongs = selectedMood === "all"
    ? MOCK_SONGS
    : MOCK_SONGS.filter(s => {
        const targetMood = MOOD_FILTERS.find(m => m.id === selectedMood);
        if (!targetMood || !targetMood.genre) return true;
        if (selectedMood === "disco") return s.genre === "Disco" || s.genre === "Funk";
        return s.genre?.toLowerCase() === targetMood.genre.toLowerCase();
      });

  // Active songs to display (preferring live top-listened results from our music search engine)
  const displaySongs = topSongs.length > 0 ? topSongs : filteredSongs;

  const quickTiles = hasHistory 
    ? Array.from(new Set(history.map(s => s.id))).map(id => history.find(s => s.id === id)!).reverse().slice(0, 5)
    : displaySongs.slice(0, 5);

  // Dynamic Spotlights built from the top listened search engine results
  const dynamicSpotlights = topSongs.length >= 3 ? [
    {
      song: topSongs[0],
      badge: "🔥 #1 GLOBAL TOP HIT",
      accentColor: "from-pink-500/20 via-purple-600/15 to-indigo-950/40",
      quote: "Leading charts worldwide with massive streaming numbers and critical acclaim across platforms.",
      vibeTag: topSongs[0].genre || "Chart Leader",
    },
    {
      song: topSongs[1],
      badge: "⭐ #2 ON HEAVY ROTATION",
      accentColor: "from-rose-500/20 via-red-600/15 to-slate-950/40",
      quote: "A global viral sensation dominating streaming queues and trending worldwide queries this week.",
      vibeTag: topSongs[1].genre || "Heavy Rotation",
    },
    {
      song: topSongs[2],
      badge: "✨ #3 EDITORIAL SPOTLIGHT",
      accentColor: "from-cyan-500/20 via-blue-600/15 to-slate-950/40",
      quote: "Outstanding production, infectious energy, and peak velocity on our global streaming engine.",
      vibeTag: topSongs[2].genre || "Global Viral",
    },
  ] : SPOTLIGHT_TRACKS;

  const currentSpotlight = dynamicSpotlights[spotlightIndex] || dynamicSpotlights[0];

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
        {/* Apple Music Dynamic Liquid Ambient Canvas (Hardware Accelerated) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden transition-all duration-1000 ease-in-out bg-[#07070a]">
          {/* Vibrant warm base blur of artwork if playing */}
          {currentSong && isDynamicTheme && (
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 opacity-45 scale-110 blur-[50px] saturate-200 mix-blend-screen transform-gpu"
              style={{ backgroundImage: `url(${currentSong.albumArt})` }}
            />
          )}

          {/* Orb 1: Top-Left Primary Floating Glow */}
          <div 
            className="absolute -top-[15%] -left-[10%] w-[85vw] h-[85vh] rounded-full opacity-80 transition-all duration-1000 animate-ambient-1 transform-gpu"
            style={{ 
              background: isDynamicTheme 
                ? 'radial-gradient(circle closest-side at 40% 40%, var(--theme-glow-1, rgba(99, 102, 241, 0.75)) 0%, var(--theme-glow-1, rgba(99, 102, 241, 0.4)) 45%, var(--theme-glow-1, rgba(99, 102, 241, 0.12)) 75%, transparent 100%)' 
                : `radial-gradient(circle closest-side at 40% 40%, ${staticAccent} 0%, transparent 100%)`,
            }}
          />

          {/* Orb 2: Bottom-Right Secondary Color Glow */}
          <div 
            className="absolute -bottom-[15%] -right-[10%] w-[80vw] h-[80vh] rounded-full opacity-75 transition-all duration-1000 animate-ambient-2 transform-gpu"
            style={{ 
              background: isDynamicTheme 
                ? 'radial-gradient(circle closest-side at 60% 60%, var(--theme-glow-2, rgba(236, 72, 153, 0.65)) 0%, var(--theme-glow-2, rgba(236, 72, 153, 0.35)) 45%, var(--theme-glow-2, rgba(236, 72, 153, 0.1)) 75%, transparent 100%)' 
                : `radial-gradient(circle closest-side at 60% 60%, ${staticAccent} 0%, transparent 100%)`,
            }}
          />

          {/* Orb 3: Center-Floating Harmonic Accent Glow */}
          <div 
            className="absolute top-[20%] left-[20%] w-[70vw] h-[70vh] rounded-full opacity-70 transition-all duration-1000 animate-ambient-3 transform-gpu"
            style={{ 
              background: isDynamicTheme 
                ? 'radial-gradient(circle closest-side at 50% 50%, var(--theme-glow-3, rgba(59, 130, 246, 0.55)) 0%, var(--theme-glow-3, rgba(59, 130, 246, 0.3)) 45%, var(--theme-glow-3, rgba(59, 130, 246, 0.08)) 75%, transparent 100%)' 
                : 'transparent',
            }}
          />

          {/* Subtle contrast gradient for readable text and depth without suffocating the glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/55 pointer-events-none" />

          <CanvasParticles />
        </div>

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex flex-col p-6 gap-6 z-20 relative bg-black/10 backdrop-blur-md">
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
                  animate={landingPlaylistId === p.id ? "landingBounce" : "initial"}
                  variants={{
                    initial: { scale: 1 },
                    hovered: { scale: 1.02 },
                    landingBounce: { scale: [1, 1.1, 0.95, 1], transition: { duration: 0.5 } }
                  }}
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
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-10 py-5 bg-background-dark/20 backdrop-blur-md">
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

        <div className="px-4 md:px-10 py-6 md:py-10 pb-48 md:pb-40 space-y-12 md:space-y-20">
          {/* Mobile Library Sub-tabs */}
          {['favorites', 'recent', 'local', 'playlist'].includes(activeTab) && (
            <div className="flex md:hidden items-center gap-2 overflow-x-auto no-scrollbar pb-4 border-b border-white/5 mb-6 px-1">
              <button 
                onClick={() => setActiveTab('favorites')}
                className={cn("px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border", 
                  activeTab === 'favorites' ? "bg-accent text-white border-accent" : "bg-white/5 text-slate-400 border-white/5"
                )}
              >
                Favorites
              </button>
              <button 
                onClick={() => setActiveTab('recent')}
                className={cn("px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border", 
                  activeTab === 'recent' ? "bg-accent text-white border-accent" : "bg-white/5 text-slate-400 border-white/5"
                )}
              >
                Recent
              </button>
              <button 
                onClick={() => setActiveTab('local')}
                className={cn("px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border", 
                  activeTab === 'local' ? "bg-accent text-white border-accent" : "bg-white/5 text-slate-400 border-white/5"
                )}
              >
                Local
              </button>
              {playlists.map(p => (
                <button 
                  key={p.id}
                  onClick={() => { setActiveTab('playlist'); setSelectedPlaylistId(p.id); }}
                  className={cn("px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border", 
                    activeTab === 'playlist' && selectedPlaylistId === p.id ? "bg-accent text-white border-accent" : "bg-white/5 text-slate-400 border-white/5"
                  )}
                >
                  {p.title}
                </button>
              ))}
              <button 
                onClick={() => {
                  const name = prompt("Enter playlist name:");
                  if (name) createPlaylist(name);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-white/5 text-accent border border-white/5 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">add</span> New
              </button>
            </div>
          )}

          {activeTab === 'discover' && (
            <div className="space-y-12 md:space-y-16">
              {/* 1. Time-of-Day Welcome Header & Live Stream Indicator */}
              <motion.section
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-accent text-xl">{greeting.icon}</span>
                    <span className="text-[11px] font-black uppercase tracking-[0.25em] text-accent/90">Curated Daily</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{greeting.title}</h1>
                  <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-xl">{greeting.subtitle}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Lossless Engine</span>
                  </div>
                  <button
                    onClick={() => {
                      if (displaySongs.length > 0) {
                        const randomSong = displaySongs[Math.floor(Math.random() * displaySongs.length)];
                        playSong(randomSong, displaySongs);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent hover:bg-accent/90 text-white text-xs font-bold transition-all shadow-lg shadow-accent/25 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm fill-[1]">shuffle</span>
                    Quick Mix
                  </button>
                </div>
              </motion.section>

              {/* 2. Jump Back In / Quick Shelf */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* Favorites Quick Tile */}
                  <div 
                    onClick={() => {
                      if (likedSongs.length > 0) {
                        playSong(likedSongs[0], likedSongs);
                      } else {
                        setActiveTab('favorites');
                      }
                    }}
                    className="group relative flex items-center gap-3 p-2.5 pr-3 rounded-2xl bg-gradient-to-r from-accent/20 to-pink-500/10 border border-white/5 hover:border-accent/40 backdrop-blur-md cursor-pointer transition-all hover:bg-white/[0.06] overflow-hidden"
                  >
                    <div className="size-11 rounded-xl bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="material-symbols-outlined text-white text-xl fill-[1]">favorite</span>
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="text-xs font-bold text-white truncate">Liked Songs</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate">{likedSongs.length} tracks</p>
                    </div>
                    <button className="size-7 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md transform translate-x-2 group-hover:translate-x-0 flex-shrink-0">
                      <span className="material-symbols-outlined text-base fill-[1]">play_arrow</span>
                    </button>
                  </div>

                  {/* 5 Instant / History Quick Tiles */}
                  {quickTiles.map((tile, i) => (
                    <div
                      key={`quick-tile-${tile.id}-${i}`}
                      onClick={() => playSong(tile, displaySongs)}
                      className="group relative flex items-center gap-3 p-2.5 pr-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 backdrop-blur-md cursor-pointer transition-all hover:bg-white/[0.06] overflow-hidden"
                    >
                      <div className="size-11 rounded-xl overflow-hidden flex-shrink-0 shadow-md relative bg-white/5">
                        <img src={tile.albumArt} alt={tile.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        {currentSong?.id === tile.id && isPlaying && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-0.5">
                            <span className="w-0.5 bg-accent rounded-full animate-bounce h-2.5" />
                            <span className="w-0.5 bg-accent rounded-full animate-bounce [animation-delay:150ms] h-4" />
                            <span className="w-0.5 bg-accent rounded-full animate-bounce [animation-delay:300ms] h-2" />
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="text-xs font-bold text-white truncate">{tile.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{tile.artist}</p>
                      </div>
                      <button className="size-7 rounded-full bg-accent text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md transform translate-x-2 group-hover:translate-x-0 flex-shrink-0">
                        <span className="material-symbols-outlined text-base fill-[1]">play_arrow</span>
                      </button>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* 3. Editorial Spotlight Hero Showcase */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="relative"
              >
                <GlowWrapper className="rounded-[2.5rem]" glowOpacity={0.35}>
                  <div className={`relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br ${currentSpotlight.accentColor} p-6 md:p-10 backdrop-blur-2xl transition-all duration-700`}>
                    {/* Ambient Glow Orbs */}
                    <div className="absolute -right-20 -top-20 size-80 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
                    <div className="absolute -left-20 -bottom-20 size-80 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
                      {/* Left Content */}
                      <div className="flex-1 space-y-5 text-center lg:text-left">
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 text-white border border-white/15 backdrop-blur-md">
                            {currentSpotlight.badge}
                          </span>
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-accent/20 text-accent border border-accent/30">
                            {currentSpotlight.vibeTag}
                          </span>
                        </div>

                        <div>
                          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none mb-3">
                            {currentSpotlight.song.title}
                          </h2>
                          <div className="flex items-center justify-center lg:justify-start gap-2">
                            <span 
                              onClick={() => setViewingArtist(currentSpotlight.song.artist, currentSpotlight.song.artistId)}
                              className="text-lg md:text-xl font-bold text-slate-200 hover:text-accent hover:underline transition-colors cursor-pointer"
                            >
                              {currentSpotlight.song.artist}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-sm md:text-base text-slate-400 font-medium">
                              {currentSpotlight.song.album}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs md:text-sm text-slate-300 max-w-xl font-medium leading-relaxed italic">
                          &ldquo;{currentSpotlight.quote}&rdquo;
                        </p>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                          <button
                            onClick={() => {
                              if (currentSong?.id === currentSpotlight.song.id) {
                                togglePlay();
                              } else {
                                playSong(currentSpotlight.song, displaySongs);
                              }
                            }}
                            className="flex items-center gap-3 px-7 py-3.5 rounded-full bg-white text-black font-black text-sm tracking-tight hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-2xl fill-[1]">
                              {currentSong?.id === currentSpotlight.song.id && isPlaying ? "pause" : "play_arrow"}
                            </span>
                            {currentSong?.id === currentSpotlight.song.id && isPlaying ? "Pause Spotlight" : "Play Spotlight"}
                          </button>

                          <button
                            onClick={(e) => {
                              addToQueue(currentSpotlight.song);
                              triggerQueueFlight(currentSpotlight.song, e.currentTarget.getBoundingClientRect());
                            }}
                            className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-lg">queue_music</span>
                            Add to Queue
                          </button>

                          <button
                            onClick={() => setAddingSong(currentSpotlight.song)}
                            className="size-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95 cursor-pointer"
                            title="Save to Playlist"
                          >
                            <span className="material-symbols-outlined text-lg">playlist_add</span>
                          </button>

                          <button
                            onClick={() => openStoryModal(currentSpotlight.song)}
                            className="flex items-center gap-1.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white font-bold text-xs transition-all border border-pink-500/30 backdrop-blur-md hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-pink-500/10"
                            title="Generate 9:16 Story Card (made by Anay)"
                          >
                            <span className="material-symbols-outlined text-lg text-pink-400">auto_awesome</span>
                            <span>Story Card</span>
                          </button>
                        </div>
                      </div>

                      {/* Right Artwork with 3D Depth & Carousel Controls */}
                      <div className="relative flex flex-col items-center">
                        <div className="relative size-60 md:size-72 lg:size-80 rounded-3xl overflow-hidden shadow-2xl border border-white/15 group">
                          <img
                            src={currentSpotlight.song.albumArt}
                            alt={currentSpotlight.song.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {/* Playing Equalizer Overlay */}
                          {currentSong?.id === currentSpotlight.song.id && isPlaying && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-1.5">
                              <span className="w-1.5 bg-accent rounded-full animate-bounce h-8" />
                              <span className="w-1.5 bg-accent rounded-full animate-bounce [animation-delay:150ms] h-12" />
                              <span className="w-1.5 bg-accent rounded-full animate-bounce [animation-delay:300ms] h-6" />
                              <span className="w-1.5 bg-accent rounded-full animate-bounce [animation-delay:75ms] h-10" />
                            </div>
                          )}
                        </div>

                        {/* Carousel Pagination Controls */}
                        <div className="mt-5 flex items-center gap-3">
                          <button
                            onClick={() => setSpotlightIndex((prev) => (prev === 0 ? dynamicSpotlights.length - 1 : prev - 1))}
                            className="size-8 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer"
                            title="Previous Spotlight"
                          >
                            <span className="material-symbols-outlined text-base">chevron_left</span>
                          </button>
                          <div className="flex items-center gap-1.5">
                            {dynamicSpotlights.map((_, idx) => (
                              <button
                                key={`spotlight-dot-${idx}`}
                                onClick={() => setSpotlightIndex(idx)}
                                className={cn(
                                  "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                                  spotlightIndex === idx ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
                                )}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => setSpotlightIndex((prev) => (prev === dynamicSpotlights.length - 1 ? 0 : prev + 1))}
                            className="size-8 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer"
                            title="Next Spotlight"
                          >
                            <span className="material-symbols-outlined text-base">chevron_right</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlowWrapper>
              </motion.section>

              {/* 4. Mood & Genre Stations (Bouncy Spring Physics & Zero-Clipping Layout) */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4 pt-3 relative"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">Vibe & Genre Stations</h2>
                    <p className="text-slate-400 text-xs mt-0.5">Filter rhythms to match your current headspace</p>
                  </div>
                  <span className="text-[11px] font-bold text-accent uppercase tracking-widest">{displaySongs.length} Tracks Available</span>
                </div>

                {/* Protective wrapper with generous padding to completely eliminate overflow clipping */}
                <div className="relative -my-4 py-4 px-1 overflow-visible">
                  <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-6 px-4 -mx-4">
                    {MOOD_FILTERS.map((mood) => {
                      const isSelected = selectedMood === mood.id;
                      return (
                        <motion.button
                          key={mood.id}
                          layout
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 16,
                            mass: 0.55,
                          }}
                          whileTap={{ scale: 0.93 }}
                          whileHover={{ scale: isSelected ? 1.02 : 1.05, y: -1 }}
                          onClick={() => setSelectedMood(mood.id)}
                          className={cn(
                            "relative flex items-center gap-2.5 rounded-full font-bold whitespace-nowrap select-none cursor-pointer border transition-colors duration-200 flex-shrink-0",
                            isSelected
                              ? "px-6 py-3.5 text-sm bg-gradient-to-r from-accent via-indigo-600 to-purple-600 text-white border-accent/80 shadow-[0_8px_32px_rgba(99,102,241,0.4)]"
                              : "px-4.5 py-2.5 text-xs bg-white/[0.04] text-slate-400 border-white/5 hover:text-white hover:border-white/20 hover:bg-white/[0.08]"
                          )}
                        >
                          <motion.span 
                            layout="position"
                            className={cn("material-symbols-outlined text-base transition-colors", isSelected ? "text-white" : "text-slate-400")}
                          >
                            {mood.icon}
                          </motion.span>
                          <motion.span layout="position">
                            {mood.label}
                          </motion.span>

                          {isSelected && (
                            <motion.span
                              layoutId="active-mood-dot"
                              className="size-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] flex-shrink-0 ml-0.5"
                              transition={{
                                type: "spring",
                                stiffness: 450,
                                damping: 18,
                              }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.section>

              {/* 5. Trending Tracks / Music Grid */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Trending Right Now</h2>
                      {isLoadingTopSongs && (
                        <div className="size-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">Top-listened tracks pulled live from our music search engine</p>
                  </div>
                  <button 
                    onClick={() => playSong(displaySongs[0], displaySongs)}
                    className="text-xs font-bold text-accent hover:underline flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">play_circle</span>
                    Play All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {displaySongs.map((song, i) => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <GlowWrapper key={`trending-song-${song.id}-${i}`} className="rounded-2xl">
                        <div
                          onClick={() => {
                            if (isCurrent) {
                              togglePlay();
                            } else {
                              playSong(song, displaySongs);
                            }
                          }}
                          className={cn(
                            "glass-card p-3.5 flex items-center gap-4 group cursor-pointer transition-all border",
                            isCurrent ? "border-accent/40 bg-accent/[0.04]" : "border-white/5 hover:border-white/20"
                          )}
                        >
                          {/* Album Art with Equalizer / Play button */}
                          <div className="size-20 flex-shrink-0 rounded-xl overflow-hidden shadow-lg relative bg-white/5">
                            <img src={song.albumArt} alt={song.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            
                            {isCurrent && isPlaying ? (
                              <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center gap-1 z-10 pointer-events-none">
                                <span className="w-1 bg-accent rounded-full animate-bounce [animation-delay:0ms] h-4" />
                                <span className="w-1 bg-accent rounded-full animate-bounce [animation-delay:150ms] h-6" />
                                <span className="w-1 bg-accent rounded-full animate-bounce [animation-delay:300ms] h-3" />
                                <span className="w-1 bg-accent rounded-full animate-bounce [animation-delay:75ms] h-5" />
                              </div>
                            ) : (
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="size-9 rounded-full bg-accent text-white flex items-center justify-center shadow-md">
                                  <span className="material-symbols-outlined text-xl fill-[1]">play_arrow</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 overflow-hidden min-w-0">
                            <h3 className={cn("font-bold text-sm truncate", isCurrent ? "text-accent" : "text-white")}>
                              {song.title}
                            </h3>
                            <p
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingArtist(song.artist, song.artistId);
                              }}
                              className="text-xs text-slate-400 hover:text-white truncate font-medium mt-0.5 cursor-pointer"
                            >
                              {song.artist}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5">
                                {song.genre}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {song.durationText}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAddingSong(song);
                              }}
                              className="size-7 rounded-full bg-white/5 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Add to Playlist"
                            >
                              <span className="material-symbols-outlined text-sm">playlist_add</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToQueue(song);
                                triggerQueueFlight(song, e.currentTarget.getBoundingClientRect());
                              }}
                              className="size-7 rounded-full bg-white/5 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Add to Queue"
                            >
                              <span className="material-symbols-outlined text-sm">queue_music</span>
                            </button>
                          </div>
                        </div>
                      </GlowWrapper>
                    );
                  })}
                </div>
              </motion.section>

              {/* 6. Curated Mixes & Vibe Stations */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Curated Mixes</h2>
                    <p className="text-slate-400 text-xs mt-0.5">Hand-crafted journeys designed for continuous play</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {MOCK_MIXES.map((mix) => (
                    <GlowWrapper key={mix.id} className="rounded-3xl">
                      <div
                        onClick={() => {
                          const mixSlice = displaySongs.length >= 4 
                            ? displaySongs.slice((MOCK_MIXES.indexOf(mix) * 4) % displaySongs.length, ((MOCK_MIXES.indexOf(mix) + 1) * 4) % displaySongs.length || displaySongs.length)
                            : mix.songs;
                          const tracksToPlay = mixSlice.length > 0 ? mixSlice : mix.songs;
                          if (tracksToPlay.length > 0) {
                            playSong(tracksToPlay[0], tracksToPlay);
                          }
                        }}
                        className="glass-card p-5 group cursor-pointer border-white/5 hover:border-white/20 flex flex-col h-full transition-all"
                      >
                        {/* Artwork Container */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-xl">
                          <img src={mix.coverArt} alt={mix.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          
                          {/* Gradient Overlay */}
                          <div className={`absolute inset-0 bg-gradient-to-t ${mix.gradient} opacity-60 group-hover:opacity-40 transition-opacity`} />

                          {/* Badge */}
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-white">
                            {mix.badge}
                          </div>

                          {/* Hover Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button className="size-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform cursor-pointer">
                              <span className="material-symbols-outlined text-3xl fill-[1]">play_arrow</span>
                            </button>
                          </div>
                        </div>

                        {/* Mix Details */}
                        <div className="space-y-1.5 flex-1 flex flex-col">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white text-base truncate group-hover:text-accent transition-colors">
                              {mix.title}
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400">
                              {mix.songs.length} Tracks
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {mix.description}
                          </p>
                          <div className="mt-auto pt-3 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                            <span className="size-1.5 rounded-full bg-accent" />
                            {mix.listenerCount}
                          </div>
                        </div>
                      </div>
                    </GlowWrapper>
                  ))}
                </div>
              </motion.section>

              {/* 7. Personal Collections & Playlists (if user has any) */}
              {hasPersonal && (
                <motion.section
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Your Collections</h2>
                      <p className="text-slate-400 text-xs mt-0.5">Playlists and favorites customized by you</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('favorites')}
                      className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                    <GlowWrapper className="rounded-2xl">
                      <div
                        onClick={() => setActiveTab('favorites')}
                        className="glass-card p-4 group cursor-pointer border-accent/20 bg-accent/5 transition-all"
                      >
                        <div className="relative mb-3.5 aspect-square rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-5xl fill-[1] opacity-90 group-hover:scale-110 transition-transform">
                            favorite
                          </span>
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="size-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                              <span className="material-symbols-outlined text-3xl fill-[1]">play_arrow</span>
                            </div>
                          </div>
                        </div>
                        <h4 className="font-bold text-white text-sm truncate">Your Favorites</h4>
                        <p className="text-[11px] text-slate-400 truncate">{likedSongs.length} tracks saved</p>
                      </div>
                    </GlowWrapper>

                    {playlists.map((playlist) => (
                      <GlowWrapper key={playlist.id} className="rounded-2xl">
                        <div
                          onClick={() => {
                            setActiveTab('playlist');
                            setSelectedPlaylistId(playlist.id);
                          }}
                          className="glass-card p-4 group cursor-pointer border-white/5 hover:border-white/20 transition-all"
                        >
                          <div className="relative mb-3.5 aspect-square rounded-xl overflow-hidden shadow-xl bg-white/5 flex items-center justify-center">
                            {playlist.songs.length > 0 ? (
                              <img src={playlist.songs[0].albumArt} alt={playlist.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <span className="material-symbols-outlined text-4xl text-white/20">queue_music</span>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="size-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                                <span className="material-symbols-outlined text-3xl fill-[1]">play_arrow</span>
                              </div>
                            </div>
                          </div>
                          <h4 className="font-bold text-white text-sm truncate">{playlist.title}</h4>
                          <p className="text-[11px] text-slate-400 truncate">{playlist.songs.length} Tracks</p>
                        </div>
                      </GlowWrapper>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* 8. Modern Power-User Studio Hub (Bento Bar replacing old blank onboarding) */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.015] backdrop-blur-xl relative overflow-hidden space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-accent text-lg">tune</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Power-User Studio</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-white">Elevate Your Audio Experience</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Customize, import, and manage your sound space.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-accent/40 hover:bg-white/[0.04] transition-all cursor-pointer group flex items-center gap-4"
                  >
                    <div className="size-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl">upload_file</span>
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white group-hover:text-accent transition-colors">Import Local Files</h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">MP3, FLAC, WAV with tags</p>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      const name = prompt("Enter playlist name:");
                      if (name) createPlaylist(name);
                    }}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-pink-500/40 hover:bg-white/[0.04] transition-all cursor-pointer group flex items-center gap-4"
                  >
                    <div className="size-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl">playlist_add</span>
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white group-hover:text-pink-400 transition-colors">Create Playlist</h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">Custom artwork & curation</p>
                    </div>
                  </div>

                  <div
                    onClick={() => toggleExpanded()}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/40 hover:bg-white/[0.04] transition-all cursor-pointer group flex items-center gap-4"
                  >
                    <div className="size-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl">graphic_eq</span>
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">Live Visualizer</h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">Real-time reactive canvas</p>
                    </div>
                  </div>

                  <div
                    onClick={() => openStoryModal(currentSong || SPOTLIGHT_TRACKS[0].song)}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-rose-500/40 hover:bg-white/[0.04] transition-all cursor-pointer group flex items-center gap-4"
                  >
                    <div className="size-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">Story Generator</h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">9:16 Insta & TikTok cards</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab('settings')}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/40 hover:bg-white/[0.04] transition-all cursor-pointer group flex items-center gap-4"
                  >
                    <div className="size-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl">palette</span>
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">Theme & Accent</h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">Dynamic artwork lighting</p>
                    </div>
                  </div>
                </div>
              </motion.section>
            </div>
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
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
                        <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
                        <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
                          <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
                      className={`glass-card flex items-center gap-2 md:gap-4 p-3 rounded-2xl group cursor-pointer hover:bg-white/5 border-transparent transition-all duration-500 ${
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
                      <div className="hidden md:flex items-center gap-4 px-4 text-slate-500 text-xs font-bold w-32 truncate">
                        {song.album}
                      </div>
                      <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
                              "glass-card flex items-center gap-2 md:gap-4 p-3 rounded-2xl group cursor-pointer hover:bg-white/5 border-transparent transition-all duration-500",
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
                            <div className="hidden md:flex items-center gap-4 px-4 text-slate-500 text-xs font-bold w-32 truncate">
                              {song.genre}
                            </div>
                            <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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

                                <div className="flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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

      {/* Mobile Navigation Bar */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-t border-white/5 px-4 py-2 justify-around items-center h-16 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <button 
          onClick={() => setActiveTab('discover')} 
          className={cn("flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase transition-colors outline-none", activeTab === 'discover' ? 'text-accent' : 'text-slate-400')}
        >
          <span className="material-symbols-outlined text-xl">grid_view</span>
          Discover
        </button>
        <button 
          onClick={() => setActiveTab('browse')} 
          className={cn("flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase transition-colors outline-none", activeTab === 'browse' ? 'text-accent' : 'text-slate-400')}
        >
          <span className="material-symbols-outlined text-xl">explore</span>
          Browse
        </button>
        <button 
          onClick={() => {
            if (activeTab === 'favorites' || activeTab === 'recent' || activeTab === 'local' || activeTab === 'playlist') {
              // Stay
            } else {
              setActiveTab('favorites');
            }
          }} 
          className={cn("flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase transition-colors outline-none", ['favorites', 'recent', 'local', 'playlist'].includes(activeTab) ? 'text-accent' : 'text-slate-400')}
        >
          <span className="material-symbols-outlined text-xl">library_music</span>
          Library
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          className={cn("flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase transition-colors outline-none", activeTab === 'settings' ? 'text-accent' : 'text-slate-400')}
        >
          <span className="material-symbols-outlined text-xl">settings</span>
          Settings
        </button>
      </nav>

      <BottomPlayer />
      <ExpandedPlayer />
      <StoryCardModal />
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
