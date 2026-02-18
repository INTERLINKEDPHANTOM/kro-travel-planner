import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Calendar, Wallet, Eye, Trash2, RotateCcw, Bell, Loader2,
  LogOut, Settings, Star, Crown, Camera, Image, Compass, ArrowRight,
  TrendingUp, Clock, Shield, Zap, Users, ChevronRight, Download,
  Globe, Film, MessageCircle, Heart, Sparkles, ExternalLink, Check, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ── Gamification title engine ──────────────────────────────────────────────
const TITLES: { label: string; emoji: string; minTrips: number; persona?: string }[] = [
  { label: "First Step Traveller", emoji: "👣", minTrips: 0 },
  { label: "Weekend Wanderer",     emoji: "🌤️",  minTrips: 1 },
  { label: "Road Scout",           emoji: "🛤️",  minTrips: 2 },
  { label: "Trail Blazer",         emoji: "🔥",  minTrips: 3 },
  { label: "Mountain Seeker",      emoji: "🏔️",  minTrips: 5 },
  { label: "Culture Collector",    emoji: "🎭",  minTrips: 7 },
  { label: "Budget Ninja",         emoji: "🥷",  minTrips: 10, persona: "budget" },
  { label: "Luxury Connoisseur",   emoji: "💎",  minTrips: 10, persona: "luxury" },
  { label: "Spiritual Pilgrim",    emoji: "🙏",  minTrips: 10, persona: "spiritual" },
  { label: "Backpacker Legend",    emoji: "🎒",  minTrips: 10, persona: "backpacker" },
  { label: "KroTravel Pro",        emoji: "🌍",  minTrips: 15 },
  { label: "Nomad Elite",          emoji: "👑",  minTrips: 25 },
];

function computeTitle(tripCount: number, persona?: string) {
  let best = TITLES[0];
  for (const t of TITLES) {
    if (tripCount >= t.minTrips) {
      if (!t.persona || t.persona === persona) best = t;
    }
  }
  return best;
}

// ── Stat mini card ─────────────────────────────────────────────────────────
const MiniStat = ({ icon: Icon, value, label }: { icon: any; value: string | number; label: string }) => (
  <div className="glass-panel p-4 flex flex-col items-center text-center gap-1">
    <Icon className="w-5 h-5 text-primary mb-1" />
    <p className="text-xl font-bold" style={{ color: "hsl(158, 45%, 10%)" }}>{value}</p>
    <p className="text-[11px] text-muted-foreground">{label}</p>
  </div>
);

// ── Main Dashboard ─────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [titleInfo, setTitleInfo] = useState(TITLES[0]);
  const [travelPageSlug, setTravelPageSlug] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth?redirect=/dashboard"); return; }
    setUser(user);

    const [{ data: prof }, { data: tripsData }, { data: sub }, { data: roleData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("saved_itineraries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("user_subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
    ]);
    setIsAdmin(roleData?.role === "admin");

    setProfile(prof);
    setTrips(tripsData || []);
    setSubscription(sub);

    // compute persona from trips
    const personaMap: Record<string, number> = {};
    (tripsData || []).forEach((t: any) => {
      const p = t.preferences?.travelPersona;
      if (p) personaMap[p] = (personaMap[p] || 0) + 1;
    });
    const dominant = Object.entries(personaMap).sort((a, b) => b[1] - a[1])[0]?.[0];
    setTitleInfo(computeTitle((tripsData || []).length, dominant));

    // upsert user title
    const titlePayload = {
      user_id: user.id,
      title: computeTitle((tripsData || []).length, dominant).label,
      badge_emoji: computeTitle((tripsData || []).length, dominant).emoji,
      trips_count: (tripsData || []).length,
      dominant_persona: dominant || null,
      updated_at: new Date().toISOString(),
    };
    await supabase.from("user_titles").upsert(titlePayload, { onConflict: "user_id" });

    // auto-create travel page if not exists
    const slug = `${(prof?.full_name || user.email?.split("@")[0] || "traveller").toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20)}-${user.id.slice(0, 6)}`;
    await supabase.from("travel_pages").upsert({
      user_id: user.id,
      slug,
      display_name: prof?.full_name || user.email?.split("@")[0] || "Traveller",
      is_public: true,
    }, { onConflict: "user_id" });

    // store slug for quick link
    const { data: travelPage } = await supabase.from("travel_pages").select("slug").eq("user_id", user.id).maybeSingle();
    if (travelPage?.slug) {
      sessionStorage.setItem("travelPageSlug", travelPage.slug);
      setTravelPageSlug(travelPage.slug);
    }

    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({ title: "Signed out" });
  };

  const viewTrip = (trip: any) => {
    sessionStorage.setItem("tripPreferences", JSON.stringify(trip.preferences));
    sessionStorage.setItem("savedItinerary", JSON.stringify(trip.itinerary_data));
    sessionStorage.setItem("savedItineraryId", trip.id);
    navigate("/paid-itinerary");
  };

  const deleteTrip = async (id: string) => {
    await supabase.from("saved_itineraries").delete().eq("id", id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "Trip removed" });
  };

  const regenerateTrip = (trip: any) => {
    if (trip.regenerate_count >= 3) {
      toast({ title: "Limit reached", description: "You can regenerate up to 3 times.", variant: "destructive" }); return;
    }
    sessionStorage.setItem("tripPreferences", JSON.stringify(trip.preferences));
    sessionStorage.setItem("regenerateTrip", trip.id);
    navigate("/paid-itinerary");
  };

  const photoCount = trips.reduce((acc) => acc, 0); // placeholder
  const storagePct = subscription ? Math.round((subscription.storage_used_mb / subscription.storage_limit_mb) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Traveller";
  const plan = subscription?.plan || "free";

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-orb-1" style={{ top: "5%", right: "10%", opacity: 0.5 }} />
        <div className="ambient-orb-2" style={{ bottom: "15%", left: "5%", opacity: 0.4 }} />
      </div>

      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* ── Hero identity card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="prism-card p-6 sm:p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-heading select-none"
                style={{ background: "linear-gradient(135deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))", boxShadow: "0 8px 32px hsla(158, 42%, 36%, 0.35)" }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              {plan !== "free" && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "hsl(45, 90%, 55%)" }}>
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-heading" style={{ color: "hsl(158, 45%, 10%)" }}>
                  {displayName}
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "hsla(158, 42%, 38%, 0.12)", color: "hsl(158, 42%, 32%)" }}>
                  {titleInfo.emoji} {titleInfo.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{user?.email}</p>
              <div className="flex flex-wrap gap-2">
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                  plan === "nomad" ? "bg-yellow-100 text-yellow-700" :
                  plan === "voyager" ? "bg-primary/10 text-primary" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {plan === "nomad" ? "👑 Nomad" : plan === "voyager" ? "✈️ Voyager" : "🗺️ Explorer"}
                </span>
                {subscription?.is_super_premium && (
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                    style={{ background: "hsla(270,70%,55%,0.12)", color: "hsl(270,60%,45%)" }}>
                    ⚡ Super Premium
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link to="/my-trips">
                <button className="btn-ghost-glass px-4 py-2 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> My Trips
                </button>
              </Link>
              <button onClick={signOut} className="w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Stats row ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          <MiniStat icon={MapPin} value={trips.length} label="Trips Planned" />
          <MiniStat icon={Camera} value={subscription?.albums_remaining ?? 1} label="Albums Left" />
          <MiniStat icon={Star} value={subscription?.reels_remaining ?? 1} label="Reels Left" />
          <MiniStat icon={Wallet} value={`${storagePct}%`} label="Storage Used" />
        </motion.div>

        {/* ── Storage bar ── */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-panel p-4 sm:p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-medium" style={{ color: "hsl(158, 45%, 12%)" }}>Trip Cloud Storage</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {subscription.storage_used_mb.toFixed(0)} MB / {subscription.storage_limit_mb} MB
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(storagePct, 100)}%`, background: "linear-gradient(90deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))" }} />
            </div>
            {storagePct > 80 && (
              <p className="text-xs text-destructive mt-1.5">Storage almost full — upgrade to Nomad plan for 40 GB.</p>
            )}
          </motion.div>
        )}

        {/* ── Gamification next title ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="glass-panel p-4 sm:p-5 mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <p className="font-heading text-sm" style={{ color: "hsl(158, 45%, 12%)" }}>Your Traveller Journey</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{titleInfo.emoji}</div>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: "hsl(158, 38%, 18%)" }}>{titleInfo.label}</p>
              {/* find next title */}
              {(() => {
                const nextIdx = TITLES.findIndex(t => t.minTrips > trips.length);
                const next = nextIdx >= 0 ? TITLES[nextIdx] : null;
                const needed = next ? next.minTrips - trips.length : 0;
                return next ? (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {needed} more trip{needed !== 1 ? "s" : ""} to unlock <strong>{next.emoji} {next.label}</strong>
                  </p>
                ) : (
                  <p className="text-[11px] text-primary font-medium mt-0.5">🎉 You've reached the highest title!</p>
                );
              })()}
            </div>
            <div className="flex gap-1">
              {TITLES.slice(0, 6).map((t, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${trips.length >= t.minTrips ? "bg-primary" : "bg-border"}`} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Quick actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`grid gap-3 mb-6 ${isAdmin ? "grid-cols-4 sm:grid-cols-7" : "grid-cols-3 sm:grid-cols-6"}`}
        >
          {[
            { icon: Compass, label: "Plan Trip", link: "/plan", primary: true },
            { icon: MapPin, label: "My Trips", link: "/my-trips" },
            { icon: Film, label: "Studio", link: "/creator-studio" },
            { icon: Globe, label: "Travel Map", link: "/travel-map" },
            { icon: Image, label: "Gallery", link: trips[0] ? `/trip-gallery/${trips[0].id}` : "/my-trips" },
            { icon: Star, label: "Offers", link: "/offers" },
            ...(isAdmin ? [{ icon: Shield, label: "Admin Panel", link: "/admin", primary: false, admin: true }] : []),
          ].map(({ icon: Icon, label, link, primary, ...rest }) => (
            <Link key={label} to={link}>
              <button className={`w-full py-3.5 rounded-xl text-sm font-medium flex flex-col items-center gap-2 transition-all ${"admin" in rest && rest.admin ? "glass-panel hover:shadow-md border border-destructive/30" : primary ? "btn-primary" : "glass-panel hover:shadow-md"}`}
                style={"admin" in rest && rest.admin ? { color: "hsl(0,65%,50%)" } : !primary ? { color: "hsl(158, 38%, 22%)" } : {}}>
                <Icon className="w-4 h-4" />
                <span className="text-[11px]">{label}</span>
              </button>
            </Link>
          ))}
        </motion.div>

        {/* ── Travel Page CTA ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className="prism-card p-4 sm:p-5 mb-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(200, 65%, 38%), hsl(220, 60%, 28%))" }}>
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-heading text-sm mb-0.5" style={{ color: "hsl(158, 45%, 10%)" }}>Your Personal Travel Page</p>
            <p className="text-xs text-muted-foreground">One shareable link — your entire journey, public or private.</p>
          </div>
          <Link to={travelPageSlug ? `/travel/${travelPageSlug}` : "/dashboard"}>
            <button className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl glass-panel"
              style={{ color: "hsl(200, 65%, 38%)" }}>
              View <ExternalLink className="w-3 h-3" />
            </button>
          </Link>
        </motion.div>

        {/* ── Anniversary reminders ── */}
        {trips.some(t => t.preferences?.departureDate) && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
            className="glass-panel p-4 sm:p-5 mb-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4" style={{ color: "hsl(0, 70%, 55%)" }} />
              <p className="font-heading text-sm" style={{ color: "hsl(158, 45%, 12%)" }}>Travel Anniversaries</p>
            </div>
            <div className="space-y-2">
              {trips.filter(t => t.preferences?.departureDate).slice(0, 3).map((trip) => {
                const dep = new Date(trip.preferences.departureDate);
                const today = new Date();
                const thisYear = new Date(today.getFullYear(), dep.getMonth(), dep.getDate());
                const daysUntil = Math.ceil((thisYear.getTime() - today.getTime()) / 86400000);
                const isUpcoming = daysUntil >= 0 && daysUntil <= 30;
                return (
                  <div key={trip.id} className="flex items-center gap-3">
                    <div className="text-lg">{isUpcoming ? "🎉" : "💝"}</div>
                    <div className="flex-1">
                      <p className="text-xs font-medium" style={{ color: "hsl(158, 38%, 18%)" }}>{trip.destination}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {dep.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} anniversary
                        {isUpcoming && <span className="font-medium" style={{ color: "hsl(0, 65%, 50%)" }}> · {daysUntil === 0 ? "Today! 🎊" : `in ${daysUntil} days`}</span>}
                      </p>
                    </div>
                    <Link to={`/trip-wrapped/${trip.id}`}>
                      <span className="text-[10px] px-2.5 py-1 rounded-full glass-panel text-primary font-medium">Wrapped</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Recent trips ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg" style={{ color: "hsl(158, 45%, 10%)" }}>Recent Trips</h2>
            <Link to="/my-trips" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {trips.length === 0 ? (
            <div className="glass-panel p-10 text-center">
              <Compass className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-heading text-base mb-1" style={{ color: "hsl(158, 45%, 12%)" }}>No trips yet</p>
              <p className="text-muted-foreground text-sm mb-5">Plan your first adventure!</p>
              <Link to="/plan">
                <button className="btn-primary px-6 py-3 flex items-center gap-2 mx-auto">
                  Plan My Trip <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.slice(0, 5).map((trip, i) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.28 + i * 0.04 }}
                  className="glass-panel p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>
                    🗺️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm mb-0.5" style={{ color: "hsl(158, 45%, 10%)" }}>
                      {trip.destination}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {trip.preferences?.departureDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(trip.preferences.departureDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                      {trip.preferences?.numPeople && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {trip.preferences.numPeople} people
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => viewTrip(trip)}
                      className="w-8 h-8 rounded-lg glass-panel flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" title="View">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => navigate(`/trip-gallery/${trip.id}`)}
                      className="w-8 h-8 rounded-lg glass-panel flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" title="Gallery">
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => regenerateTrip(trip)}
                      className="w-8 h-8 rounded-lg glass-panel flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" title="Regenerate">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteTrip(trip.id)}
                      className="w-8 h-8 rounded-lg glass-panel flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Plan upgrade CTA ── */}
        {plan === "free" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="prism-card p-6 mt-6 flex flex-col sm:flex-row items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))" }}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-heading text-base mb-1" style={{ color: "hsl(158, 45%, 10%)" }}>Unlock Voyager Plan</p>
              <p className="text-muted-foreground text-sm">Hour-by-hour plans, hotel picks, exact budget & PDF download.</p>
            </div>
            <Link to="/plans">
              <button className="btn-primary px-6 py-3 flex items-center gap-2 flex-shrink-0">
                Upgrade <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
