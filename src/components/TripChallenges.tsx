import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Trophy, ChevronDown, ChevronUp, Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const CHALLENGES = [
  { key: "unesco_5", label: "Visit 5 UNESCO Heritage Sites", target: 5, emoji: "🏛️", category: "heritage" },
  { key: "beaches_3", label: "Explore 3 Coastal Beaches", target: 3, emoji: "🏖️", category: "nature" },
  { key: "mountains_4", label: "Conquer 4 Mountain Destinations", target: 4, emoji: "🏔️", category: "adventure" },
  { key: "temples_5", label: "Visit 5 Sacred Temples", target: 5, emoji: "🛕", category: "spiritual" },
  { key: "street_food_10", label: "Try Street Food in 10 Cities", target: 10, emoji: "🍜", category: "food" },
  { key: "solo_trips_3", label: "Complete 3 Solo Trips", target: 3, emoji: "🧳", category: "solo" },
  { key: "night_markets_3", label: "Visit 3 Night Markets", target: 3, emoji: "🌙", category: "culture" },
  { key: "sunrise_spots_5", label: "Watch Sunrise at 5 Spots", target: 5, emoji: "🌅", category: "nature" },
];

export default function TripChallenges() {
  const [open, setOpen] = useState(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) loadChallenges();
  }, [open]);

  const loadChallenges = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase.from("trip_challenges").select("*").eq("user_id", user.id);
    const merged = CHALLENGES.map(c => {
      const existing = data?.find(d => d.challenge_key === c.key);
      return { ...c, progress: existing?.progress || 0, completed: existing?.completed || false, id: existing?.id };
    });
    setChallenges(merged);
    setLoading(false);
  };

  const incrementProgress = async (challenge: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newProgress = Math.min(challenge.progress + 1, challenge.target);
    const completed = newProgress >= challenge.target;

    if (challenge.id) {
      await supabase.from("trip_challenges").update({
        progress: newProgress, completed, completed_at: completed ? new Date().toISOString() : null
      }).eq("id", challenge.id);
    } else {
      await supabase.from("trip_challenges").insert({
        user_id: user.id, challenge_key: challenge.key, progress: newProgress,
        target: challenge.target, completed, completed_at: completed ? new Date().toISOString() : null
      });
    }

    if (completed) toast({ title: "🎉 Challenge Complete!", description: challenge.label });
    loadChallenges();
  };

  const completedCount = challenges.filter(c => c.completed).length;

  return (
    <motion.div className="glass-panel p-4 rounded-2xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Trip Challenges</h3>
            <p className="text-xs text-muted-foreground">{completedCount}/{CHALLENGES.length} completed</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading challenges...</div>
            ) : challenges.map((c, i) => (
              <motion.div key={c.key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={`glass-panel p-3 rounded-xl flex items-center gap-3 ${c.completed ? "border-primary/30 bg-primary/5" : ""}`}>
                <span className="text-2xl">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${c.completed ? "text-primary" : "text-foreground"}`}>{c.label}</p>
                    {c.completed && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={(c.progress / c.target) * 100} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{c.progress}/{c.target}</span>
                  </div>
                </div>
                {!c.completed && (
                  <button onClick={() => incrementProgress(c)}
                    className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
