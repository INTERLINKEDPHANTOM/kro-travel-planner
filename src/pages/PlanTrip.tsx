import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, Users, Wallet, Plane, Utensils, FileText,
  ArrowRight, ArrowLeft, Plus, X, Check
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const travelTypes = [
  { value: "leisure", label: "🌴 Leisure", desc: "Relax & unwind" },
  { value: "adventure", label: "🏔️ Adventure", desc: "Thrills & trails" },
  { value: "corporate", label: "💼 Corporate", desc: "Work-ready travel" },
  { value: "medical", label: "🏥 Medical", desc: "Healthcare travel" },
  { value: "religious", label: "🕉️ Spiritual", desc: "Sacred journeys" },
];

const transportModes = [
  { value: "flight", label: "✈️ Flight", desc: "Fastest option" },
  { value: "train", label: "🚆 Train", desc: "Scenic & affordable" },
  { value: "bus", label: "🚌 Bus", desc: "Budget friendly" },
  { value: "own", label: "🚗 Own Car", desc: "Maximum freedom" },
  { value: "public", label: "🚇 Public", desc: "Local experience" },
  { value: "mixed", label: "🔀 Mixed", desc: "Best of all" },
];

const foodPrefs = [
  { value: "vegetarian", label: "🥗 Vegetarian", icon: "🥗" },
  { value: "non-vegetarian", label: "🍖 Non-Veg", icon: "🍖" },
  { value: "mixed", label: "🍽️ Mixed", icon: "🍽️" },
];

const travelPersonas = [
  { value: "budget", label: "💰 Budget", desc: "Smart spending, max value" },
  { value: "luxury", label: "✨ Luxury", desc: "Premium comfort" },
  { value: "backpacker", label: "🎒 Backpacker", desc: "Adventure spirit" },
  { value: "spiritual", label: "🕉️ Spiritual", desc: "Inner peace journey" },
  { value: "explorer", label: "🧭 Explorer", desc: "Hidden gems & culture" },
  { value: "family", label: "👨‍👩‍👧 Family", desc: "Kid-friendly & safe" },
];

const STEPS = [
  { id: 1, title: "Where to?", icon: "📍", desc: "Set your route" },
  { id: 2, title: "When & Who", icon: "📅", desc: "Dates & group" },
  { id: 3, title: "Your Budget", icon: "💰", desc: "Money matters" },
  { id: 4, title: "Travel Style", icon: "✨", desc: "Vibe & persona" },
  { id: 5, title: "Details", icon: "📋", desc: "Extras & notes" },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const PlanTrip = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState({
    departure: "",
    arrival: "",
    departureDate: "",
    arrivalDate: "",
    numPeople: 2,
    budgetMin: 5000,
    budgetMax: 20000,
    travelType: "",
    transport: "",
    food: "",
    notes: "",
    persona: "",
    multiCity: [] as string[],
  });
  const [cityInput, setCityInput] = useState("");

  const update = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length));
  };
  const goPrev = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    sessionStorage.setItem("tripPreferences", JSON.stringify(form));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) navigate("/plans");
    else navigate("/auth?redirect=/plans");
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const sliderPercent = (val: number, min: number, max: number) =>
    `${((val - min) / (max - min)) * 100}%`;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-orb-1" style={{ top: "5%", left: "10%" }} />
        <div className="ambient-orb-2" style={{ bottom: "15%", right: "8%" }} />
      </div>

      <Navbar />

      <div className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <p className="section-label mb-3">Trip Planner</p>
            <h1 className="text-4xl sm:text-5xl font-heading mb-3 tracking-tight" style={{ color: "hsl(158, 45%, 10%)" }}>
              Where are you <span className="text-mint-gradient">headed?</span>
            </h1>
            <p className="text-base font-light" style={{ color: "hsl(158, 18%, 48%)" }}>
              Tell us about your dream trip in 5 quick steps
            </p>
          </motion.div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => { setDirection(s.id > step ? 1 : -1); setStep(s.id); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  s.id === step
                    ? "bg-primary text-white shadow-lg scale-105"
                    : s.id < step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted/60 text-muted-foreground"
                }`}
              >
                <span>{s.icon}</span>
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mb-8 px-2">
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Step {step} of {STEPS.length}</span>
              <span>{STEPS[step - 1].desc}</span>
            </div>
          </div>

          {/* Card */}
          <div className="glass-intense p-6 sm:p-10 relative overflow-hidden">
            {/* Inner glow */}
            <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
              style={{ background: "radial-gradient(circle at top right, hsla(152, 60%, 65%, 0.12) 0%, transparent 70%)" }} />

            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              >

                {/* ── STEP 1: Route ── */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-heading mb-6" style={{ color: "hsl(158, 45%, 12%)" }}>
                      📍 Set your route
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "hsl(158, 35%, 28%)" }}>
                          <MapPin className="w-4 h-4" /> From
                        </label>
                        <input
                          className="glass-input w-full px-4 py-3.5 text-sm"
                          placeholder="e.g., New Delhi"
                          value={form.departure}
                          onChange={(e) => update("departure", e.target.value)}
                        />
                      </div>

                      {/* Arrow connector */}
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs font-medium" style={{ color: "hsl(158, 35%, 35%)" }}>
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>to destination</span>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "hsl(158, 35%, 28%)" }}>
                          <MapPin className="w-4 h-4 text-accent" /> To
                        </label>
                        <input
                          className="glass-input w-full px-4 py-3.5 text-sm"
                          placeholder="e.g., Manali, Goa, Jaipur..."
                          value={form.arrival}
                          onChange={(e) => update("arrival", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Multi-city stops */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "hsl(158, 35%, 28%)" }}>
                        🗺️ Add stops <span className="font-normal text-muted-foreground">(optional)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          className="glass-input flex-1 px-4 py-3 text-sm"
                          placeholder="e.g., Shimla"
                          value={cityInput}
                          onChange={(e) => setCityInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && cityInput.trim()) {
                              e.preventDefault();
                              setForm(p => ({ ...p, multiCity: [...p.multiCity, cityInput.trim()] }));
                              setCityInput("");
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (cityInput.trim()) {
                              setForm(p => ({ ...p, multiCity: [...p.multiCity, cityInput.trim()] }));
                              setCityInput("");
                            }
                          }}
                          className="w-11 h-11 rounded-2xl flex items-center justify-center btn-primary text-white flex-shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {form.multiCity.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {form.multiCity.map((city, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                              style={{ background: "hsla(158, 40%, 38%, 0.12)", color: "hsl(158, 40%, 30%)", border: "1px solid hsla(158, 40%, 50%, 0.25)" }}>
                              📍 {city}
                              <button onClick={() => setForm(p => ({ ...p, multiCity: p.multiCity.filter((_, idx) => idx !== i) }))}>
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Dates & People ── */}
                {step === 2 && (
                  <div className="space-y-7">
                    <h2 className="text-2xl font-heading mb-6" style={{ color: "hsl(158, 45%, 12%)" }}>
                      📅 When & with whom?
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "hsl(158, 35%, 28%)" }}>
                          <Calendar className="w-4 h-4" /> Departure
                        </label>
                        <input
                          type="datetime-local"
                          className="glass-input w-full px-4 py-3.5 text-sm"
                          value={form.departureDate}
                          onChange={(e) => update("departureDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "hsl(158, 35%, 28%)" }}>
                          <Calendar className="w-4 h-4" /> Return
                        </label>
                        <input
                          type="datetime-local"
                          className="glass-input w-full px-4 py-3.5 text-sm"
                          value={form.arrivalDate}
                          onChange={(e) => update("arrivalDate", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* People counter */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-4" style={{ color: "hsl(158, 35%, 28%)" }}>
                        <Users className="w-4 h-4" /> Number of travellers
                      </label>
                      <div className="flex items-center gap-6">
                        <button
                          type="button"
                          onClick={() => update("numPeople", Math.max(1, form.numPeople - 1))}
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all"
                          style={{ background: "hsla(148, 40%, 98%, 0.55)", border: "1.5px solid hsla(148, 40%, 72%, 0.45)" }}
                        >
                          −
                        </button>
                        <div className="flex-1 text-center">
                          <div className="text-5xl font-bold" style={{ color: "hsl(158, 42%, 35%)" }}>{form.numPeople}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {form.numPeople === 1 ? "Solo traveller" : form.numPeople <= 2 ? "Couple" : form.numPeople <= 5 ? "Small group" : "Large group"}
                          </div>
                          {/* Mini person icons */}
                          <div className="flex justify-center gap-1 mt-2">
                            {Array.from({ length: Math.min(form.numPeople, 8) }).map((_, i) => (
                              <span key={i} className="text-lg">👤</span>
                            ))}
                            {form.numPeople > 8 && <span className="text-sm text-muted-foreground self-center">+{form.numPeople - 8}</span>}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => update("numPeople", Math.min(20, form.numPeople + 1))}
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all btn-primary"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Transport Mode */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: "hsl(158, 35%, 28%)" }}>
                        <Plane className="w-4 h-4" /> How will you travel?
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {transportModes.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => update("transport", t.value)}
                            className={`persona-card ${form.transport === t.value ? "active" : ""}`}
                          >
                            <div className="text-xl mb-1">{t.label.split(" ")[0]}</div>
                            <div className={`text-sm font-semibold ${form.transport === t.value ? "text-white" : "text-foreground"}`}>
                              {t.label.split(" ").slice(1).join(" ")}
                            </div>
                            <div className={`text-xs mt-0.5 ${form.transport === t.value ? "text-white/70" : "text-muted-foreground"}`}>
                              {t.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Budget ── */}
                {step === 3 && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-heading mb-6" style={{ color: "hsl(158, 45%, 12%)" }}>
                      💰 What's your budget?
                    </h2>

                    {/* Budget display */}
                    <div className="text-center py-6 rounded-2xl glass-panel">
                      <div className="text-xs text-muted-foreground mb-1">Your range</div>
                      <div className="text-4xl font-bold" style={{ color: "hsl(158, 42%, 35%)" }}>
                        ₹{form.budgetMin.toLocaleString("en-IN")}
                        <span className="text-xl text-muted-foreground mx-3">–</span>
                        ₹{form.budgetMax.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">per person, total trip</div>

                      {/* Budget label */}
                      <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
                        style={{ background: "hsla(158, 42%, 38%, 0.12)", color: "hsl(158, 42%, 32%)" }}>
                        {form.budgetMax < 8000 ? "🎒 Backpacker" : form.budgetMax < 15000 ? "💰 Budget Smart" : form.budgetMax < 30000 ? "🌟 Mid-Range" : "✨ Luxury"}
                      </div>
                    </div>

                    {/* Min slider */}
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-3">
                        <span style={{ color: "hsl(158, 35%, 28%)" }}>Minimum budget</span>
                        <span className="font-bold" style={{ color: "hsl(158, 42%, 35%)" }}>₹{form.budgetMin.toLocaleString("en-IN")}</span>
                      </div>
                      <input
                        type="range"
                        min={1000}
                        max={50000}
                        step={500}
                        value={form.budgetMin}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          update("budgetMin", val);
                          if (val > form.budgetMax) update("budgetMax", val + 2000);
                        }}
                        className="budget-slider w-full"
                        style={{ "--val": sliderPercent(form.budgetMin, 1000, 50000) } as any}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>₹1,000</span><span>₹50,000+</span>
                      </div>
                    </div>

                    {/* Max slider */}
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-3">
                        <span style={{ color: "hsl(158, 35%, 28%)" }}>Maximum budget</span>
                        <span className="font-bold" style={{ color: "hsl(158, 42%, 35%)" }}>₹{form.budgetMax.toLocaleString("en-IN")}</span>
                      </div>
                      <input
                        type="range"
                        min={1000}
                        max={100000}
                        step={1000}
                        value={form.budgetMax}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          update("budgetMax", val);
                          if (val < form.budgetMin) update("budgetMin", val - 2000);
                        }}
                        className="budget-slider w-full"
                        style={{ "--val": sliderPercent(form.budgetMax, 1000, 100000) } as any}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>₹1,000</span><span>₹1,00,000+</span>
                      </div>
                    </div>

                    {/* Quick presets */}
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-3">Quick presets</div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: "Budget 🎒", min: 3000, max: 8000 },
                          { label: "Mid-range 🌟", min: 8000, max: 20000 },
                          { label: "Comfort 🛋️", min: 20000, max: 40000 },
                          { label: "Luxury ✨", min: 40000, max: 100000 },
                        ].map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => { update("budgetMin", p.min); update("budgetMax", p.max); }}
                            className={`pill-select ${form.budgetMin === p.min && form.budgetMax === p.max ? "active" : ""}`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: Style & Persona ── */}
                {step === 4 && (
                  <div className="space-y-7">
                    <h2 className="text-2xl font-heading mb-6" style={{ color: "hsl(158, 45%, 12%)" }}>
                      ✨ Your travel style
                    </h2>

                    {/* Travel vibe */}
                    <div>
                      <label className="text-sm font-semibold mb-3 block" style={{ color: "hsl(158, 35%, 28%)" }}>
                        🌈 Trip vibe
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {travelTypes.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => update("travelType", t.value)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium border transition-all duration-250 ${
                              form.travelType === t.value
                                ? "bg-primary text-white border-transparent shadow-lg scale-[1.03]"
                                : "glass-panel text-foreground/80 hover:border-primary/40"
                            }`}
                          >
                            <span>{t.label.split(" ")[0]}</span>
                            <span>{t.label.split(" ").slice(1).join(" ")}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Food preference */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: "hsl(158, 35%, 28%)" }}>
                        <Utensils className="w-4 h-4" /> Food preference
                      </label>
                      <div className="flex gap-3">
                        {foodPrefs.map((f) => (
                          <button
                            key={f.value}
                            type="button"
                            onClick={() => update("food", f.value)}
                            className={`flex-1 py-3.5 rounded-2xl text-sm font-semibold border transition-all duration-250 ${
                              form.food === f.value
                                ? "bg-primary text-white border-transparent shadow-lg"
                                : "glass-panel text-foreground/80 hover:border-primary/40"
                            }`}
                          >
                            <div className="text-xl mb-1">{f.icon}</div>
                            {f.label.split(" ").slice(1).join(" ")}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Travel persona */}
                    <div>
                      <label className="text-sm font-semibold mb-3 block" style={{ color: "hsl(158, 35%, 28%)" }}>
                        🧭 You are a...
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {travelPersonas.map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => update("persona", p.value)}
                            className={`persona-card ${form.persona === p.value ? "active" : ""}`}
                          >
                            <div className="text-2xl mb-1.5">{p.label.split(" ")[0]}</div>
                            <div className={`text-sm font-bold ${form.persona === p.value ? "text-white" : "text-foreground"}`}>
                              {p.label.split(" ").slice(1).join(" ")}
                            </div>
                            <div className={`text-xs mt-0.5 ${form.persona === p.value ? "text-white/75" : "text-muted-foreground"}`}>
                              {p.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 5: Notes & Submit ── */}
                {step === 5 && (
                  <div className="space-y-7">
                    <h2 className="text-2xl font-heading mb-6" style={{ color: "hsl(158, 45%, 12%)" }}>
                      📋 Anything else?
                    </h2>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "hsl(158, 35%, 28%)" }}>
                        <FileText className="w-4 h-4" /> Special notes
                      </label>
                      <textarea
                        className="glass-input w-full px-4 py-3.5 text-sm min-h-[140px] resize-none"
                        placeholder="e.g., elderly parents, wheelchair needed, honeymoon special requests, allergies..."
                        value={form.notes}
                        onChange={(e) => update("notes", e.target.value)}
                      />
                    </div>

                    {/* Summary card */}
                    <div className="prism-card p-5">
                      <h3 className="text-sm font-bold mb-4" style={{ color: "hsl(158, 38%, 22%)" }}>📋 Your trip summary</h3>
                      <div className="space-y-2.5 text-sm">
                        {[
                          { icon: "📍", label: "Route", value: form.departure && form.arrival ? `${form.departure} → ${form.arrival}` : "Not set" },
                          { icon: "📅", label: "Dates", value: form.departureDate ? new Date(form.departureDate).toLocaleDateString("en-IN") + (form.arrivalDate ? " → " + new Date(form.arrivalDate).toLocaleDateString("en-IN") : "") : "Not set" },
                          { icon: "👥", label: "People", value: `${form.numPeople} traveller${form.numPeople > 1 ? "s" : ""}` },
                          { icon: "💰", label: "Budget", value: `₹${form.budgetMin.toLocaleString("en-IN")} – ₹${form.budgetMax.toLocaleString("en-IN")}` },
                          { icon: "✨", label: "Style", value: form.travelType || "Not selected" },
                          { icon: "🧭", label: "Persona", value: form.persona || "Not selected" },
                        ].map((row) => (
                          <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                            <span className="text-muted-foreground flex items-center gap-1.5">{row.icon} {row.label}</span>
                            <span className="font-semibold text-foreground/90 text-right max-w-[55%]">{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-3 mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={goPrev}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full btn-ghost-glass text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}

            {step < STEPS.length ? (
              <button
                type="button"
                onClick={goNext}
                disabled={step === 1 && (!form.departure || !form.arrival)}
                className="flex-1 flex items-center justify-center gap-2 btn-primary py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!form.departure || !form.arrival}
                className="flex-1 flex items-center justify-center gap-2 btn-primary py-3.5 text-base disabled:opacity-50 animate-glow-ring"
              >
                <Check className="w-5 h-5" />
                Craft My Itinerary ✨
              </button>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">🔒 Secure & private</span>
            <span className="flex items-center gap-1.5">⚡ Ready in ~60s</span>
            <span className="flex items-center gap-1.5">🆓 Free to start</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PlanTrip;
