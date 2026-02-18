import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, ExternalLink, ChevronDown, Headphones, Play } from "lucide-react";

interface Props {
  destination: string;
  travelPersona?: string;
  travelType?: string;
  numDays?: number;
}

type Playlist = {
  mood: string;
  title: string;
  description: string;
  emoji: string;
  spotifyQuery: string;
  tracks: string[];
  color: string;
};

function generatePlaylists(destination: string, persona: string, travelType: string): Playlist[] {
  const dest = destination || "India";
  const isLuxury = persona === "luxury";
  const isSolo = travelType?.toLowerCase().includes("solo");
  const isCorporate = travelType?.toLowerCase().includes("corporate");
  const isSpiritural = persona === "spiritual" || travelType?.toLowerCase().includes("spiritual");
  const isAdventure = persona === "adventure" || travelType?.toLowerCase().includes("adventure");

  const lists: Playlist[] = [
    {
      mood: "Road Trip Vibes",
      emoji: "🚗",
      title: `${dest} Drive Mix`,
      description: `High-energy tracks perfect for the journey to ${dest}. Feel the road, feel alive.`,
      spotifyQuery: `road trip india ${dest} hindi songs`,
      tracks: ["Tum Se Hi – Jab We Met", "Hawayein – Jab Harry Met Sejal", "Ik Vaari Aa – Raanjhanaa", "Phir Le Aaya Dil – Barfi!", "Musafir – Atif Aslam"],
      color: "hsla(158,42%,38%,0.12)",
    },
    {
      mood: isSpiritural ? "Spiritual Calm" : isLuxury ? "Luxury Lounge" : isAdventure ? "Adventure Beats" : "Chill & Explore",
      emoji: isSpiritural ? "🙏" : isLuxury ? "🥂" : isAdventure ? "⚡" : "🌿",
      title: isSpiritural ? "Inner Peace Mix" : isLuxury ? "Luxury Travel Lounge" : isAdventure ? "High Energy Adventure" : `${dest} Exploration`,
      description: isSpiritural
        ? "Mantras and meditative sounds for your spiritual journey."
        : isLuxury
        ? "Jazz, chillout, and ambient sounds for the refined traveller."
        : isAdventure
        ? "Bass-heavy beats and workout energy for your adventure."
        : `Laid-back indie and folk tracks to explore ${dest} by.`,
      spotifyQuery: isSpiritural
        ? "meditation mantras spiritual india"
        : isLuxury
        ? "luxury travel lounge jazz ambient"
        : isAdventure
        ? "adventure travel energy workout hindi"
        : `indie folk chill travel ${dest}`,
      tracks: isSpiritural
        ? ["Om Namah Shivaya – Shankar Mahadevan", "Gayatri Mantra", "Vande Mataram – A.R. Rahman", "Raghupati Raghava Raja Ram", "Bolo Ram Ram Ram – Hansraj Raghuwanshi"]
        : isLuxury
        ? ["Bheege Hont Tere – Murder", "Tum Hi Ho – Aashiqui 2", "Channa Mereya – ADHM", "Ae Dil Hai Mushkil", "Bol Do Na Zara – Azhar"]
        : isAdventure
        ? ["Zinda – Bhaag Milkha Bhaag", "Sultan Theme", "Dangal Title Track", "Lakshya – Lakshya", "Warrior – Hans Zimmer"]
        : ["Sadda Haq – Rockstar", "Ilahi – YJHD", "Kabira – YJHD", "Tu Jaane Na – Ajab Prem", "Dil Dhadakne Do"],
      color: "hsla(220,60%,50%,0.10)",
    },
    {
      mood: isCorporate ? "Focus & Productivity" : isSolo ? "Solo Wanderer" : "Group Celebrations",
      emoji: isCorporate ? "💼" : isSolo ? "🎒" : "🎉",
      title: isCorporate ? "Work Travel Focus" : isSolo ? "Solo Trip Anthem" : "Group Trip Bangers",
      description: isCorporate
        ? "Lo-fi and ambient tracks to stay productive on business trips."
        : isSolo
        ? "Songs that feel like a best friend when you travel alone."
        : "Party anthems and celebration songs for the whole squad.",
      spotifyQuery: isCorporate
        ? "lofi study focus productivity"
        : isSolo
        ? "solo travel songs empowerment hindi"
        : "bollywood party group friends anthems",
      tracks: isCorporate
        ? ["Lofi Hip Hop Radio", "Coffee Shop Ambience", "Deep Focus – Spotify", "Brain Food – Spotify", "Peaceful Piano – Spotify"]
        : isSolo
        ? ["Main Agar – Tubelight", "Dil Dhadakne Do – Title", "Jeena Jeena – Badlapur", "Tere Bina – Guru", "Maahi Ve – Kal Ho Na Ho"]
        : ["Gallan Goodiyaan – Dil Dhadakne Do", "Birthday Bash", "London Thumakda – Queen", "Afghan Jalebi – Phantom", "Badtameez Dil – YJHD"],
      color: "hsla(38,80%,50%,0.10)",
    },
  ];

  return lists;
}

const SpotifyPlaylistSuggestion = ({ destination, travelPersona = "explorer", travelType = "leisure", numDays = 3 }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const playlists = generatePlaylists(destination, travelPersona, travelType);
  const active = playlists[activeIdx];

  const openSpotify = (query: string) => {
    window.open(`https://open.spotify.com/search/${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mb-10 sm:mb-12">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 rounded-2xl transition-all hover-lift"
        style={{
          background: isOpen ? "linear-gradient(135deg, hsl(258,70%,50%), hsl(280,65%,38%))" : "hsla(258,70%,50%,0.10)",
          border: "1px solid hsla(258,70%,50%,0.20)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: isOpen ? "hsla(0,0%,100%,0.15)" : "hsla(258,70%,50%,0.15)" }}>
            <Music className="w-4 h-4" style={{ color: isOpen ? "white" : "hsl(258,70%,45%)" }} />
          </div>
          <div className="text-left">
            <p className="font-heading text-sm font-semibold" style={{ color: isOpen ? "white" : "hsl(258,45%,18%)" }}>
              🎵 Trip Playlist Suggestions
            </p>
            <p className="text-[11px]" style={{ color: isOpen ? "hsla(0,0%,100%,0.75)" : "hsl(0,0%,50%)" }}>
              Curated for {destination} · {travelPersona} vibe · {numDays}D trip
            </p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 transition-transform flex-shrink-0"
          style={{
            color: isOpen ? "white" : "hsl(258,70%,45%)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
          }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="glass-panel rounded-t-none rounded-b-2xl border-t-0 p-4 sm:p-5"
              style={{ borderColor: "hsla(258,70%,50%,0.20)" }}>

              {/* Mood tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {playlists.map((pl, i) => (
                  <button key={i} onClick={() => setActiveIdx(i)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background: activeIdx === i ? "linear-gradient(135deg, hsl(258,70%,50%), hsl(280,65%,38%))" : "hsla(258,70%,50%,0.10)",
                      color: activeIdx === i ? "white" : "hsl(258,45%,38%)",
                    }}>
                    <span>{pl.emoji}</span>
                    <span>{pl.mood}</span>
                  </button>
                ))}
              </div>

              {/* Active playlist */}
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="rounded-2xl p-4 mb-4"
                  style={{ background: active.color, border: "1px solid hsla(258,70%,50%,0.15)" }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{active.emoji}</span>
                        <h3 className="font-heading text-sm font-bold" style={{ color: "hsl(258,45%,18%)" }}>
                          {active.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{active.description}</p>
                    </div>
                    <button
                      onClick={() => openSpotify(active.spotifyQuery)}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                      style={{ background: "#1DB954" }}
                    >
                      <Play className="w-3 h-3 fill-white" />
                      Spotify
                    </button>
                  </div>

                  {/* Track list */}
                  <div className="space-y-1.5">
                    {active.tracks.map((track, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                        style={{ background: "hsla(0,0%,100%,0.55)" }}
                      >
                        <span className="text-[10px] w-4 text-muted-foreground font-mono">{i + 1}</span>
                        <Headphones className="w-3 h-3 flex-shrink-0" style={{ color: "hsl(258,70%,50%)" }} />
                        <span className="text-xs flex-1" style={{ color: "hsl(258,30%,25%)" }}>{track}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">
                    ✨ Curated for your {travelPersona} travel style
                  </p>
                  <button onClick={() => openSpotify(`travel ${destination} bollywood`)}
                    className="flex items-center gap-1 text-[11px] font-semibold"
                    style={{ color: "#1DB954" }}>
                    Open Spotify <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpotifyPlaylistSuggestion;
