import { LyricLine, LyricWord } from "@/types/music";

export function parseLrc(lrcString: string): LyricLine[] {
  const lines = lrcString.split('\n');
  const lyrics: LyricLine[] = [];
  // Matches [mm:ss.xx] or [mm:ss.xxx] Format at the start of a line
  const lineRegex = /^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
  
  const parseTime = (minStr: string, secStr: string, msStr: string): number => {
    const min = parseInt(minStr);
    const sec = parseInt(secStr);
    const ms = msStr.length === 2 ? parseInt(msStr) * 10 : parseInt(msStr);
    return min * 60 + sec + ms / 1000;
  };

  lines.forEach(line => {
    const match = line.match(lineRegex);
    if (match) {
      const time = parseTime(match[1], match[2], match[3]);
      const content = match[4].trim();
      
      if (!content) {
        lyrics.push({ time, text: "♪", words: [] });
        return;
      }

      // Check for word-level timestamps in <mm:ss.xx> format
      const parts = content.split(/(<\d{2}:\d{2}\.\d{2,3}>)/);
      
      let currentWordTime = time;
      const words: LyricWord[] = [];
      let textClean = "";
      let hasWordTimestamps = false;

      parts.forEach(part => {
        const tagMatch = part.match(/<(\d{2}):(\d{2})\.(\d{2,3})>/);
        if (tagMatch) {
          currentWordTime = parseTime(tagMatch[1], tagMatch[2], tagMatch[3]);
          hasWordTimestamps = true;
        } else {
          const textPart = part.trim();
          if (textPart) {
            const textWords = textPart.split(/\s+/);
            textWords.forEach(w => {
              if (w) {
                words.push({
                  text: w,
                  time: currentWordTime
                });
                textClean += (textClean ? " " : "") + w;
              }
            });
          }
        }
      });

      if (hasWordTimestamps && words.length > 0) {
        lyrics.push({
          time,
          text: textClean,
          words
        });
      } else {
        // Fallback: standard LRC line, we split it into words and distribute timestamps later
        const standardWords = content.split(/\s+/).filter(Boolean);
        lyrics.push({
          time,
          text: content,
          words: standardWords.map(w => ({
            text: w,
            time: time
          }))
        });
      }
    }
  });

  // Second pass: distribute word times for standard lines using the line's actual duration
  for (let i = 0; i < lyrics.length; i++) {
    const currentLine = lyrics[i];
    const nextLine = lyrics[i + 1];
    const lineDuration = nextLine ? nextLine.time - currentLine.time : 5.0; // fallback to 5 seconds
    
    if (currentLine.words && currentLine.words.length > 0) {
      const isStandardLine = currentLine.words.every(w => w.time === currentLine.time);
      if (isStandardLine && currentLine.words.length > 1) {
        const wordCount = currentLine.words.length;
        const timeWindow = lineDuration / wordCount;
        currentLine.words.forEach((w, wIndex) => {
          w.time = currentLine.time + (wIndex * timeWindow);
        });
      }
    }
  }

  return lyrics;
}
