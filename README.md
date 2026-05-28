# 🎵 EchoStream

**EchoStream** is a high-performance, premium music streaming web application built with Next.js, React, Tailwind CSS, and Framer Motion. Featuring a tactile, glassmorphic visual interface, EchoStream blends local media, YouTube streaming, dynamic typography, and physics-based micro-animations into a seamless listening experience.

---

## ✨ Features

### 🎧 Audio & Playback Engine
* **Local Media Support**: Web-based upload with full metadata retrieval (using `jsmediatags`).
* **YouTube Streaming**: Seamless background integration of YouTube audio streams.
* **Lyrics Syncing**: Synced `.lrc` file parser with auto-fetching integration from `lrclib.net` supporting line-by-line and word-level modes.
* **Smart Queue & History**: Active user-managed queue, context-based queue fallback, and playback history tracking.
* **Smart Navigation**: Shuffling, repeating, volume controls, and playback seeking.
* **Crossfade Transition**: Adjustable playback blending in settings for smooth transitions.

### 🎨 Design & Micro-Animations
* **Interactive Logo Switcher**: Cycle through 4 responsive logo designs (Monogram, Ripple, Infinity, Equalizer) with high-fidelity idle and hover animations.
* **Parabolic Flight Animation**: Adding a song to a playlist launches its album art in a curved flight path towards the playlist sidebar indicator.
* **Cyber-Trash Deletion**: Deleting songs from a playlist slides up a custom white mechanical trash can, opens the lid, launches the song card inside, slams the lid shut, and retreats.
* **Dynamic Backdrop**: The interface backdrop smoothly transitions gradients and blur layers to match the album art color palette of the active track.

---

## 🛠️ Prerequisites

To run this application locally, you must have the following installed:

* **Node.js** (v18.0.0 or higher recommended)
* **npm** (or **yarn** / **pnpm** / **bun**)
* A modern web browser supporting HTML5 Audio and Canvas rendering.

---

## 🚀 Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/EchoStream.git
   cd EchoStream
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 💻 Tech Stack

* **Framework**: [Next.js](https://nextjs.org/) (App Router, Client-side React Provider architecture)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Media Parsing**: [jsmediatags](https://github.com/aadsm/jsmediatags)
* **State Management**: React Context Provider (`PlayerContext`)
