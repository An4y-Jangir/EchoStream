# 🎵 EchoStream

**EchoStream** is a premium, high-performance music streaming web application built using Next.js (App Router), React, Tailwind CSS, and Framer Motion. Featuring a tactile, glassmorphic visual interface, EchoStream merges local file streaming, dynamic YouTube Music searching, real-time lyrics syncing, and beautiful physics-based micro-animations into a seamless, modern music experience.

---

## ✨ Features

### 🎧 Audio & Playback Engine
* **Local Media Support**: In-browser client media upload with automatic metadata parsing (ID3 tags, album artwork, track info) using `jsmediatags`.
* **Dynamic YouTube Music Streaming**: Under-the-hood integration of YouTube Music search and streaming using the `ytmusic-api` node package.
* **Dynamic Album Fetching**: Dynamic fetching of complete album tracklists (mapped via YouTube Music playlist and browse IDs) using a backend serverless route handler (`/api/album`).
* **Smart Queue & History**: Full support for active user-managed queue, context-based queue fallbacks (e.g. playing through related tracks or search results), and history tracking.
* **Lyrics Syncing**: Live `.lrc` file parser with auto-fetching integration from `lrclib.net` supporting line-by-line and word-level modes.
* **Discrepancy Grouping**: Case-insensitive grouping of albums to correctly merge compilation folders or tracks with varying featured-artist tags.
* **Boundary Playback Controls**: Stops playback (pauses audio players and resets timelines) when the queue or playlist ends and repeat is disabled, preventing infinite loops.

### 🎨 Design & Micro-Animations
* **Interactive Logo Switcher**: Cycle through 4 high-fidelity responsive logo designs (Monogram, Ripple, Infinity, Equalizer) with dynamic hover states.
* **Parabolic Flight Animation**: Adding a song to a playlist launches its album art in a physical, curved flight path towards the playlist sidebar indicator.
* **Cyber-Trash Deletion**: Deleting songs from a playlist triggers a custom mechanical trash bin, opens the lid, launches the song card inside, slams shut, and retreats.
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

EchoStream is configured for **zero-config** deployments on [Vercel](https://vercel.com). The backend endpoints `/api/search` and `/api/album` are automatically converted to serverless functions, and ESLint configurations are set up to run non-interactively during production builds.

### Deploying via Git (Recommended)
1. Push your repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New"** > **"Project"**.
3. Import your repository.
4. Keep the default build settings (Next.js preset) and click **"Deploy"**.

### Deploying via Vercel CLI
1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Log in and deploy from the repository root:
   ```bash
   vercel
   ```
3. For production deployments:
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
