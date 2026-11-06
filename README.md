# 🎵 EchoStream

**EchoStream** is a premium, high-performance music streaming web application built using Next.js (App Router), React, Tailwind CSS, and Framer Motion. Featuring a tactile, glassmorphic visual interface, EchoStream merges local file streaming, dynamic YouTube Music searching, real-time lyrics syncing, and beautiful physics-based micro-animations into a seamless, modern music experience.

---

## ✨ Features

### 🎧 Audio & Playback Engine
* **Dynamic Top-Listened Search Engine (`/api/top-listened`)**: Live, dynamic fetching of top-streamed global hits and genre-specific charts (Synthwave, Electronic, Disco & Funk, Lo-Fi, Darkwave) directly via `ytmusic-api`, featuring high-res 600×600 artwork scaling and serverless in-memory caching.
* **Instant Client-Side Mood Cache**: Integrated an in-memory client cache (`moodCacheRef`) ensuring 0ms instantaneous switching between vibe stations without network re-render flicker.
* **Local Media Support**: In-browser client media upload with automatic metadata parsing (ID3 tags, album artwork, track info) using `jsmediatags`.
* **Dynamic YouTube Music Streaming**: Under-the-hood integration of YouTube Music search and streaming using the `ytmusic-api` node package.
* **Dynamic Album Fetching**: Dynamic fetching of complete album tracklists (mapped via YouTube Music playlist and browse IDs) using a backend serverless route handler (`/api/album`).
* **Complete Artist Catalog Support**: Extended the artist detail endpoint (`/api/artist`) to retrieve the full catalog of popular tracks using `getArtistSongs` with automatic overview fallback.
* **Artist Catalog "See All"**: Toggles between a neat 5-track preview and the complete artist catalog inside the Popular Tracks section on artist pages.
* **Studio-Grade Audio Crossfading**: Smooth crossfade volume ramping between consecutive audio tracks during automatic playback transitions, avoiding dead air gaps. Crossfade duration can be customized in settings.
* **Smart Queue & History**: Full support for active user-managed queue, context-based queue fallbacks (e.g. playing through related tracks or search results), and history tracking.
* **Lyrics Syncing**: Live `.lrc` file parser with auto-fetching integration from `lrclib.net` supporting line-by-line and word-level modes.
* **Discrepancy Grouping**: Case-insensitive grouping of albums to correctly merge compilation folders or tracks with varying featured-artist tags.
* **Playlist Looping**: Automatically wraps around and plays the first song in the playlist when the last song finishes playing, ensuring continuous music delivery.
* **Virtual DSP & Equalizer Module**: Added a 5-band Graphic Equalizer (60Hz, 230Hz, 910Hz, 4kHz, 14kHz), customizable room Reverb modes (Studio, Hall, Club), and predefined presets (Cyberpunk, Bass Boost, Rock, Electronic, Vocal, Flat).
* **JSON Data Sync Manager**: Integrated full backup/restore functionality, allowing users to export all customized playlists, likes, and visual configurations into a JSON file, or import it to sync data across devices.
* **Interactive Playlist Editor & Custom Covers**: Added a detail-editing modal next to the playlist delete button. Users can rename playlists and select from 5 premium curated preset covers (Synthwave Neon, Retro Pink Cassette, Abstract Glow, Cosmic Space, and Spinning Vinyl Record) or upload their own custom cover art from their laptop (validated under 2MB).
* **Custom Profile Avatar Uploader**: Added support for uploading local custom avatars from settings. Custom images are verified to be under 2MB and encoded to Base64 strings for persistent `localStorage` synchronization.
* **Mute Keyboard Shortcut**: Configured keybind `M`/`m` to toggle muting. Stores the previous volume in memory and restores it when unmuting. Added a keyboard shortcuts cheatsheet directly into settings.

### 🎨 Design, Micro-Animations & Ambient Engine
* **Apple Music Dynamic Liquid Ambient Canvas**:
  * *Harmonic Triad Color Extraction*: Analyzes album artwork using `FastAverageColor` to extract dominant tones, then algorithmically derives complementary analogous (+45°) and triadic (+160°) color harmonies.
  * *Three Floating Ambient Mesh Orbs*: Drifting, hardware-accelerated fluid orbs (`w-[85vw] h-[85vh]`, `w-[80vw] h-[80vh]`, `w-[70vw] h-[70vh]`) with analytical radial gradients that bloom naturally without GPU convolution blurs.
  * *Artwork Base Bloom*: Saturated, blurred 40% ambient artwork layer that dynamically illuminates the background when tracks play.
  * *Refraction Glassmorphism*: Frosted glass cards, sidebar, and controls refract the ambient colored light, matching the signature Apple Music aesthetic.
* **Editorial Spotlight Hero Carousel**:
  * Luxury editorial hero banner on the Discover page highlighting curated tracks with custom quotes, genre tags, and badges.
  * Integrated one-click playback, queue flight micro-animation, and smooth pagination controls.
* **Bouncy Vibe & Genre Stations with Elastic Spring Physics**:
  * Interactive mood filter bar (All Vibes, Synthwave, Electronic, Disco & Funk, Lo-Fi & Chill, Darkwave) powered by Framer Motion layout animations (`stiffness: 420`, `damping: 16`, `mass: 0.55`).
  * *Physical Neighbor Displacement*: Selecting a pill expands its dimensions (`px-6 py-3.5`), physically pushing adjacent sibling pills outward with an organic spring bounce overshoot.
  * *Gliding Active Indicator*: Features a smooth floating indicator dot (`layoutId="active-mood-dot"`) that fluidly glides between buttons.
  * *Zero-Clipping Layout*: Engineered with dedicated vertical breathing room (`py-6 px-4 -my-4 -mx-4`), ensuring active glows, hover scales, and drop shadows are never cut off by overflow boundaries.
  * *Live Vibe Background Illumination*: Selecting a vibe station dynamically bathes the entire application canvas in that mood's signature neon lighting (e.g. Synthwave magenta/cyan, Disco amber/ruby, Electronic cyber blue).
* **Spotify-Style "Jump Back In" Shelf**: 6-tile quick-launch shelf showcasing Liked Songs and frequent rotation tracks with instant one-click hover play triggers.
* **Contextual Time-of-Day Greetings**: Dynamic time-sensitive welcome headers (`Good morning`, `Good afternoon`, `Good evening`, `Midnight Sessions`) reflecting the user's local clock with an active "Lossless Engine" indicator and a "Quick Mix" shuffle button.
* **Modern Power-User Studio Bento Grid**: Elegant 4-panel bento grid offering 1-click access to local audio imports, custom playlist creation, real-time reactive audio visualizer, and dynamic accent controls.
* **Snappy Zero-Lag Custom Cursor**:
  * Upgraded follower ring physics with an ultra-responsive spring curve (`stiffness: 600`, `damping: 32`, `mass: 0.12`).
  * Powered by GPU `transform: scale` to eliminate browser DOM reflows and layout recalculations.
  * The 1:1 hardware point dot remains permanently visible at exact hardware mouse coordinates for instantaneous aiming precision.
* **View Navigation History (Back/Forward)**: Built a custom navigation history stack (`navHistory`) that caches active tabs, playlists, albums, and artist views with responsive chevron indicators.
* **Dynamic Character Animated Search Bar (`AnimatedInput`)**: Skiper UI inspired character-by-character reveal input field using Framer Motion springs.
* **Tactile Bidirectional Mini-Player Transitions**: Interactive directional slide animations that adapt to track advancement vs rewinding.
* **Smart Gooey Song Tooltip (`GooeyTooltip`)**: Rich gooey SVG fluid morphing tooltips with separated text layers to preserve crisp typography.
* **Parabolic Flight Animation & Landing Pulses**: Visual flight physics when adding songs to playlists or queue, complete with rounded corner preservation and arrival ripple pulses.
* **Cyber-Trash Deletion**: Mechanical trash bin animation for playlist removals.

### 📱 Mobile Experience & Performance Optimizations
* **Zero-Stall Canvas Particles Loop**:
  * Removed per-frame synchronous `getComputedStyle(document.documentElement)` calls from the 60/120fps `requestAnimationFrame` loop, eliminating main thread stalls.
  * Switched constellation mesh distance calculations to squared thresholds (`dx * dx + dy * dy < maxDistSq`) and batched connection strokes into a single canvas draw call.
* **GPU Fill-Rate Optimization**: Replaced CPU/GPU heavy `filter: blur(35px-40px)` on moving full-screen layers with analytical multi-stop CSS radial gradients, dropping GPU rendering overhead by over 90%.
* **Direct DOM Mouse Glow Tracking**: Updated `GlowWrapper` mousemove tracking to direct DOM property mutations, eliminating hundreds of cascading React re-renders per second.
* **Mobile Background Playback & Lock Screen Controls**: Integrated HTML5 Media Session API (`navigator.mediaSession`) for full lockscreen metadata and playback controls on iOS and Android.
* **Instant Direct Audio Streaming**: High-speed CDN audio streaming with browser pre-buffering (`preload="auto"`).
* **Pre-Warmed YouTube Iframe Engine**: Instant YouTube stream playback under 1 second via permanent iframe mounting and `loadVideoById`.
* **Single-Click Autoplay**: Optimized player variables to ensure playback starts on the very first tap.
* **Responsive Bottom Navigation & Stacking Layer**: Compact bottom navigation bar with elevated modals (`z-[70]`) and tailored mobile layouts.

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
- **Serverless API Routes**: `/api/search`, `/api/top-listened`, `/api/album`, and `/api/artist` are automatically mapped to Vercel serverless function runners.
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
