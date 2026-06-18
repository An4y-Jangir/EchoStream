# 🎵 EchoStream

**EchoStream** is a premium, high-performance music streaming web application built using Next.js (App Router), React, Tailwind CSS, and Framer Motion. Featuring a tactile, glassmorphic visual interface, EchoStream merges local file streaming, dynamic YouTube Music searching, real-time lyrics syncing, and beautiful physics-based micro-animations into a seamless, modern music experience.

---

## ✨ Features

### 🎧 Audio & Playback Engine
* **Local Media Support**: In-browser client media upload with automatic metadata parsing (ID3 tags, album artwork, track info) using `jsmediatags`.
* **Dynamic YouTube Music Streaming**: Under-the-hood integration of YouTube Music search and streaming using the `ytmusic-api` node package.
* **Dynamic Album Fetching**: Dynamic fetching of complete album tracklists (mapped via YouTube Music playlist and browse IDs) using a backend serverless route handler (`/api/album`).
* **Studio-Grade Audio Crossfading**: Smooth crossfade volume ramping between consecutive audio tracks during automatic playback transitions, avoiding dead air gaps. Crossfade duration can be customized in settings.
* **Smart Queue & History**: Full support for active user-managed queue, context-based queue fallbacks (e.g. playing through related tracks or search results), and history tracking.
* **Lyrics Syncing**: Live `.lrc` file parser with auto-fetching integration from `lrclib.net` supporting line-by-line and word-level modes.
* **Discrepancy Grouping**: Case-insensitive grouping of albums to correctly merge compilation folders or tracks with varying featured-artist tags.
* **Playlist Looping**: Automatically wraps around and plays the first song in the playlist when the last song finishes playing, ensuring continuous music delivery.

### 🎨 Design & Micro-Animations
* **Dynamic Character Animated Search Bar (`AnimatedInput`)**:
  * Replaced traditional input search bars with a character-by-character reveal input field inspired by the Skiper UI visual engine (`skiper68`).
  * Characters slide up and transition using `<AnimatePresence>` and Framer Motion spring curves.
  * Preserves layout stability and handles spaces correctly using `white-space: pre` wrappers.
* **Tactile Bidirectional Mini-Player Transitions**:
  * Interactive slide animations on the mini-player (`BottomPlayer`) that adapt to your playback navigation.
  * Advancing to the next song slides details *down* (top-to-bottom).
  * Clicking the previous button reverses the animation, sliding details *up* (bottom-to-top) to mirror a rewinding movement.
* **Smart Gooey Song Tooltip (`GooeyTooltip`)**:
  * Rich gooey SVG fluid morphing tooltips inspired by the Skiper UI Nextjs gooey menu (`skiper46`).
  * **Zero Text Blurriness**: Separates the background SVG gooey filter layer from the foreground text layer, keeping typography 100% crisp and readable.
  * **Smart Overflow Detection**: Automatically compares container scrollWidth vs clientWidth. The tooltip only mounts for truncated song titles, keeping short titles clean.
* **Dynamic Custom Cursor**: A hardware-accelerated pointer follower with a spring-delayed outer ring (`damping: 25`, `stiffness: 220`) that trails the cursor.
  * *Interactive Hover State*: Outer ring expands, glows with a neon aura, and changes blend-mode to `difference` when hovering over links, buttons, cards, or nav items.
  * *Tactile Click State*: Inner dot and outer ring scale down and pulse on clicks.
  * *Text Input State*: Ring transforms into an elegant vertical line (I-beam selection indicator) when hovering text input fields.
  * *Touch Prevention*: Automatically disabled on touch-only devices to preserve default mobile navigation.
* **Equalizer Default Startup**: The audio equalizer logo loads by default on startup, immediately establishing a dynamic visual brand presence.
* **Parabolic Flight Animation (Playlists & Queue)**: Adding a song to either a playlist or the playback queue launches a miniature preview of its album art in a physical, curved flight path towards the target element (the sidebar playlist or the active player's queue button).
* **Landing Pulse Animations**: Adding songs to both playlists and the queue triggers a visual scaling pulse animation on landing, signaling successful addition with rich micro-feedback.
* **Cyber-Trash Deletion**: Deleting songs from a playlist triggers a custom mechanical trash bin, opens the lid, launches the song card inside, slams shut, and retreats.
* **Exposed Playlist Deletion**: Convenient management action to delete custom playlists directly from the playlist header with confirmation prompts.
* **Dynamic Backdrop**: Blur layers and background colors dynamically adapt to match the color palette of the active album art.

---

## 🛠️ Prerequisites

To run this application locally, you need:
* **Node.js** (v18.0.0 or higher recommended)
* **npm** (or **yarn** / **pnpm** / **bun**)

---

## 🚀 Local Installation & Setup

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

4. **Build and Start Production Server**:
   ```bash
   npm run build
   ```
   ```bash
   npm start
   ```

---

## ⚡ Vercel Deployment

EchoStream is fully optimized for **zero-config** deployments on [Vercel](https://vercel.com). 

### Setup details:
- **Serverless API Routes**: `/api/search`, `/api/album`, and `/api/artist` are automatically mapped to Vercel serverless function runners.
- **Client & Server Isolation**: Safe conditional checks (`typeof window !== 'undefined'`) prevent compilation errors on Vercel's SSR builders.
- **Production Build Scripts**: Next.js builds clean and compiles TypeScript targets without blocking warnings.

### Deploying via Git (Recommended)
1. Push your repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New"** > **"Project"**.
3. Import your repository.
4. Keep the default Next.js build settings and click **"Deploy"**.

### Deploying via Vercel CLI
1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Log in and deploy:
   ```bash
   vercel
   ```
3. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## 💻 Tech Stack

* **Core Framework**: [Next.js](https://nextjs.org/) (App Router, Client-side React Provider architecture)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Media Parsing**: [jsmediatags](https://github.com/aadsm/jsmediatags)
* **State Management**: React Context (`PlayerContext`)
* **Music APIs**: `ytmusic-api` integration for serverless routes
