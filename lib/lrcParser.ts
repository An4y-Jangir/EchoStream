export function parseLrc(lrcString: string) {
  const lines = lrcString.split('\n');
  const lyrics: { time: number; text: string }[] = [];
  // Matches [mm:ss.xx] or [mm:ss.xxx] Format
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
  
  lines.forEach(line => {
    const match = line.match(regex);
    if (match) {
      const min = parseInt(match[1]);
      const sec = parseInt(match[2]);
      const ms = match[3].length === 2 ? parseInt(match[3]) * 10 : parseInt(match[3]);
      const time = min * 60 + sec + ms / 1000;
      const text = match[4].trim();
      
      // We push even if text is empty, as it acts as a timing blank spacer!
      // But typically we can skip totally empty unless we want precise silences.
      if (text) {
        lyrics.push({ time, text });
      } else {
        lyrics.push({ time, text: "♪" }); // Use music note for instrumentals
      }
    }
  });
  
  return lyrics;
}
