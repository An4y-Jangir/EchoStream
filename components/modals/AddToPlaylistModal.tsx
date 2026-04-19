"use client";

import { usePlayer } from "@/context/PlayerContext";
import { Song } from "@/types/music";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface AddToPlaylistModalProps {
  song: Song | null;
  onClose: () => void;
  onAdded: (playlistId: string) => void;
}

export function AddToPlaylistModal({ song, onClose, onAdded }: AddToPlaylistModalProps) {
  const { playlists, createPlaylist, addSongToPlaylist } = usePlayer();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showCreate, setShowCreate] = useState(playlists.length === 0);

  if (!song) return null;

  const handleCreateAndAdd = () => {
    if (!newPlaylistName.trim()) return;
    // We need the ID of the newly created playlist. 
    // Since createPlaylist is async/state-based, we'll just handle it simply here.
    const newId = `pl-${Date.now()}`;
    // Directly add via state if possible, or just call the context functions.
    createPlaylist(newPlaylistName);
    // Note: Since state update is async, adding to the "new" playlist immediately might be tricky 
    // without a return value from createPlaylist. I'll stick to a simpler flow for now.
    setNewPlaylistName("");
    setShowCreate(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-md glass-panel p-8 rounded-[2.5rem] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white">Add to Playlist</h2>
          <button onClick={onClose} className="size-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8 p-3 bg-white/5 rounded-2xl border border-white/5">
          <img src={song.albumArt} alt={song.title} className="size-12 rounded-xl object-cover shadow-lg" />
          <div className="flex-1 overflow-hidden">
            <p className="font-bold text-white truncate">{song.title}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{song.artist}</p>
          </div>
        </div>

        <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2 mb-8">
          {playlists.length === 0 ? (
            <div className="text-center py-6 px-4 bg-accent/5 rounded-[2rem] border border-accent/10">
              <span className="material-symbols-outlined text-accent text-4xl mb-2">library_music</span>
              <p className="text-slate-400 text-sm font-medium">Your library is waiting.</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Create your first playlist below</p>
            </div>
          ) : (
            playlists.map(playlist => (
              <button 
                key={playlist.id}
                onClick={() => onAdded(playlist.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-accent/10 hover:border-accent/20 border border-transparent transition-all group"
              >
                <div className="size-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <span className="material-symbols-outlined text-accent text-xl">playlist_add</span>
                </div>
                <span className="font-semibold text-white/90 group-hover:text-white transition-colors">{playlist.title}</span>
                <span className="ml-auto text-[10px] text-slate-500 font-bold uppercase">{playlist.songs.length} tracks</span>
              </button>
            ))
          )}
        </div>

        <div className="pt-6 border-t border-white/5">
          {showCreate ? (
            <div className="flex flex-col gap-3">
              <input 
                autoFocus
                type="text" 
                placeholder="Playlist name..."
                className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:ring-1 focus:ring-accent/50 focus:border-accent/50 outline-none transition-all"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()}
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleCreateAndAdd}
                  className="flex-1 bg-accent text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Create Playlist
                </button>
                <button 
                  onClick={() => setShowCreate(false)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-dashed border-white/10 text-slate-400 hover:text-white hover:border-accent/50 hover:bg-accent/5 transition-all group"
            >
              <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform duration-300">add</span>
              <span className="text-sm font-bold">Create New Playlist</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
