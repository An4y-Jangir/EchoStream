import { NextResponse } from 'next/server';
import YTMusic from 'ytmusic-api';

export const dynamic = 'force-dynamic';

const ytmusic = new YTMusic();
let initialized = false;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'Top 50 Global Hits';

  try {
    if (!initialized) {
      await ytmusic.initialize();
      initialized = true;
    }

    const results = await ytmusic.searchSongs(query);

    // Map YTMusic results to our application's `Song` interface
    const mappedSongs = results.slice(0, 24).map((item) => {
      let albumArt = item.thumbnails?.[item.thumbnails.length - 1]?.url || item.thumbnails?.[0]?.url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745";
      if (albumArt.includes("=w") && albumArt.includes("-h")) {
        albumArt = albumArt.replace(/=w\d+-h\d+.*$/, "=w600-h600-l90-rj");
      }

      return {
        id: `youtube-${item.videoId}`,
        title: item.name,
        artist: item.artist?.name || 'Unknown Artist',
        artistId: item.artist?.artistId || undefined,
        album: item.album?.name || 'Unknown Album',
        albumId: item.album?.albumId || undefined,
        albumArt,
        audioUrl: `youtube:${item.videoId}`,
        lyrics: [],
        genre: "Top Hits",
        tempo: 120,
        durationText: typeof item.duration === "number" ? Math.floor(item.duration / 60) + ":" + (item.duration % 60).toString().padStart(2, "0") : "0:00"
      };
    });

    return NextResponse.json({ results: mappedSongs });
  } catch (error) {
    console.error("YTMusic Search Error:", error);
    return NextResponse.json({ error: 'Failed to search YouTube Music' }, { status: 500 });
  }
}
