import { NextResponse } from 'next/server';
import YTMusic from 'ytmusic-api';

export const dynamic = 'force-dynamic';

const ytmusic = new YTMusic();
let initialized = false;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const albumId = searchParams.get('id');

  if (!albumId) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    if (!initialized) {
      await ytmusic.initialize();
      initialized = true;
    }

    const results = await ytmusic.getAlbum(albumId);
    if (!results || !results.songs) {
      return NextResponse.json({ results: [] });
    }

    // Map YTMusic album songs to our application's `Song` interface
    const mappedSongs = results.songs.map((item) => {
      // Use fallback thumbnails from the album if the track has none
      const thumbnail = item.thumbnails?.[1]?.url || item.thumbnails?.[0]?.url || results.thumbnails?.[1]?.url || results.thumbnails?.[0]?.url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745";
      
      return {
        id: `youtube-${item.videoId}`,
        title: item.name,
        artist: item.artist?.name || results.artist?.name || 'Unknown Artist',
        artistId: item.artist?.artistId || results.artist?.artistId || undefined,
        album: results.name,
        albumId: results.albumId,
        albumArt: thumbnail,
        audioUrl: `youtube:${item.videoId}`,
        lyrics: [],
        genre: "Internet",
        tempo: 120,
        durationText: typeof item.duration === "number" ? Math.floor(item.duration / 60) + ":" + (item.duration % 60).toString().padStart(2, "0") : "0:00"
      };
    });

    return NextResponse.json({ results: mappedSongs });
  } catch (error) {
    console.error("YTMusic Album Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to fetch YouTube Music album' }, { status: 500 });
  }
}
