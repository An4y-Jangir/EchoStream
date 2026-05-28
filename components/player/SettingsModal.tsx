import { usePlayer } from "@/context/PlayerContext";
import { motion } from "framer-motion";

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { crossfadeDuration, setCrossfadeDuration } = usePlayer();

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
      className="absolute bottom-full right-0 mb-4 w-72 glass-panel bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl z-[999] origin-bottom-right"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-accent">tune</span>
          Playback Settings
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Crossfade</label>
            <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-md">
              {crossfadeDuration}s
            </span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="10" 
            step="1"
            value={crossfadeDuration}
            onChange={(e) => setCrossfadeDuration(parseInt(e.target.value))}
            className="w-full accent-accent bg-white/10 rounded-full h-1.5 appearance-none cursor-pointer"
          />
          <p className="text-[10px] text-slate-500 mt-2">
            Smoothly fade out the current song and fade in the next over {crossfadeDuration} seconds. Set to 0 to disable.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
