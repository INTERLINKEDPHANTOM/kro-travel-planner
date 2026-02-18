import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Film, Camera, Users, Sparkles, ArrowLeft, ChevronRight, Lock,
  Upload, Image as ImageIcon, Zap, ArrowRight, Crown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CreatorStudio = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { navigate("/auth?redirect=/creator-studio"); return; }
    setUser(u);
    const { data } = await supabase.from("saved_itineraries").select("id,destination,created_at").eq("user_id", u.id).order("created_at", { ascending: false });
    setTrips(data || []);
    setLoading(false);
  };

  const handleFileSelect = (type: "before" | "after", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "before") { setBeforeFile(file); setBeforePreview(url); }
    else { setAfterFile(file); setAfterPreview(url); }
  };

  const features = [
    {
      id: "before-after",
      icon: "🔄",
      title: "Before vs After Reel",
      tagline: "Your glow-up, shareable in seconds",
      description: "Upload your before-trip and after-trip selfie. AI creates a transformation reel that GenZ loves to share.",
      badge: "Free once · Paid unlimited",
      badgeColor: "hsl(35, 80%, 55%)",
      coming: false,
    },
    {
      id: "group-story",
      icon: "👥",
      title: "Group Trip Story",
      tagline: "One story, everyone tagged",
      description: "For group trips, the app combines everyone's photos into one cinematic story. All members tagged. All friends sharing.",
      badge: "Paid feature",
      badgeColor: "hsl(270, 60%, 55%)",
      coming: true,
    },
    {
      id: "trip-reel",
      icon: "🎬",
      title: "Instant Trip Reel",
      tagline: "Your memories, cinematic style",
      description: "Auto-generate a short video from your trip photos with music, transitions, and text overlays — no editing needed.",
      badge: "1 free · Unlimited on Premium",
      badgeColor: "hsl(200, 60%, 45%)",
      coming: true,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <Navbar />

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
                    {f.coming && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-white"
                        style={{ background: "hsla(270, 60%, 50%, 0.8)" }}>Coming Soon</span>
                    )}
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
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Before */}
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect("before", e)} />
                      <div className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${beforePreview ? "border-transparent" : "border-border hover:border-primary/50"}`}
                        style={{ background: beforePreview ? "none" : "hsla(158, 20%, 96%, 0.5)" }}>
                        {beforePreview
                          ? <img src={beforePreview} alt="before" className="w-full h-full object-cover rounded-2xl" />
                          : <>
                            <Camera className="w-6 h-6 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground font-medium">Before Trip</p>
                            <p className="text-[10px] text-muted-foreground">Tap to upload</p>
                          </>}
                      </div>
                    </label>

                    {/* After */}
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect("after", e)} />
                      <div className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${afterPreview ? "border-transparent" : "border-border hover:border-primary/50"}`}
                        style={{ background: afterPreview ? "none" : "hsla(158, 20%, 96%, 0.5)" }}>
                        {afterPreview
                          ? <img src={afterPreview} alt="after" className="w-full h-full object-cover rounded-2xl" />
                          : <>
                            <Sparkles className="w-6 h-6 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground font-medium">After Trip</p>
                            <p className="text-[10px] text-muted-foreground">Tap to upload</p>
                          </>}
                      </div>
                    </label>
                  </div>

                  {beforePreview && afterPreview ? (
                    <button className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" /> Create Transformation Reel
                    </button>
                  ) : (
                    <div className="text-center text-xs text-muted-foreground py-2">Upload both photos to create your reel</div>
                  )}
                </motion.div>
              )}

              {/* Coming soon expanded */}
              {activeFeature === f.id && f.coming && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="border-t px-5 pb-5 pt-4 text-center"
                  style={{ borderColor: "hsla(148, 35%, 78%, 0.30)" }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="text-4xl mb-3">🚀</div>
                  <p className="font-heading text-sm mb-1" style={{ color: "hsl(158, 45%, 12%)" }}>This feature is coming soon</p>
                  <p className="text-xs text-muted-foreground mb-4">We're building it! Upgrade to Premium to get early access when it launches.</p>
                  <Link to="/offers">
                    <button className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 mx-auto">
                      <Crown className="w-4 h-4" /> View Premium Plans
                    </button>
                  </Link>
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
              {trips.slice(0, 5).map((trip, i) => (
                <div key={trip.id} className="glass-panel p-4 rounded-2xl flex items-center gap-3">
                  <div className="text-xl">🗺️</div>
                  <div className="flex-1">
                    <p className="font-heading text-sm" style={{ color: "hsl(158, 45%, 10%)" }}>{trip.destination}</p>
                    <p className="text-xs text-muted-foreground">{new Date(trip.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/trip-wrapped/${trip.id}`}>
                      <button className="text-[11px] px-3 py-1.5 rounded-full glass-panel text-primary font-medium flex items-center gap-1 hover:shadow-md transition-all">
                        🎬 Wrapped
                      </button>
                    </Link>
                    <Link to={`/trip-gallery/${trip.id}`}>
                      <button className="text-[11px] px-3 py-1.5 rounded-full glass-panel text-muted-foreground font-medium flex items-center gap-1 hover:shadow-md transition-all">
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
