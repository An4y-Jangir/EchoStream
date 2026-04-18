"use client";

import { MOCK_MIXES, MOCK_SONGS } from "@/lib/mockData";
import { usePlayer } from "@/context/PlayerContext";
import { BottomPlayer } from "@/components/player/BottomPlayer";
import { ExpandedPlayer } from "@/components/player/ExpandedPlayer";
import { useRef, useState } from "react";
import { Song } from "@/types/music";
import { motion } from "framer-motion";

// @ts-ignore
const jsmediatags = typeof window !== "undefined" ? require("jsmediatags/dist/jsmediatags.min.js") : null;

export default function Home() {
  const { playSong, currentSong, history, likedSongs, addToQueue } = usePlayer();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localSongs, setLocalSongs] = useState<Song[]>([]);
  
  const [activeTab, setActiveTab] = useState<'discover'|'recent'|'favorites'|'local'>('discover');

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const query = searchQuery;
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    setActiveTab('discover');
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
            <div className="absolute inset-0 bg-background-dark/70 backdrop-blur-xl" />
          </>
        ) : (
          <div className="absolute inset-0 dynamic-bg" />
        )}
      </div>

      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 flex flex-col p-6 gap-8 z-20 border-r border-white/5 relative">
        <div className="px-2 flex items-center gap-3">
          <div className="size-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="material-symbols-outlined text-white text-2xl fill-[1]">auto_awesome</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/40">EchoStream</h1>
            <p className="text-[10px] text-accent font-bold tracking-[0.2em] mt-1">PREMIUM</p>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Menu</p>
          <a onClick={() => setActiveTab('discover')} className={`nav-item flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer ${activeTab === 'discover' ? 'text-white active-nav bg-white/10' : 'text-slate-400 hover:text-white'}`}>
            <span className="material-symbols-outlined text-xl">grid_view</span>
            <span className="text-sm font-medium">Discover</span>
          </a>
          <a className="nav-item flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white" href="#">
            <span className="material-symbols-outlined text-xl">explore</span>
            <span className="text-sm font-medium">Browse</span>
          </a>
          <a className="nav-item flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white" href="#">
            <span className="material-symbols-outlined text-xl">podcasts</span>
            <span className="text-sm font-medium">Radio</span>
          </a>
        </nav>
        <div className="flex flex-col gap-2">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Library</p>
          <a onClick={() => setActiveTab('recent')} className={`nav-item flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer ${activeTab === 'recent' ? 'text-white active-nav bg-white/10' : 'text-slate-400 hover:text-white'}`}>
            <span className="material-symbols-outlined text-xl">history</span>
            <span className="text-sm font-medium">Recent</span>
          </a>
          <a onClick={() => setActiveTab('favorites')} className={`nav-item flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer ${activeTab === 'favorites' ? 'text-white active-nav bg-white/10' : 'text-slate-400 hover:text-white'}`}>
            <span className="material-symbols-outlined text-xl">favorite</span>
            <span className="text-sm font-medium">Favorites</span>
          </a>
          <a onClick={() => setActiveTab('local')} className={`nav-item flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer ${activeTab === 'local' ? 'text-white active-nav bg-white/10' : 'text-slate-400 hover:text-white'}`}>
            <span className="material-symbols-outlined text-xl">folder</span>
            <span className="text-sm font-medium">Local Music</span>
          </a>
          <a className="nav-item flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white" href="#">
            <span className="material-symbols-outlined text-xl">album</span>
            <span className="text-sm font-medium">Albums</span>
          </a>
          <div onClick={() => fileInputRef.current?.click()} className="nav-item flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white cursor-pointer mt-2 border border-white/10 bg-white/5 transition-all hover:bg-white/10">
            <span className="material-symbols-outlined text-xl text-accent">upload_file</span>
            <span className="text-sm font-medium text-white">Import Files</span>
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
        </div>
        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="px-4 py-4 flex items-center gap-3 glass-panel rounded-2xl cursor-pointer hover:bg-white/10 transition-colors">
            <img alt="Alex Rivera" className="size-10 rounded-xl border border-white/10 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuS4AeQPOY77JkrPKNNHoRYKAOe7JkkIBpjBcwI2ZnpCQYnKKvRbHp-kjEVKFZudPolxk9m-yEy5PSXTXKOilMsNda5d9N3ZacHQuoms-B8XFGQ4c0STRlDCHVl5YYz7xXM5tbz7TPuu2jBjGB1QMrEYZ0lGNYbt6_n52P30z22UoyiqXFBLPRNjSfZ4GYXJQYPeYNzen4xDaUBho2eH6EaId9gLTZvBHurc_7ONpyqVyJhnGijDrEky1myah93nbSA4NEMTLkzZSw"/>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">Alex Rivera</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Pro Tier</p>
            </div>
            <span className="material-symbols-outlined text-slate-400">settings</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative z-10">
        <header className="sticky top-0 z-30 flex items-center justify-between px-10 py-6 bg-background-dark/40 backdrop-blur-xl">
          <div className="flex items-center gap-8 flex-1">
            <div className="flex gap-3">
              <button className="size-10 rounded-xl glass-panel flex items-center justify-center text-slate-300 hover:bg-white/10 transition-all">
                <span className="material-symbols-outlined">west</span>
              </button>
              <button className="size-10 rounded-xl glass-panel flex items-center justify-center text-slate-300 hover:bg-white/10 transition-all">
                <span className="material-symbols-outlined">east</span>
              </button>
            </div>
            <div className="relative w-full max-w-lg">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">search</span>
              <input 
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent/50 focus:bg-white/10 outline-none transition-all text-white placeholder-slate-500" 
                placeholder="Search for tracks, artists or podcasts..." 
                type="text"
                value={searchQuery}
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
            <button className="size-12 rounded-xl glass-panel flex items-center justify-center text-slate-300 relative hover:text-white transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-3 right-3 size-2 bg-accent rounded-full border-2 border-background-dark"></span>
            </button>
            <button className="bg-accent text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all">
              Upgrade to Pro
            </button>
          </div>
        </header>

        <div className="px-10 py-6 pb-40 space-y-12">
          {activeTab === 'discover' && (
            <>
              {/* Featured Section */}
              <section>
                <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Made For You</h2>
                <p className="text-slate-400 text-sm mt-1">Hand-picked selections based on your taste</p>
              </div>
              <button className="text-sm font-bold text-accent hover:underline flex items-center gap-1">
                View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {MOCK_MIXES.map((mix) => (
                <div key={mix.id} className="glass-card p-4 rounded-[2rem] group cursor-pointer" onClick={() => playSong(MOCK_SONGS[0], MOCK_SONGS)}>
                  <div className="relative mb-4 aspect-square rounded-[1.5rem] overflow-hidden shadow-2xl">
                    <img alt={mix.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={mix.coverArt}/>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button className="size-16 bg-white text-black rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <span className="material-symbols-outlined text-4xl fill-[1]">play_arrow</span>
                      </button>
                    </div>
                  </div>
                  <div className="px-2">
                    <h3 className="font-bold text-white mb-1 truncate text-lg">{mix.title}</h3>
                    <p className="text-xs text-slate-500 font-medium truncate">{mix.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recents Section on Discover */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">{searchResults.length > 0 ? "Search Results" : "Jump back in"}</h2>
                <p className="text-slate-400 text-sm mt-1">{searchResults.length > 0 ? "From YouTube Music" : "Continue where you left off"}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(searchResults.length > 0
                  ? searchResults
                  : (history.length > 0 ? Array.from(new Set(history.map(s => s.id))).map(id => history.find(s => s.id === id)!).reverse() : MOCK_SONGS)
                ).slice(0, 8).map((song, i) => {
                  const fullList = searchResults.length > 0
                    ? searchResults
                    : (history.length > 0
                        ? Array.from(new Set(history.map(s => s.id))).map(id => history.find(s => s.id === id)!).reverse()
                        : MOCK_SONGS);
                  return (
                <div key={`recents-discover-${song.id}-${i}`} onClick={() => playSong(song, fullList)} className="glass-card flex items-center gap-4 p-3 rounded-2xl group cursor-pointer">
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
                  );
                })}
            </div>
          </section>
            </>
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
                    <div key={song.id} onClick={() => playSong(song, localSongs)} className="glass-card flex items-center gap-4 p-3 rounded-2xl group cursor-pointer">
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
                    <div key={`favpage-${song.id}-${i}`} onClick={() => playSong(song, likedSongs)} className="glass-card flex items-center gap-4 p-3 rounded-2xl group cursor-pointer">
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
                    <div key={`recpage-${song.id}-${i}`} onClick={() => playSong(song, undefined)} className="glass-card flex items-center gap-4 p-3 rounded-2xl group cursor-pointer">
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
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <BottomPlayer />
      <ExpandedPlayer />
    </div>
  );
}
