"use client";

import React, { useRef, useState, MouseEvent } from "react";

interface GlowWrapperProps {
  children: React.ReactNode;
  className?: string;
  glowSize?: number;
  glowOpacity?: number;
}

export const GlowWrapper: React.FC<GlowWrapperProps> = ({ 
  children, 
  className = "", 
  glowSize = 400,
  glowOpacity = 0.2 // Increased for visibility
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      <div 
        className="pointer-events-none absolute inset-0 z-50 transition-opacity duration-300"
        style={{
          background: `radial-gradient(${glowSize}px circle at ${position.x}px ${position.y}px, rgba(255, 255, 255, ${glowOpacity}), transparent 80%)`,
          opacity: opacity,
        }}
      />
      {children}
    </div>
  );
};
