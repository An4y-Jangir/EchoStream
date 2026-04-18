import { NextResponse } from 'next/server';
import YTMusic from 'ytmusic-api';

const ytmusic = new YTMusic();
let initialized = false;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    if (!initialized) {
      await ytmusic.initialize();
      initialized = true;
    }

    const results = await ytmusic.searchSongs(query);

    // Map YTMusic results to our application's `Song` interface
    const mappedSongs = results.slice(0, 20).map((item) => ({
      id: `youtube-${item.videoId}`,
      title: item.name,
      artist: item.artist?.name || 'Unknown Artist',
      album: item.album?.name || 'Unknown Album',
      albumArt: item.thumbnails[1]?.url || item.thumbnails[0]?.url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
      audioUrl: `youtube:${item.videoId}`,
      lyrics: [],
      genre: "Internet",
      tempo: 120,
      durationText: typeof item.duration === "number" ? Math.floor(item.duration / 60) + ":" + (item.duration % 60).toString().padStart(2, "0") : "0:00"
    }));

    return NextResponse.json({ results: mappedSongs });
  } catch (error) {
    console.error("YTMusic Search Error:", error);
    return NextResponse.json({ error: 'Failed to search YouTube Music' }, { status: 500 });
  }
}
