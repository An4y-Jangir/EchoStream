"use client";

import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  backgroundImage?: string;
  onClick?: () => void;
}

export function GlassCard({ children, className, backgroundImage, onClick, ...props }: GlassCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl cursor-pointer group",
        "bg-white/5 border border-white/10 backdrop-blur-xl",
        "transition-colors duration-300 hover:bg-white/10",
        className
      )}
      {...props}
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      <div className="relative z-20 h-full p-4 flex flex-col justify-end">
        {children}
      </div>
    </motion.div>
  );
}
