import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, Wallet, Star, Hotel, Utensils, Bus, Calendar,
  Lightbulb, ArrowRight, ExternalLink, Loader2, Package, Users,
  CheckCircle2, AlertCircle, Download, RotateCcw, Train, Car, Plane,
  IndianRupee, Camera, ChevronLeft, ChevronRight, Navigation,
  Image as ImageIcon, X, Zap, Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateItineraryPDF } from "@/lib/generatePDF";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, ease: "easeOut" as const },
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

// Reliable seeded picsum images
const getDestPhoto = (query: string, index: number, w = 800, h = 600) => {
  const seed = encodeURIComponent(query.replace(/\s+/g, "-").toLowerCase()) + "-" + index;
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
};

const formatINR = (val: any): string => {
  if (!val) return "—";
  const str = String(val).replace(/[^\d]/g, "");
  const num = parseInt(str, 10);
  if (isNaN(num)) return String(val);
  return "₹" + num.toLocaleString("en-IN");
};

type ActivityPhoto = { id: string; storage_path: string; place_name: string };

const PHOTO_LABELS = ["Landmark", "Nature", "Temples", "Street Food", "Markets", "Landscape"];

// ─── Destination Photo Gallery ─────────────────────────────────────────────
const DestinationGallery = ({ destination }: { destination: string }) => {
  const [active, setActive] = useState<number | null>(null);

  const photos = Array.from({ length: 6 }, (_, i) => ({
    label: PHOTO_LABELS[i],
    src: getDestPhoto(`${destination}-${PHOTO_LABELS[i]}`, i, 600, 400),
    lightboxSrc: getDestPhoto(`${destination}-${PHOTO_LABELS[i]}`, i, 1200, 700),
  }));

  return (
    <motion.section {...fadeUp} className="mb-12 sm:mb-16">
      <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl font-heading flex items-center gap-2 sm:gap-3" style={{ color: "hsl(158, 45%, 12%)" }}>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          {destination} <span className="text-mint-gradient hidden sm:inline">in pictures</span>
        </h2>
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(destination + " india tourism photos")}&tbm=isch`}
          target="_blank"
          rel="noopener noreferrer"
          className="booking-chip text-xs flex-shrink-0"
        >
          Google <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Responsive bento grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {photos.map((photo, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.93 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.45 }}
            className={`dest-photo-card cursor-pointer ${i === 0 ? "col-span-2 sm:col-span-1 sm:row-span-2" : ""}`}
            style={{
              height: i === 0
                ? "clamp(180px, 40vw, 280px)"
                : "clamp(110px, 20vw, 150px)",
            }}
            onClick={() => setActive(i)}
          >
            <img
              src={photo.src}
              alt={`${destination} ${photo.label}`}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/travel${i}/600/400`; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-2.5 sm:p-3">
              <span className="text-white text-[10px] sm:text-xs font-semibold">{photo.label}</span>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4 py-8"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="relative max-w-2xl w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos[active].lightboxSrc}
                alt={`${destination} ${photos[active].label}`}
                className="w-full object-cover max-h-[80vh]"
              />
              <div className="absolute inset-0 flex items-center justify-between px-3 sm:px-4 pointer-events-none">
                <button onClick={() => setActive((active - 1 + photos.length) % photos.length)}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setActive((active + 1) % photos.length)}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button onClick={() => setActive(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/60 to-transparent">
                <span className="text-white/90 text-xs font-semibold">{photos[active].label}</span>
                <span className="text-white/50 text-xs ml-2">{active + 1} / {photos.length}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

// ─── Day Carousel ──────────────────────────────────────────────────────────
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
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollTabIntoView = (idx: number) => {
    const el = tabsRef.current?.children[idx] as HTMLElement;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const changeDay = (idx: number) => {
    setActiveDay(idx);
    scrollTabIntoView(idx);
  };

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
    const raw = String(act.cost || "0").replace(/[^\d]/g, "");
    return sum + (parseInt(raw, 10) || 0);
  }, 0) || 0;

  return (
    <motion.section {...fadeUp} className="mb-12 sm:mb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl font-heading flex items-center gap-2 sm:gap-3" style={{ color: "hsl(158, 45%, 12%)" }}>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          Day-by-Day Journey
        </h2>
        <span className="text-xs text-muted-foreground px-3 py-1.5 rounded-full glass-panel">{days.length} days</span>
      </div>

      {/* Day tabs – scrollable */}
      <div ref={tabsRef} className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide snap-x snap-mandatory">
        {days.map((d: any, i: number) => {
          const label = d.day_label?.split("–")[1]?.trim() || d.day_label?.split("-")[1]?.trim() || d.theme || "";
          return (
            <motion.button
              key={i}
              onClick={() => changeDay(i)}
              whileTap={{ scale: 0.95 }}
              className={`snap-start flex-shrink-0 flex flex-col items-center gap-0.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-300 border min-w-[60px] ${
                activeDay === i
                  ? "text-white border-transparent"
                  : "glass-panel border-border/50 text-foreground/70"
              }`}
              style={activeDay === i ? {
                background: "linear-gradient(135deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))",
                boxShadow: "0 4px 16px hsla(158, 42%, 36%, 0.35)"
              } : {}}
            >
              <span className="font-bold text-[11px]">D{i + 1}</span>
              {label && <span className="text-[9px] opacity-70 truncate max-w-[56px]">{label}</span>}
            </motion.button>
          );
        })}
      </div>

      {/* Active day card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="prism-card overflow-hidden"
        >
          {/* Day header */}
          <div className="p-4 sm:p-6 border-b border-border/30"
            style={{ background: "linear-gradient(135deg, hsla(148, 45%, 98%, 0.55) 0%, hsla(155, 40%, 95%, 0.35) 100%)" }}>
            
            {/* Day image */}
            <div className="rounded-xl sm:rounded-2xl overflow-hidden mb-4 relative" style={{ height: "clamp(140px, 30vw, 200px)" }}>
              <img
                src={getDestPhoto(day?.theme || day?.day_label || "travel-landscape", activeDay, 900, 350)}
                alt={day?.day_label}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/day${activeDay + 1}/900/350`; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div>
                  <h3 className="text-white font-heading text-sm sm:text-base font-bold leading-tight">{day?.day_label}</h3>
                  {day?.theme && <p className="text-white/75 text-[11px] sm:text-xs italic mt-0.5">{day.theme}</p>}
                </div>
                {dayCost > 0 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: "hsla(0,0%,0%,0.45)", backdropFilter: "blur(8px)", color: "white" }}>
                    <IndianRupee className="w-3 h-3" />
                    {dayCost.toLocaleString("en-IN")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="p-3 sm:p-5 space-y-2.5">
            {day?.activities?.map((act: any, ai: number) => {
              const actKey = `${activeDay}-${ai}`;
              const actPhotos = photos.filter(p => p.place_name === act.activity);
              const costNum = parseInt(String(act.cost || "0").replace(/[^\d]/g, ""), 10);

              return (
                <motion.div
                  key={actKey}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ai * 0.05 }}
                  className="rounded-xl sm:rounded-2xl overflow-hidden"
                  style={{ background: "hsla(148, 40%, 98%, 0.60)", border: "1px solid hsla(148, 35%, 82%, 0.45)" }}
                >
                  <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4">
                    {/* Time badge */}
                    <div className="flex-shrink-0 flex flex-col items-center mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <div className="w-px flex-1 bg-border/40 my-0.5" style={{ minHeight: "20px" }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {act.time && (
                            <span className="text-[10px] font-bold tracking-wide text-primary/80 block mb-0.5">{act.time}</span>
                          )}
                          <p className="font-semibold text-sm leading-snug" style={{ color: "hsl(158, 45%, 12%)" }}>{act.activity}</p>
                          {act.note && <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{act.note}</p>}
                        </div>
                        {/* Action icons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {tripId && userId && (
                            <>
                              <input
                                ref={el => { fileRefs.current[actKey] = el; }}
                                type="file" multiple accept="image/*" className="hidden"
                                onChange={(e) => handleUpload(e, act.activity)}
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); fileRefs.current[actKey]?.click(); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                                style={{ background: "hsla(158, 42%, 38%, 0.10)", color: "hsl(158, 42%, 40%)" }}
                                title="Add photo"
                              >
                                {uploadingAct === act.activity
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <Camera className="w-3.5 h-3.5" />}
                              </button>
                            </>
                          )}
                          {act.maps_url && (
                            <a href={act.maps_url} target="_blank" rel="noopener noreferrer"
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                              style={{ background: "hsla(158, 42%, 38%, 0.10)", color: "hsl(158, 42%, 40%)" }}
                              title="View on Maps">
                              <Navigation className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {act.duration && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: "hsla(148, 35%, 88%, 0.7)", color: "hsl(158, 30%, 38%)" }}>
                            <Clock className="w-2.5 h-2.5" /> {act.duration}
                          </span>
                        )}
                        {costNum > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: "hsla(158, 42%, 38%, 0.10)", color: "hsl(158, 42%, 30%)" }}>
                            <IndianRupee className="w-2.5 h-2.5" />{costNum.toLocaleString("en-IN")}
                          </span>
                        )}
                        {act.cost === "Free" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: "hsla(152, 55%, 52%, 0.12)", color: "hsl(152, 45%, 32%)" }}>
                            Free
                          </span>
                        )}
                        {act.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: "hsla(152, 55%, 52%, 0.10)", color: "hsl(152, 40%, 36%)" }}>
                            {act.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Activity photos */}
                  {actPhotos.length > 0 && (
                    <div className="flex gap-2 px-3 pb-3 overflow-x-auto scrollbar-hide">
                      {actPhotos.map(p => (
                        <img key={p.id} src={getPhotoUrl(p.storage_path)} alt=""
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover flex-shrink-0 border border-border/50"
                          loading="lazy" />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Day cost footer */}
            {dayCost > 0 && (
              <div className="flex items-center justify-between pt-3 mt-1 px-1 border-t border-border/30">
                <span className="text-xs text-muted-foreground">Day {activeDay + 1} estimated spend</span>
                <span className="font-heading font-bold text-sm" style={{ color: "hsl(158, 42%, 38%)" }}>
                  ₹{dayCost.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>

          {/* Prev/Next */}
          <div className="flex items-center gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
            <button
              onClick={() => changeDay(Math.max(0, activeDay - 1))}
              disabled={activeDay === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium btn-ghost-glass disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <div className="flex-1 flex items-center justify-center gap-1">
              {days.map((_, i) => (
                <button key={i} onClick={() => changeDay(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === activeDay ? "bg-primary w-4" : "bg-border"}`} />
              ))}
            </div>
            <button
              onClick={() => changeDay(Math.min(days.length - 1, activeDay + 1))}
              disabled={activeDay === days.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium btn-primary disabled:opacity-40 disabled:pointer-events-none"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
};

// ─── Budget Row ────────────────────────────────────────────────────────────
const BudgetRow = ({ label, amount, isTotal = false }: { label: string; amount: any; isTotal?: boolean }) => {
  const display = formatINR(amount);
  return (
    <div className={`flex items-center justify-between py-3 ${isTotal ? "border-t-2 border-primary/20 mt-2 pt-4" : "border-b border-border/30 last:border-0"}`}>
      <span className={`${isTotal ? "font-heading text-base" : "text-sm text-muted-foreground"}`}
        style={isTotal ? { color: "hsl(158, 45%, 12%)" } : {}}>
        {label}
      </span>
      <span className={`font-semibold tabular-nums ${isTotal ? "font-heading text-lg text-primary" : "text-sm"}`}
        style={!isTotal ? { color: "hsl(158, 45%, 15%)" } : {}}>
        {display}
      </span>
    </div>
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
    }
  };

  const handleRegenerate = async () => {
    if (!preferences) return;
    setRegenerating(true); setLoading(true); setError(""); setItinerary(null);
    await generateItinerary(preferences);
    setRegenerating(false);
    toast({ title: "Itinerary regenerated!" });
  };

  const handleDownloadPDF = async () => {
    if (!itinerary) return;
    setDownloading(true);
    try { generateItineraryPDF(itinerary, preferences); toast({ title: "PDF downloaded!" }); }
    catch { toast({ title: "PDF failed", variant: "destructive" }); }
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
        <div className="relative z-10 pt-28 sm:pt-36 flex flex-col items-center gap-6 sm:gap-8 px-4 pb-20">
          {/* Spinner */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20">
            <div className="absolute inset-0 rounded-full border-4 border-border/40" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full flex items-center justify-center">
              <Plane className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
            </div>
          </div>

          <div className="text-center max-w-xs sm:max-w-sm px-4">
            <h2 className="text-xl sm:text-2xl font-heading mb-2" style={{ color: "hsl(158, 45%, 12%)" }}>
              {regenerating ? "Regenerating your trip" : "Crafting your perfect trip"}
            </h2>
            <p className="text-primary font-medium text-sm mb-1">{progressLabel}</p>
            <p className="text-xs text-muted-foreground">Step {progressStep || 1} of 8 — ~30-60 seconds</p>
          </div>

          <div className="w-full max-w-xs sm:max-w-sm px-4">
            <div className="progress-bar-track">
              <motion.div
                className="progress-bar-fill"
                animate={{ width: `${(progressStep / 8) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="w-full max-w-xs sm:max-w-md px-4 space-y-2">
            {PIPELINE_STEPS.map((s) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: s.step <= progressStep ? 1 : 0.3, x: 0 }}
                transition={{ duration: 0.3, delay: s.step * 0.05 }}
                className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-xl sm:rounded-2xl text-sm transition-all ${
                  s.step < progressStep ? "glass-panel text-primary" :
                  s.step === progressStep ? "prism-card text-primary font-medium" :
                  "bg-muted/30 text-muted-foreground"
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {s.step < progressStep
                    ? <CheckCircle2 className="w-4 h-4 text-primary" />
                    : s.step === progressStep
                    ? <s.Icon className="w-4 h-4 text-primary" />
                    : <Clock className="w-4 h-4 text-muted-foreground opacity-50" />}
                </div>
                <span className="flex-1 text-xs sm:text-sm">{s.label}</span>
                {s.step === progressStep && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
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
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "hsla(0, 72%, 55%, 0.10)" }}>
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
          <h1 className="text-xl sm:text-2xl font-heading mb-3" style={{ color: "hsl(158, 45%, 12%)" }}>Generation Failed</h1>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm">{error}</p>
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
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-orb-1" style={{ top: "5%", left: "10%", opacity: 0.4 }} />
        <div className="ambient-orb-2" style={{ bottom: "25%", right: "8%", opacity: 0.35 }} />
      </div>

      <Navbar />

      {/* Sticky floating action bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full w-auto max-w-[calc(100vw-2rem)]"
        style={{
          background: "hsla(148, 40%, 97%, 0.90)",
          backdropFilter: "blur(24px)",
          border: "1px solid hsla(148, 35%, 78%, 0.50)",
          boxShadow: "0 8px 32px hsla(158, 45%, 18%, 0.16)",
        }}
      >
        <button onClick={handleDownloadPDF} disabled={downloading}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold btn-primary disabled:opacity-50 whitespace-nowrap">
          {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          {downloading ? "Generating..." : "PDF"}
        </button>
        <button onClick={handleRegenerate}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold btn-ghost-glass whitespace-nowrap">
          <RotateCcw className="w-3.5 h-3.5" /> Regenerate
        </button>
      </motion.div>

      {/* Hero */}
      <section className="relative pt-0">
        <div className="relative overflow-hidden" style={{ height: "clamp(240px, 50vw, 480px)" }}>
          <motion.img
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src={getDestPhoto(preferences?.arrival || "india-travel", 0, 1400, 700)}
            alt={preferences?.arrival}
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/seed/travel-india-hero/1400/700"; }}
          />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to top, hsl(148, 35%, 95%) 0%, hsla(148, 35%, 95%, 0.6) 35%, transparent 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8 sm:pb-12">
            <motion.div {...fadeUp} className="max-w-4xl mx-auto">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4"
                style={{ background: "hsla(158, 42%, 38%, 0.88)", color: "white" }}>
                <Star className="w-3 h-3" /> AI-Crafted Itinerary
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading leading-tight mb-2 sm:mb-3" style={{ color: "hsl(158, 45%, 10%)" }}>
                {it.cover_title || `Your Trip to ${preferences?.arrival}`}
              </h1>
              {it.intro && (
                <p className="max-w-xl text-sm sm:text-base font-light line-clamp-2 sm:line-clamp-none" style={{ color: "hsl(158, 25%, 38%)" }}>
                  {it.intro}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">

        {/* Preferences summary */}
        {it.user_preferences_summary && (
          <motion.section {...fadeUp} className="glass-panel p-5 sm:p-7 mb-10 mt-6 sm:mt-8">
            <h2 className="text-sm font-heading mb-4 flex items-center gap-2" style={{ color: "hsl(158, 38%, 22%)" }}>
              <Users className="w-4 h-4 text-primary" /> Your Preferences
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {Object.entries(it.user_preferences_summary).map(([key, val]: [string, any]) => (
                <div key={key} className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-[10px] sm:text-xs capitalize">{key.replace(/_/g, " ")}</span>
                  <span className="font-semibold text-xs sm:text-sm" style={{ color: "hsl(158, 38%, 20%)" }}>{val}</span>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Quick Book Links */}
        <motion.section {...fadeUp} className="mb-10 sm:mb-12">
          <h2 className="text-base sm:text-lg font-heading mb-3 sm:mb-4 flex items-center gap-2" style={{ color: "hsl(158, 45%, 12%)" }}>
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Quick Book
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Train", Icon: Train, url: LINKS.train },
              { label: "Hotel", Icon: Hotel, url: LINKS.hotel },
              { label: "Bus", Icon: Bus, url: LINKS.bus },
              { label: "Flight", Icon: Plane, url: LINKS.flight },
              { label: "Cab", Icon: Car, url: LINKS.cab },
              { label: "Maps", Icon: Navigation, url: LINKS.maps },
            ].map((link) => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="booking-chip">
                <link.Icon className="w-3.5 h-3.5" />
                {link.label}
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            ))}
          </div>
        </motion.section>

        {/* Destination Gallery */}
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
          <motion.section {...fadeUp} className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-heading mb-5 flex items-center gap-2 sm:gap-3" style={{ color: "hsl(158, 45%, 12%)" }}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
                <Hotel className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              Hotel Options
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {it.hotels.map((hotel: any, i: number) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="prism-card p-4 sm:p-5 flex flex-col">
                  {/* Hotel photo */}
                  <div className="h-28 sm:h-32 rounded-xl overflow-hidden mb-3 -mx-1">
                    <img
                      src={getDestPhoto(`hotel-${hotel.name || "resort"}-india`, i, 600, 300)}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/hotel${i}/600/300`; }}
                    />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                      hotel.tier === "Low" ? "bg-primary/10 text-primary" :
                      hotel.tier === "Mid" ? "bg-accent/20 text-accent-foreground" :
                      "bg-secondary/10 text-secondary"
                    }`}>{hotel.tier}</span>
                    <span className="font-bold text-sm text-primary tabular-nums">{formatINR(hotel.price_per_night)}<span className="text-[10px] text-muted-foreground font-normal">/night</span></span>
                  </div>
                  <h3 className="font-heading text-sm mb-1" style={{ color: "hsl(158, 45%, 12%)" }}>{hotel.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 flex-1 leading-relaxed">{hotel.description}</p>
                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    {hotel.distance_station && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 flex-shrink-0 text-primary" /> {hotel.distance_station}
                      </p>
                    )}
                    {hotel.breakfast_included && (
                      <p className="flex items-center gap-1.5 text-primary font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Breakfast included
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 mt-auto pt-3 border-t border-border/30">
                    {hotel.maps_url && (
                      <a href={hotel.maps_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1">
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
          <motion.section {...fadeUp} className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-heading mb-5 flex items-center gap-2 sm:gap-3" style={{ color: "hsl(158, 45%, 12%)" }}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
                <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              Food & Restaurants
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {it.restaurants.map((r: any, i: number) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-panel p-4 sm:p-5 hover-lift">
                  <div className="flex items-start justify-between mb-1.5 gap-2">
                    <h4 className="font-heading text-sm sm:text-base leading-tight" style={{ color: "hsl(158, 45%, 12%)" }}>{r.name}</h4>
                    <span className="text-[10px] px-2 py-1 rounded-full font-semibold flex-shrink-0"
                      style={{ background: "hsla(158, 42%, 38%, 0.10)", color: "hsl(158, 42%, 30%)" }}>
                      {r.meal}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{r.reason}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.near_landmark}</span>
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
          <motion.section {...fadeUp} className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-heading mb-5 flex items-center gap-2 sm:gap-3" style={{ color: "hsl(158, 45%, 12%)" }}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              Budget Breakdown
            </h2>
            <div className="glass-panel p-5 sm:p-7">
              {it.budget_breakdown.items?.map((item: any) => (
                <BudgetRow key={item.label} label={item.label} amount={item.amount} />
              ))}
              {it.budget_breakdown.emergency_buffer && (
                <BudgetRow label="Emergency Buffer (10%)" amount={it.budget_breakdown.emergency_buffer} />
              )}
              <BudgetRow label="Total Estimated" amount={it.budget_breakdown.total_estimated} isTotal />
              {it.budget_breakdown.savings_message && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-2.5 mt-4 p-3.5 rounded-2xl"
                  style={{ background: "hsla(158, 42%, 38%, 0.08)", border: "1px solid hsla(158, 42%, 50%, 0.20)" }}>
                  <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-primary flex-1">{it.budget_breakdown.savings_message}</span>
                  {it.budget_breakdown.percent_used && (
                    <span className="font-bold text-sm text-primary flex-shrink-0">{it.budget_breakdown.percent_used}</span>
                  )}
                </motion.div>
              )}
            </div>
          </motion.section>
        )}

        {/* Travel Tips */}
        {it.travel_tips?.length > 0 && (
          <motion.section {...fadeUp} className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-heading mb-5 flex items-center gap-2 sm:gap-3" style={{ color: "hsl(158, 45%, 12%)" }}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              Travel Tips
            </h2>
            <div className="glass-panel p-5 sm:p-7 space-y-3">
              {it.travel_tips.map((tip: string, i: number) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: "hsl(158, 25%, 28%)" }}>
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Packing checklist */}
        {it.packing_checklist?.length > 0 && (
          <motion.section {...fadeUp} className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-heading mb-5 flex items-center gap-2 sm:gap-3" style={{ color: "hsl(158, 45%, 12%)" }}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              Packing Checklist
            </h2>
            <div className="glass-panel p-5 sm:p-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {it.packing_checklist.map((item: string, i: number) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-2.5 text-sm py-1"
                    style={{ color: "hsl(158, 25%, 28%)" }}>
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
          <motion.section {...fadeUp} className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-heading mb-5 flex items-center gap-2 sm:gap-3" style={{ color: "hsl(158, 45%, 12%)" }}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              Trip Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Nights", value: it.trip_summary.total_nights, Icon: Clock },
                { label: "Transport", value: it.trip_summary.transport_percent, Icon: Train },
                { label: "Stay", value: it.trip_summary.stay_percent, Icon: Hotel },
                { label: "Food", value: it.trip_summary.food_percent, Icon: Utensils },
              ].map((s) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="prism-card p-4 sm:p-5 text-center">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2.5"
                    style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>
                    <s.Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">{s.label}</div>
                  <div className="font-heading text-sm sm:text-base font-bold text-primary tabular-nums">{s.value}</div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Closing note */}
        {it.closing_note && (
          <motion.section {...fadeUp} className="mb-12 sm:mb-16">
            <div className="prism-card p-6 sm:p-10 text-center">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>
                <Star className="w-5 h-5 text-primary" />
              </div>
              <p className="text-base sm:text-lg font-heading italic leading-relaxed max-w-2xl mx-auto"
                style={{ color: "hsl(158, 35%, 25%)" }}>
                "{it.closing_note}"
              </p>
            </div>
          </motion.section>
        )}

        {/* Help */}
        <motion.section {...fadeUp} className="mb-20 sm:mb-24">
          <div className="glass-panel p-6 sm:p-8 text-center">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-heading mb-2" style={{ color: "hsl(158, 45%, 12%)" }}>Need Help?</h2>
            <p className="text-muted-foreground text-sm mb-5">Our travel experts are here for you 24/7</p>
            <a href="mailto:support@krotravel.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm btn-primary">
              <ArrowRight className="w-4 h-4" /> Contact Support
            </a>
          </div>
        </motion.section>
      </div>

      <Footer />
    </div>
  );
};

export default PaidItinerary;
