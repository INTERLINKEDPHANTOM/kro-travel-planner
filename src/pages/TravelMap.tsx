import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Globe, Loader2, ArrowRight, Crown, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons broken by vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type TripPin = {
  id: string;
  destination: string;
  created_at: string;
  preferences: any;
  status: string;
  lat?: number;
  lng?: number;
};

// Real lat/lng coordinates for Indian cities & destinations
const CITY_LATLONG: Record<string, [number, number]> = {
  "delhi": [28.6139, 77.2090], "new delhi": [28.6139, 77.2090],
  "shimla": [31.1048, 77.1734], "manali": [32.2432, 77.1892],
  "amritsar": [31.6340, 74.8723], "chandigarh": [30.7333, 76.7794],
  "jammu": [32.7266, 74.8570], "srinagar": [34.0837, 74.7973],
  "leh": [34.1526, 77.5771], "ladakh": [34.1526, 77.5771],
  "spiti": [32.2461, 78.0339], "spiti valley": [32.2461, 78.0339],
  "mumbai": [19.0760, 72.8777], "pune": [18.5204, 73.8567],
  "goa": [15.2993, 74.1240], "ahmedabad": [23.0225, 72.5714],
  "jaipur": [26.9124, 75.7873], "udaipur": [24.5854, 73.7125],
  "jodhpur": [26.2389, 73.0243], "jaisalmer": [26.9157, 70.9083],
  "mount abu": [24.5926, 72.7156], "pushkar": [26.4899, 74.5514],
  "ajmer": [26.4499, 74.6399], "bikaner": [28.0229, 73.3119],
  "bangalore": [12.9716, 77.5946], "bengaluru": [12.9716, 77.5946],
  "mysore": [12.2958, 76.6394], "mysuru": [12.2958, 76.6394],
  "chennai": [13.0827, 80.2707], "hyderabad": [17.3850, 78.4867],
  "kerala": [10.8505, 76.2711], "kochi": [9.9312, 76.2673],
  "munnar": [10.0889, 77.0595], "ooty": [11.4102, 76.6950],
  "coorg": [12.3375, 75.8069], "wayanad": [11.6854, 76.1320],
  "alleppey": [9.4981, 76.3388], "kovalam": [8.4004, 76.9787],
  "trivandrum": [8.5241, 76.9366], "thiruvananthapuram": [8.5241, 76.9366],
  "kolkata": [22.5726, 88.3639], "darjeeling": [27.0360, 88.2627],
  "bhubaneswar": [20.2961, 85.8245], "puri": [19.8135, 85.8312],
  "bhopal": [23.2599, 77.4126], "indore": [22.7196, 75.8577],
  "nagpur": [21.1458, 79.0882], "varanasi": [25.3176, 82.9739],
  "lucknow": [26.8467, 80.9462], "agra": [27.1767, 78.0081],
  "mathura": [27.4924, 77.6737], "haridwar": [29.9457, 78.1642],
  "rishikesh": [30.0869, 78.2676], "dehradun": [30.3165, 78.0322],
  "nainital": [29.3919, 79.4542], "mussoorie": [30.4598, 78.0664],
  "assam": [26.2006, 92.9376], "guwahati": [26.1445, 91.7362],
  "shillong": [25.5788, 91.8933], "gangtok": [27.3314, 88.6138],
  "kaziranga": [26.6638, 93.3699], "meghalaya": [25.4670, 91.3662],
  "andaman": [11.7401, 92.6586], "port blair": [11.6234, 92.7265],
  "lakshadweep": [10.5667, 72.6417],
  "agartala": [23.8315, 91.2868], "aizawl": [23.7307, 92.7173],
  "imphal": [24.8170, 93.9368], "kohima": [25.6751, 94.1086],
  "pattaya": [12.9236, 100.8824], "bangkok": [13.7563, 100.5018],
  "singapore": [1.3521, 103.8198], "dubai": [25.2048, 55.2708],
  "maldives": [3.2028, 73.2207], "bali": [-8.3405, 115.0920],
  "paris": [48.8566, 2.3522], "london": [51.5074, -0.1278],
  "new york": [40.7128, -74.0060], "tokyo": [35.6762, 139.6503],
  "kathmandu": [27.7172, 85.3240], "colombo": [6.9271, 79.8612],
  "dhaka": [23.8103, 90.4125],
};

const getLatLng = (destination: string): [number, number] | null => {
  const lower = destination.toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITY_LATLONG)) {
    if (lower.includes(key) || key.includes(lower.split(",")[0].trim())) return coords;
  }
  return null;
};

const PIN_COLORS_HEX = ["#00e5a0", "#7c6fff", "#fbbf24", "#f87171", "#38bdf8", "#34d399"];

// Custom glowing pin icon for dark map
const createColoredIcon = (color: string, index: number) => {
  const svg = `
    <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow${index}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path d="M18 0C10.3 0 4 6.3 4 14c0 10.5 14 30 14 30s14-19.5 14-30c0-7.7-6.3-14-14-14z"
        fill="${color}" filter="url(#glow${index})" opacity="0.95"/>
      <circle cx="18" cy="14" r="7" fill="#0a0f1e" opacity="0.85"/>
      <circle cx="18" cy="14" r="4" fill="${color}" opacity="0.9"/>
      <text x="18" y="18" text-anchor="middle" font-size="7" font-weight="bold" fill="#0a0f1e">${index + 1}</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
};

// ── Animated marker drop helper ──────────────────────────────────────────────
const dropMarkerAnimated = (
  map: L.Map,
  trip: TripPin,
  index: number,
  color: string,
  onClickCb: (t: TripPin) => void,
  delay: number
): Promise<L.Marker> =>
  new Promise(resolve => {
    setTimeout(() => {
      const icon = createColoredIcon(color, index);
      const date = new Date(trip.created_at).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
      const marker = L.marker([trip.lat!, trip.lng!], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:system-ui;padding:6px 4px;min-width:170px;background:#0d1b2a;border-radius:10px">
            <div style="font-weight:700;font-size:14px;color:${color};margin-bottom:4px">📍 ${trip.destination}</div>
            <div style="font-size:11px;color:#8ab4c9;margin-bottom:6px">${date}</div>
            <div style="font-size:11px;font-weight:600;color:#0a0f1e;background:${color};padding:3px 8px;border-radius:6px;display:inline-block">Trip #${index + 1}</div>
          </div>
        `, { maxWidth: 210 });
      marker.on("click", () => onClickCb(trip));
      resolve(marker);
    }, delay);
  });

// ─────────────────────────────────────────────────────────────────────────────
const LeafletMap = ({
  trips,
  onSelectTrip,
  newTripId,
}: {
  trips: TripPin[];
  onSelectTrip: (trip: TripPin) => void;
  newTripId?: string | null;
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);

  const rebuildMap = useCallback(async (map: L.Map, validTrips: TripPin[]) => {
    // Clear old markers and lines
    markersRef.current.forEach(m => m.remove());
    polylinesRef.current.forEach(p => p.remove());
    markersRef.current = [];
    polylinesRef.current = [];

    if (validTrips.length === 0) return;

    const latlngs: [number, number][] = [];

    // Drop markers one by one with staggered animation
    const markerPromises = validTrips.map((trip, i) => {
      const color = PIN_COLORS_HEX[i % PIN_COLORS_HEX.length];
      latlngs.push([trip.lat!, trip.lng!]);
      return dropMarkerAnimated(map, trip, i, color, onSelectTrip, i * 250);
    });

    const markers = await Promise.all(markerPromises);
    markersRef.current = markers;

    // Draw animated polyline connecting all trips
    if (latlngs.length > 1) {
      const line = L.polyline([], {
        color: "#00e5a0",
        weight: 2,
        opacity: 0.7,
        dashArray: "6, 6",
        smoothFactor: 2,
      }).addTo(map);
      polylinesRef.current.push(line);

      // Animate the line drawing
      latlngs.forEach((ll, i) => {
        setTimeout(() => {
          const current = line.getLatLngs() as L.LatLng[];
          line.setLatLngs([...current, ll]);
        }, i * 250 + 100);
      });
    }

    // Fit bounds after all pins placed
    setTimeout(() => {
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10 });
    }, validTrips.length * 250 + 300);
  }, [onSelectTrip]);

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // 🌑 Dark tile layer — CartoDB Dark Matter
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Rebuild when trips change (including real-time additions)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const validTrips = trips.filter(t => t.lat && t.lng);
    rebuildMap(map, validTrips);
  }, [trips, rebuildMap]);

  return (
    <div
      ref={mapRef}
      style={{
        height: "500px",
        width: "100%",
        borderRadius: "16px",
        zIndex: 1,
        background: "#0a0f1e",
      }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const TravelMap = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<TripPin | null>(null);
  const [view, setView] = useState<"map" | "timeline">("map");
  const [subscription, setSubscription] = useState<any>(null);
  const [newTripId, setNewTripId] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  const enrichWithCoords = (raw: any[]): TripPin[] =>
    raw.map((t: any) => {
      const coords = getLatLng(t.destination);
      return { ...t, lat: coords?.[0], lng: coords?.[1] };
    });

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { navigate("/auth?redirect=/travel-map"); return; }
    userIdRef.current = u.id;

    const [{ data: tripsData }, { data: sub }] = await Promise.all([
      supabase
        .from("saved_itineraries")
        .select("id,destination,created_at,preferences,status")
        .eq("user_id", u.id)
        .order("created_at", { ascending: true }),
      supabase.from("user_subscriptions").select("*").eq("user_id", u.id).maybeSingle(),
    ]);

    setTrips(enrichWithCoords(tripsData || []));
    setSubscription(sub);
    setLoading(false);

    // 🔴 Realtime: auto-pin new trips as they are planned
    const channel = supabase
      .channel(`travel-map-${u.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "saved_itineraries",
          filter: `user_id=eq.${u.id}`,
        },
        (payload) => {
          const newTrip = payload.new as any;
          const coords = getLatLng(newTrip.destination);
          const enriched: TripPin = {
            ...newTrip,
            lat: coords?.[0],
            lng: coords?.[1],
          };
          setNewTripId(enriched.id);
          setTrips(prev => {
            if (prev.find(t => t.id === enriched.id)) return prev;
            return [...prev, enriched];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const isPremium = subscription?.plan === "voyager" || subscription?.is_super_premium;
  const visibleTrips = isPremium ? trips : trips.slice(0, 3);
  const lockedCount = trips.length - visibleTrips.length;
  const mappedTrips = visibleTrips.filter(t => t.lat && t.lng);

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
                Travel Life Map
              </h1>
              <p className="text-sm text-muted-foreground">Every place you've visited, pinned forever</p>
            </div>

            {/* Live badge */}
            <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: "hsla(158,80%,38%,0.12)", color: "hsl(158,80%,32%)", border: "1px solid hsla(158,80%,38%,0.30)" }}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Trips Planned", value: trips.length, emoji: "✈️" },
              { label: "Places on Map", value: mappedTrips.length, emoji: "📍" },
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
        <div className="flex gap-2 mb-5">
          {(["map", "timeline"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: view === v ? "linear-gradient(135deg, hsl(158,42%,40%), hsl(162,45%,28%))" : "hsla(158,42%,38%,0.10)",
                color: view === v ? "white" : "hsl(158,42%,32%)",
              }}>
              {v === "map" ? "🗺️ Live Map" : "📅 Timeline"}
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
              <div className="space-y-4">
                {/* Dark Leaflet Map */}
                <div className="rounded-2xl overflow-hidden shadow-2xl"
                  style={{ border: "1px solid hsla(148,35%,60%,0.20)", background: "#0a0f1e" }}>
                  <LeafletMap trips={mappedTrips} onSelectTrip={setSelectedTrip} newTripId={newTripId} />
                </div>

                {/* Legend */}
                {mappedTrips.length > 0 && (
                  <div className="glass-panel p-3 flex flex-wrap gap-2 items-center">
                    <span className="text-[11px] text-muted-foreground font-medium mr-1">Pins:</span>
                    {mappedTrips.map((trip, i) => (
                      <button key={trip.id}
                        onClick={() => setSelectedTrip(selectedTrip?.id === trip.id ? null : trip)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
                        style={{
                          background: selectedTrip?.id === trip.id ? PIN_COLORS_HEX[i % PIN_COLORS_HEX.length] + "22" : "hsla(0,0%,50%,0.08)",
                          border: `1px solid ${PIN_COLORS_HEX[i % PIN_COLORS_HEX.length]}55`,
                          color: PIN_COLORS_HEX[i % PIN_COLORS_HEX.length],
                        }}>
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{ background: PIN_COLORS_HEX[i % PIN_COLORS_HEX.length], color: "#0a0f1e" }}>
                          {i + 1}
                        </span>
                        {trip.destination.split(",")[0]}
                      </button>
                    ))}
                    {trips.filter(t => !t.lat).length > 0 && (
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {trips.filter(t => !t.lat).length} destination{trips.filter(t => !t.lat).length > 1 ? "s" : ""} not yet on map
                      </span>
                    )}
                  </div>
                )}

                {/* Selected Trip Card */}
                <AnimatePresence>
                  {selectedTrip && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="p-4 rounded-2xl flex items-center justify-between gap-3"
                      style={{ background: "hsla(158,42%,38%,0.08)", border: "1px solid hsla(158,42%,50%,0.20)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                          style={{ background: "hsla(158,42%,38%,0.12)" }}>📍</div>
                        <div>
                          <p className="font-heading text-sm font-semibold" style={{ color: "hsl(158,45%,12%)" }}>
                            {selectedTrip.destination}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(selectedTrip.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            {selectedTrip.lat && (
                              <span className="ml-2 opacity-60">
                                {selectedTrip.lat.toFixed(2)}°N, {selectedTrip.lng?.toFixed(2)}°E
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Link to={`/trip-wrapped/${selectedTrip.id}`}>
                          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background: "hsla(158,42%,38%,0.12)", color: "hsl(158,42%,30%)" }}>
                            Trip Wrapped
                          </button>
                        </Link>
                        <button onClick={() => setSelectedTrip(null)}
                          className="w-7 h-7 rounded-full glass-panel flex items-center justify-center text-muted-foreground">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Upgrade CTA */}
                {!isPremium && lockedCount > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-4 rounded-2xl text-center"
                    style={{ background: "linear-gradient(135deg, hsla(258,70%,50%,0.10), hsla(280,65%,38%,0.08))", border: "1px solid hsla(258,70%,50%,0.20)" }}>
                    <Crown className="w-5 h-5 mx-auto mb-2" style={{ color: "hsl(258,70%,50%)" }} />
                    <p className="font-heading text-sm mb-1" style={{ color: "hsl(258,45%,18%)" }}>
                      Unlock {lockedCount} more trip{lockedCount > 1 ? "s" : ""} on the map
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upgrade to Voyager for your full travel history
                    </p>
                    <Link to="/plans">
                      <button className="px-5 py-2 rounded-xl text-xs font-bold text-white"
                        style={{ background: "linear-gradient(135deg, hsl(258,70%,50%), hsl(280,65%,38%))" }}>
                        Upgrade <Sparkles className="w-3 h-3 inline ml-1" />
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
                      <div className="w-14 h-10 rounded-xl flex items-center justify-center font-heading font-bold text-sm"
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
                              background: PIN_COLORS_HEX[i % PIN_COLORS_HEX.length],
                              borderColor: "hsl(var(--background))",
                            }} />
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="font-heading text-sm flex items-center gap-1.5" style={{ color: "hsl(158,45%,12%)" }}>
                                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                {trip.destination}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                                {new Date(trip.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                                {trip.lat && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px]"
                                    style={{ background: "hsla(158,42%,38%,0.08)", color: "hsl(158,42%,38%)" }}>
                                    📍 On map
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              {trip.lat && (
                                <button onClick={() => { setView("map"); setSelectedTrip(trip); }}
                                  className="text-[11px] px-2.5 py-1.5 rounded-lg font-semibold"
                                  style={{ background: "hsla(200,70%,40%,0.10)", color: "hsl(200,70%,35%)" }}>
                                  View Map
                                </button>
                              )}
                              <Link to={`/trip-wrapped/${trip.id}`}>
                                <button className="text-[11px] px-2.5 py-1.5 rounded-lg font-semibold"
                                  style={{ background: "hsla(158,42%,38%,0.10)", color: "hsl(158,42%,30%)" }}>
                                  Wrapped
                                </button>
                              </Link>
                            </div>
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
