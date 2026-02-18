import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Play, Pause, X, Zap, Download, Film, Image as ImageIcon, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TripPhoto {
  id: string;
  storage_path: string;
  place_name: string | null;
}

interface ReelGeneratorProps {
  tripId: string;
  destination: string;
  onClose: () => void;
}

const SLIDE_DURATION = 3000; // ms per slide in preview
const TRANSITIONS = ["fade", "slide", "zoom", "blur"] as const;
type Transition = typeof TRANSITIONS[number];

const REEL_TEMPLATES = [
  {
    id: "cinematic",
    name: "🎬 Cinematic Journey",
    gradient: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    textColor: "#e8f5f0",
    accentColor: "#00e5a0",
    font: "font-heading",
  },
  {
    id: "golden",
    name: "✨ Golden Hour",
    gradient: "linear-gradient(135deg, #f7971e, #ffd200, #f7971e)",
    textColor: "#2d1a00",
    accentColor: "#fff",
    font: "font-heading",
  },
  {
    id: "ocean",
    name: "🌊 Ocean Vibes",
    gradient: "linear-gradient(135deg, #0052d4, #4364f7, #6fb1fc)",
    textColor: "#fff",
    accentColor: "#a8f0ff",
    font: "font-heading",
  },
];

// ─── Single Reel Frame ──────────────────────────────────────────────────────
const ReelFrame = ({
  imgSrc, caption, destination, index, total, template, transition, isActive,
}: {
  imgSrc: string; caption: string; destination: string; index: number; total: number;
  template: typeof REEL_TEMPLATES[0]; transition: Transition; isActive: boolean;
}) => {
  const variants: Record<Transition, any> = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    slide: { initial: { x: 80, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -80, opacity: 0 } },
    zoom: { initial: { scale: 1.2, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.85, opacity: 0 } },
    blur: { initial: { filter: "blur(16px)", opacity: 0 }, animate: { filter: "blur(0px)", opacity: 1 }, exit: { filter: "blur(12px)", opacity: 0 } },
  };
  const v = variants[transition];
  return (
    <motion.div
      key={index}
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
      transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      className="absolute inset-0 w-full h-full"
    >
      {/* Background image with Ken Burns */}
      <motion.img
        src={imgSrc}
        alt={caption}
        className="w-full h-full object-cover"
        initial={{ scale: 1.08 }}
        animate={{ scale: isActive ? 1.0 : 1.08 }}
        transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
      />
      {/* Overlay */}
      <div className="absolute inset-0" style={{ background: template.gradient, opacity: 0.55 }} />
      {/* Top badge */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="absolute top-4 left-4 right-4 flex items-center justify-between"
      >
        <span className="text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md"
          style={{ background: "rgba(0,0,0,0.45)", color: template.accentColor }}>
          📍 {destination}
        </span>
        <span className="text-xs px-2 py-1 rounded-full backdrop-blur-md"
          style={{ background: "rgba(0,0,0,0.35)", color: "rgba(255,255,255,0.7)" }}>
          {index + 1}/{total}
        </span>
      </motion.div>
      {/* Bottom caption */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-12"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.45 }}>
          {caption && (
            <p className="text-white font-semibold text-sm leading-snug mb-1">{caption}</p>
          )}
          {/* Animated accent bar */}
          <motion.div className="h-0.5 rounded-full mt-2"
            style={{ background: template.accentColor }}
            initial={{ width: 0 }}
            animate={{ width: "40%" }}
            transition={{ delay: 0.5, duration: 0.7 }}
          />
          {/* Progress dots */}
          <div className="flex gap-1 mt-2">
            {Array.from({ length: total }).map((_, di) => (
              <motion.div key={di} className="h-1 rounded-full" style={{
                background: di === index ? template.accentColor : "rgba(255,255,255,0.3)",
                width: di === index ? 16 : 4,
                transition: "all 0.3s",
              }} />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
const ReelGenerator = ({ tripId, destination, onClose }: ReelGeneratorProps) => {
  const [step, setStep] = useState<"choose" | "preview" | "done">("choose");
  const [existingPhotos, setExistingPhotos] = useState<TripPhoto[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ file: File; preview: string }[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [template, setTemplate] = useState(REEL_TEMPLATES[0]);
  const [transition, setTransition] = useState<Transition>("zoom");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchExisting();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const fetchExisting = async () => {
    const { data } = await supabase.from("trip_photos")
      .select("id,storage_path,place_name").eq("trip_id", tripId).order("created_at", { ascending: false });
    setExistingPhotos(data || []);
    setLoading(false);
  };

  const getPublicUrl = (path: string) =>
    supabase.storage.from("trip-photos").getPublicUrl(path).data.publicUrl;

  const allImages: { src: string; caption: string }[] = [
    ...existingPhotos
      .filter(p => selectedPhotos.includes(p.id))
      .map(p => ({ src: getPublicUrl(p.storage_path), caption: p.place_name || destination })),
    ...uploadedFiles.map(f => ({ src: f.preview, caption: destination })),
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(f => {
      const preview = URL.createObjectURL(f);
      setUploadedFiles(prev => [...prev, { file: f, preview }]);
    });
  };

  const toggleSelect = (id: string) =>
    setSelectedPhotos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const startPreview = () => {
    if (allImages.length === 0) return;
    setStep("preview");
    setCurrentSlide(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying && step === "preview") {
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => {
          if (prev >= allImages.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, SLIDE_DURATION);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, step, allImages.length]);

  const handleDownload = () => {
    // In production this would encode frames to video; here we download first photo as demo
    const link = document.createElement("a");
    link.href = allImages[0]?.src || "";
    link.download = `${destination}-reel-preview.jpg`;
    link.click();
    setStep("done");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 20 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "hsl(var(--background))", maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(270,60%,45%), hsl(300,55%,35%))" }}>
              <Film className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-heading text-sm" style={{ color: "hsl(158,45%,10%)" }}>30s Reel Generator</p>
              <p className="text-[10px] text-muted-foreground">{destination}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: Choose photos */}
        {step === "choose" && (
          <div className="p-5 space-y-5">
            {/* Template picker */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Choose Style</p>
              <div className="grid grid-cols-3 gap-2">
                {REEL_TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setTemplate(t)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium transition-all border ${template.id === t.id ? "border-primary shadow-md scale-105" : "border-border/30"}`}
                    style={{ background: t.gradient, color: t.textColor }}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Transition picker */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Transition</p>
              <div className="flex gap-2 flex-wrap">
                {TRANSITIONS.map(tr => (
                  <button key={tr} onClick={() => setTransition(tr)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${transition === tr ? "bg-primary text-white" : "glass-panel text-muted-foreground"}`}>
                    {tr}
                  </button>
                ))}
              </div>
            </div>

            {/* Existing photos */}
            {loading ? (
              <div className="text-center text-xs text-muted-foreground py-4">Loading trip photos…</div>
            ) : existingPhotos.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Your Trip Photos</p>
                <div className="grid grid-cols-3 gap-2">
                  {existingPhotos.map(p => (
                    <button key={p.id} onClick={() => toggleSelect(p.id)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedPhotos.includes(p.id) ? "border-primary scale-95 shadow-md" : "border-transparent"}`}>
                      <img src={getPublicUrl(p.storage_path)} alt="" className="w-full h-full object-cover" />
                      {selectedPhotos.includes(p.id) && (
                        <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Upload new photos */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Upload New Photos</p>
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-all flex flex-col items-center gap-2 text-muted-foreground hover:text-primary">
                <Upload className="w-6 h-6" />
                <span className="text-xs font-medium">Tap to upload photos</span>
              </button>
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                      <img src={f.preview} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Generate */}
            <button
              onClick={startPreview}
              disabled={allImages.length === 0}
              className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Sparkles className="w-4 h-4" />
              Generate Reel ({allImages.length} photo{allImages.length !== 1 ? "s" : ""})
            </button>
          </div>
        )}

        {/* STEP 2: Preview reel */}
        {step === "preview" && allImages.length > 0 && (
          <div className="p-5 space-y-4">
            {/* Reel viewport — 9:16 ratio */}
            <div className="relative mx-auto rounded-2xl overflow-hidden bg-black shadow-2xl"
              style={{ width: "100%", aspectRatio: "9/16", maxHeight: "50vh" }}>
              <AnimatePresence mode="wait">
                <ReelFrame
                  key={currentSlide}
                  imgSrc={allImages[currentSlide].src}
                  caption={allImages[currentSlide].caption}
                  destination={destination}
                  index={currentSlide}
                  total={allImages.length}
                  template={template}
                  transition={transition}
                  isActive={isPlaying}
                />
              </AnimatePresence>
              {/* Watermark */}
              <div className="absolute bottom-2 right-3 text-[8px] text-white/40 font-bold tracking-widest">KroTravel</div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-muted-foreground">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setIsPlaying(p => !p)}
                className="flex-1 py-2.5 rounded-xl btn-primary text-sm flex items-center justify-center gap-2">
                {isPlaying ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Play</>}
              </button>
              <button onClick={() => setCurrentSlide(prev => Math.min(allImages.length - 1, prev + 1))}
                className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-muted-foreground">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setStep("choose"); setIsPlaying(false); setCurrentSlide(0); }}
                className="flex-1 py-2.5 rounded-xl btn-ghost-glass text-sm">
                ← Edit
              </button>
              <button onClick={handleDownload}
                className="flex-1 py-2.5 rounded-xl btn-primary text-sm flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Save Reel
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Done */}
        {step === "done" && (
          <div className="p-8 text-center space-y-4">
            <div className="text-5xl">🎬</div>
            <p className="font-heading text-lg" style={{ color: "hsl(158,45%,10%)" }}>Reel Saved!</p>
            <p className="text-sm text-muted-foreground">Share your trip reel on Instagram or WhatsApp stories.</p>
            <button onClick={onClose} className="btn-primary px-8 py-3 text-sm">Done</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ReelGenerator;
