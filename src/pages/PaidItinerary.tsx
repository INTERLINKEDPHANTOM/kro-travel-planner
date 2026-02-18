import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, Wallet, Star, Hotel, Utensils, Bus, Calendar,
  Lightbulb, ArrowRight, ExternalLink, Loader2, Package, Users,
  CheckCircle2, AlertCircle, Download, RotateCcw, Train, Car, Plane,
  IndianRupee, Camera, ChevronLeft, ChevronRight, Navigation,
  Image as ImageIcon, X, Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateItineraryPDF } from "@/lib/generatePDF";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const buildAffiliateLinks = (destination: string, departure: string, departureDate?: string, arrivalDate?: string) => {
  const dest = encodeURIComponent(destination || "");
  const dep = encodeURIComponent(departure || "");
  return {
    train: `https://www.irctc.co.in/nget/train-search`,
    hotel: `https://www.booking.com/searchresults.html?ss=${dest}&checkin=${departureDate?.split("T")[0] || ""}&checkout=${arrivalDate?.split("T")[0] || ""}`,
    bus: `https://www.redbus.in/bus-tickets/${(departure || "").toLowerCase()}-to-${(destination || "").toLowerCase()}`,
    flight: `https://www.makemytrip.com/flight/search?itinerary=${dep}-${dest}-${departureDate?.split("T")[0]?.replace(/-/g, "/") || ""}&tripType=O&paxType=A-1_C-0_I-0&cabinClass=E`,
    cab: `https://www.uber.com/in/en/ride/`,
    maps: `https://www.google.com/maps/search/${dest}`,
  };
};

// Free image source – uses Wikimedia Commons / Google image search redirect
const getDestPhoto = (query: string, index: number, w = 800, h = 600) => {
  // Seed based on query + index for consistent images per destination
  const seed = encodeURIComponent(query.replace(/\s+/g, "-").toLowerCase()) + index;
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
};

// Get a Google image search URL for a destination query
const getGoogleImageSearch = (destination: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(destination + " india tourism photos")}&tbm=isch`;

type ActivityPhoto = { id: string; storage_path: string; place_name: string };

// ─── Destination Photo Gallery ─────────────────────────────────────────────
const PHOTO_LABELS = ["Landmark", "Nature", "Architecture", "Street Food", "Culture", "Landscape", "Temples", "Markets"];

const DestinationGallery = ({ destination }: { destination: string }) => {
  const [active, setActive] = useState<number | null>(null);
  const googleSearchUrl = getGoogleImageSearch(destination);

  // Generate 6 seeded picsum images for this destination
  const photos = Array.from({ length: 6 }, (_, i) => ({
    label: PHOTO_LABELS[i],
    src: getDestPhoto(`${destination}-${PHOTO_LABELS[i]}`, i, i === 0 ? 1200 : 600, i === 0 ? 600 : 400),
    lightboxSrc: getDestPhoto(`${destination}-${PHOTO_LABELS[i]}`, i, 1200, 700),
  }));

  return (
    <motion.section {...fadeUp} className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-heading flex items-center gap-3" style={{ color: "hsl(158, 45%, 12%)" }}>
          <ImageIcon className="w-7 h-7 text-primary" />
          <span>{destination} <span className="text-mint-gradient">in pictures</span></span>
        </h2>
        <a
          href={googleSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="booking-chip text-xs"
        >
          More on Google <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="dest-photo-card cursor-pointer"
            style={{ height: i === 0 ? "220px" : "160px", gridColumn: i === 0 ? "span 2" : "span 1" }}
            onClick={() => setActive(i)}
          >
            <img
              src={photo.src}
              alt={`${destination} ${photo.label}`}
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${i + 10}/600/400`; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <span className="text-white text-xs font-medium">{photo.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-3xl w-full rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos[active].lightboxSrc}
                alt={`${destination} ${photos[active].label}`}
                className="w-full object-cover"
              />
              <button
                onClick={() => setActive(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
                <button onClick={() => setActive((active - 1 + photos.length) % photos.length)}
                  className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setActive((active + 1) % photos.length)}
                  className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

// ─── Day Carousel ─────────────────────────────────────────────────────────
const DayCarousel = ({
  days, tripId, userId, photos, onPhotoAdded
}: {
  days: any[];
  tripId: string | null;
  userId: string | null;
  photos: ActivityPhoto[];
  onPhotoAdded: () => void;
}) => {
  const [activeDay, setActiveDay] = useState(0);
  const [uploadingAct, setUploadingAct] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, activityName: string) => {
    const files = e.target.files;
    if (!files || !userId || !tripId) return;
    setUploadingAct(activityName);
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `${userId}/${tripId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("trip-photos").upload(path, file);
      if (!error) {
        await supabase.from("trip_photos").insert({
          user_id: userId, trip_id: tripId, storage_path: path,
          caption: file.name, place_name: activityName,
        });
      }
    }
    setUploadingAct(null);
    onPhotoAdded();
  };

  const getPhotoUrl = (path: string) => supabase.storage.from("trip-photos").getPublicUrl(path).data.publicUrl;

  const day = days[activeDay];
  const dayCost = day?.activities?.reduce((sum: number, act: any) => {
    return sum + (parseInt(String(act.cost || "0").replace(/[^\d]/g, "")) || 0);
  }, 0) || 0;

  return (
    <motion.section {...fadeUp} className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-heading flex items-center gap-3" style={{ color: "hsl(158, 45%, 12%)" }}>
          <Calendar className="w-7 h-7 text-primary" />
          Day-by-Day Journey
        </h2>
        <span className="text-sm text-muted-foreground">{days.length} days total</span>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {days.map((d: any, i: number) => (
          <motion.button
            key={i}
            onClick={() => setActiveDay(i)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 border ${
              activeDay === i
                ? "text-white border-transparent shadow-lg"
                : "glass-panel border-border/50 text-foreground/70 hover:border-primary/30"
            }`}
            style={activeDay === i ? {
              background: "linear-gradient(135deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))",
              boxShadow: "0 6px 20px hsla(158, 42%, 36%, 0.38)"
            } : {}}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold whitespace-nowrap">Day {i + 1}</span>
            <span className="text-[10px] opacity-70 hidden sm:block truncate max-w-[80px]">
              {d.day_label?.split("–")[1]?.trim() || d.day_label?.split("-")[1]?.trim() || d.theme || ""}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Active day card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, x: 30, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -30, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="prism-card overflow-hidden"
        >
          {/* Day header */}
          <div className="p-5 sm:p-6 border-b border-border/30"
            style={{ background: "linear-gradient(135deg, hsla(148, 45%, 98%, 0.55) 0%, hsla(155, 40%, 95%, 0.35) 100%)" }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-heading" style={{ color: "hsl(158, 45%, 12%)" }}>{day?.day_label}</h3>
                  {day?.theme && <p className="text-sm text-muted-foreground italic">{day.theme}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {dayCost > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
                    style={{ background: "hsla(158, 42%, 38%, 0.12)", color: "hsl(158, 42%, 32%)" }}>
                    <IndianRupee className="w-3.5 h-3.5" />
                    {dayCost.toLocaleString("en-IN")}
                  </div>
                )}
                <span className="text-xs text-muted-foreground px-2">{day?.activities?.length || 0} activities</span>
              </div>
            </div>

            {/* Day photo from destination */}
            {day?.day_label && (
              <div className="mt-4 rounded-2xl overflow-hidden h-40 sm:h-48 relative">
                <img
                  src={`https://picsum.photos/seed/${encodeURIComponent((day.day_label.split("–")[1]?.trim() || day.theme || "travel").replace(/\s+/g, "-").toLowerCase())}-day${activeDay}/1000/400`}
                  alt={day.day_label}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/day${activeDay + 1}/1000/400`; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            )}
          </div>

          {/* Activities */}
          <div className="p-4 sm:p-6 space-y-3">
            {day?.activities?.map((act: any, ai: number) => {
              const actKey = `${activeDay}-${ai}`;
              const actPhotos = photos.filter(p => p.place_name === act.activity);

              return (
                <motion.div
                  key={actKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ai * 0.06 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "hsla(148, 40%, 98%, 0.55)", border: "1px solid hsla(148, 35%, 80%, 0.40)" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-3.5">
                    {/* Time */}
                    <div className="flex items-center gap-2 sm:w-20 flex-shrink-0">
                      <Clock className="w-3.5 h-3.5" style={{ color: "hsl(158, 42%, 40%)" }} />
                      <span className="font-mono text-xs font-bold" style={{ color: "hsl(158, 42%, 38%)" }}>{act.time}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm" style={{ color: "hsl(158, 45%, 12%)" }}>{act.activity}</p>
                          {act.note && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{act.note}</p>}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* Photo upload */}
                          {tripId && userId && (
                            <>
                              <input
                                ref={el => { fileRefs.current[actKey] = el; }}
                                type="file" multiple accept="image/*" className="hidden"
                                onChange={(e) => handleUpload(e, act.activity)}
                              />
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => { e.stopPropagation(); fileRefs.current[actKey]?.click(); }}
                                className="p-1.5 rounded-xl transition-all"
                                style={{ background: "hsla(158, 42%, 38%, 0.08)", color: "hsl(158, 42%, 40%)" }}
                                title="Add photo"
                              >
                                {uploadingAct === act.activity
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <Camera className="w-3.5 h-3.5" />
                                }
                              </motion.button>
                            </>
                          )}
                          {act.maps_url && (
                            <a href={act.maps_url} target="_blank" rel="noopener noreferrer"
                              className="p-1.5 rounded-xl transition-all"
                              style={{ background: "hsla(158, 42%, 38%, 0.08)", color: "hsl(158, 42%, 40%)" }}
                              title="View on Maps">
                              <Navigation className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {act.duration && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: "hsla(148, 35%, 88%, 0.7)", color: "hsl(158, 30%, 38%)" }}>
                            ⏱ {act.duration}
                          </span>
                        )}
                        {act.cost && act.cost !== "₹0" && act.cost !== "Free" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: "hsla(158, 42%, 38%, 0.10)", color: "hsl(158, 42%, 30%)" }}>
                            ₹ {act.cost}
                          </span>
                        )}
                        {act.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: "hsla(152, 55%, 52%, 0.12)", color: "hsl(152, 45%, 35%)" }}>
                            {act.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Activity photos strip */}
                  {actPhotos.length > 0 && (
                    <div className="flex gap-2 px-3.5 pb-3.5 overflow-x-auto">
                      {actPhotos.map(p => (
                        <img key={p.id} src={getPhotoUrl(p.storage_path)} alt=""
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-border/50"
                          loading="lazy" />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Day cost footer */}
            {dayCost > 0 && (
              <div className="flex items-center justify-between pt-3 mt-2 px-1 border-t border-border/30">
                <span className="text-xs text-muted-foreground">Day {activeDay + 1} estimated spend</span>
                <span className="font-heading font-bold" style={{ color: "hsl(158, 42%, 38%)" }}>
                  ₹{dayCost.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>

          {/* Prev / Next nav */}
          <div className="flex items-center gap-3 px-5 pb-5">
            <button
              onClick={() => setActiveDay(Math.max(0, activeDay - 1))}
              disabled={activeDay === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium btn-ghost-glass disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Day
            </button>
            <div className="flex-1 text-center text-xs text-muted-foreground">
              {activeDay + 1} / {days.length}
            </div>
            <button
              onClick={() => setActiveDay(Math.min(days.length - 1, activeDay + 1))}
              disabled={activeDay === days.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium btn-primary disabled:opacity-40"
            >
              Next Day <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
};

// ─── Main PaidItinerary ────────────────────────────────────────────────────
const PaidItinerary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preferences, setPreferences] = useState<any>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [activityPhotos, setActivityPhotos] = useState<ActivityPhoto[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("tripPreferences");
    if (!stored) { navigate("/plan"); return; }
    const prefs = JSON.parse(stored);
    setPreferences(prefs);
    supabase.auth.getUser().then(({ data: { user } }) => { if (user) setUserId(user.id); });
    const savedData = sessionStorage.getItem("savedItinerary");
    const existingSavedId = sessionStorage.getItem("savedItineraryId");
    const regenerateId = sessionStorage.getItem("regenerateTrip");
    if (savedData && !regenerateId) {
      setItinerary(JSON.parse(savedData));
      setSavedId(existingSavedId);
      setLoading(false);
      sessionStorage.removeItem("savedItinerary");
      sessionStorage.removeItem("savedItineraryId");
    } else {
      if (regenerateId) { setSavedId(regenerateId); sessionStorage.removeItem("regenerateTrip"); }
      generateItinerary(prefs);
    }
  }, []);

  const fetchActivityPhotos = async () => {
    if (!savedId) return;
    const { data } = await supabase.from("trip_photos").select("id, storage_path, place_name")
      .eq("trip_id", savedId).order("created_at", { ascending: false });
    setActivityPhotos((data as ActivityPhoto[]) || []);
  };
  useEffect(() => { if (savedId) fetchActivityPhotos(); }, [savedId]);

  const [progressStep, setProgressStep] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Starting...");

  const PIPELINE_STEPS = [
    { step: 1, label: "Validating preferences...", Icon: CheckCircle2 },
    { step: 2, label: "Analyzing travel context...", Icon: Zap },
    { step: 3, label: "Finding best transport...", Icon: Train },
    { step: 4, label: "Recalculating budget...", Icon: IndianRupee },
    { step: 5, label: "Searching hotels...", Icon: Hotel },
    { step: 6, label: "Building itinerary...", Icon: Package },
    { step: 7, label: "Adding restaurants & tips...", Icon: Utensils },
    { step: 8, label: "Finalizing...", Icon: Star },
  ];

  const generateItinerary = async (prefs: any) => {
    setProgressStep(0);
    setProgressLabel("Starting...");
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-paid-itinerary`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ preferences: prefs }),
      });
      if (!resp.ok || !resp.body) throw new Error("Failed to start generation");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n\n")) !== -1) {
          const chunk = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 2);
          let eventType = "message", eventData = "";
          for (const line of chunk.split("\n")) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim();
            if (line.startsWith("data: ")) eventData = line.slice(6).trim();
          }
          if (!eventData) continue;
          try {
            const parsed = JSON.parse(eventData);
            if (eventType === "progress") { setProgressStep(parsed.step); setProgressLabel(parsed.label); }
            else if (eventType === "complete") {
              if (parsed.success && parsed.data) { setItinerary(parsed.data); await saveItinerary(parsed.data, prefs); }
              else throw new Error(parsed.error || "Generation failed");
            } else if (eventType === "error") throw new Error(parsed.message || "Generation failed");
          } catch (parseErr: any) { if (parseErr.message && !parseErr.message.includes("JSON")) throw parseErr; }
        }
      }
    } catch (err: any) { setError(err.message || "Something went wrong."); } finally { setLoading(false); }
  };

  const saveItinerary = async (itineraryData: any, prefs: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (savedId) {
      const { data: existing } = await supabase.from("saved_itineraries").select("regenerate_count").eq("id", savedId).single();
      await supabase.from("saved_itineraries").update({ itinerary_data: itineraryData, preferences: prefs, regenerate_count: (existing?.regenerate_count || 0) + 1 }).eq("id", savedId);
    } else {
      const { data: inserted } = await supabase.from("saved_itineraries").insert({ user_id: user.id, preferences: prefs, itinerary_data: itineraryData, destination: prefs.arrival || "Unknown", status: "generated" }).select("id").single();
      if (inserted) setSavedId(inserted.id);
      if (prefs.departureDate) {
        const depDate = new Date(prefs.departureDate);
        await supabase.from("notifications").insert({ user_id: user.id, trip_id: inserted?.id, type: "departure_reminder", title: `🧳 Trip to ${prefs.arrival} tomorrow!`, message: `Your trip starts ${depDate.toLocaleDateString()}. Check your itinerary!`, scheduled_for: new Date(depDate.getTime() - 86400000).toISOString() });
      }
    }
  };

  const handleRegenerate = async () => {
    if (!preferences) return;
    setRegenerating(true); setLoading(true); setError(""); setItinerary(null);
    await generateItinerary(preferences);
    setRegenerating(false);
    toast({ title: "✨ Itinerary regenerated!" });
  };

  const handleDownloadPDF = async () => {
    if (!itinerary) return;
    setDownloading(true);
    try { generateItineraryPDF(itinerary, preferences); toast({ title: "📄 PDF downloaded!" }); }
    catch (err) { toast({ title: "PDF failed", variant: "destructive" }); }
    finally { setDownloading(false); }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen relative">
        <Navbar />
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="ambient-orb-1" style={{ top: "10%", left: "15%" }} />
          <div className="ambient-orb-2" style={{ bottom: "20%", right: "10%" }} />
        </div>
        <div className="relative z-10 pt-32 flex flex-col items-center justify-center gap-8 px-4 pb-20">
          {/* Animated spinner */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-border/40" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full flex items-center justify-center">
              <Plane className="w-7 h-7 text-primary" />
            </div>
          </div>

          <div className="text-center max-w-sm">
            <h2 className="text-2xl sm:text-3xl font-heading mb-2" style={{ color: "hsl(158, 45%, 12%)" }}>
              {regenerating ? "Regenerating your trip" : "Crafting your perfect trip"}
            </h2>
            <p className="text-primary font-medium mb-1">{progressLabel}</p>
            <p className="text-xs text-muted-foreground">Step {progressStep || 1} of 8 — ~30-60 seconds</p>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-sm">
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${(progressStep / 8) * 100}%` }} />
            </div>
          </div>

          {/* Pipeline steps */}
          <div className="w-full max-w-md space-y-2">
            {PIPELINE_STEPS.map((s) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: s.step <= progressStep ? 1 : 0.3, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm transition-all ${
                  s.step < progressStep ? "glass-panel text-primary" :
                  s.step === progressStep ? "prism-card text-primary font-medium" :
                  "bg-muted/30 text-muted-foreground"
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {s.step < progressStep
                    ? <CheckCircle2 className="w-4 h-4 text-primary" />
                    : s.step === progressStep
                    ? <s.Icon className="w-4 h-4 text-primary" />
                    : <Clock className="w-4 h-4 text-muted-foreground opacity-50" />}
                </div>
                <span className="flex-1">{s.label}</span>
                {s.step === progressStep && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 text-center px-4">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>
            <AlertCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading mb-3" style={{ color: "hsl(158, 45%, 12%)" }}>Generation Failed</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">{error}</p>
          <button onClick={() => { setError(""); setLoading(true); generateItinerary(preferences); }} className="btn-primary px-8 py-3">
            Try Again <Zap className="w-4 h-4 inline ml-1" />
          </button>
        </div>
      </div>
    );
  }

  if (!itinerary) return null;

  const it = itinerary;
  const LINKS = buildAffiliateLinks(preferences?.arrival, preferences?.departure, preferences?.departureDate, preferences?.arrivalDate);

  return (
    <div className="min-h-screen relative">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-orb-1" style={{ top: "5%", left: "10%", opacity: 0.5 }} />
        <div className="ambient-orb-2" style={{ bottom: "25%", right: "8%", opacity: 0.4 }} />
      </div>

      <Navbar />

      {/* Sticky Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-2 px-4 py-2.5 rounded-full"
        style={{
          background: "hsla(148, 40%, 97%, 0.85)",
          backdropFilter: "blur(24px)",
          border: "1px solid hsla(148, 35%, 78%, 0.50)",
          boxShadow: "0 8px 32px hsla(158, 45%, 18%, 0.14)"
        }}
      >
        <button onClick={handleDownloadPDF} disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold btn-primary disabled:opacity-50">
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? "Generating..." : "Download PDF"}
        </button>
        <button onClick={handleRegenerate}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold btn-ghost-glass">
          <RotateCcw className="w-4 h-4" /> Regenerate
        </button>
      </motion.div>

      {/* Hero cover */}
      <section className="relative pt-0">
        <div className="relative h-72 sm:h-[420px] overflow-hidden">
          <img
            src={`https://picsum.photos/seed/${encodeURIComponent((preferences?.arrival || "travel").replace(/\s+/g, "-").toLowerCase())}-hero/1600/800`}
            alt={preferences?.arrival}
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/seed/travel-hero/1600/800"; }}
          />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to top, hsl(148, 35%, 95%) 0%, hsla(148, 35%, 95%, 0.5) 40%, transparent 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-10">
            <motion.div {...fadeUp} className="max-w-4xl mx-auto">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4"
                style={{ background: "hsla(158, 42%, 38%, 0.85)", color: "white" }}>
                <Star className="w-3 h-3" /> AI-Crafted Itinerary
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading leading-tight mb-3" style={{ color: "hsl(158, 45%, 10%)" }}>
                {it.cover_title || `Your Trip to ${preferences?.arrival}`}
              </h1>
              {it.intro && (
                <p className="max-w-xl text-base font-light" style={{ color: "hsl(158, 25%, 38%)" }}>
                  {it.intro}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">

        {/* Preferences summary */}
        {it.user_preferences_summary && (
          <motion.section {...fadeUp} className="glass-panel p-6 sm:p-8 mb-12 mt-8">
            <h2 className="text-base font-heading mb-4 flex items-center gap-2" style={{ color: "hsl(158, 38%, 22%)" }}>
              <Users className="w-5 h-5 text-primary" /> Your Preferences
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {Object.entries(it.user_preferences_summary).map(([key, val]: [string, any]) => (
                <div key={key} className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs capitalize">{key.replace(/_/g, " ")}</span>
                  <span className="font-semibold" style={{ color: "hsl(158, 38%, 20%)" }}>{val}</span>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Quick booking links */}
        <motion.section {...fadeUp} className="mb-12">
          <h2 className="text-lg font-heading mb-4 flex items-center gap-2" style={{ color: "hsl(158, 45%, 12%)" }}>
            <Zap className="w-5 h-5 text-primary" /> Quick Book Links
          </h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[
              { label: "Book Train", Icon: Train, url: LINKS.train },
              { label: "Book Hotel", Icon: Hotel, url: LINKS.hotel },
              { label: "Book Bus", Icon: Bus, url: LINKS.bus },
              { label: "Book Flight", Icon: Plane, url: LINKS.flight },
              { label: "Book Cab", Icon: Car, url: LINKS.cab },
              { label: "Google Maps", Icon: Navigation, url: LINKS.maps },
            ].map((link) => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="booking-chip">
                <link.Icon className="w-3.5 h-3.5" />
                {link.label}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </motion.section>

        {/* Destination photo gallery */}
        {preferences?.arrival && <DestinationGallery destination={preferences.arrival} />}

        {/* Day carousel */}
        {it.days?.length > 0 && (
          <DayCarousel
            days={it.days}
            tripId={savedId}
            userId={userId}
            photos={activityPhotos}
            onPhotoAdded={fetchActivityPhotos}
          />
        )}

        {/* Hotels */}
        {it.hotels?.length > 0 && (
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-heading mb-6 flex items-center gap-3" style={{ color: "hsl(158, 45%, 12%)" }}>
              <Hotel className="w-7 h-7 text-primary" /> Hotel Options
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {it.hotels.map((hotel: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="prism-card p-6 flex flex-col">
                  {/* Hotel photo */}
                  <div className="h-32 rounded-2xl overflow-hidden mb-4 -mx-2">
                    <img src={`https://source.unsplash.com/600x300/?hotel,${encodeURIComponent(hotel.name || "resort india")}`}
                      alt={hotel.name} className="w-full h-full object-cover"
                      loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                      hotel.tier === "Low" ? "bg-primary/10 text-primary" :
                      hotel.tier === "Mid" ? "bg-accent/20 text-accent-foreground" :
                      "bg-secondary/10 text-secondary"
                    }`}>{hotel.tier}</span>
                    <span className="font-heading font-bold text-primary">{hotel.price_per_night}</span>
                  </div>
                  <h3 className="font-heading text-base mb-1.5" style={{ color: "hsl(158, 45%, 12%)" }}>{hotel.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 flex-1">{hotel.description}</p>
                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <p>📍 {hotel.distance_station}</p>
                    {hotel.breakfast_included && <p className="text-primary font-medium">✅ Breakfast included</p>}
                  </div>
                  <div className="flex gap-2 mt-auto pt-3 border-t border-border/30">
                    {hotel.maps_url && (
                      <a href={hotel.maps_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                        <Navigation className="w-3 h-3" /> Maps
                      </a>
                    )}
                    <a href={LINKS.hotel} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 ml-auto font-semibold">
                      Book Now <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Restaurants */}
        {it.restaurants?.length > 0 && (
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-heading mb-6 flex items-center gap-3" style={{ color: "hsl(158, 45%, 12%)" }}>
              <Utensils className="w-7 h-7 text-primary" /> Food & Restaurants
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {it.restaurants.map((r: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="glass-panel p-5 hover-lift">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-heading text-base" style={{ color: "hsl(158, 45%, 12%)" }}>{r.name}</h4>
                    <span className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{ background: "hsla(158, 42%, 38%, 0.10)", color: "hsl(158, 42%, 30%)" }}>
                      {r.meal}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{r.reason}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" /> Near {r.near_landmark}
                    <span className="ml-auto px-2 py-0.5 rounded-full"
                      style={{ background: "hsla(148, 35%, 88%, 0.7)", color: "hsl(158, 30%, 38%)" }}>
                      {r.type}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Budget breakdown */}
        {it.budget_breakdown && (
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-heading mb-6 flex items-center gap-3" style={{ color: "hsl(158, 45%, 12%)" }}>
              <Wallet className="w-7 h-7 text-primary" /> Budget Breakdown
            </h2>
            <div className="glass-panel p-6 sm:p-8">
              {it.budget_breakdown.items?.map((item: any) => (
                <div key={item.label} className="flex justify-between items-center py-3 border-b border-border/30 last:border-0">
                  <span className="text-muted-foreground text-sm">{item.label}</span>
                  <span className="font-semibold text-sm" style={{ color: "hsl(158, 45%, 12%)" }}>{item.amount}</span>
                </div>
              ))}
              {it.budget_breakdown.emergency_buffer && (
                <div className="flex justify-between items-center py-3 border-b border-border/30">
                  <span className="text-sm">🛡️ Emergency Buffer (10%)</span>
                  <span className="font-semibold text-sm">{it.budget_breakdown.emergency_buffer}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-primary/20">
                <span className="font-heading text-lg" style={{ color: "hsl(158, 45%, 12%)" }}>Total Estimated</span>
                <span className="font-heading text-xl text-primary">{it.budget_breakdown.total_estimated}</span>
              </div>
              {it.budget_breakdown.savings_message && (
                <div className="flex items-center gap-2 mt-4 p-4 rounded-2xl"
                  style={{ background: "hsla(158, 42%, 38%, 0.08)", border: "1px solid hsla(158, 42%, 50%, 0.20)" }}>
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-primary">{it.budget_breakdown.savings_message}</span>
                  <span className="ml-auto font-bold text-primary">{it.budget_breakdown.percent_used}</span>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* Travel Tips */}
        {it.travel_tips?.length > 0 && (
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-heading mb-6 flex items-center gap-3" style={{ color: "hsl(158, 45%, 12%)" }}>
              <Lightbulb className="w-7 h-7 text-primary" /> Travel Tips
            </h2>
            <div className="glass-panel p-6 sm:p-8">
              <ul className="space-y-3">
                {it.travel_tips.map((tip: string, i: number) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 text-sm" style={{ color: "hsl(158, 25%, 28%)" }}>
                    <span className="text-primary flex-shrink-0 mt-0.5">✅</span>
                    <span>{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.section>
        )}

        {/* Packing checklist */}
        {it.packing_checklist?.length > 0 && (
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-heading mb-6 flex items-center gap-3" style={{ color: "hsl(158, 45%, 12%)" }}>
              <Package className="w-7 h-7 text-primary" /> Packing Checklist
            </h2>
            <div className="glass-panel p-6 sm:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {it.packing_checklist.map((item: string, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-2 text-sm" style={{ color: "hsl(158, 25%, 28%)" }}>
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Trip summary */}
        {it.trip_summary && (
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-heading mb-6 flex items-center gap-3" style={{ color: "hsl(158, 45%, 12%)" }}>
              <Calendar className="w-7 h-7 text-primary" /> Trip Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Nights", value: it.trip_summary.total_nights, Icon: Clock },
                { label: "Transport", value: it.trip_summary.transport_percent, Icon: Train },
                { label: "Stay", value: it.trip_summary.stay_percent, Icon: Hotel },
                { label: "Food", value: it.trip_summary.food_percent, Icon: Utensils },
              ].map((s) => (
                <div key={s.label} className="prism-card p-4 sm:p-5 text-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>
                    <s.Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                  <div className="font-heading text-base sm:text-lg font-bold text-primary">{s.value}</div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Closing note */}
        {it.closing_note && (
          <motion.section {...fadeUp} className="mb-16">
            <div className="prism-card p-8 sm:p-12 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>
                <Star className="w-6 h-6 text-primary" />
              </div>
              <p className="text-lg font-heading italic leading-relaxed max-w-2xl mx-auto" style={{ color: "hsl(158, 35%, 25%)" }}>
                "{it.closing_note}"
              </p>
            </div>
          </motion.section>
        )}

        {/* Contact */}
        <motion.section {...fadeUp} className="mb-20">
          <div className="glass-panel p-6 sm:p-8 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-heading mb-2" style={{ color: "hsl(158, 45%, 12%)" }}>Need Help?</h2>
            <p className="text-muted-foreground text-sm mb-5">Our travel experts are here for you 24/7</p>
            <a href="mailto:support@krotravel.com"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm btn-primary">
              <ArrowRight className="w-4 h-4" /> support@krotravel.com
            </a>
            <p className="text-xs text-muted-foreground mt-4 italic">Share feedback to get your next itinerary free</p>
          </div>
        </motion.section>
      </div>

      <Footer />
    </div>
  );
};

export default PaidItinerary;
