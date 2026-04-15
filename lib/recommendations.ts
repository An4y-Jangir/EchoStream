import { Song } from "@/types/music";

export interface UserHistoryMapping {
  genres: Record<string, number>; // Record of frequency of listening
  favoriteTempos: number[];
}

/**
 * YouTube Music Style 'Deep Discovery' Recommendation Logic
 * Suggests songs based on shared genre and tempo similarity rather than simple popularity.
 */
export function generateRecommendations(
  currentSong: Song,
  allSongs: Song[],
  userHistory?: UserHistoryMapping
): Song[] {
  // Simple algorithm:
  // 1. Matches genre strongly
  // 2. Matches tempo within +/- 15 BPM
  // 3. Fallback to similar artists

  const scoredSongs = allSongs.map((song) => {
    let score = 0;
    
    // Exact genre match score
    if (song.genre === currentSong.genre) {
      score += 50;
    }

    // Tempo similarity score
    const tempoDiff = Math.abs(song.tempo - currentSong.tempo);
    if (tempoDiff <= 15) {
      score += (15 - tempoDiff) * 2; // Closer tempo = higher score
    }

    // History bonus
    if (userHistory) {
      const genrePref = userHistory.genres[song.genre] || 0;
      score += genrePref * 5;
    }

    return { song, score };
  });

  // Sort by highest score, exclude the current song itself
  return scoredSongs
    .filter((s) => s.song.id !== currentSong.id)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.song);
}
