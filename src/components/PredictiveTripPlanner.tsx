import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp, MapPin, Calendar, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const RECOMMENDATIONS: Record<string, { dest: string; reason: string; bestMonth: string; emoji: string }[]> = {
  adventure: [
    { dest: "Ladakh", reason: "Perfect for thrill-seekers", bestMonth: "Jun-Sep", emoji: "🏔️" },
    { dest: "Rishikesh", reason: "Rafting & bungee paradise", bestMonth: "Oct-Mar", emoji: "🌊" },
    { dest: "Spiti Valley", reason: "Offbeat mountain adventure", bestMonth: "May-Oct", emoji: "⛰️" },
  ],
  cultural: [
    { dest: "Varanasi", reason: "Ancient spiritual capital", bestMonth: "Oct-Mar", emoji: "🛕" },
    { dest: "Hampi", reason: "UNESCO ruins & history", bestMonth: "Nov-Feb", emoji: "🏛️" },
    { dest: "Jaipur", reason: "Royal Rajasthani heritage", bestMonth: "Oct-Mar", emoji: "👑" },
  ],
  nature: [
    { dest: "Meghalaya", reason: "Living root bridges & waterfalls", bestMonth: "Oct-May", emoji: "🌿" },
    { dest: "Coorg", reason: "Coffee plantations & misty hills", bestMonth: "Oct-Mar", emoji: "☕" },
    { dest: "Andaman", reason: "Crystal clear waters & coral", bestMonth: "Nov-May", emoji: "🏝️" },
  ],
  relaxation: [
    { dest: "Kerala Backwaters", reason: "Houseboat serenity", bestMonth: "Sep-Mar", emoji: "🚢" },
    { dest: "Udaipur", reason: "Lake city romance", bestMonth: "Oct-Mar", emoji: "💎" },
    { dest: "Goa", reason: "Beaches & chill vibes", bestMonth: "Nov-Feb", emoji: "🏖️" },
  ],
};

export default function PredictiveTripPlanner() {
  const [open, setOpen] = useState(false);
  const [recs, setRecs] = useState<any[]>([]);
  const [persona, setPersona] = useState("explorer");
  const navigate = useNavigate();

  useEffect(() => { if (open) analyze(); }, [open]);

  const analyze = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setRecs(RECOMMENDATIONS.nature); return; }

    const { data: trips } = await supabase.from("saved_itineraries").select("destination, preferences").eq("user_id", user.id);
    const visited = new Set((trips || []).map(t => t.destination.toLowerCase()));

    // Detect dominant persona from preferences
    const personas = (trips || []).map(t => (t.preferences as any)?.travel_persona).filter(Boolean);
    const counts: Record<string, number> = {};
    personas.forEach(p => { counts[p] = (counts[p] || 0) + 1; });
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "nature";
    setPersona(dominant);

    const category = dominant.includes("adventure") ? "adventure"
      : dominant.includes("cultur") || dominant.includes("spiritual") ? "cultural"
      : dominant.includes("relax") || dominant.includes("luxury") ? "relaxation" : "nature";

    const all = Object.values(RECOMMENDATIONS).flat();
    const filtered = (RECOMMENDATIONS[category] || all).filter(r => !visited.has(r.dest.toLowerCase()));
    setRecs(filtered.length > 0 ? filtered : all.slice(0, 3));
  };

  return (
    <motion.div className="glass-panel p-4 rounded-2xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400/20 to-purple-400/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-violet-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Predictive Trip Planner</h3>
            <p className="text-xs text-muted-foreground">AI recommends based on your history</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 space-y-3">
            <p className="text-xs text-muted-foreground">Based on your <span className="text-primary capitalize">{persona}</span> travel style:</p>
            {recs.map((r, i) => (
              <motion.div key={r.dest} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-panel p-3 rounded-xl flex items-center gap-3">
                <span className="text-2xl">{r.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{r.dest}</p>
                  <p className="text-xs text-muted-foreground">{r.reason}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                    <Calendar className="w-3 h-3" /> Best: {r.bestMonth}
                  </div>
                </div>
                <Button size="sm" variant="glass" onClick={() => navigate("/plan")}>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
