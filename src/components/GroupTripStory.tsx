import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Image as ImageIcon, Film, Crown, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface GroupMember {
  trip_id: string;
  destination: string;
  owner_email?: string;
  photos: { src: string; caption: string }[];
}

interface GroupTripStoryProps {
  userId: string;
  onClose: () => void;
}

const SLIDE_BG = [
  "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
  "linear-gradient(135deg, #2d1b69, #11998e, #38ef7d)",
  "linear-gradient(135deg, #f7971e, #ffd200)",
  "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
];

const GroupTripStory = ({ userId, onClose }: GroupTripStoryProps) => {
  const [sharedTrips, setSharedTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [groupPhotos, setGroupPhotos] = useState<{ src: string; caption: string; member: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [storyStep, setStoryStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => { loadSharedTrips(); }, []);

  const loadSharedTrips = async () => {
    // Load trips where this user is either owner or shared-with
    const { data: owned } = await supabase
      .from("shared_trips")
      .select("*, saved_itineraries!trip_id(destination, id)")
      .eq("owner_id", userId);

    const { data: joined } = await supabase
      .from("shared_trips")
      .select("*, saved_itineraries!trip_id(destination, id)")
      .eq("shared_with_id", userId);

    const all = [...(owned || []), ...(joined || [])];
    setSharedTrips(all);
    setLoading(false);
  };

  const loadGroupPhotos = async (tripId: string) => {
    const { data } = await supabase
      .from("trip_photos")
      .select("storage_path, place_name, user_id")
      .eq("trip_id", tripId)
      .limit(20);

    const photos = (data || []).map(p => ({
      src: supabase.storage.from("trip-photos").getPublicUrl(p.storage_path).data.publicUrl,
      caption: p.place_name || "Memory",
      member: p.user_id.slice(0, 6),
    }));
    setGroupPhotos(photos);
    setPlaying(true);
  };

  const handleSelectTrip = (trip: any) => {
    setSelectedTrip(trip);
    loadGroupPhotos(trip.trip_id);
    setStoryStep(0);
  };

  // Auto advance story
  useEffect(() => {
    if (!playing || groupPhotos.length === 0) return;
    if (storyStep >= groupPhotos.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStoryStep(p => p + 1), 3000);
    return () => clearTimeout(t);
  }, [playing, storyStep, groupPhotos.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-lg"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "hsl(var(--background))", maxHeight: "88vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(270,60%,45%), hsl(300,55%,35%))" }}>
              <Users className="w-4 h-4 text-white" />
            </div>
            <p className="font-heading text-sm" style={{ color: "hsl(158,45%,10%)" }}>Group Trip Story</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!selectedTrip ? (
          <div className="p-5">
            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-8">Loading group trips…</p>
            ) : sharedTrips.length === 0 ? (
              <div className="text-center py-10 space-y-4">
                <div className="text-4xl">👥</div>
                <p className="font-heading text-sm" style={{ color: "hsl(158,45%,10%)" }}>No group trips yet</p>
                <p className="text-xs text-muted-foreground">Share a trip with friends from your Trip Gallery to start a group story.</p>
                <Link to="/my-trips" onClick={onClose}>
                  <button className="btn-primary px-6 py-2.5 text-sm">Go to My Trips</button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground mb-3">Select a shared trip to generate a story</p>
                {sharedTrips.map((trip, i) => (
                  <button key={i} onClick={() => handleSelectTrip(trip)}
                    className="w-full glass-panel p-4 rounded-2xl flex items-center gap-3 text-left hover:shadow-md transition-all">
                    <div className="text-xl">🗺️</div>
                    <div className="flex-1">
                      <p className="font-heading text-sm" style={{ color: "hsl(158,45%,10%)" }}>
                        {trip.saved_itineraries?.destination || "Shared Trip"}
                      </p>
                      <p className="text-xs text-muted-foreground">Group story</p>
                    </div>
                    <Film className="w-4 h-4 text-primary" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : groupPhotos.length === 0 ? (
          <div className="p-8 text-center space-y-4">
            <div className="text-4xl">📷</div>
            <p className="font-heading text-sm" style={{ color: "hsl(158,45%,10%)" }}>No photos yet</p>
            <p className="text-xs text-muted-foreground">Members haven't uploaded photos to this trip gallery yet.</p>
            <button onClick={() => { setSelectedTrip(null); setGroupPhotos([]); }} className="btn-ghost-glass px-6 py-2.5 text-sm">← Back</button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Story viewer — 9:16 */}
            <div className="relative mx-auto rounded-2xl overflow-hidden"
              style={{ width: "100%", aspectRatio: "9/16", maxHeight: "52vh", background: "#000" }}>
              <AnimatePresence mode="wait">
                <motion.div key={storyStep}
                  initial={{ opacity: 0, scale: 1.12 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <img src={groupPhotos[storyStep].src} alt=""
                    className="w-full h-full object-cover" />
                  <div className="absolute inset-0"
                    style={{ background: SLIDE_BG[storyStep % SLIDE_BG.length], opacity: 0.45 }} />
                  {/* Top progress */}
                  <div className="absolute top-3 left-3 right-3 flex gap-1">
                    {groupPhotos.map((_, i) => (
                      <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden bg-white/30">
                        <motion.div className="h-full bg-white"
                          initial={{ width: i < storyStep ? "100%" : "0%" }}
                          animate={{ width: i < storyStep ? "100%" : i === storyStep ? "100%" : "0%" }}
                          transition={i === storyStep ? { duration: 3, ease: "linear" } : { duration: 0 }} />
                      </div>
                    ))}
                  </div>
                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-8"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)" }}>
                    <p className="text-white font-semibold text-sm">{groupPhotos[storyStep].caption}</p>
                    <p className="text-white/50 text-[10px] mt-0.5">Member #{groupPhotos[storyStep].member}</p>
                  </div>
                  <div className="absolute bottom-2 right-3 text-[8px] text-white/40 font-bold tracking-widest">KroTravel</div>
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Controls */}
            <div className="flex gap-2">
              <button onClick={() => { setSelectedTrip(null); setGroupPhotos([]); setPlaying(false); setStoryStep(0); }}
                className="flex-1 btn-ghost-glass py-2.5 text-sm">← Back</button>
              <button onClick={() => { setStoryStep(0); setPlaying(true); }}
                className="flex-1 btn-primary py-2.5 text-sm">▶ Replay</button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default GroupTripStory;
