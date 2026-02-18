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

// Reliable Unsplash-source images (no API key needed)
const DEST_IMAGE_KEYWORDS: Record<string, string[]> = {
  default: ["travel", "landscape", "nature", "mountain", "ocean", "temple", "market", "hotel", "food", "street"],
};

const getDestPhoto = (query: string, index: number, w = 800, h = 600) => {
  const cleanQuery = query.replace(/[^a-zA-Z\s]/g, "").trim().split(" ").slice(0, 2).join(",") || "travel";
  return `https://source.unsplash.com/${w}x${h}/?${encodeURIComponent(cleanQuery)}&sig=${index + 1}`;
};

// Safe INR formatter — correctly handles AI-returned cost strings
const formatINR = (val: any): string => {
  if (val === null || val === undefined || val === "") return "—";
  const str = String(val).trim();

  // 1. Handle "Free" / "Included" / percent strings — return as-is
  if (/^free$/i.test(str) || /included/i.test(str) || /%/.test(str)) return str;

  // 2. If already a clean ₹ range like "₹1,200 – ₹2,500", return as-is
  if (/^₹[\d,]+\s*[-–]\s*₹[\d,]+$/.test(str)) return str;

  // 3. Extract the FIRST continuous numeric run after an optional ₹ sign
  //    This prevents "₹3000 (for 2 people)" → 30002 bug
  //    Regex: optional ₹, then optional comma-formatted number
  const match = str.match(/₹?\s*([\d,]+)/);
  if (!match) return str; // no number found, return original

  // Remove commas, parse
  const digits = match[1].replace(/,/g, "");
  const num = parseInt(digits, 10);
  if (isNaN(num) || num === 0) return "—";
  return "₹" + num.toLocaleString("en-IN");
};

// Parse a cost value to integer safely — only takes the FIRST number
const parseCostInt = (val: any): number => {
  if (!val) return 0;
  const str = String(val).trim();
  if (/^free$/i.test(str) || /included/i.test(str)) return 0;
  const match = str.match(/[\d,]+/);
  if (!match) return 0;
  const n = parseInt(match[0].replace(/,/g, ""), 10);
  return isNaN(n) ? 0 : n;
};

type ActivityPhoto = { id: string; storage_path: string; place_name: string };

const PHOTO_LABELS = ["Landmark", "Nature", "Temple", "Street Food", "Market", "Landscape"];

// ─── Destination Photo Gallery (Swipeable on mobile) ──────────────────────
const DestinationGallery = ({ destination }: { destination: string }) => {
  const [active, setActive] = useState<number | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [dragStart, setDragStart] = useState(0);

  const getImgSrc = (label: string, i: number, w: number, h: number) => {
    if (imgErrors[i]) return `https://picsum.photos/seed/${destination.toLowerCase()}${i}/${w}/${h}`;
    return `https://picsum.photos/seed/${encodeURIComponent(destination.toLowerCase() + label.toLowerCase())}/${w}/${h}`;
  };

  const goPrev = () => setActive(v => v !== null ? (v - 1 + PHOTO_LABELS.length) % PHOTO_LABELS.length : null);
  const goNext = () => setActive(v => v !== null ? (v + 1) % PHOTO_LABELS.length : null);

  return (
    <motion.section {...fadeUp} className="mb-10 sm:mb-14">
      <div className="flex items-center justify-between mb-4 sm:mb-5 gap-3">
        <h2 className="text-lg sm:text-xl font-heading flex items-center gap-2" style={{ color: "hsl(158, 45%, 12%)" }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
            <ImageIcon className="w-4 h-4 text-primary" />
          </div>
          {destination} in pictures
        </h2>
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(destination + " india photos")}&tbm=isch`}
          target="_blank" rel="noopener noreferrer"
          className="booking-chip text-xs flex-shrink-0"
        >
          Google Images <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Mobile: horizontal swipeable strip */}
      <div className="sm:hidden overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        <motion.div
          className="flex gap-2.5"
          style={{ width: `${PHOTO_LABELS.length * 72}vw` }}
          drag="x"
          dragConstraints={{ right: 0, left: -(PHOTO_LABELS.length - 1.4) * 72 * 3.6 }}
          dragElastic={0.08}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
          onDragStart={(_, info) => setDragStart(info.point.x)}
          onDragEnd={(_, info) => {
            const delta = info.point.x - dragStart;
            if (Math.abs(delta) < 10) return; // it's a tap
          }}
        >
          {PHOTO_LABELS.map((label, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.93 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileTap={{ scale: 0.97 }}
              className="dest-photo-card flex-shrink-0 cursor-pointer"
              style={{ width: "68vw", height: "clamp(180px, 50vw, 240px)" }}
              onClick={() => setActive(i)}
            >
              <img
                src={getImgSrc(label, i, 480, 320)}
                alt={`${destination} ${label}`}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={() => setImgErrors(prev => ({ ...prev, [i]: true }))}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                <span className="text-white text-xs font-bold">{label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <div className="flex justify-center gap-1.5 mt-3">
          {PHOTO_LABELS.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all" style={{ background: i === 0 ? "hsl(158,42%,40%)" : "hsla(158,42%,40%,0.25)" }} />
          ))}
        </div>
      </div>

      {/* Desktop: masonry grid */}
      <div className="hidden sm:grid grid-cols-3 gap-2">
        {PHOTO_LABELS.map((label, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="dest-photo-card cursor-pointer"
            style={{ height: i === 0 ? "clamp(200px, 28vw, 260px)" : "clamp(110px, 14vw, 140px)" }}
            onClick={() => setActive(i)}
          >
            <img
              src={getImgSrc(label, i, i === 0 ? 600 : 400, i === 0 ? 500 : 300)}
              alt={`${destination} ${label}`}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={() => setImgErrors(prev => ({ ...prev, [i]: true }))}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-white text-xs font-semibold">{label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox with swipe to navigate */}
      <AnimatePresence>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg px-4 py-8"
            onClick={() => setActive(null)}
          >
            <motion.div
              key={active}
              initial={{ scale: 0.88, opacity: 0, x: 40 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.92, opacity: 0, x: -40 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) goNext();
                else if (info.offset.x > 60) goPrev();
              }}
              className="relative max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={getImgSrc(PHOTO_LABELS[active], active, 1200, 700)}
                alt={`${destination} ${PHOTO_LABELS[active]}`}
                className="w-full object-cover max-h-[80vh] select-none"
                draggable={false}
              />
              {/* Navigation arrows */}
              <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                <button onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); goNext(); }}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button onClick={() => setActive(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent">
                <span className="text-white/90 text-xs font-semibold">{PHOTO_LABELS[active]}</span>
                <span className="text-white/50 text-xs ml-2">{active + 1} / {PHOTO_LABELS.length}</span>
                <p className="text-white/40 text-[10px] mt-0.5">Swipe left/right to navigate</p>
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
    return sum + parseCostInt(act.cost);
  }, 0) || 0;

  return (
    <motion.section {...fadeUp} className="mb-10 sm:mb-14">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-lg sm:text-xl font-heading flex items-center gap-2" style={{ color: "hsl(158, 45%, 12%)" }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          Day-by-Day Journey
        </h2>
        <span className="text-xs text-muted-foreground px-3 py-1.5 rounded-full glass-panel">{days.length} days</span>
      </div>

      {/* Scrollable day tabs */}
      <div ref={tabsRef} className="flex gap-2 overflow-x-auto pb-3 mb-4 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
        {days.map((d: any, i: number) => {
          const rawLabel = d.day_label || "";
          const label = rawLabel.split(/[–-]/).pop()?.trim() || d.theme || "";
          return (
            <motion.button
              key={i}
              onClick={() => changeDay(i)}
              whileTap={{ scale: 0.95 }}
              className="snap-start flex-shrink-0 flex flex-col items-center gap-0.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-300 border min-w-[60px]"
              style={activeDay === i ? {
                background: "linear-gradient(135deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))",
                boxShadow: "0 4px 16px hsla(158, 42%, 36%, 0.35)",
                color: "white",
                border: "1px solid transparent",
              } : {
                background: "hsla(148, 40%, 98%, 0.50)",
                backdropFilter: "blur(12px)",
                border: "1px solid hsla(148, 35%, 80%, 0.45)",
                color: "hsl(158, 30%, 40%)",
              }}
            >
              <span className="font-bold text-[11px]">D{i + 1}</span>
              {label && <span className="text-[9px] opacity-70 truncate max-w-[52px]">{label}</span>}
            </motion.button>
          );
        })}
      </div>

      {/* Active day card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          className="prism-card overflow-hidden"
        >
          {/* Day header */}
          <div className="p-4 sm:p-5 border-b border-border/25"
            style={{ background: "linear-gradient(135deg, hsla(148, 45%, 98%, 0.55) 0%, hsla(155, 40%, 95%, 0.35) 100%)" }}>

            <div className="rounded-xl overflow-hidden mb-4 relative" style={{ height: "clamp(130px, 28vw, 200px)" }}>
              <img
                src={`https://source.unsplash.com/900x350/?${encodeURIComponent((day?.theme || "travel landscape").split(" ").slice(0, 2).join(","))}&sig=${activeDay + 50}`}
                alt={day?.day_label}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/day${activeDay + 1}/900/350`; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-white font-heading text-sm sm:text-base font-bold leading-tight truncate">{day?.day_label}</h3>
                  {day?.theme && <p className="text-white/75 text-[11px] italic mt-0.5 truncate">{day.theme}</p>}
                </div>
                {dayCost > 0 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
                    style={{ background: "hsla(0,0%,0%,0.50)", backdropFilter: "blur(8px)", color: "white" }}>
                    <IndianRupee className="w-3 h-3" />
                    {dayCost.toLocaleString("en-IN")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="p-3 sm:p-4 space-y-2">
            {day?.activities?.map((act: any, ai: number) => {
              const actKey = `${activeDay}-${ai}`;
              const actPhotos = photos.filter(p => p.place_name === act.activity);
              const costNum = parseCostInt(act.cost);

              return (
                <motion.div
                  key={actKey}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ai * 0.04 }}
                  className="rounded-xl overflow-hidden"
                  style={{ background: "hsla(148, 40%, 98%, 0.65)", border: "1px solid hsla(148, 35%, 82%, 0.45)" }}
                >
                  <div className="flex items-start gap-2.5 p-3 sm:p-3.5">
                    <div className="flex-shrink-0 flex flex-col items-center mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <div className="w-px flex-1 bg-border/40 my-0.5" style={{ minHeight: "16px" }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {act.time && (
                            <span className="text-[10px] font-bold tracking-wide text-primary/80 block mb-0.5">{act.time}</span>
                          )}
                          <p className="font-semibold text-sm leading-snug" style={{ color: "hsl(158, 45%, 12%)" }}>{act.activity}</p>
                          {act.note && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{act.note}</p>}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {tripId && userId && (
                            <>
                              <input
                                ref={el => { fileRefs.current[actKey] = el; }}
                                type="file" multiple accept="image/*" className="hidden"
                                onChange={(e) => handleUpload(e, act.activity)}
                              />
                              <button
                                onClick={e => { e.stopPropagation(); fileRefs.current[actKey]?.click(); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-all"
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
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-all"
                              style={{ background: "hsla(158, 42%, 38%, 0.10)", color: "hsl(158, 42%, 40%)" }}>
                              <Navigation className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
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
                        {(act.cost === "Free" || act.cost === "free") && (
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

                  {actPhotos.length > 0 && (
                    <div className="flex gap-2 px-3 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                      {actPhotos.map(p => (
                        <img key={p.id} src={getPhotoUrl(p.storage_path)} alt=""
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-border/50"
                          loading="lazy" />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}

            {dayCost > 0 && (
              <div className="flex items-center justify-between pt-3 mt-1 px-1 border-t border-border/30">
                <span className="text-xs text-muted-foreground">Day {activeDay + 1} estimated spend</span>
                <span className="font-heading font-bold text-sm" style={{ color: "hsl(158, 42%, 38%)" }}>
                  ₹{dayCost.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>

          {/* Prev/Next navigation */}
          <div className="flex items-center gap-3 px-4 pb-4">
            <button
              onClick={() => changeDay(Math.max(0, activeDay - 1))}
              disabled={activeDay === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium btn-ghost-glass disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <div className="flex-1 flex items-center justify-center gap-1.5">
              {days.map((_, i) => (
                <button key={i} onClick={() => changeDay(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === activeDay ? "16px" : "6px",
                    height: "6px",
                    background: i === activeDay ? "hsl(158, 42%, 40%)" : "hsl(148, 25%, 78%)",
                  }} />
              ))}
            </div>
            <button
              onClick={() => changeDay(Math.min(days.length - 1, activeDay + 1))}
              disabled={activeDay === days.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium btn-primary disabled:opacity-40 disabled:pointer-events-none"
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
  // Strip leading emoji from AI-generated labels for clean display
  const cleanLabel = label.replace(/^[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]+\s*/gu, "").trim();
  const display = formatINR(amount);
  return (
    <div className={`flex items-center justify-between py-3 gap-4 ${isTotal ? "border-t-2 border-primary/20 mt-2 pt-4" : "border-b border-border/25 last:border-0"}`}>
      <span className={`${isTotal ? "font-heading text-base" : "text-sm text-muted-foreground"} flex-1 min-w-0`}
        style={isTotal ? { color: "hsl(158, 45%, 12%)" } : {}}>
        {cleanLabel}
      </span>
      <span className={`font-semibold tabular-nums flex-shrink-0 ${isTotal ? "font-heading text-lg text-primary" : "text-sm"}`}
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
        <div className="relative z-10 pt-24 sm:pt-32 flex flex-col items-center gap-6 px-4 pb-20">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-border/40" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary" />
            </div>
          </div>

          <div className="text-center max-w-xs px-4">
            <h2 className="text-xl sm:text-2xl font-heading mb-2" style={{ color: "hsl(158, 45%, 12%)" }}>
              {regenerating ? "Regenerating your trip" : "Crafting your perfect trip"}
            </h2>
            <p className="text-primary font-medium text-sm mb-1">{progressLabel}</p>
            <p className="text-xs text-muted-foreground">Step {progressStep || 1} of 8 — ~30–60 seconds</p>
          </div>

          <div className="w-full max-w-xs">
            <div className="progress-bar-track">
              <motion.div
                className="progress-bar-fill"
                animate={{ width: `${Math.max(5, (progressStep / 8) * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="w-full max-w-sm space-y-2">
            {PIPELINE_STEPS.map((s) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: s.step <= progressStep ? 1 : 0.3, x: 0 }}
                transition={{ duration: 0.3, delay: s.step * 0.04 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                  s.step < progressStep ? "glass-panel text-primary" :
                  s.step === progressStep ? "prism-card text-primary font-medium" :
                  "text-muted-foreground"
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  {s.step < progressStep
                    ? <CheckCircle2 className="w-4 h-4 text-primary" />
                    : s.step === progressStep
                    ? <s.Icon className="w-4 h-4 text-primary" />
                    : <Clock className="w-4 h-4 opacity-40" />}
                </div>
                <span className="flex-1">{s.label}</span>
                {s.step === progressStep && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm px-4">{error}</p>
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
    <div className="min-h-screen relative" style={{ overflowX: "hidden", maxWidth: "100vw" }}>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-orb-1" style={{ top: "5%", left: "10%", opacity: 0.4 }} />
        <div className="ambient-orb-2" style={{ bottom: "25%", right: "8%", opacity: 0.35 }} />
      </div>
      <Navbar />
      {/* Fixed Action Bar below Navbar */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.35, ease: "easeOut" }}
        className="fixed left-0 right-0 z-40 flex items-center justify-between gap-2 px-3 sm:px-6 py-2"
        style={{
          top: "64px",
          background: "hsla(148, 45%, 98%, 0.88)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: "1px solid hsla(148, 35%, 80%, 0.40)",
          boxShadow: "0 2px 14px hsla(158, 42%, 36%, 0.08)",
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="text-xs sm:text-sm font-semibold truncate" style={{ color: "hsl(158, 45%, 14%)" }}>
            {preferences?.arrival || "Your Trip"}
          </span>
          {it.days?.length && (
            <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
              style={{ background: "hsla(158, 42%, 38%, 0.10)", color: "hsl(158, 42%, 35%)" }}>
              {it.days.length} days
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all disabled:opacity-60"
            style={{
              background: "hsla(148, 40%, 97%, 0.8)",
              border: "1px solid hsla(148, 35%, 75%, 0.55)",
              color: "hsl(158, 42%, 35%)",
            }}
          >
            <RotateCcw className={`w-3 h-3 ${regenerating ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{regenerating ? "Regenerating…" : "Regenerate"}</span>
            <span className="sm:hidden">Retry</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-white disabled:opacity-60 transition-all"
            style={{
              background: "linear-gradient(135deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))",
              boxShadow: "0 2px 8px hsla(158, 42%, 36%, 0.28)",
            }}
          >
            {downloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            <span className="hidden sm:inline">{downloading ? "Generating…" : "Download PDF"}</span>
            <span className="sm:hidden">PDF</span>
          </motion.button>
        </div>
      </motion.div>


      {/* Hero */}
      <section className="relative pt-0">
        <div className="relative overflow-hidden" style={{ height: "clamp(220px, 45vw, 420px)" }}>
          <motion.img
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            src={`https://source.unsplash.com/1400x700/?${encodeURIComponent((preferences?.arrival || "india travel").split(" ").slice(0, 2).join(",") + ",landscape")}&sig=1`}
            alt={preferences?.arrival}
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/seed/travel-india-hero/1400/700"; }}
          />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to top, hsl(148, 35%, 95%) 0%, hsla(148, 35%, 95%, 0.55) 35%, transparent 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6 sm:pb-10">
            <motion.div {...fadeUp} className="max-w-4xl mx-auto">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3"
                style={{ background: "hsla(158, 42%, 38%, 0.88)", color: "white" }}>
                <Star className="w-3 h-3" /> AI-Crafted Itinerary
              </span>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-heading leading-tight mb-2" style={{ color: "hsl(158, 45%, 10%)" }}>
                {it.cover_title || `Your Trip to ${preferences?.arrival}`}
              </h1>
              {it.intro && (
                <p className="max-w-xl text-sm font-light line-clamp-2" style={{ color: "hsl(158, 25%, 38%)" }}>
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
          <motion.section {...fadeUp} className="glass-panel p-4 sm:p-6 mb-8 mt-5">
            <h2 className="text-xs font-heading mb-3 flex items-center gap-2 uppercase tracking-wide" style={{ color: "hsl(158, 38%, 22%)" }}>
              <Users className="w-3.5 h-3.5 text-primary" /> Your Preferences
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(it.user_preferences_summary).map(([key, val]: [string, any]) => (
                <div key={key} className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-[10px] capitalize">{key.replace(/_/g, " ")}</span>
                  <span className="font-semibold text-xs sm:text-sm truncate" style={{ color: "hsl(158, 38%, 20%)" }}>{String(val)}</span>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Quick Book Links */}
        <motion.section {...fadeUp} className="mb-8 sm:mb-10">
          <h2 className="text-base sm:text-lg font-heading mb-3 flex items-center gap-2" style={{ color: "hsl(158, 45%, 12%)" }}>
            <Zap className="w-4 h-4 text-primary" /> Quick Book
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
          <motion.section {...fadeUp} className="mb-10 sm:mb-12">
            <h2 className="text-lg sm:text-xl font-heading mb-4 flex items-center gap-2" style={{ color: "hsl(158, 45%, 12%)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
                <Hotel className="w-4 h-4 text-primary" />
              </div>
              Hotel Options
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {it.hotels.map((hotel: any, i: number) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="prism-card p-4 flex flex-col">
                  <div className="h-28 rounded-xl overflow-hidden mb-3">
                    <img
                      src={`https://source.unsplash.com/600x300/?hotel,${encodeURIComponent(hotel.name?.split(" ")[0] || "resort")}&sig=${i + 20}`}
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
                    <span className="font-bold text-sm text-primary tabular-nums">
                      {formatINR(hotel.price_per_night)}
                      <span className="text-[10px] text-muted-foreground font-normal">/night</span>
                    </span>
                  </div>
                  <h3 className="font-heading text-sm mb-1" style={{ color: "hsl(158, 45%, 12%)" }}>{hotel.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 flex-1 leading-relaxed line-clamp-3">{hotel.description}</p>
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
          <motion.section {...fadeUp} className="mb-10 sm:mb-12">
            <h2 className="text-lg sm:text-xl font-heading mb-4 flex items-center gap-2" style={{ color: "hsl(158, 45%, 12%)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
                <Utensils className="w-4 h-4 text-primary" />
              </div>
              Food & Restaurants
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {it.restaurants.map((r: any, i: number) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-panel p-4 hover-lift">
                  <div className="flex items-start justify-between mb-1.5 gap-2">
                    <h4 className="font-heading text-sm leading-tight" style={{ color: "hsl(158, 45%, 12%)" }}>{r.name}</h4>
                    <span className="text-[10px] px-2 py-1 rounded-full font-semibold flex-shrink-0"
                      style={{ background: "hsla(158, 42%, 38%, 0.10)", color: "hsl(158, 42%, 30%)" }}>
                      {r.meal}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed line-clamp-2">{r.reason}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.near_landmark}</span>
                    {r.type && (
                      <span className="ml-auto px-2 py-0.5 rounded-full"
                        style={{ background: "hsla(148, 35%, 88%, 0.7)", color: "hsl(158, 30%, 38%)" }}>
                        {r.type}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Budget breakdown */}
        {it.budget_breakdown && (
          <motion.section {...fadeUp} className="mb-10 sm:mb-12">
            <h2 className="text-lg sm:text-xl font-heading mb-4 flex items-center gap-2" style={{ color: "hsl(158, 45%, 12%)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
                <Wallet className="w-4 h-4 text-primary" />
              </div>
              Budget Breakdown
            </h2>
            <div className="glass-panel p-4 sm:p-6">
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
          <motion.section {...fadeUp} className="mb-10 sm:mb-12">
            <h2 className="text-lg sm:text-xl font-heading mb-4 flex items-center gap-2" style={{ color: "hsl(158, 45%, 12%)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              Travel Tips
            </h2>
            <div className="glass-panel p-4 sm:p-6 space-y-3">
              {it.travel_tips.map((tip: string, i: number) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
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
          <motion.section {...fadeUp} className="mb-10 sm:mb-12">
            <h2 className="text-lg sm:text-xl font-heading mb-4 flex items-center gap-2" style={{ color: "hsl(158, 45%, 12%)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
                <Package className="w-4 h-4 text-primary" />
              </div>
              Packing Checklist
            </h2>
            <div className="glass-panel p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

        {/* Trip summary stats */}
        {it.trip_summary && (
          <motion.section {...fadeUp} className="mb-10 sm:mb-12">
            <h2 className="text-lg sm:text-xl font-heading mb-4 flex items-center gap-2" style={{ color: "hsl(158, 45%, 12%)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
                <Calendar className="w-4 h-4 text-primary" />
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
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="prism-card p-4 text-center">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>
                    <s.Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-[10px] text-muted-foreground mb-1">{s.label}</div>
                  <div className="font-heading text-sm font-bold text-primary tabular-nums">{s.value || "—"}</div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Closing note */}
        {it.closing_note && (
          <motion.section {...fadeUp} className="mb-10">
            <div className="prism-card p-5 sm:p-7 text-center">
              <Star className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="text-sm sm:text-base leading-relaxed italic" style={{ color: "hsl(158, 30%, 28%)" }}>{it.closing_note}</p>
            </div>
          </motion.section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PaidItinerary;
