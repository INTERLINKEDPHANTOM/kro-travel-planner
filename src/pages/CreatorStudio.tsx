import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film, Camera, Users, Sparkles, ChevronRight,
  Upload, Zap, Crown, Play
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReelGenerator from "@/components/ReelGenerator";
import GroupTripStory from "@/components/GroupTripStory";

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
      title: "Before vs After Reel",
      tagline: "Your glow-up, shareable in seconds",
      description: "Upload your before-trip and after-trip selfie. Creates a transformation reel that GenZ loves to share.",
      badge: "Free once · Paid unlimited",
      badgeColor: "hsl(35, 80%, 55%)",
      coming: false,
    },
    {
      id: "trip-reel",
      icon: "🎬",
      title: "Instant Trip Reel",
      tagline: "Your memories, cinematic style",
      description: "Auto-generate a 30-second reel from your trip photos with transitions, text overlays & animated templates — no editing needed.",
      badge: "1 free · Unlimited on Premium",
      badgeColor: "hsl(200, 60%, 45%)",
      coming: false,
    },
    {
      id: "group-story",
      icon: "👥",
      title: "Group Trip Story",
      tagline: "One story, everyone's photos",
      description: "For group trips, combines everyone's uploaded photos into one cinematic story — members tagged, all sharing.",
      badge: "Voyager feature",
      badgeColor: "hsl(270, 60%, 55%)",
      coming: false,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <Navbar />

      {/* Reel Generator Modal */}
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

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(270, 60%, 45%), hsl(300, 55%, 35%))" }}>
              <Film className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading" style={{ color: "hsl(158, 45%, 10%)" }}>Creator Studio</h1>
          </div>
          <p className="text-muted-foreground text-sm">Turn your travel memories into shareable content. Go viral. Stay unforgettable.</p>
        </motion.div>

        {/* Feature cards */}
        <div className="space-y-4 mb-10">
          {features.map((f, i) => (
            <motion.div key={f.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`glass-panel rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg ${activeFeature === f.id ? "ring-2 ring-primary/40" : ""}`}
              onClick={() => setActiveFeature(activeFeature === f.id ? null : f.id)}
            >
              <div className="p-5 flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">{f.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-heading text-sm" style={{ color: "hsl(158, 45%, 10%)" }}>{f.title}</h3>
                  </div>
                  <p className="text-xs font-medium mb-1.5" style={{ color: f.badgeColor }}>{f.tagline}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                  <span className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded-full border text-muted-foreground"
                    style={{ borderColor: "hsla(158, 30%, 60%, 0.25)" }}>
                    {f.badge}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform ${activeFeature === f.id ? "rotate-90" : ""}`} />
              </div>

              {/* Before vs After expanded */}
              {activeFeature === "before-after" && f.id === "before-after" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="border-t px-5 pb-5 pt-4"
                  style={{ borderColor: "hsla(148, 35%, 78%, 0.30)" }}
                  onClick={e => e.stopPropagation()}
                >
                  <p className="text-xs text-muted-foreground mb-3">Upload your before & after selfie to create a transformation reel.</p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <label className="cursor-pointer">
                      <div className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-all"
                        style={{ background: "hsla(158, 20%, 96%, 0.5)" }}>
                        <Camera className="w-6 h-6 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground font-medium">Before Trip</p>
                        <p className="text-[10px] text-muted-foreground">Tap to upload</p>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <div className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-all"
                        style={{ background: "hsla(158, 20%, 96%, 0.5)" }}>
                        <Sparkles className="w-6 h-6 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground font-medium">After Trip</p>
                        <p className="text-[10px] text-muted-foreground">Tap to upload</p>
                      </div>
                    </label>
                  </div>
                  <div className="text-center text-xs text-muted-foreground py-2">
                    Select a trip below to use your uploaded photos ↓
                  </div>
                </motion.div>
              )}

              {/* Trip Reel expanded */}
              {activeFeature === "trip-reel" && f.id === "trip-reel" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="border-t px-5 pb-5 pt-4"
                  style={{ borderColor: "hsla(148, 35%, 78%, 0.30)" }}
                  onClick={e => e.stopPropagation()}
                >
                  {trips.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-muted-foreground mb-3">Plan a trip first to generate a reel</p>
                      <Link to="/plan">
                        <button className="btn-primary px-5 py-2 text-xs">Plan a Trip</button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground mb-2">Select a trip to make a reel:</p>
                      {trips.slice(0, 4).map(trip => (
                        <button
                          key={trip.id}
                          onClick={e => { e.stopPropagation(); setShowReel({ tripId: trip.id, destination: trip.destination }); }}
                          className="w-full glass-panel p-3 rounded-xl flex items-center gap-3 hover:shadow-md transition-all text-left"
                        >
                          <span className="text-lg">🗺️</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs truncate" style={{ color: "hsl(158,45%,10%)" }}>{trip.destination}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(trip.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-semibold"
                            style={{ background: "linear-gradient(135deg, hsl(270,60%,45%), hsl(300,55%,35%))", color: "white" }}>
                            <Play className="w-3 h-3" /> Make Reel
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Group Story expanded */}
              {activeFeature === "group-story" && f.id === "group-story" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="border-t px-5 pb-5 pt-4"
                  style={{ borderColor: "hsla(148, 35%, 78%, 0.30)" }}
                  onClick={e => e.stopPropagation()}
                >
                  <p className="text-xs text-muted-foreground mb-3">Combines everyone's photos from shared group trips into one cinematic story.</p>
                  <button
                    onClick={e => { e.stopPropagation(); setShowGroupStory(true); }}
                    className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" /> Open Group Story
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Your trips to make content from */}
        {trips.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="font-heading text-lg mb-3" style={{ color: "hsl(158, 45%, 10%)" }}>Create from your trips</h2>
            <div className="space-y-2">
              {trips.slice(0, 5).map((trip) => (
                <div key={trip.id} className="glass-panel p-4 rounded-2xl flex items-center gap-3">
                  <div className="text-xl">🗺️</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm truncate" style={{ color: "hsl(158, 45%, 10%)" }}>{trip.destination}</p>
                    <p className="text-xs text-muted-foreground">{new Date(trip.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setShowReel({ tripId: trip.id, destination: trip.destination })}
                      className="text-[11px] px-3 py-1.5 rounded-full glass-panel text-primary font-medium flex items-center gap-1 hover:shadow-md transition-all whitespace-nowrap">
                      🎬 Reel
                    </button>
                    <Link to={`/trip-wrapped/${trip.id}`}>
                      <button className="text-[11px] px-3 py-1.5 rounded-full glass-panel text-primary font-medium flex items-center gap-1 hover:shadow-md transition-all whitespace-nowrap">
                        ✨ Wrapped
                      </button>
                    </Link>
                    <Link to={`/trip-gallery/${trip.id}`}>
                      <button className="text-[11px] px-3 py-1.5 rounded-full glass-panel text-muted-foreground font-medium flex items-center gap-1 hover:shadow-md transition-all whitespace-nowrap">
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
