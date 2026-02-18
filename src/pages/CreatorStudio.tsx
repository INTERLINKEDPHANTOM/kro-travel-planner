import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film, Camera, Users, Sparkles, ChevronRight,
  Zap, Play, PenLine, Save, Loader2, CheckCircle2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReelGenerator from "@/components/ReelGenerator";
import GroupTripStory from "@/components/GroupTripStory";

// ── Before vs After: Trip-wise text journal ─────────────────────────────────
const BeforeAfterJournal = ({ trips, userId }: { trips: any[]; userId: string }) => {
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || "");
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  useEffect(() => {
    if (!selectedTripId) return;
    loadJournal(selectedTripId);
  }, [selectedTripId]);

  const loadJournal = async (tripId: string) => {
    setLoading(true);
    setSaved(false);
    const { data } = await supabase
      .from("trip_photos")
      .select("caption, place_name")
      .eq("trip_id", tripId)
      .eq("place_name", "__before_after_journal__")
      .maybeSingle();
    if (data?.caption) {
      try {
        const parsed = JSON.parse(data.caption);
        setBefore(parsed.before || "");
        setAfter(parsed.after || "");
      } catch {
        setBefore("");
        setAfter("");
      }
    } else {
      setBefore("");
      setAfter("");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedTripId || !userId) return;
    setSaving(true);
    const content = JSON.stringify({ before, after });
    // Check if entry exists
    const { data: existing } = await supabase
      .from("trip_photos")
      .select("id")
      .eq("trip_id", selectedTripId)
      .eq("place_name", "__before_after_journal__")
      .maybeSingle();

    if (existing) {
      await supabase.from("trip_photos").update({ caption: content })
        .eq("id", existing.id);
    } else {
      await supabase.from("trip_photos").insert({
        user_id: userId,
        trip_id: selectedTripId,
        storage_path: `journal/${userId}/${selectedTripId}`,
        place_name: "__before_after_journal__",
        caption: content,
      });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (trips.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-muted-foreground mb-3">Plan a trip first to start your journal</p>
        <Link to="/plan">
          <button className="btn-primary px-5 py-2 text-xs">Plan a Trip</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4" onClick={e => e.stopPropagation()}>
      {/* Trip selector */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Select Trip</p>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {trips.map(t => (
            <button key={t.id} onClick={() => setSelectedTripId(t.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedTripId === t.id ? "bg-primary text-white" : "glass-panel text-muted-foreground"}`}>
              {t.destination}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="text-base">😐</span> Before the trip — who were you?
              </label>
              <textarea
                value={before}
                onChange={e => setBefore(e.target.value)}
                placeholder="What was your mindset before this trip? What were you struggling with, hoping for, or curious about?..."
                rows={4}
                className="w-full text-xs rounded-xl px-3.5 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed"
                style={{
                  background: "hsla(148, 35%, 97%, 0.7)",
                  border: "1px solid hsla(148, 35%, 80%, 0.45)",
                  color: "hsl(158, 38%, 18%)",
                }}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="text-base">✨</span> After the trip — what changed?
              </label>
              <textarea
                value={after}
                onChange={e => setAfter(e.target.value)}
                placeholder="How did this trip change you? New perspectives, memories, people you met, lessons learned?..."
                rows={4}
                className="w-full text-xs rounded-xl px-3.5 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed"
                style={{
                  background: "hsla(148, 35%, 97%, 0.7)",
                  border: "1px solid hsla(148, 35%, 80%, 0.45)",
                  color: "hsl(158, 38%, 18%)",
                }}
              />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving || (!before && !after)}
            className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-40">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
              : <><Save className="w-4 h-4" /> Save My Story for {selectedTrip?.destination || "Trip"}</>}
          </button>

          <p className="text-[10px] text-center text-muted-foreground">
            Your journal is private — only visible to you
          </p>
        </>
      )}
    </div>
  );
};

// ── Main ───────────────────────────────────────────────────────────────────
const CreatorStudio = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [showReel, setShowReel] = useState<{ tripId: string; destination: string } | null>(null);
  const [showGroupStory, setShowGroupStory] = useState(false);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { navigate("/auth?redirect=/creator-studio"); return; }
    setUser(u);
    const { data } = await supabase
      .from("saved_itineraries")
      .select("id,destination,created_at")
      .eq("user_id", u.id)
      .order("created_at", { ascending: false });
    setTrips(data || []);
    setLoading(false);
  };

  const features = [
    {
      id: "before-after",
      icon: "🔄",
      title: "Before vs After Journal",
      tagline: "Capture how this trip changed you",
      description: "Write a personal reflection — who you were before and who you became after the trip. Private, trip-wise, and meaningful.",
      badge: "Free · All trips",
      badgeColor: "hsl(35, 80%, 45%)",
    },
    {
      id: "trip-reel",
      icon: "🎬",
      title: "Instant Trip Reel",
      tagline: "Your memories, cinematic style",
      description: "Upload exactly 10 photos and generate a high-quality 30-second video reel with Ken Burns effects, auto-mixed transitions, and visual overlays.",
      badge: "1 free · Unlimited on Premium",
      badgeColor: "hsl(200, 60%, 38%)",
    },
    {
      id: "group-story",
      icon: "👥",
      title: "Group Trip Story",
      tagline: "One story, everyone's photos",
      description: "For group trips, combines everyone's uploaded photos into one cinematic story — members tagged, all sharing.",
      badge: "Voyager feature",
      badgeColor: "hsl(270, 60%, 45%)",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <Navbar />

      {/* Reel Generator Modal — rendered in a portal at root level to avoid scroll offset bugs */}
      <AnimatePresence>
        {showReel && (
          <ReelGenerator
            tripId={showReel.tripId}
            destination={showReel.destination}
            onClose={() => setShowReel(null)}
          />
        )}
        {showGroupStory && user && (
          <GroupTripStory userId={user.id} onClose={() => setShowGroupStory(false)} />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-20 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(270, 60%, 45%), hsl(300, 55%, 35%))" }}>
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading" style={{ color: "hsl(158, 45%, 10%)" }}>Creator Studio</h1>
              <p className="text-muted-foreground text-xs">Turn your travel memories into shareable content.</p>
            </div>
          </div>
        </motion.div>

        {/* Feature cards */}
        <div className="space-y-3 mb-10">
          {features.map((f, i) => (
            <motion.div key={f.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl overflow-hidden transition-all ${activeFeature === f.id ? "shadow-lg ring-2 ring-primary/30" : "shadow-sm"}`}
              style={{
                background: "hsla(148, 40%, 98%, 0.70)",
                border: "1px solid hsla(148, 35%, 82%, 0.45)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Card header — always visible */}
              <button
                className="w-full p-4 flex items-start gap-4 text-left"
                onClick={() => setActiveFeature(activeFeature === f.id ? null : f.id)}
              >
                <div className="text-3xl flex-shrink-0 leading-none mt-0.5">{f.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-sm leading-tight mb-0.5" style={{ color: "hsl(158, 45%, 10%)" }}>{f.title}</h3>
                  <p className="text-xs font-medium mb-1" style={{ color: f.badgeColor }}>{f.tagline}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{f.description}</p>
                  <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full border text-muted-foreground"
                    style={{ borderColor: "hsla(158, 30%, 65%, 0.30)" }}>
                    {f.badge}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 mt-1 ${activeFeature === f.id ? "rotate-90" : ""}`} />
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {activeFeature === f.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-5 pt-1 border-t"
                      style={{ borderColor: "hsla(148, 35%, 78%, 0.30)" }}>

                      {/* ─ Before vs After Journal ─ */}
                      {f.id === "before-after" && user && (
                        <div className="pt-3">
                          <BeforeAfterJournal trips={trips} userId={user.id} />
                        </div>
                      )}

                      {/* ─ Trip Reel ─ */}
                      {f.id === "trip-reel" && (
                        <div className="pt-3">
                          {trips.length === 0 ? (
                            <div className="text-center py-4">
                              <p className="text-xs text-muted-foreground mb-3">Plan a trip first to generate a reel</p>
                              <Link to="/plan">
                                <button className="btn-primary px-5 py-2 text-xs">Plan a Trip</button>
                              </Link>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground mb-3 p-3 rounded-xl"
                                style={{ background: "hsla(270,60%,45%,0.07)", border: "1px solid hsla(270,60%,45%,0.15)" }}>
                                🎬 Upload <strong>exactly 10 photos</strong> and we'll generate a high-quality 30s video with auto transitions, Ken Burns effects, and visual overlays.
                              </p>
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Select a trip:</p>
                              {trips.slice(0, 5).map(trip => (
                                <button
                                  key={trip.id}
                                  onClick={e => { e.stopPropagation(); setShowReel({ tripId: trip.id, destination: trip.destination }); }}
                                  className="w-full glass-panel p-3 rounded-xl flex items-center gap-3 hover:shadow-md transition-all text-left"
                                >
                                  <span className="text-lg">🗺️</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-xs truncate" style={{ color: "hsl(158,45%,10%)" }}>{trip.destination}</p>
                                    <p className="text-[10px] text-muted-foreground">{new Date(trip.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-semibold"
                                    style={{ background: "linear-gradient(135deg, hsl(270,60%,45%), hsl(300,55%,35%))", color: "white" }}>
                                    <Play className="w-3 h-3" /> Generate
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ─ Group Story ─ */}
                      {f.id === "group-story" && (
                        <div className="pt-3">
                          <p className="text-xs text-muted-foreground mb-3">Combines everyone's photos from shared group trips into one cinematic story.</p>
                          <button
                            onClick={e => { e.stopPropagation(); setShowGroupStory(true); }}
                            className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
                            <Users className="w-4 h-4" /> Open Group Story
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Create from your trips */}
        {trips.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="font-heading text-base mb-3" style={{ color: "hsl(158, 45%, 10%)" }}>Quick Actions</h2>
            <div className="space-y-2">
              {trips.slice(0, 5).map((trip) => (
                <div key={trip.id} className="glass-panel p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="text-xl flex-shrink-0">🗺️</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-xs truncate" style={{ color: "hsl(158, 45%, 10%)" }}>{trip.destination}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(trip.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setShowReel({ tripId: trip.id, destination: trip.destination })}
                      className="text-[10px] px-2.5 py-1.5 rounded-full glass-panel text-primary font-semibold flex items-center gap-1 hover:shadow-md transition-all whitespace-nowrap">
                      🎬 Reel
                    </button>
                    <Link to={`/trip-wrapped/${trip.id}`}>
                      <button className="text-[10px] px-2.5 py-1.5 rounded-full glass-panel text-primary font-semibold flex items-center gap-1 hover:shadow-md transition-all whitespace-nowrap">
                        ✨ Wrapped
                      </button>
                    </Link>
                    <Link to={`/trip-gallery/${trip.id}`}>
                      <button className="text-[10px] px-2.5 py-1.5 rounded-full glass-panel text-muted-foreground font-semibold flex items-center gap-1 hover:shadow-md transition-all whitespace-nowrap">
                        📸 Gallery
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CreatorStudio;
