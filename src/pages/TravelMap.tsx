import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Globe, Loader2, Lock, ArrowRight, Download, Crown, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type TripPin = {
  id: string;
  destination: string;
  created_at: string;
  preferences: any;
  status: string;
};

// Indian cities rough lat/lng for map pinning (normalized 0-100 for SVG)
const CITY_COORDS: Record<string, { x: number; y: number }> = {
  // North India
  "delhi": { x: 38, y: 22 }, "new delhi": { x: 38, y: 22 },
  "shimla": { x: 37, y: 17 }, "manali": { x: 37, y: 14 },
  "amritsar": { x: 34, y: 18 }, "chandigarh": { x: 37, y: 20 },
  "jammu": { x: 34, y: 15 }, "srinagar": { x: 33, y: 11 },
  "leh": { x: 38, y: 10 }, "ladakh": { x: 40, y: 10 },
  // West India
  "mumbai": { x: 28, y: 55 }, "pune": { x: 30, y: 57 },
  "goa": { x: 27, y: 65 }, "ahmedabad": { x: 27, y: 42 },
  "jaipur": { x: 34, y: 30 }, "udaipur": { x: 32, y: 36 },
  "jodhpur": { x: 29, y: 30 }, "jaisalmer": { x: 25, y: 29 },
  "mount abu": { x: 28, y: 37 },
  // South India
  "bangalore": { x: 35, y: 72 }, "bengaluru": { x: 35, y: 72 },
  "mysore": { x: 34, y: 74 }, "mysuru": { x: 34, y: 74 },
  "chennai": { x: 42, y: 70 }, "hyderabad": { x: 38, y: 63 },
  "kerala": { x: 33, y: 80 }, "kochi": { x: 32, y: 80 },
  "munnar": { x: 32, y: 78 }, "ooty": { x: 34, y: 76 },
  "coorg": { x: 33, y: 74 },
  // East India
  "kolkata": { x: 56, y: 47 }, "darjeeling": { x: 58, y: 38 },
  "bhubaneswar": { x: 54, y: 56 }, "puri": { x: 55, y: 58 },
  // Central India
  "bhopal": { x: 38, y: 44 }, "indore": { x: 35, y: 44 },
  "nagpur": { x: 41, y: 50 }, "varanasi": { x: 47, y: 36 },
  "lucknow": { x: 44, y: 30 }, "agra": { x: 40, y: 28 },
  // North East
  "assam": { x: 64, y: 35 }, "guwahati": { x: 64, y: 34 },
  "shillong": { x: 66, y: 37 }, "gangtok": { x: 60, y: 38 },
  // Andaman
  "andaman": { x: 68, y: 72 }, "port blair": { x: 68, y: 72 },
};

const getCoords = (destination: string): { x: number; y: number } | null => {
  const lower = destination.toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(key)) return coords;
  }
  return null;
};

const PIN_COLORS = [
  "hsl(158,42%,38%)", "hsl(258,70%,50%)", "hsl(38,90%,50%)",
  "hsl(340,75%,50%)", "hsl(200,80%,45%)", "hsl(120,60%,40%)",
];

const TravelMap = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [trips, setTrips] = useState<TripPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<TripPin | null>(null);
  const [view, setView] = useState<"map" | "timeline">("map");
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { navigate("/auth?redirect=/travel-map"); return; }
    setUser(u);

    const [{ data: tripsData }, { data: sub }] = await Promise.all([
      supabase.from("saved_itineraries").select("id,destination,created_at,preferences,status")
        .eq("user_id", u.id).order("created_at", { ascending: true }),
      supabase.from("user_subscriptions").select("*").eq("user_id", u.id).maybeSingle(),
    ]);

    setTrips((tripsData || []) as TripPin[]);
    setSubscription(sub);
    setLoading(false);
  };

  const isPremium = subscription?.plan === "voyager" || subscription?.is_super_premium;

  // Limit to 3 pins for free users
  const visibleTrips = isPremium ? trips : trips.slice(0, 3);
  const lockedCount = trips.length - visibleTrips.length;

  const pinsWithCoords = visibleTrips
    .map((t, i) => ({ trip: t, coords: getCoords(t.destination), color: PIN_COLORS[i % PIN_COLORS.length] }))
    .filter(p => p.coords !== null);

  // Group trips by year for timeline
  const byYear: Record<string, TripPin[]> = {};
  trips.forEach(t => {
    const yr = new Date(t.created_at).getFullYear().toString();
    if (!byYear[yr]) byYear[yr] = [];
    byYear[yr].push(t);
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <Navbar />
      <div className="relative z-0 pointer-events-none fixed inset-0">
        <div className="ambient-orb-1" style={{ top: "10%", left: "8%", opacity: 0.35 }} />
        <div className="ambient-orb-2" style={{ bottom: "20%", right: "8%", opacity: 0.30 }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-20">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "hsla(158,42%,38%,0.12)" }}>
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl" style={{ color: "hsl(158,45%,10%)" }}>
                Travel Timeline / Life Map
              </h1>
              <p className="text-sm text-muted-foreground">Your journey, pinned forever on the map</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Trips Planned", value: trips.length, emoji: "✈️" },
              { label: "Cities Visited", value: pinsWithCoords.length, emoji: "📍" },
              { label: "Years Explored", value: Object.keys(byYear).length, emoji: "🗓️" },
            ].map(s => (
              <div key={s.label} className="glass-panel p-3 text-center">
                <p className="text-lg">{s.emoji}</p>
                <p className="font-heading text-xl font-bold text-primary">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          {(["map", "timeline"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize"
              style={{
                background: view === v ? "linear-gradient(135deg, hsl(158,42%,40%), hsl(162,45%,28%))" : "hsla(158,42%,38%,0.10)",
                color: view === v ? "white" : "hsl(158,42%,32%)",
              }}>
              {v === "map" ? "🗺️ India Map" : "📅 Timeline"}
            </button>
          ))}
        </div>

        {/* MAP VIEW */}
        {view === "map" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {trips.length === 0 ? (
              <div className="glass-panel p-12 text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="font-heading text-lg mb-2" style={{ color: "hsl(158,45%,12%)" }}>No trips yet</h3>
                <p className="text-sm text-muted-foreground mb-5">Plan your first trip to see it pinned on the map!</p>
                <Link to="/plan">
                  <button className="btn-primary px-6 py-3">Plan a Trip <ArrowRight className="w-4 h-4 inline ml-1" /></button>
                </Link>
              </div>
            ) : (
              <div className="glass-panel p-4 sm:p-6">
                {/* SVG India Map with pins */}
                <div className="relative rounded-2xl overflow-hidden" style={{ background: "hsla(158,35%,96%,0.8)", border: "1px solid hsla(148,35%,78%,0.30)" }}>
                  <svg viewBox="0 0 100 100" className="w-full" style={{ maxHeight: "480px" }}>
                    {/* India outline (simplified paths) */}
                    <path d="M30,10 L45,8 L55,10 L65,12 L72,18 L75,25 L73,32 L68,38 L65,45 L67,52 L65,60 L62,68 L58,74 L54,80 L50,85 L45,88 L40,85 L37,80 L34,72 L30,65 L26,58 L22,50 L20,42 L22,35 L25,28 L28,20 Z"
                      fill="hsla(158,30%,88%,0.6)" stroke="hsla(158,42%,45%,0.35)" strokeWidth="0.5" />
                    {/* State borders hint */}
                    <path d="M38,22 L44,28 M38,22 L30,30 M44,28 L50,35 M30,30 L35,40 M50,35 L55,45 M35,40 L40,50 M55,45 L58,55 M40,50 L45,60 M58,55 L55,65"
                      stroke="hsla(158,42%,60%,0.25)" strokeWidth="0.3" fill="none" />

                    {/* Trip Pins */}
                    {pinsWithCoords.map(({ trip, coords, color }, i) => (
                      <g key={trip.id} style={{ cursor: "pointer" }}
                        onClick={() => setSelectedTrip(selectedTrip?.id === trip.id ? null : trip)}>
                        <circle cx={coords!.x} cy={coords!.y} r="2.5" fill={color} opacity="0.9">
                          <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                        </circle>
                        <circle cx={coords!.x} cy={coords!.y} r="4" fill={color} opacity="0.2">
                          <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                        </circle>
                        {/* Label */}
                        <text x={coords!.x + 3.5} y={coords!.y - 1} fontSize="2.5" fill={color} fontWeight="bold">
                          {trip.destination.split(",")[0].split(" ").slice(0, 1).join(" ")}
                        </text>
                      </g>
                    ))}

                    {/* Locked pins */}
                    {lockedCount > 0 && (
                      <g>
                        <text x="50" y="95" textAnchor="middle" fontSize="3" fill="hsl(0,0%,55%)">
                          +{lockedCount} more · Upgrade to unlock
                        </text>
                      </g>
                    )}
                  </svg>

                  {/* Legend */}
                  <div className="px-4 pb-3 flex flex-wrap gap-2">
                    {pinsWithCoords.slice(0, 6).map(({ trip, color }) => (
                      <div key={trip.id} className="flex items-center gap-1.5 text-[11px]"
                        style={{ color: "hsl(158,38%,25%)" }}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                        <span>{trip.destination.split(",")[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Trip Card */}
                <AnimatePresence>
                  {selectedTrip && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-4 p-4 rounded-2xl flex items-center justify-between gap-3"
                      style={{ background: "hsla(158,42%,38%,0.08)", border: "1px solid hsla(158,42%,50%,0.20)" }}
                    >
                      <div>
                        <p className="font-heading text-sm" style={{ color: "hsl(158,45%,12%)" }}>
                          📍 {selectedTrip.destination}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(selectedTrip.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/trip-wrapped/${selectedTrip.id}`}>
                          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background: "hsla(158,42%,38%,0.12)", color: "hsl(158,42%,30%)" }}>
                            Trip Wrapped
                          </button>
                        </Link>
                        <button onClick={() => setSelectedTrip(null)}
                          className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground"
                          style={{ background: "hsla(0,0%,50%,0.10)" }}>
                          Close
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Upgrade CTA */}
                {!isPremium && lockedCount > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-4 p-4 rounded-2xl text-center"
                    style={{ background: "linear-gradient(135deg, hsla(258,70%,50%,0.10), hsla(280,65%,38%,0.08))", border: "1px solid hsla(258,70%,50%,0.20)" }}>
                    <Crown className="w-5 h-5 mx-auto mb-2" style={{ color: "hsl(258,70%,50%)" }} />
                    <p className="font-heading text-sm mb-1" style={{ color: "hsl(258,45%,18%)" }}>
                      Unlock all {trips.length} trip pins
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upgrade to Voyager to show your full travel history + export as PDF poster
                    </p>
                    <Link to="/plans">
                      <button className="px-5 py-2 rounded-xl text-xs font-bold text-white"
                        style={{ background: "linear-gradient(135deg, hsl(258,70%,50%), hsl(280,65%,38%))" }}>
                        Upgrade to Voyager <Sparkles className="w-3 h-3 inline ml-1" />
                      </button>
                    </Link>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* TIMELINE VIEW */}
        {view === "timeline" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {trips.length === 0 ? (
              <div className="glass-panel p-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                <p className="text-muted-foreground text-sm">No trips in your timeline yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(byYear).sort(([a], [b]) => Number(b) - Number(a)).map(([year, yearTrips]) => (
                  <motion.div key={year} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-heading font-bold text-sm"
                        style={{ background: "linear-gradient(135deg, hsl(158,42%,40%), hsl(162,45%,28%))", color: "white" }}>
                        {year}
                      </div>
                      <div className="flex-1 h-px" style={{ background: "hsla(148,35%,75%,0.40)" }} />
                      <span className="text-xs text-muted-foreground">{yearTrips.length} trip{yearTrips.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="ml-6 pl-6 border-l-2 space-y-3"
                      style={{ borderColor: "hsla(158,42%,50%,0.25)" }}>
                      {yearTrips.map((trip, i) => (
                        <motion.div key={trip.id}
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.06 }}
                          className="relative glass-panel p-4 hover-lift">
                          <div className="absolute -left-9 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2"
                            style={{
                              background: PIN_COLORS[i % PIN_COLORS.length],
                              borderColor: "hsl(var(--background))",
                            }} />
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="font-heading text-sm flex items-center gap-1.5" style={{ color: "hsl(158,45%,12%)" }}>
                                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                {trip.destination}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(trip.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                              </p>
                            </div>
                            <Link to={`/trip-wrapped/${trip.id}`}>
                              <button className="text-[11px] px-2.5 py-1.5 rounded-lg font-semibold flex-shrink-0"
                                style={{ background: "hsla(158,42%,38%,0.10)", color: "hsl(158,42%,30%)" }}>
                                Wrapped
                              </button>
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TravelMap;
