export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  audioUrl: string; // Mock URL or path for real audio
  lyrics: LyricLine[];
  genre: string;
  tempo: number; // BPM for recommendation grouping
  durationText?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverArt: string;
  songs: Song[];
}
