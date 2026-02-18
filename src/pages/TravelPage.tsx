import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Calendar, Share2, Instagram, Youtube, Globe, Loader2, Lock,
  Edit3, Eye, EyeOff, Check, Crown, Star, ArrowRight, ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TravelPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [titleData, setTitleData] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    init();
  }, [slug]);

  const init = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data: pageData } = await supabase
      .from("travel_pages")
      .select("*")
      .eq("slug", slug!)
      .maybeSingle();

    if (!pageData) { setNotFound(true); setLoading(false); return; }

    if (!pageData.is_public && pageData.user_id !== user?.id) {
      setNotFound(true); setLoading(false); return;
    }

    setPage(pageData);
    setEditForm(pageData);
    setIsOwner(user?.id === pageData.user_id);

    const [{ data: tripsData }, { data: titleInfo }] = await Promise.all([
      pageData.show_trips
        ? supabase.from("saved_itineraries").select("id,destination,created_at,preferences").eq("user_id", pageData.user_id).order("created_at", { ascending: false }).limit(10)
        : Promise.resolve({ data: [] }),
      supabase.from("user_titles").select("*").eq("user_id", pageData.user_id).maybeSingle(),
    ]);

    setTrips(tripsData || []);
    setTitleData(titleInfo);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("travel_pages").update({
      display_name: editForm.display_name,
      bio: editForm.bio,
      is_public: editForm.is_public,
      show_trips: editForm.show_trips,
      show_stats: editForm.show_stats,
      show_title: editForm.show_title,
      instagram_url: editForm.instagram_url,
      youtube_url: editForm.youtube_url,
    }).eq("user_id", page.user_id);

    if (error) {
      toast({ title: "Failed to save", variant: "destructive" });
    } else {
      setPage({ ...page, ...editForm });
      setEditing(false);
      toast({ title: "Page updated! ✨" });
    }
    setSaving(false);
  };

  const copyLink = () => {
    const url = `${window.location.origin}/travel/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied! 🔗", description: "Share your travel page with the world." });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <Navbar />
      <Globe className="w-12 h-12 text-muted-foreground" />
      <h2 className="font-heading text-xl" style={{ color: "hsl(158, 45%, 10%)" }}>Page not found</h2>
      <p className="text-muted-foreground text-sm text-center">This travel page doesn't exist or is private.</p>
      <Link to="/"><button className="btn-primary px-6 py-3">Go Home</button></Link>
    </div>
  );

  const stats = [
    { label: "Trips", value: trips.length },
    { label: "Title", value: titleData?.badge_emoji || "🧭" },
    { label: "Explorer", value: titleData?.dominant_persona || "All" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <Navbar />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-24 pb-20">

        {/* Cover / Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden mb-6"
          style={{ minHeight: 200, background: "linear-gradient(135deg, hsl(158, 42%, 30%), hsl(162, 45%, 20%))" }}
        >
          {page.cover_image_url && (
            <img src={page.cover_image_url} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, hsla(158, 45%, 8%, 0.85))" }} />
          <div className="relative z-10 p-6 flex flex-col justify-end" style={{ minHeight: 200 }}>
            <div className="flex items-end justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold border-2 border-white/20"
                  style={{ background: "hsla(255,255%,255%,0.15)", backdropFilter: "blur(12px)" }}>
                  {page.display_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-heading text-white">{page.display_name}</h1>
                  {page.show_title && titleData && (
                    <span className="text-sm text-white/80">{titleData.badge_emoji} {titleData.title}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isOwner && (
                  <button onClick={() => setEditing(true)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-white border border-white/30 hover:bg-white/10 transition-colors flex items-center gap-1">
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                )}
                <button onClick={copyLink}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-white border border-white/30 hover:bg-white/10 transition-colors flex items-center gap-1">
                  <Share2 className="w-3 h-3" /> Share
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        {page.bio && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="glass-panel p-5 mb-4 rounded-2xl">
            <p className="text-sm leading-relaxed" style={{ color: "hsl(158, 30%, 28%)" }}>{page.bio}</p>
          </motion.div>
        )}

        {/* Stats row */}
        {page.show_stats && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="grid grid-cols-3 gap-3 mb-4">
            {stats.map(({ label, value }) => (
              <div key={label} className="glass-panel p-4 rounded-2xl text-center">
                <p className="text-xl font-bold" style={{ color: "hsl(158, 42%, 28%)" }}>{value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Social links */}
        {(page.instagram_url || page.youtube_url) && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            className="flex gap-3 mb-6">
            {page.instagram_url && (
              <a href={page.instagram_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full glass-panel text-sm font-medium transition-all hover:shadow-md"
                style={{ color: "hsl(158, 38%, 22%)" }}>
                <Instagram className="w-4 h-4" /> Instagram
              </a>
            )}
            {page.youtube_url && (
              <a href={page.youtube_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full glass-panel text-sm font-medium transition-all hover:shadow-md"
                style={{ color: "hsl(158, 38%, 22%)" }}>
                <Youtube className="w-4 h-4" /> YouTube
              </a>
            )}
          </motion.div>
        )}

        {/* Trips list */}
        {page.show_trips && trips.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <h2 className="font-heading text-lg mb-3" style={{ color: "hsl(158, 45%, 10%)" }}>✈️ Travel Journey</h2>
            <div className="space-y-3">
              {trips.map((trip, i) => (
                <motion.div key={trip.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  className="glass-panel p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>🗺️</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm" style={{ color: "hsl(158, 45%, 10%)" }}>{trip.destination}</p>
                    {trip.preferences?.departureDate && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(trip.preferences.departureDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Privacy badge */}
        <div className={`flex items-center justify-center gap-1.5 mt-8 text-xs ${page.is_public ? "text-primary" : "text-muted-foreground"}`}>
          {page.is_public ? <Eye className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          {page.is_public ? "Public travel page" : "Private page"}
          {isOwner && <span>· <Link to="/dashboard" className="underline">Change in Dashboard</Link></span>}
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditing(false)}>
          <div className="glass-intense rounded-3xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-lg mb-4" style={{ color: "hsl(158, 45%, 10%)" }}>Edit Travel Page</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Display Name</label>
                <input value={editForm.display_name || ""} onChange={e => setEditForm({ ...editForm, display_name: e.target.value })}
                  className="glass-input w-full px-4 py-2.5 text-sm rounded-xl" placeholder="Your travel name" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Bio</label>
                <textarea value={editForm.bio || ""} onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  className="glass-input w-full px-4 py-2.5 text-sm rounded-xl resize-none" rows={3} placeholder="Tell the world about your travel style..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Instagram URL</label>
                <input value={editForm.instagram_url || ""} onChange={e => setEditForm({ ...editForm, instagram_url: e.target.value })}
                  className="glass-input w-full px-4 py-2.5 text-sm rounded-xl" placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">YouTube URL</label>
                <input value={editForm.youtube_url || ""} onChange={e => setEditForm({ ...editForm, youtube_url: e.target.value })}
                  className="glass-input w-full px-4 py-2.5 text-sm rounded-xl" placeholder="https://youtube.com/..." />
              </div>

              <div className="space-y-2">
                {[
                  { key: "is_public", label: "Make page public" },
                  { key: "show_trips", label: "Show my trips" },
                  { key: "show_stats", label: "Show stats" },
                  { key: "show_title", label: "Show traveller title" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between glass-panel px-4 py-3 rounded-xl cursor-pointer">
                    <span className="text-sm" style={{ color: "hsl(158, 38%, 18%)" }}>{label}</span>
                    <div className={`w-10 h-5 rounded-full transition-all relative ${editForm[key] ? "bg-primary" : "bg-muted"}`}
                      onClick={() => setEditForm({ ...editForm, [key]: !editForm[key] })}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editForm[key] ? "left-5" : "left-0.5"}`} />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(false)} className="btn-ghost-glass flex-1 py-3 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TravelPage;
