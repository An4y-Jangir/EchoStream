import { NextResponse } from 'next/server';
import YTMusic from 'ytmusic-api';

export const dynamic = 'force-dynamic';

const ytmusic = new YTMusic();
let initialized = false;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get('id');
  const artistName = searchParams.get('name');

  if (!artistId && !artistName) {
    return NextResponse.json({ error: 'Missing id or name parameter' }, { status: 400 });
  }

  try {
    if (!initialized) {
      await ytmusic.initialize();
      initialized = true;
    }

    let id = artistId;
    
    // Resolve artist ID by name if not provided
    if (!id && artistName) {
      const searchResults = await ytmusic.searchArtists(artistName);
      if (searchResults && searchResults.length > 0) {
        id = searchResults[0].artistId;
      }
    }

    if (!id) {
      // Return null results if no artist could be resolved
      return NextResponse.json({ results: null });
    }

    const artistData = await ytmusic.getArtist(id);
    let rawSongs = artistData.topSongs || [];

    try {
      const allSongs = await ytmusic.getArtistSongs(id);
      if (allSongs && allSongs.length > 0) {
        rawSongs = allSongs;
      }
    } catch (err) {
      console.warn("Failed to fetch artist songs, falling back to topSongs:", err);
    }

    // Map top songs to our front-end Song structure
    const mappedSongs = rawSongs.map((item) => ({
      id: `youtube-${item.videoId}`,
      title: item.name,
      artist: item.artist?.name || artistData.name,
      artistId: item.artist?.artistId || id || undefined,
      album: item.album?.name || 'Unknown Album',
      albumId: item.album?.albumId || undefined,
      albumArt: item.thumbnails?.[1]?.url || item.thumbnails?.[0]?.url || artistData.thumbnails?.[1]?.url || artistData.thumbnails?.[0]?.url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
      audioUrl: `youtube:${item.videoId}`,
      lyrics: [],
      genre: "Internet",
      tempo: 120,
      durationText: typeof item.duration === "number" ? Math.floor(item.duration / 60) + ":" + (item.duration % 60).toString().padStart(2, "0") : "0:00"
    }));

    // Map top albums to a clean format
    const mappedAlbums = (artistData.topAlbums || []).map((album) => ({
      id: album.albumId,
      name: album.name,
      coverArt: album.thumbnails?.[1]?.url || album.thumbnails?.[0]?.url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
      year: album.year,
      playlistId: album.playlistId
    }));

    // Map similar artists
    const mappedSimilar = (artistData.similarArtists || []).map((art) => ({
      id: art.artistId,
      name: art.name,
      thumbnail: art.thumbnails?.[1]?.url || art.thumbnails?.[0]?.url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745"
    }));

    return NextResponse.json({
      results: {
        id,
        name: artistData.name,
        thumbnail: artistData.thumbnails?.[2]?.url || artistData.thumbnails?.[1]?.url || artistData.thumbnails?.[0]?.url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
        topSongs: mappedSongs,
        topAlbums: mappedAlbums,
        similarArtists: mappedSimilar
      }
    });
  } catch (error) {
    console.error("YTMusic Artist Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to fetch artist details' }, { status: 500 });
  }
}
