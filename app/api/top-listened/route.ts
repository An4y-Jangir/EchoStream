import { NextResponse } from 'next/server';
import YTMusic from 'ytmusic-api';
import { Song } from '@/types/music';

export const dynamic = 'force-dynamic';

const ytmusic = new YTMusic();
let initialized = false;

// In-memory cache to prevent redundant external API hits
const cache = new Map<string, { data: Song[]; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

const MOOD_QUERY_MAP: Record<string, string> = {
  all: 'Top 50 Global Hits',
  synthwave: 'Top Synthwave Hits',
  electronic: 'Top Electronic Dance Hits',
  disco: 'Top Disco Funk Hits',
  chill: 'Top Lo-Fi Chill Beats',
  darkwave: 'Top Darkwave Synth Hits',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mood = searchParams.get('mood') || 'all';
  const query = MOOD_QUERY_MAP[mood.toLowerCase()] || `Top ${mood} Hits`;

  const now = Date.now();
  const cached = cache.get(mood.toLowerCase());
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ results: cached.data, cached: true });
  }

  try {
    if (!initialized) {
      await ytmusic.initialize();
      initialized = true;
    }

    const results = await ytmusic.searchSongs(query);

    const mappedSongs: Song[] = results.slice(0, 24).map((item) => {
      let albumArt = item.thumbnails?.[item.thumbnails.length - 1]?.url || item.thumbnails?.[0]?.url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745";
      if (albumArt.includes("=w") && albumArt.includes("-h")) {
        albumArt = albumArt.replace(/=w\d+-h\d+.*$/, "=w600-h600-l90-rj");
      }

      const formattedGenre = mood === 'all' 
        ? 'Global Hit' 
        : (mood.charAt(0).toUpperCase() + mood.slice(1));

      return {
        id: `youtube-${item.videoId}`,
        title: item.name,
        artist: item.artist?.name || 'Unknown Artist',
        artistId: item.artist?.artistId || undefined,
        album: item.album?.name || 'Top Chart Single',
        albumId: item.album?.albumId || undefined,
        albumArt,
        audioUrl: `youtube:${item.videoId}`,
        lyrics: [],
        genre: formattedGenre,
        tempo: 120,
        durationText: typeof item.duration === "number" ? Math.floor(item.duration / 60) + ":" + (item.duration % 60).toString().padStart(2, "0") : "0:00"
      };
    });

    cache.set(mood.toLowerCase(), { data: mappedSongs, timestamp: now });
    return NextResponse.json({ results: mappedSongs });
  } catch (error) {
    console.error("Top Listened Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to fetch top listened songs from search engine' }, { status: 500 });
  }
}

