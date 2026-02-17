import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Clock, Wallet, Star, Hotel, Utensils, Bus, Calendar,
  Lightbulb, ArrowRight, ExternalLink, Loader2, Package, Users,
  CheckCircle2, AlertCircle, Download, RotateCcw, Train, Car, Plane
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const AFFILIATE_LINKS = {
  train: "https://www.irctc.co.in",
  hotel: "https://www.booking.com",
  bus: "https://www.redbus.in",
  flight: "https://www.makemytrip.com/flights",
  cab: "https://www.uber.com",
};

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
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("tripPreferences");
    if (!stored) {
      navigate("/plan");
      return;
    }
    const prefs = JSON.parse(stored);
    setPreferences(prefs);

    // Check for saved itinerary (viewing from My Trips)
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
      if (regenerateId) {
        setSavedId(regenerateId);
        sessionStorage.removeItem("regenerateTrip");
      }
      generateItinerary(prefs);
    }
  }, []);

  const [progressStep, setProgressStep] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Starting...");

  const PIPELINE_STEPS = [
    { step: 1, label: "Validating preferences...", icon: "✅" },
    { step: 2, label: "Analyzing travel context...", icon: "🧠" },
    { step: 3, label: "Finding best transport options...", icon: "🚆" },
    { step: 4, label: "Recalculating budget...", icon: "💰" },
    { step: 5, label: "Searching for best hotels...", icon: "🏨" },
    { step: 6, label: "Building day-by-day itinerary...", icon: "📋" },
    { step: 7, label: "Adding restaurants & tips...", icon: "🍽️" },
    { step: 8, label: "Assembling final itinerary...", icon: "✨" },
  ];

  const generateItinerary = async (prefs: any) => {
    setProgressStep(0);
    setProgressLabel("Starting...");

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-paid-itinerary`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
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

          let eventType = "message";
          let eventData = "";
          for (const line of chunk.split("\n")) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim();
            if (line.startsWith("data: ")) eventData = line.slice(6).trim();
          }

          if (!eventData) continue;

          try {
            const parsed = JSON.parse(eventData);

            if (eventType === "progress") {
              setProgressStep(parsed.step);
              setProgressLabel(parsed.label);
            } else if (eventType === "complete") {
              if (parsed.success && parsed.data) {
                setItinerary(parsed.data);
                await saveItinerary(parsed.data, prefs);
              } else {
                throw new Error(parsed.error || "Generation failed");
              }
            } else if (eventType === "error") {
              throw new Error(parsed.message || "Generation failed");
            }
          } catch (parseErr: any) {
            if (parseErr.message && !parseErr.message.includes("JSON")) {
              throw parseErr;
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveItinerary = async (itineraryData: any, prefs: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (savedId) {
      // Update existing (regeneration)
      const { data: existing } = await supabase
        .from("saved_itineraries")
        .select("regenerate_count")
        .eq("id", savedId)
        .single();

      await supabase.from("saved_itineraries").update({
        itinerary_data: itineraryData,
        preferences: prefs,
        regenerate_count: (existing?.regenerate_count || 0) + 1,
      }).eq("id", savedId);
    } else {
      // Insert new
      const { data: inserted } = await supabase.from("saved_itineraries").insert({
        user_id: user.id,
        preferences: prefs,
        itinerary_data: itineraryData,
        destination: prefs.arrival || "Unknown",
        status: "generated",
      }).select("id").single();

      if (inserted) setSavedId(inserted.id);

      // Auto-create departure reminder
      if (prefs.departureDate) {
        const depDate = new Date(prefs.departureDate);
        await supabase.from("notifications").insert({
          user_id: user.id,
          trip_id: inserted?.id,
          type: "departure_reminder",
          title: `🧳 Trip to ${prefs.arrival} tomorrow!`,
          message: `Your trip starts ${depDate.toLocaleDateString()}. Check your itinerary!`,
          scheduled_for: new Date(depDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }
  };

  const handleRegenerate = async () => {
    if (!preferences) return;
    setRegenerating(true);
    setLoading(true);
    setError("");
    setItinerary(null);
    await generateItinerary(preferences);
    setRegenerating(false);
    toast({ title: "Itinerary regenerated!" });
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setDownloading(true);
    
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#F8F6F3",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      while (position < pdfHeight) {
        if (position > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, -position, pdfWidth, pdfHeight);
        position += pageHeight;
      }

      pdf.save(`KroTravel_${preferences?.arrival || "Itinerary"}.pdf`);
      toast({ title: "PDF downloaded!" });
    } catch (err) {
      console.error("PDF error:", err);
      toast({ title: "PDF download failed", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 flex flex-col items-center justify-center gap-6 px-4 pb-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-heading mb-2">
              {regenerating ? "Regenerating Your Trip" : "Crafting Your Perfect Trip"}
            </h2>
            <p className="text-muted-foreground mb-1">{progressLabel}</p>
            <p className="text-xs text-muted-foreground">Step {progressStep || 1} of 8 — This takes about 30-60 seconds</p>
          </div>
          {/* Pipeline Steps */}
          <div className="w-full max-w-md space-y-2 mt-4">
            {PIPELINE_STEPS.map((s) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: s.step <= progressStep ? 1 : 0.3,
                  x: 0,
                }}
                transition={{ duration: 0.3, delay: s.step <= progressStep ? 0 : 0.1 }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                  s.step < progressStep
                    ? "bg-primary/10 text-primary"
                    : s.step === progressStep
                    ? "bg-primary/20 text-primary font-medium border border-primary/30"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                <span className="text-lg w-6 text-center">
                  {s.step < progressStep ? "✅" : s.step === progressStep ? s.icon : "⏳"}
                </span>
                <span className="flex-1">{s.label}</span>
                {s.step === progressStep && (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center px-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-heading mb-3">Generation Failed</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">{error}</p>
          <button onClick={() => { setError(""); setLoading(true); generateItinerary(preferences); }} className="btn-primary px-8 py-3">
            Try Again
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!itinerary) return null;

  const it = itinerary;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Sticky Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-2 bg-card/95 backdrop-blur-md border border-border rounded-full px-4 py-2 shadow-lg">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? "Generating..." : "Download PDF"}
        </button>
        <button
          onClick={handleRegenerate}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Regenerate
        </button>
      </div>

      <div ref={contentRef}>
        {/* Cover */}
        <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Star className="w-3 h-3" /> Personalized Itinerary
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading leading-tight mb-4">
              {it.cover_title || `Your Trip to ${preferences?.arrival}`}
            </h1>
            {it.intro && <p className="text-muted-foreground max-w-xl text-lg">{it.intro}</p>}
          </motion.div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* User Preferences Summary */}
          {it.user_preferences_summary && (
            <motion.section {...fadeUp} className="warm-card rounded-2xl p-6 sm:p-8 mb-12">
              <h2 className="text-lg font-heading mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Your Preferences
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                {Object.entries(it.user_preferences_summary).map(([key, val]: [string, any]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="font-medium text-foreground">{val}</span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Affiliate Booking Quick Links */}
          <motion.section {...fadeUp} className="mb-12">
            <h2 className="text-lg font-heading mb-4 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-primary" /> Quick Book
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "🚆 Book Train", url: AFFILIATE_LINKS.train, icon: Train },
                { label: "🏨 Book Hotel", url: AFFILIATE_LINKS.hotel, icon: Hotel },
                { label: "🚌 Book Bus", url: AFFILIATE_LINKS.bus, icon: Bus },
                { label: "✈️ Book Flight", url: AFFILIATE_LINKS.flight, icon: Plane },
                { label: "🚕 Book Cab", url: AFFILIATE_LINKS.cab, icon: Car },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-card text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  {link.label}
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </a>
              ))}
            </div>
          </motion.section>

          {/* Day-wise Itinerary */}
          {it.days?.map((day: any, di: number) => (
            <motion.section key={di} {...fadeUp} className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-heading mb-6 flex items-center gap-3">
                <span className="text-2xl">{day.emoji || "📍"}</span> {day.day_label}
              </h2>
              <div className="space-y-3">
                {day.activities?.map((act: any, ai: number) => (
                  <motion.div
                    key={ai}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: ai * 0.05 }}
                    className="warm-card rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3"
                  >
                    <div className="flex items-center gap-2 sm:w-24 flex-shrink-0">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-mono text-sm font-semibold text-primary">{act.time}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-foreground">{act.activity}</p>
                          {act.note && <p className="text-sm text-muted-foreground mt-1">{act.note}</p>}
                        </div>
                        {act.maps_url && (
                          <a href={act.maps_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex-shrink-0">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {act.duration && (
                          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{act.duration}</span>
                        )}
                        {act.cost && act.cost !== "₹0" && (
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{act.cost}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}

          {/* Hotels */}
          {it.hotels?.length > 0 && (
            <motion.section {...fadeUp} className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-heading mb-6 flex items-center gap-3">
                <Hotel className="w-7 h-7 text-primary" /> Hotel Options
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {it.hotels.map((hotel: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="warm-card-hover rounded-2xl p-6 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide ${
                        hotel.tier === "Low" ? "bg-primary/10 text-primary" :
                        hotel.tier === "Mid" ? "bg-accent/20 text-accent-foreground" :
                        "bg-secondary text-secondary-foreground"
                      }`}>
                        {hotel.tier}
                      </span>
                      <span className="font-heading text-primary">{hotel.price_per_night}</span>
                    </div>
                    <h3 className="font-heading text-lg mb-2">{hotel.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 flex-1">{hotel.description}</p>
                    <div className="space-y-1 text-xs text-muted-foreground mb-3">
                      <p>📍 Station: {hotel.distance_station}</p>
                      <p>🗺️ Tourist hub: {hotel.distance_hub}</p>
                      {hotel.breakfast_included && (
                        <p className="text-primary font-medium">✅ Breakfast included</p>
                      )}
                    </div>
                    <p className="text-sm italic text-foreground/70 mb-3">{hotel.why_choose}</p>
                    <div className="flex gap-2 mt-auto">
                      {hotel.maps_url && (
                        <a href={hotel.maps_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Maps
                        </a>
                      )}
                      <a href={AFFILIATE_LINKS.hotel} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 ml-auto">
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
              <h2 className="text-2xl sm:text-3xl font-heading mb-6 flex items-center gap-3">
                <Utensils className="w-7 h-7 text-primary" /> Restaurant Suggestions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {it.restaurants.map((r: any, i: number) => (
                  <div key={i} className="warm-card rounded-xl p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-heading">{r.name}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{r.meal}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.reason}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /> Near {r.near_landmark}
                      <span className="ml-auto px-2 py-0.5 rounded bg-muted">{r.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Budget Breakdown */}
          {it.budget_breakdown && (
            <motion.section {...fadeUp} className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-heading mb-6 flex items-center gap-3">
                <Wallet className="w-7 h-7 text-primary" /> Budget Breakdown
              </h2>
              <div className="warm-card rounded-2xl p-6 sm:p-8">
                {it.budget_breakdown.items?.map((item: any) => (
                  <div key={item.label} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground">{item.amount}</span>
                  </div>
                ))}
                {it.budget_breakdown.emergency_buffer && (
                  <div className="flex justify-between items-center py-3 border-b border-border text-amber-600">
                    <span>🛡️ Emergency Buffer (10%)</span>
                    <span className="font-semibold">{it.budget_breakdown.emergency_buffer}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-primary/20">
                  <span className="font-heading text-lg">Total Estimated</span>
                  <span className="font-heading text-lg text-primary">{it.budget_breakdown.total_estimated}</span>
                </div>
                <div className="flex items-center justify-between mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-primary font-medium">{it.budget_breakdown.savings_message}</span>
                  </div>
                  <span className="text-primary font-bold">{it.budget_breakdown.percent_used} used</span>
                </div>
              </div>
            </motion.section>
          )}

          {/* Route Overview */}
          {it.route_overview && (
            <motion.section {...fadeUp} className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-heading mb-4 flex items-center gap-3">
                <Bus className="w-7 h-7 text-primary" /> Route Overview
              </h2>
              <div className="warm-card rounded-2xl p-6 text-foreground/80 leading-relaxed">
                {it.route_overview}
              </div>
            </motion.section>
          )}

          {/* Travel Tips */}
          {it.travel_tips?.length > 0 && (
            <motion.section {...fadeUp} className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-heading mb-6 flex items-center gap-3">
                <Lightbulb className="w-7 h-7 text-primary" /> Practical Travel Notes
              </h2>
              <div className="warm-card rounded-2xl p-6 sm:p-8">
                <ul className="space-y-3">
                  {it.travel_tips.map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-foreground/80">
                      <span className="text-primary">✅</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.section>
          )}

          {/* Packing Checklist */}
          {it.packing_checklist?.length > 0 && (
            <motion.section {...fadeUp} className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-heading mb-6 flex items-center gap-3">
                <Package className="w-7 h-7 text-primary" /> Packing Checklist
              </h2>
              <div className="warm-card rounded-2xl p-6 sm:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {it.packing_checklist.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* Trip Summary */}
          {it.trip_summary && (
            <motion.section {...fadeUp} className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-heading mb-6 flex items-center gap-3">
                <Calendar className="w-7 h-7 text-primary" /> Trip Summary
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Nights", value: it.trip_summary.total_nights, icon: "🌙" },
                  { label: "Transport", value: it.trip_summary.transport_percent, icon: "🚆" },
                  { label: "Stay", value: it.trip_summary.stay_percent, icon: "🏨" },
                  { label: "Food", value: it.trip_summary.food_percent, icon: "🍽️" },
                ].map((s) => (
                  <div key={s.label} className="warm-card rounded-xl p-5 text-center">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="font-heading text-lg text-primary">{s.value}</div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Closing Note */}
          {it.closing_note && (
            <motion.section {...fadeUp} className="mb-16">
              <div className="warm-card rounded-2xl p-8 sm:p-10 text-center glow-primary">
                <p className="text-lg font-heading italic text-foreground/80 leading-relaxed max-w-2xl mx-auto">
                  {it.closing_note}
                </p>
              </div>
            </motion.section>
          )}

          {/* Contact */}
          <motion.section {...fadeUp} className="mb-20">
            <div className="warm-card rounded-2xl p-8 text-center">
              <h2 className="text-xl font-heading mb-2">Need Help?</h2>
              <p className="text-muted-foreground mb-4">Our travel experts are here for you</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm">
                <a href="mailto:support@krotravel.com" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">
                  ✉️ support@krotravel.com
                </a>
              </div>
              <p className="text-sm text-muted-foreground mt-4 italic">Share feedback to get your next itinerary free ✨</p>
            </div>
          </motion.section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaidItinerary;
