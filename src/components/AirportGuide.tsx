import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, ChevronDown, ChevronUp, MapPin, Coffee, ShoppingBag, Wifi, Clock, CreditCard } from "lucide-react";

const AIRPORTS: Record<string, { name: string; code: string; terminals: { name: string; airlines: string[]; facilities: string[] }[]; lounges: { name: string; access: string; rating: number }[]; dutyFree: string[]; tips: string[] }> = {
  delhi: {
    name: "Indira Gandhi International", code: "DEL",
    terminals: [
      { name: "Terminal 3", airlines: ["Air India", "IndiGo (Intl)", "Vistara", "Emirates", "Lufthansa"], facilities: ["Prayer Room", "Spa", "Kids Zone", "Sleeping Pods"] },
      { name: "Terminal 1", airlines: ["IndiGo (Dom)", "SpiceJet", "Go First"], facilities: ["Food Court", "ATM", "Pharmacy"] },
    ],
    lounges: [
      { name: "ITC Green Lounge", access: "Priority Pass / ₹2000", rating: 4.5 },
      { name: "Plaza Premium", access: "Card Access / Walk-in ₹2500", rating: 4.2 },
    ],
    dutyFree: ["Electronics at DFS", "Whisky at Aer Rianta", "Perfumes at Le Grand"],
    tips: ["Free WiFi for 45 min", "Metro connects T3 directly", "Arrive 3hrs early for international"]
  },
  mumbai: {
    name: "Chhatrapati Shivaji Maharaj", code: "BOM",
    terminals: [
      { name: "Terminal 2", airlines: ["Air India", "Vistara", "IndiGo (Intl)", "British Airways"], facilities: ["Jaya He Art Gallery", "Spa", "Prayer Room"] },
      { name: "Terminal 1", airlines: ["IndiGo (Dom)", "SpiceJet", "Akasa"], facilities: ["Food Court", "Lounges"] },
    ],
    lounges: [
      { name: "GVK Lounge", access: "Business Class / Priority Pass", rating: 4.6 },
      { name: "Adani Premium Lounge", access: "Card Access / ₹1800", rating: 4.0 },
    ],
    dutyFree: ["Liquor at Mumbai Duty Free", "Chocolates", "Indian Handicrafts"],
    tips: ["T2 has stunning art installations", "Use CSIA app for navigation", "Pre-book meet & greet service"]
  },
  bangalore: {
    name: "Kempegowda International", code: "BLR",
    terminals: [
      { name: "Terminal 1", airlines: ["IndiGo", "SpiceJet", "Air India (Dom)"], facilities: ["Food Court", "Book Store", "Pharmacy"] },
      { name: "Terminal 2", airlines: ["Vistara", "Air India (Intl)", "Singapore Airlines"], facilities: ["Art Gallery", "Spa", "Kids Play Area", "Yoga Room"] },
    ],
    lounges: [
      { name: "BLR Lounge by TFS", access: "Priority Pass / ₹2200", rating: 4.3 },
      { name: "Encalm Privé", access: "Premium Card / Walk-in", rating: 4.7 },
    ],
    dutyFree: ["Coffee & Spices", "Electronics", "Silk Products"],
    tips: ["T2 opened 2024 - modern facilities", "Airport express shuttle available", "Free charging stations everywhere"]
  },
  goa: {
    name: "Manohar International (Mopa)", code: "GOX",
    terminals: [
      { name: "Main Terminal", airlines: ["IndiGo", "SpiceJet", "Air India", "Vistara"], facilities: ["Beach-themed lounge", "Local food court", "Cashew shop"] },
    ],
    lounges: [
      { name: "Goa Lounge", access: "Walk-in ₹1500", rating: 3.8 },
    ],
    dutyFree: ["Feni & Port Wine", "Cashew products", "Goan Spices"],
    tips: ["New airport, less crowded", "30 min from North Goa beaches", "Pre-book cab to avoid surge"]
  },
};

const DEFAULT_AIRPORT = {
  name: "Airport Information", code: "---",
  terminals: [{ name: "Main Terminal", airlines: ["Check airline for terminal"], facilities: ["Lounge", "Food Court", "WiFi", "ATM"] }],
  lounges: [{ name: "General Lounge", access: "Priority Pass / Walk-in", rating: 4.0 }],
  dutyFree: ["Local specialties", "Electronics", "Perfumes"],
  tips: ["Arrive 2-3 hours early for international flights", "Download airport app for navigation", "Keep boarding pass accessible"]
};

interface Props { destination: string; }

export default function AirportGuide({ destination }: Props) {
  const [open, setOpen] = useState(false);

  const dest = destination.toLowerCase().trim();
  const airport = Object.entries(AIRPORTS).find(([k]) => dest.includes(k))?.[1] || DEFAULT_AIRPORT;

  return (
    <motion.div className="glass-panel p-4 rounded-2xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400/20 to-cyan-400/20 flex items-center justify-center">
            <Plane className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Airport Guide</h3>
            <p className="text-xs text-muted-foreground">{airport.name} ({airport.code})</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 space-y-4">
            {/* Terminals */}
            {airport.terminals.map((t, i) => (
              <div key={i} className="glass-panel p-3 rounded-xl">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-primary" /> {t.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Airlines: {t.airlines.join(", ")}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {t.facilities.map(f => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{f}</span>
                  ))}
                </div>
              </div>
            ))}

            {/* Lounges */}
            <div>
              <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2"><Coffee className="w-3.5 h-3.5 text-primary" /> Lounges</p>
              {airport.lounges.map((l, i) => (
                <div key={i} className="glass-panel p-3 rounded-xl mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{l.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="w-3 h-3" /> {l.access}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">⭐ {l.rating}</span>
                </div>
              ))}
            </div>

            {/* Duty Free */}
            <div>
              <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2"><ShoppingBag className="w-3.5 h-3.5 text-primary" /> Duty-Free Picks</p>
              <div className="flex flex-wrap gap-1.5">
                {airport.dutyFree.map(d => (
                  <span key={d} className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent-foreground border border-accent/20">{d}</span>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="glass-panel p-3 rounded-xl bg-primary/5">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1"><Wifi className="w-3.5 h-3.5 text-primary" /> Pro Tips</p>
              {airport.tips.map((tip, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Clock className="w-3 h-3 text-primary/60 flex-shrink-0" /> {tip}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
