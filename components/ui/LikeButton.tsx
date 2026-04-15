"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  className?: string;
  initialLiked?: boolean;
}

export function LikeButton({ className, initialLiked = false }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={(e) => {
        e.stopPropagation();
        setLiked(!liked);
      }}
      className={cn("p-2 rounded-full hover:bg-white/10 transition-colors", className)}
    >
      <Heart
        className={cn("w-6 h-6 transition-colors duration-300", 
          liked ? "fill-red-500 text-red-500" : "fill-transparent text-white/70"
        )}
      />
    </motion.button>
  );
}
