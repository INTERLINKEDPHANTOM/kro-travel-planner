import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, Users, Wallet, Plane, Utensils, FileText,
  ArrowRight, ArrowLeft, Plus, X, Check, Train, Bus, Car, Shuffle,
  Palmtree, Mountain, Briefcase, HeartPulse, Sun, Compass,
  Leaf, Drumstick, Star, Backpack, Globe, Home, Shield, Zap, UserRound
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const travelTypes = [
  { value: "leisure", label: "Leisure", Icon: Palmtree, desc: "Relax & unwind" },
  { value: "adventure", label: "Adventure", Icon: Mountain, desc: "Thrills & trails" },
  { value: "corporate", label: "Corporate", Icon: Briefcase, desc: "Work-ready" },
  { value: "medical", label: "Medical", Icon: HeartPulse, desc: "Healthcare" },
  { value: "spiritual", label: "Spiritual", Icon: Sun, desc: "Sacred journeys" },
];

const transportModes = [
  { value: "flight", label: "Flight", Icon: Plane, desc: "Fastest" },
  { value: "train", label: "Train", Icon: Train, desc: "Scenic" },
  { value: "bus", label: "Bus", Icon: Bus, desc: "Budget" },
  { value: "own", label: "Own Car", Icon: Car, desc: "Freedom" },
  { value: "public", label: "Public", Icon: Globe, desc: "Local exp." },
  { value: "mixed", label: "Mixed", Icon: Shuffle, desc: "Best of all" },
];

const foodPrefs = [
  { value: "vegetarian", label: "Vegetarian", Icon: Leaf },
  { value: "non-vegetarian", label: "Non-Veg", Icon: Drumstick },
  { value: "mixed", label: "Mixed", Icon: Utensils },
];

const travelPersonas = [
  { value: "budget", label: "Budget", Icon: Wallet, desc: "Smart spending" },
  { value: "luxury", label: "Luxury", Icon: Star, desc: "Premium comfort" },
  { value: "backpacker", label: "Backpacker", Icon: Backpack, desc: "Adventure spirit" },
  { value: "spiritual", label: "Spiritual", Icon: Sun, desc: "Inner peace" },
  { value: "explorer", label: "Explorer", Icon: Compass, desc: "Hidden gems" },
  { value: "family", label: "Family", Icon: Home, desc: "Kid-friendly" },
];

const STEPS = [
  { id: 1, title: "Route", Icon: MapPin, desc: "Where to?" },
  { id: 2, title: "Dates", Icon: Calendar, desc: "When & who" },
  { id: 3, title: "Budget", Icon: Wallet, desc: "Money matters" },
  { id: 4, title: "Style", Icon: Star, desc: "Your vibe" },
  { id: 5, title: "Notes", Icon: FileText, desc: "Final details" },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
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

  const update = (key: string, value: any) => setForm(p => ({ ...p, [key]: value }));

  const goNext = () => { setDirection(1); setStep(s => Math.min(s + 1, STEPS.length)); };
  const goPrev = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    sessionStorage.setItem("tripPreferences", JSON.stringify(form));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) navigate("/plans");
    else navigate("/auth?redirect=/plans");
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  const sliderPercent = (val: number, min: number, max: number) => `${((val - min) / (max - min)) * 100}%`;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-orb-1" style={{ top: "5%", left: "10%" }} />
        <div className="ambient-orb-2" style={{ bottom: "15%", right: "8%" }} />
      </div>

      <Navbar />

      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <p className="section-label mb-2">Trip Planner</p>
            <h1 className="text-3xl sm:text-4xl font-heading mb-2 tracking-tight" style={{ color: "hsl(158, 45%, 10%)" }}>
              Where are you <span className="text-mint-gradient">headed?</span>
            </h1>
            <p className="text-sm font-light" style={{ color: "hsl(158, 18%, 48%)" }}>
              5 quick steps to your perfect trip
            </p>
          </motion.div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-1.5 mb-5 overflow-x-auto pb-1">
            {STEPS.map(s => (
              <button
                key={s.id}
                onClick={() => { setDirection(s.id > step ? 1 : -1); setStep(s.id); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex-shrink-0"
                style={s.id === step ? {
                  background: "linear-gradient(135deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))",
                  color: "white",
                  boxShadow: "0 4px 12px hsla(158, 42%, 36%, 0.35)",
                  transform: "scale(1.05)",
                } : s.id < step ? {
                  background: "hsla(158, 42%, 38%, 0.15)",
                  color: "hsl(158, 42%, 35%)",
                } : {
                  background: "hsla(148, 35%, 88%, 0.6)",
                  color: "hsl(158, 18%, 55%)",
                }}
              >
                <s.Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{s.title}</span>
                <span className="sm:hidden">{s.id}</span>
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mb-6 px-1">
            <div className="progress-bar-track">
              <motion.div
                className="progress-bar-fill"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
              <span>Step {step} of {STEPS.length}</span>
              <span>{STEPS[step - 1].desc}</span>
            </div>
          </div>

          {/* Card */}
          <div className="glass-intense p-5 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
              style={{ background: "radial-gradient(circle at top right, hsla(152, 60%, 65%, 0.10) 0%, transparent 70%)" }} />

            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >

                {/* ── STEP 1: Route ── */}
                {step === 1 && (
                  <div className="space-y-5">
                    <h2 className="text-lg sm:text-xl font-heading flex items-center gap-2" style={{ color: "hsl(158, 45%, 12%)" }}>
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0" /> Set your route
                    </h2>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "hsl(158, 35%, 28%)" }}>
                        <MapPin className="w-3.5 h-3.5" /> From
                      </label>
                      <input
                        className="glass-input w-full px-4 py-3 text-sm"
                        placeholder="e.g., New Delhi"
                        value={form.departure}
                        onChange={e => update("departure", e.target.value)}
                      />
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs font-medium" style={{ color: "hsl(158, 35%, 35%)" }}>
                        <ArrowRight className="w-3.5 h-3.5" />
                        to destination
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "hsl(158, 35%, 28%)" }}>
                        <MapPin className="w-3.5 h-3.5 text-accent" /> To
                      </label>
                      <input
                        className="glass-input w-full px-4 py-3 text-sm"
                        placeholder="e.g., Manali, Goa, Jaipur..."
                        value={form.arrival}
                        onChange={e => update("arrival", e.target.value)}
                      />
                    </div>

                    {/* Multi-city stops */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "hsl(158, 35%, 28%)" }}>
                        <Plus className="w-3.5 h-3.5" /> Add stops <span className="font-normal text-muted-foreground">(optional)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          className="glass-input flex-1 px-4 py-3 text-sm"
                          placeholder="e.g., Shimla"
                          value={cityInput}
                          onChange={e => setCityInput(e.target.value)}
                          onKeyDown={e => {
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
                          className="w-11 h-11 rounded-2xl flex items-center justify-center btn-primary flex-shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {form.multiCity.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {form.multiCity.map((city, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                              style={{ background: "hsla(158, 40%, 38%, 0.12)", color: "hsl(158, 40%, 30%)", border: "1px solid hsla(158, 40%, 50%, 0.25)" }}>
                              <MapPin className="w-3 h-3" /> {city}
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
                  <div className="space-y-6">
                    <h2 className="text-lg sm:text-xl font-heading flex items-center gap-2" style={{ color: "hsl(158, 45%, 12%)" }}>
                      <Calendar className="w-5 h-5 text-primary flex-shrink-0" /> When &amp; with whom?
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "hsl(158, 35%, 28%)" }}>
                          <Calendar className="w-3.5 h-3.5" /> Departure
                        </label>
                        <input type="datetime-local" className="glass-input w-full px-4 py-3 text-sm"
                          value={form.departureDate} onChange={e => update("departureDate", e.target.value)} />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "hsl(158, 35%, 28%)" }}>
                          <Calendar className="w-3.5 h-3.5" /> Return
                        </label>
                        <input type="datetime-local" className="glass-input w-full px-4 py-3 text-sm"
                          value={form.arrivalDate} onChange={e => update("arrivalDate", e.target.value)} />
                      </div>
                    </div>

                    {/* People counter */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-4" style={{ color: "hsl(158, 35%, 28%)" }}>
                        <Users className="w-3.5 h-3.5" /> Number of travellers
                      </label>
                      <div className="flex items-center gap-5">
                        <button type="button" onClick={() => update("numPeople", Math.max(1, form.numPeople - 1))}
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all hover:scale-110"
                          style={{ background: "hsla(148, 40%, 98%, 0.55)", border: "1.5px solid hsla(148, 40%, 72%, 0.45)" }}>
                          −
                        </button>
                        <div className="flex-1 text-center">
                          <div className="text-4xl sm:text-5xl font-bold" style={{ color: "hsl(158, 42%, 35%)" }}>{form.numPeople}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {form.numPeople === 1 ? "Solo traveller" : form.numPeople <= 2 ? "Couple" : form.numPeople <= 5 ? "Small group" : "Large group"}
                          </div>
                          <div className="flex justify-center gap-1 mt-2 flex-wrap">
                            {Array.from({ length: Math.min(form.numPeople, 8) }).map((_, i) => (
                              <UserRound key={i} className="w-4 h-4 text-primary/70" />
                            ))}
                            {form.numPeople > 8 && <span className="text-xs text-muted-foreground self-center">+{form.numPeople - 8}</span>}
                          </div>
                        </div>
                        <button type="button" onClick={() => update("numPeople", Math.min(20, form.numPeople + 1))}
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold btn-primary hover:scale-110 transition-transform">
                          +
                        </button>
                      </div>
                    </div>

                    {/* Transport Mode */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: "hsl(158, 35%, 28%)" }}>
                        <Plane className="w-3.5 h-3.5" /> How will you travel?
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                        {transportModes.map(t => (
                          <button key={t.value} type="button" onClick={() => update("transport", t.value)}
                            className={`persona-card ${form.transport === t.value ? "active" : ""}`}>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 mx-auto"
                              style={{ background: form.transport === t.value ? "hsla(255,255%,255%,0.15)" : "hsla(158, 42%, 38%, 0.10)" }}>
                              <t.Icon className={`w-4 h-4 ${form.transport === t.value ? "text-white" : "text-primary"}`} />
                            </div>
                            <div className={`text-xs font-semibold ${form.transport === t.value ? "text-white" : "text-foreground"}`}>{t.label}</div>
                            <div className={`text-[10px] mt-0.5 ${form.transport === t.value ? "text-white/70" : "text-muted-foreground"}`}>{t.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Budget ── */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-lg sm:text-xl font-heading flex items-center gap-2" style={{ color: "hsl(158, 45%, 12%)" }}>
                      <Wallet className="w-5 h-5 text-primary flex-shrink-0" /> What's your budget?
                    </h2>

                    {/* Budget display */}
                    <div className="text-center py-5 rounded-2xl glass-panel">
                      <div className="text-xs text-muted-foreground mb-1">Your range</div>
                      <div className="text-3xl sm:text-4xl font-bold" style={{ color: "hsl(158, 42%, 35%)" }}>
                        ₹{form.budgetMin.toLocaleString("en-IN")}
                        <span className="text-xl text-muted-foreground mx-2">–</span>
                        ₹{form.budgetMax.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1.5">per person, total trip</div>
                      <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: "hsla(158, 42%, 38%, 0.12)", color: "hsl(158, 42%, 32%)" }}>
                        {form.budgetMax < 8000 ? "Backpacker" : form.budgetMax < 15000 ? "Budget Smart" : form.budgetMax < 30000 ? "Mid-Range" : "Luxury"}
                      </div>
                    </div>

                    {/* Min slider */}
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-2">
                        <span style={{ color: "hsl(158, 35%, 28%)" }}>Minimum</span>
                        <span className="font-bold" style={{ color: "hsl(158, 42%, 35%)" }}>₹{form.budgetMin.toLocaleString("en-IN")}</span>
                      </div>
                      <input type="range" min={1000} max={50000} step={500} value={form.budgetMin}
                        onChange={e => { const v = Number(e.target.value); update("budgetMin", v); if (v > form.budgetMax) update("budgetMax", v + 2000); }}
                        className="budget-slider w-full"
                        style={{ "--val": sliderPercent(form.budgetMin, 1000, 50000) } as any} />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>₹1,000</span><span>₹50,000+</span>
                      </div>
                    </div>

                    {/* Max slider */}
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-2">
                        <span style={{ color: "hsl(158, 35%, 28%)" }}>Maximum</span>
                        <span className="font-bold" style={{ color: "hsl(158, 42%, 35%)" }}>₹{form.budgetMax.toLocaleString("en-IN")}</span>
                      </div>
                      <input type="range" min={1000} max={100000} step={1000} value={form.budgetMax}
                        onChange={e => { const v = Number(e.target.value); update("budgetMax", v); if (v < form.budgetMin) update("budgetMin", v - 2000); }}
                        className="budget-slider w-full"
                        style={{ "--val": sliderPercent(form.budgetMax, 1000, 100000) } as any} />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>₹1,000</span><span>₹1,00,000+</span>
                      </div>
                    </div>

                    {/* Quick presets */}
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-2">Quick presets</div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: "Budget", min: 3000, max: 8000 },
                          { label: "Mid-range", min: 8000, max: 20000 },
                          { label: "Comfort", min: 20000, max: 40000 },
                          { label: "Luxury", min: 40000, max: 100000 },
                        ].map(p => (
                          <button key={p.label} type="button"
                            onClick={() => { update("budgetMin", p.min); update("budgetMax", p.max); }}
                            className={`pill-select ${form.budgetMin === p.min && form.budgetMax === p.max ? "active" : ""}`}>
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: Style & Persona ── */}
                {step === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-lg sm:text-xl font-heading flex items-center gap-2" style={{ color: "hsl(158, 45%, 12%)" }}>
                      <Star className="w-5 h-5 text-primary flex-shrink-0" /> Your travel style
                    </h2>

                    {/* Trip vibe */}
                    <div>
                      <label className="text-sm font-semibold mb-3 block" style={{ color: "hsl(158, 35%, 28%)" }}>Trip vibe</label>
                      <div className="flex flex-wrap gap-2">
                        {travelTypes.map(t => (
                          <button key={t.value} type="button" onClick={() => update("travelType", t.value)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium border transition-all duration-250"
                            style={form.travelType === t.value ? {
                              background: "linear-gradient(135deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))",
                              color: "white",
                              border: "1px solid transparent",
                              boxShadow: "0 4px 14px hsla(158, 42%, 36%, 0.35)",
                              transform: "scale(1.03)",
                            } : {
                              background: "hsla(148, 40%, 98%, 0.50)",
                              backdropFilter: "blur(12px)",
                              border: "1px solid hsla(148, 35%, 80%, 0.45)",
                              color: "hsl(158, 30%, 35%)",
                            }}>
                            <t.Icon className="w-4 h-4" />
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Food preference */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: "hsl(158, 35%, 28%)" }}>
                        <Utensils className="w-3.5 h-3.5" /> Food preference
                      </label>
                      <div className="flex gap-2 sm:gap-3">
                        {foodPrefs.map(f => (
                          <button key={f.value} type="button" onClick={() => update("food", f.value)}
                            className="flex-1 py-3 rounded-2xl text-sm font-semibold border transition-all duration-250"
                            style={form.food === f.value ? {
                              background: "linear-gradient(135deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))",
                              color: "white",
                              border: "1px solid transparent",
                              boxShadow: "0 4px 14px hsla(158, 42%, 36%, 0.30)",
                            } : {
                              background: "hsla(148, 40%, 98%, 0.50)",
                              backdropFilter: "blur(12px)",
                              border: "1px solid hsla(148, 35%, 80%, 0.45)",
                              color: "hsl(158, 30%, 35%)",
                            }}>
                            <div className="w-7 h-7 rounded-xl flex items-center justify-center mb-1.5 mx-auto"
                              style={{ background: form.food === f.value ? "hsla(255,255%,255%,0.18)" : "hsla(158,42%,38%,0.10)" }}>
                              <f.Icon className={`w-3.5 h-3.5 ${form.food === f.value ? "text-white" : "text-primary"}`} />
                            </div>
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Travel persona */}
                    <div>
                      <label className="text-sm font-semibold mb-3 block" style={{ color: "hsl(158, 35%, 28%)" }}>
                        You are a...
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {travelPersonas.map(p => (
                          <button key={p.value} type="button" onClick={() => update("persona", p.value)}
                            className={`persona-card ${form.persona === p.value ? "active" : ""}`}>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 mx-auto"
                              style={{ background: form.persona === p.value ? "hsla(255,255%,255%,0.15)" : "hsla(158, 42%, 38%, 0.10)" }}>
                              <p.Icon className={`w-4 h-4 ${form.persona === p.value ? "text-white" : "text-primary"}`} />
                            </div>
                            <div className={`text-xs font-bold ${form.persona === p.value ? "text-white" : "text-foreground"}`}>{p.label}</div>
                            <div className={`text-[10px] mt-0.5 ${form.persona === p.value ? "text-white/70" : "text-muted-foreground"}`}>{p.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 5: Notes & Submit ── */}
                {step === 5 && (
                  <div className="space-y-6">
                    <h2 className="text-lg sm:text-xl font-heading flex items-center gap-2" style={{ color: "hsl(158, 45%, 12%)" }}>
                      <FileText className="w-5 h-5 text-primary flex-shrink-0" /> Anything else?
                    </h2>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "hsl(158, 35%, 28%)" }}>
                        <FileText className="w-3.5 h-3.5" /> Special notes
                      </label>
                      <textarea
                        className="glass-input w-full px-4 py-3 text-sm min-h-[120px] resize-none"
                        placeholder="e.g., elderly parents, wheelchair needed, honeymoon, allergies..."
                        value={form.notes}
                        onChange={e => update("notes", e.target.value)}
                      />
                    </div>

                    {/* Summary */}
                    <div className="prism-card p-4">
                      <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "hsl(158, 38%, 22%)" }}>
                        <FileText className="w-4 h-4 text-primary" /> Trip summary
                      </h3>
                      <div className="space-y-2 text-sm">
                        {[
                          { Icon: MapPin, label: "Route", value: form.departure && form.arrival ? `${form.departure} → ${form.arrival}` : "Not set" },
                          { Icon: Calendar, label: "Dates", value: form.departureDate ? new Date(form.departureDate).toLocaleDateString("en-IN") + (form.arrivalDate ? " → " + new Date(form.arrivalDate).toLocaleDateString("en-IN") : "") : "Not set" },
                          { Icon: Users, label: "People", value: `${form.numPeople} traveller${form.numPeople > 1 ? "s" : ""}` },
                          { Icon: Wallet, label: "Budget", value: `₹${form.budgetMin.toLocaleString("en-IN")} – ₹${form.budgetMax.toLocaleString("en-IN")}` },
                          { Icon: Star, label: "Style", value: form.travelType || "Not selected" },
                          { Icon: Compass, label: "Persona", value: form.persona || "Not selected" },
                        ].map(row => (
                          <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-border/25 last:border-0 gap-3">
                            <span className="text-muted-foreground flex items-center gap-1.5 flex-shrink-0">
                              <row.Icon className="w-3.5 h-3.5 text-primary/60" /> {row.label}
                            </span>
                            <span className="font-semibold text-right text-xs sm:text-sm truncate" style={{ color: "hsl(158, 38%, 18%)" }}>{row.value}</span>
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
          <div className="flex items-center gap-3 mt-5">
            {step > 1 && (
              <button type="button" onClick={goPrev}
                className="flex items-center gap-2 px-5 py-3 rounded-full btn-ghost-glass text-sm font-semibold">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}

            {step < STEPS.length ? (
              <button type="button" onClick={goNext}
                disabled={step === 1 && (!form.departure || !form.arrival)}
                className="flex-1 flex items-center justify-center gap-2 btn-primary py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit}
                disabled={!form.departure || !form.arrival}
                className="flex-1 flex items-center justify-center gap-2 btn-primary py-3.5 text-sm disabled:opacity-50 animate-glow-ring">
                <Check className="w-4 h-4" />
                Craft My Itinerary
              </button>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> Secure & private</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" /> Ready in ~60s</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary" /> Free to start</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PlanTrip;
