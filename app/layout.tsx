import type { Metadata } from "next";
import "./globals.css";

import { PlayerProvider } from "@/context/PlayerContext";

export const metadata: Metadata = {
  title: "Music Player",
  description: "High-performance Music Streaming Web App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className="bg-background-dark text-slate-100 font-display selection:bg-accent/30 selection:text-white">
        <PlayerProvider>
          {children}
        </PlayerProvider>
      </body>
    </html>
  );
}
