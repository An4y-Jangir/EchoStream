export interface LyricWord {
  text: string;
  time: number; // absolute time in seconds
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
  words?: LyricWord[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumId?: string;
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
