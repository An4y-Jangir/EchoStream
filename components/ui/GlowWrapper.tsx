"use client";

import React, { useRef } from "react";

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
  glowOpacity = 0.2
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !glowRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glowRef.current.style.background = `radial-gradient(${glowSize}px circle at ${x}px ${y}px, rgba(255, 255, 255, ${glowOpacity}), transparent 80%)`;
  };

  const handleMouseEnter = () => {
    if (glowRef.current) glowRef.current.style.opacity = "1";
  };

  const handleMouseLeave = () => {
    if (glowRef.current) glowRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(99,102,241,0.2)] ${className}`}
    >
      <div 
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-50 opacity-0 transition-opacity duration-300"
      />
      {children}
    </div>
  );
};
