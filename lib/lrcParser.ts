import { LyricLine, LyricWord } from "@/types/music";

/**
 * Parses word-level lyrics returned from TTML / Apple Music / Musixmatch JSON providers
 * (e.g. from lyricsplus or similar word-synced APIs).
 */
export function parseWordLyrics(lines: any[]): LyricLine[] {
  if (!Array.isArray(lines) || lines.length === 0) return [];

  const parsedLines: LyricLine[] = [];

  for (const line of lines) {
    const lineTime = typeof line.time === "number" ? line.time / 1000 : 0;
    const lineDuration = typeof line.duration === "number" ? line.duration / 1000 : undefined;
    const lineText = line.text || "";

    const words: LyricWord[] = [];

    // Check for syllabus array (Apple Music / Spotify TTML word format)
    if (Array.isArray(line.syllabus) && line.syllabus.length > 0) {
      let currentWordStr = "";
      let currentWordStartTime = 0;
      let currentWordDuration = 0;

      line.syllabus.forEach((s: any) => {
        const sTime = typeof s.time === "number" ? s.time / 1000 : lineTime;
        const sDuration = typeof s.duration === "number" ? s.duration / 1000 : 0.25;

        if (!currentWordStr) {
          currentWordStartTime = sTime;
        }

        currentWordStr += s.text || "";
        currentWordDuration += sDuration;

        // If the syllable ends with a space, newline, or punctuation boundary, it completes the word
        if (s.text && (s.text.endsWith(" ") || s.text.endsWith("\n") || s.text.endsWith("\t"))) {
          const trimmed = currentWordStr.trim();
          if (trimmed) {
            words.push({
              text: trimmed,
              time: currentWordStartTime,
              duration: Math.max(0.1, currentWordDuration),
            });
          }
          currentWordStr = "";
          currentWordDuration = 0;
        }
      });

      // Catch any trailing word without a trailing space
      const remainingTrimmed = currentWordStr.trim();
      if (remainingTrimmed) {
        words.push({
          text: remainingTrimmed,
          time: currentWordStartTime,
          duration: Math.max(0.1, currentWordDuration),
        });
      }
    } else if (Array.isArray(line.words) && line.words.length > 0) {
      // Direct words array
      line.words.forEach((w: any) => {
        words.push({
          text: (w.text || "").trim(),
          time: typeof w.time === "number" ? (w.time > 1000 ? w.time / 1000 : w.time) : lineTime,
          duration: typeof w.duration === "number" ? (w.duration > 100 ? w.duration / 1000 : w.duration) : 0.35,
        });
      });
    } else {
      // Fallback: split line text into words with rhythmic vocal pacing
      const textTokens = lineText.split(/\s+/).filter(Boolean);
      const vocalSpan = lineDuration ? Math.min(lineDuration * 0.85, textTokens.length * 0.45) : textTokens.length * 0.45;
      const wordSpan = textTokens.length > 0 ? vocalSpan / textTokens.length : 0.4;

      textTokens.forEach((t: string, tIdx: number) => {
        words.push({
          text: t,
          time: lineTime + tIdx * wordSpan,
          duration: wordSpan * 0.9,
        });
      });
    }

    parsedLines.push({
      time: lineTime,
      text: lineText,
      words: words.filter((w) => Boolean(w.text)),
    });
  }

  return parsedLines;
}

/**
 * Parses standard or enhanced `.lrc` lyrics strings.
 */
export function parseLrc(lrcString: string): LyricLine[] {
  const lines = lrcString.split("\n");
  const lyrics: LyricLine[] = [];
  // Matches [mm:ss.xx] or [mm:ss.xxx] Format at the start of a line
  const lineRegex = /^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

  const parseTime = (minStr: string, secStr: string, msStr: string): number => {
    const min = parseInt(minStr);
    const sec = parseInt(secStr);
    const ms = msStr.length === 2 ? parseInt(msStr) * 10 : parseInt(msStr);
    return min * 60 + sec + ms / 1000;
  };

  lines.forEach((line) => {
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

      parts.forEach((part) => {
        const tagMatch = part.match(/<(\d{2}):(\d{2})\.(\d{2,3})>/);
        if (tagMatch) {
          currentWordTime = parseTime(tagMatch[1], tagMatch[2], tagMatch[3]);
          hasWordTimestamps = true;
        } else {
          const textPart = part.trim();
          if (textPart) {
            const textWords = textPart.split(/\s+/);
            textWords.forEach((w) => {
              if (w) {
                words.push({
                  text: w,
                  time: currentWordTime,
                });
                textClean += (textClean ? " " : "") + w;
              }
            });
          }
        }
      });

      if (hasWordTimestamps && words.length > 0) {
        // Calculate durations between consecutive words
        for (let w = 0; w < words.length; w++) {
          const nextW = words[w + 1];
          words[w].duration = nextW ? Math.max(0.15, nextW.time - words[w].time) : 0.45;
        }

        lyrics.push({
          time,
          text: textClean,
          words,
        });
      } else {
        // Fallback: standard LRC line, split into words to distribute timestamps
        const standardWords = content.split(/\s+/).filter(Boolean);
        lyrics.push({
          time,
          text: content,
          words: standardWords.map((w) => ({
            text: w,
            time: time,
          })),
        });
      }
    }
  });

  // Second pass: distribute word times for standard lines using realistic vocal cadence
  for (let i = 0; i < lyrics.length; i++) {
    const currentLine = lyrics[i];
    const nextLine = lyrics[i + 1];
    const lineDuration = nextLine ? Math.max(1.5, nextLine.time - currentLine.time) : 5.0;

    if (currentLine.words && currentLine.words.length > 0) {
      const isStandardLine = currentLine.words.every((w) => w.time === currentLine.time);
      if (isStandardLine && currentLine.words.length > 1) {
        const wordCount = currentLine.words.length;
        // Realistic natural human vocal cadence: ~0.35s to 0.5s per word
        const estimatedVocalSpan = Math.min(lineDuration * 0.85, wordCount * 0.45);
        const wordDuration = estimatedVocalSpan / wordCount;

        currentLine.words.forEach((w, wIndex) => {
          w.time = currentLine.time + wIndex * wordDuration;
          w.duration = wordDuration * 0.92;
        });
      }
    }
  }

  return lyrics;
}
