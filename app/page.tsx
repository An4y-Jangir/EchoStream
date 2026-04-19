"use client";

import { MOCK_MIXES, MOCK_SONGS } from "@/lib/mockData";
import { usePlayer } from "@/context/PlayerContext";
import { BottomPlayer } from "@/components/player/BottomPlayer";
import { ExpandedPlayer } from "@/components/player/ExpandedPlayer";
import { useRef, useState } from "react";
import { Song } from "@/types/music";
import { motion, AnimatePresence } from "framer-motion";
import { AddToPlaylistModal } from "@/components/modals/AddToPlaylistModal";
import { GlowWrapper } from "@/components/ui/GlowWrapper";
import { FlightAnimation } from "@/components/animations/FlightAnimation";

const jsmediatags = typeof window !== "undefined" ? require("jsmediatags/dist/jsmediatags.min.js") : null;

export default function Home() {
  const { playSong, currentSong, history, likedSongs, addToQueue } = usePlayer();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localSongs, setLocalSongs] = useState<Song[]>([]);
  
  const [activeTab, setActiveTab] = useState<'discover'|'recent'|'favorites'|'local'|'playlist'|'radio'|'browse'>('discover');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [landingPlaylistId, setLandingPlaylistId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Playlist states
  const { playlists, addSongToPlaylist, createPlaylist, removeSongFromPlaylist } = usePlayer();
  const [addingSong, setAddingSong] = useState<Song | null>(null);
  const [flightData, setFlightData] = useState<{ start: DOMRect, end: DOMRect } | null>(null);
  const playlistHeaderRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const currentPlaylist = playlists.find(p => p.id === selectedPlaylistId);
  const [flightImageUrl, setFlightImageUrl] = useState("");

  const triggerFlight = (song: Song, startRect: DOMRect, playlistId: string) => {
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

  return (
    <div className="flex h-screen overflow-hidden relative">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-1000 ease-in-out">
          {currentSong ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000 opacity-60 scale-105"
                style={{ backgroundImage: `url(${currentSong.albumArt})` }}
              />
              <div className="absolute inset-0 bg-black/50 backdrop-blur-xl" />
            </>
          ) : (
            <div className="absolute inset-0 dynamic-bg" />
          )}
        </div>

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col p-6 gap-6 z-20 relative bg-black/10 backdrop-blur-md">
        <div className="px-2 flex items-center gap-3 mb-2">
          <div className="size-9 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="material-symbols-outlined text-white text-xl fill-[1]">auto_awesome</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white">EchoStream</h1>
            <p className="text-[8px] text-accent/80 font-bold tracking-[0.3em] uppercase">Premium</p>
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
          <a onClick={() => setActiveTab('radio')} className={`nav-item flex items-center gap-4 px-4 py-2.5 rounded-xl cursor-pointer ${activeTab === 'radio' ? 'text-white active-nav bg-white/5' : 'text-slate-400 hover:text-white'}`}>
            <span className="material-symbols-outlined text-lg">podcasts</span>
            <span className="text-sm font-medium">Radio</span>
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
        <div className="flex flex-col gap-1 mt-4">
          <div ref={playlistHeaderRef} className="px-4 flex items-center justify-between mb-2">
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
          {playlists.length === 0 ? (
            <div className="px-4 py-3 bg-white/5 rounded-xl border border-dashed border-white/10 mx-2">
              <p className="text-[10px] text-slate-500 font-bold uppercase text-center">No playlists yet</p>
            </div>
          ) : (
            playlists.map(p => (
              <a 
                key={p.id}
                id={`sidebar-pl-${p.id}`}
                onClick={() => { setActiveTab('playlist'); setSelectedPlaylistId(p.id); }} 
                className={`nav-item flex items-center gap-4 px-4 py-2.5 rounded-xl cursor-pointer relative transition-all duration-300 ${selectedPlaylistId === p.id && activeTab === 'playlist' ? 'text-white active-nav bg-white/5' : 'text-slate-400 hover:text-white'}`}
              >
                <span className="material-symbols-outlined text-lg">playlist_play</span>
                <span className="text-sm font-medium truncate">{p.title}</span>
                <AnimatePresence>
                  {landingPlaylistId === p.id && (
                    <motion.div 
                      key="landing-pulse"
                      className="absolute inset-0 bg-accent/20 rounded-xl"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1] }}
                      transition={{ duration: 0.6 }}
                    />
                  )}
                </AnimatePresence>
              </a>
            ))
          )}
        </div>
        <div className="mt-auto pt-6">
          <div className="px-3 py-3 flex items-center gap-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group">
            <img alt="Alex Rivera" className="size-8 rounded-lg border border-white/10 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuS4AeQPOY77JkrPKNNHoRYKAOe7JkkIBpjBcwI2ZnpCQYnKKvRbHp-kjEVKFZudPolxk9m-yEy5PSXTXKOilMsNda5d9N3ZacHQuoms-B8XFGQ4c0STRlDCHVl5YYz7xXM5tbz7TPuu2jBjGB1QMrEYZ0lGNYbt6_n52P30z22UoyiqXFBLPRNjSfZ4GYXJQYPeYNzen4xDaUBho2eH6EaId9gLTZvBHurc_7ONpyqVyJhnGijDrEky1myah93nbSA4NEMTLkzZSw"/>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold truncate">Alex Rivera</p>
              <p className="text-[9px] text-slate-600 font-bold uppercase">Pro Tier</p>
            </div>
            <span className="material-symbols-outlined text-slate-600 group-hover:text-slate-400 transition-colors text-lg">settings</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative z-10">
        <header className="sticky top-0 z-30 flex items-center justify-between px-10 py-5 bg-background-dark/20 backdrop-blur-md">
          <div className="flex items-center gap-6 flex-1">
            <div className="flex gap-2">
              <button className="size-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-all">
                <span className="material-symbols-outlined text-lg">west</span>
              </button>
              <button className="size-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-all">
                <span className="material-symbols-outlined text-lg">east</span>
              </button>
            </div>
            <div className="relative w-full max-w-md group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-lg group-focus-within:text-accent transition-colors">search</span>
              <input 
                className="w-full bg-white/[0.03] border border-white/[0.02] rounded-xl py-2.5 pl-11 pr-4 text-xs focus:ring-1 focus:ring-accent/30 focus:border-accent/30 focus:bg-white/[0.06] outline-none transition-all text-white placeholder-slate-600" 
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
          <div className="flex items-center gap-4">
            <button className="size-10 rounded-xl flex items-center justify-center text-slate-500 relative hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-3 right-3 size-1.5 bg-accent rounded-full"></span>
            </button>
            <button className="text-accent border border-accent/20 px-5 py-2 rounded-xl text-xs font-bold hover:bg-accent hover:text-white transition-all">
              Go Pro
            </button>
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
                            <p className="text-[10px] text-slate-600 font-medium truncate">{song.artist}</p>
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
                            <button onClick={(e) => { e.stopPropagation(); addToQueue(song); }} className="size-8 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" title="Add to Queue">
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
                          <p className="text-[10px] text-slate-600 font-medium truncate">{song.artist}</p>
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
                          <button onClick={(e) => { e.stopPropagation(); addToQueue(song); }} className="size-8 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" title="Add to Queue">
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

          {activeTab === 'radio' && (
            <section className="relative">
              {/* Pulse Visualizer Background */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden -z-10">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={`pulse-${i}`}
                    className="absolute rounded-full border border-accent/10"
                    initial={{ width: 0, height: 0, opacity: 0.5 }}
                    animate={{ width: "150%", height: "150%", opacity: 0 }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: i * 1.3,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-2 mb-12">
                <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.4em] mb-1.5 opacity-80">Infinite Stream</h2>
                <h3 className="text-4xl font-black tracking-tight text-white italic">The Radio Hub</h3>
                <p className="text-slate-500 text-sm max-w-lg">Continuous discovery powered by global trends and human vibes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {RADIO_STATIONS.map((station) => (
                  <GlowWrapper key={station.id} className="rounded-[2.5rem]" glowOpacity={0.4}>
                    <div 
                      onClick={() => startRadio(station)}
                      className="glass-card group cursor-pointer border-white/5 overflow-hidden flex flex-col h-[320px] transition-all duration-500 hover:border-white/10"
                    >
                      <div className={`flex-1 relative overflow-hidden bg-gradient-to-br ${station.gradient}`}>
                        <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0" />
                        
                        {/* Huge Background Icon */}
                        <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:scale-125 transform-gpu">
                          <span className="material-symbols-outlined text-[180px] fill-[1]">{station.icon}</span>
                        </div>

                        <div className="absolute inset-x-8 bottom-8">
                          <div className="size-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                             <span className="material-symbols-outlined text-white text-4xl fill-[1]">{station.icon}</span>
                          </div>
                          
                          {/* Station Branding - Per User Request: Title and Name Prominent */}
                          <h4 className="text-3xl font-black text-white italic tracking-tighter mb-1 drop-shadow-lg">
                            {station.title}
                          </h4>
                          <p className="text-white/70 text-xs font-medium tracking-wide drop-shadow-md">
                            {station.subtitle}
                          </p>
                        </div>

                        {/* Play Overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="size-20 bg-white text-black rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-all duration-500">
                            <span className="material-symbols-outlined text-5xl fill-[1]">play_arrow</span>
                          </div>
                        </div>
                      </div>
                      <div className="px-8 py-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                           <span className="size-2 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                           <span className="text-[10px] font-black text-accent uppercase tracking-widest">Live Broadcast</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-600 text-xl group-hover:text-white transition-colors">sensors</span>
                      </div>
                    </div>
                  </GlowWrapper>
                ))}
              </div>
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
                <div className="text-slate-500">You haven't imported any local files yet. Click 'Import Files' to begin!</div>
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
                          <p className="text-xs text-slate-500 font-medium truncate">{song.artist}</p>
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
                          <button onClick={(e) => { e.stopPropagation(); addToQueue(song); }} className="size-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" title="Add to Queue">
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
                <div className="text-slate-500">You haven't liked any songs yet. Play a song and click the heart icon!</div>
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
                          <p className="text-xs text-slate-500 font-medium truncate">{song.artist}</p>
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
                          <button onClick={(e) => { e.stopPropagation(); addToQueue(song); }} className="size-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" title="Add to Queue">
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
                  {Array.from(new Set(history.map(s => s.id))).map(id => history.find(s => s.id === id)!).reverse().map((song, i) => (
                    <GlowWrapper key={`recpage-${song.id}-${i}`} className="rounded-2xl">
                      <div onClick={() => playSong(song, undefined)} className="glass-card flex items-center gap-4 p-3 group cursor-pointer">
                        <div className="size-20 flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
                          <img alt={song.title} className="w-full h-full object-cover" src={song.albumArt}/>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h3 className="font-bold text-white truncate">{song.title}</h3>
                          <p className="text-xs text-slate-500 font-medium truncate">{song.artist}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); addToQueue(song); }} className="size-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" title="Add to Queue">
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
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mb-2">Playlist</p>
                  <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">{currentPlaylist.title}</h2>
                  <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                    <span>{currentPlaylist.songs.length} tracks</span>
                    <span className="size-1 bg-slate-700 rounded-full"></span>
                    <span>Created by you</span>
                  </div>
                </div>
              </div>

              {currentPlaylist.songs.length === 0 ? (
                <div className="text-slate-500">This playlist is empty. Add some songs to get started!</div>
              ) : (
                <div className="space-y-2">
                  {currentPlaylist.songs.map((song, i) => (
                    <div key={`plsong-${song.id}-${i}`} onClick={() => playSong(song, currentPlaylist.songs)} className="glass-card flex items-center gap-4 p-3 rounded-2xl group cursor-pointer hover:bg-white/5 border-transparent">
                      <div className="w-8 text-center text-slate-600 font-bold group-hover:text-accent transition-colors tabular-nums">{i + 1}</div>
                      <div className="size-12 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                        <img alt={song.title} className="w-full h-full object-cover" src={song.albumArt}/>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h3 className="font-semibold text-white/90 truncate text-sm">{song.title}</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">{song.artist}</p>
                      </div>
                      <div className="flex items-center gap-4 px-4 text-slate-500 text-xs font-bold w-32 truncate">
                        {song.album}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToQueue(song); }} 
                          className="size-10 bg-white/5 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors" 
                          title="Add to Queue"
                        >
                          <span className="material-symbols-outlined fill-[1] text-[20px]">queue_music</span>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeSongFromPlaylist(currentPlaylist.id, song.id); }} 
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
