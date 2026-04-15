import { Song } from "@/types/music";

export const MOCK_SONGS: Song[] = [
  {
    id: "1",
    title: "Midnight City",
    artist: "M83",
    album: "Hurry Up, We're Dreaming",
    albumArt: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop",
    audioUrl: "/mock-audio-1.mp3",
    genre: "Electronic",
    tempo: 105,
    durationText: "4:03",
    lyrics: [
      { time: 0, text: "(Instrumental Intro)" },
      { time: 15, text: "Waiting in a car" },
      { time: 18, text: "Waiting for a ride in the dark" },
      { time: 23, text: "The night city grows" },
      { time: 27, text: "Look and see her eyes, they glow" },
      { time: 31, text: "Waiting in a car" },
      { time: 35, text: "Waiting for a ride in the dark" },
    ],
  },
  {
    id: "2",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    albumArt: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500&auto=format&fit=crop",
    audioUrl: "/mock-audio-2.mp3",
    genre: "Synthwave",
    tempo: 171,
    durationText: "3:20",
    lyrics: [
      { time: 0, text: "(Synth Intro)" },
      { time: 12, text: "Yeah..." },
      { time: 25, text: "I've been tryna call" },
      { time: 29, text: "I've been on my own for long enough" },
      { time: 33, text: "Maybe you can show me how to love, maybe" },
      { time: 38, text: "I'm going through withdrawals" },
      { time: 42, text: "You don't even have to do too much" },
      { time: 46, text: "You can turn me on with just a touch, baby" },
    ],
  },
  {
    id: "3",
    title: "Starboy",
    artist: "The Weeknd ft. Daft Punk",
    album: "Starboy",
    albumArt: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=500&auto=format&fit=crop",
    audioUrl: "/mock-audio-3.mp3",
    genre: "R&B",
    tempo: 186,
    durationText: "3:50",
    lyrics: [
      { time: 0, text: "(Intro)" },
      { time: 10, text: "I'm tryna put you in the worst mood, ah" },
      { time: 14, text: "P1 cleaner than your church shoes, ah" },
      { time: 17, text: "Milli point two just to hurt you, ah" },
      { time: 21, text: "All red Lamb' just to tease you, ah" },
    ],
  },
  {
    id: "4",
    title: "Lose Yourself to Dance",
    artist: "Daft Punk",
    album: "Random Access Memories",
    albumArt: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=500&auto=format&fit=crop",
    audioUrl: "/mock-audio-4.mp3",
    genre: "Electronic",
    tempo: 100,
    durationText: "5:53",
    lyrics: [
      { time: 0, text: "(Beat Start)" },
      { time: 30, text: "Lose yourself to dance" },
      { time: 35, text: "Lose yourself to dance" },
      { time: 40, text: "Lose yourself to dance" },
      { time: 45, text: "Lose yourself to dance" },
    ],
  }
];

export const MOCK_MIXES = [
  {
    id: "mix1",
    title: "Synthwave Essentials",
    description: "Deep, driving synthwave tracks to keep you moving.",
    coverArt: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "mix2",
    title: "Late Night Drive",
    description: "Atmospheric electronic and R&B for the midnight hours.",
    coverArt: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f4a7?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "mix3",
    title: "Electronic Discovery",
    description: "The best new electronic tracks handpicked for you.",
    coverArt: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "mix4",
    title: "Workout Energy",
    description: "High BPM tracks to get your heart pumping.",
    coverArt: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=500&auto=format&fit=crop",
  }
];
