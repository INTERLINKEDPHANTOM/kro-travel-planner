import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Heart, Zap, ChevronDown, Share2, Copy, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  userId?: string;
}

interface TravelProfile {
  userId: string;
  email: string;
  name: string;
  tripCount: number;
  persona: string;
  avgBudget: string;
  prefFoodType: string;
  prefTransport: string;
  prefTravelType: string;
}

const PERSONA_EMOJI: Record<string, string> = {
  explorer: "🧭", budget: "💰", luxury: "💎", spiritual: "🙏",
  backpacker: "🎒", foodie: "🍕", adventure: "⛰️", cultural: "🎭",
  romantic: "❤️", family: "👨‍👩‍👧‍👦",
};

const compatibilityFactors = (a: TravelProfile, b: TravelProfile) => {
  const factors: { label: string; score: number; emoji: string }[] = [];

  // Persona match (0-30 pts)
  if (a.persona === b.persona) {
    factors.push({ label: "Same travel vibe!", score: 30, emoji: "🎯" });
  } else {
    const compatible: Record<string, string[]> = {
      explorer: ["adventure", "backpacker", "cultural"],
      budget: ["backpacker"],
      luxury: ["romantic", "foodie"],
      spiritual: ["cultural"],
      adventure: ["explorer", "backpacker"],
      foodie: ["cultural", "luxury"],
    };
    if (compatible[a.persona]?.includes(b.persona)) {
      factors.push({ label: "Complementary vibes", score: 20, emoji: "✨" });
    } else {
      factors.push({ label: "Different vibes (variety!)", score: 10, emoji: "🎲" });
    }
  }

  // Budget compatibility (0-25 pts)
  if (a.avgBudget === b.avgBudget) {
    factors.push({ label: "Same budget range", score: 25, emoji: "💰" });
  } else {
    factors.push({ label: "Flexible budget range", score: 12, emoji: "📊" });
  }

  // Food compatibility (0-20 pts)
  if (a.prefFoodType === b.prefFoodType) {
    factors.push({ label: "Same food preference", score: 20, emoji: "🍽️" });
  } else if (a.prefFoodType === "mixed" || b.prefFoodType === "mixed") {
    factors.push({ label: "Flexible food choices", score: 15, emoji: "🥘" });
  } else {
    factors.push({ label: "Different food tastes", score: 8, emoji: "🍕" });
  }

  // Transport compatibility (0-15 pts)
  if (a.prefTransport === b.prefTransport) {
    factors.push({ label: "Same transport preference", score: 15, emoji: "🚗" });
  } else {
    factors.push({ label: "Transport flexibility needed", score: 8, emoji: "🚌" });
  }

  // Experience level bonus (0-10 pts)
  const diff = Math.abs(a.tripCount - b.tripCount);
  if (diff <= 2) {
    factors.push({ label: "Similar experience level", score: 10, emoji: "📈" });
  } else if (diff <= 5) {
    factors.push({ label: "Great mentor-learner dynamic", score: 7, emoji: "🎓" });
  } else {
    factors.push({ label: "Experience gap (guide opportunity!)", score: 5, emoji: "🗺️" });
  }

  const total = factors.reduce((s, f) => s + f.score, 0);
  return { factors, total };
};

const getScoreLabel = (score: number) => {
  if (score >= 85) return { label: "Perfect Match!", color: "hsl(158, 50%, 40%)" };
  if (score >= 65) return { label: "Great Match", color: "hsl(158, 40%, 45%)" };
  if (score >= 45) return { label: "Good Match", color: "hsl(45, 80%, 45%)" };
  return { label: "Could Work", color: "hsl(25, 70%, 50%)" };
};

const TravelCompatibilityScore = ({ userId }: Props) => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [myProfile, setMyProfile] = useState<TravelProfile | null>(null);
  const [friendProfile, setFriendProfile] = useState<TravelProfile | null>(null);
  const [result, setResult] = useState<{ factors: any[]; total: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (userId) loadMyProfile();
  }, [userId]);

  const loadMyProfile = async () => {
    if (!userId) return;
    const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
    const { data: trips } = await supabase.from("saved_itineraries").select("preferences, destination").eq("user_id", userId);

    if (!trips?.length) return;

    // Analyze travel patterns
    const personas = trips.map(t => (t.preferences as any)?.travel_persona || "explorer");
    const persona = personas.sort((a: string, b: string) => personas.filter((p: string) => p === b).length - personas.filter((p: string) => p === a).length)[0];
    const budgets = trips.map(t => {
      const max = (t.preferences as any)?.budget_max || 10000;
      return max < 5000 ? "low" : max < 15000 ? "mid" : "high";
    });
    const avgBudget = budgets.sort((a: string, b: string) => budgets.filter((p: string) => p === b).length - budgets.filter((p: string) => p === a).length)[0];

    setMyProfile({
      userId,
      email: profile?.email || "",
      name: profile?.full_name || "You",
      tripCount: trips.length,
      persona,
      avgBudget,
      prefFoodType: (trips[0].preferences as any)?.food_preference || "mixed",
      prefTransport: (trips[0].preferences as any)?.transport_mode || "mixed",
      prefTravelType: (trips[0].preferences as any)?.travel_type || "leisure",
    });
  };

  const checkCompatibility = async () => {
    if (!friendEmail || !myProfile) return;
    setLoading(true);
    setResult(null);

    try {
      // Find friend by email
      const { data: friendProfileData } = await supabase.from("profiles").select("*").eq("email", friendEmail).maybeSingle();
      if (!friendProfileData) {
        toast({ title: "User not found", description: "Your friend hasn't signed up yet. Invite them!", variant: "destructive" });
        setLoading(false);
        return;
      }

      const { data: friendTrips } = await supabase.from("saved_itineraries").select("preferences, destination")
        .eq("user_id", friendProfileData.user_id);

      if (!friendTrips?.length) {
        toast({ title: "No trip data", description: "Your friend hasn't planned any trips yet.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const personas = friendTrips.map(t => (t.preferences as any)?.travel_persona || "explorer");
      const persona = personas.sort((a: string, b: string) => personas.filter((p: string) => p === b).length - personas.filter((p: string) => p === a).length)[0];
      const budgets = friendTrips.map(t => {
        const max = (t.preferences as any)?.budget_max || 10000;
        return max < 5000 ? "low" : max < 15000 ? "mid" : "high";
      });
      const avgBudget = budgets.sort((a: string, b: string) => budgets.filter((p: string) => p === b).length - budgets.filter((p: string) => p === a).length)[0];

      const fp: TravelProfile = {
        userId: friendProfileData.user_id,
        email: friendProfileData.email || friendEmail,
        name: friendProfileData.full_name || friendEmail.split("@")[0],
        tripCount: friendTrips.length,
        persona,
        avgBudget,
        prefFoodType: (friendTrips[0].preferences as any)?.food_preference || "mixed",
        prefTransport: (friendTrips[0].preferences as any)?.transport_mode || "mixed",
        prefTravelType: (friendTrips[0].preferences as any)?.travel_type || "leisure",
      };

      setFriendProfile(fp);
      setResult(compatibilityFactors(myProfile, fp));
    } catch (err) {
      toast({ title: "Error", description: "Could not check compatibility", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const shareResult = () => {
    if (!result || !friendProfile) return;
    const text = `🧳 Travel Compatibility: ${result.total}% match with ${friendProfile.name}! Check it on KroTravel`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 flex items-center justify-between hover:bg-accent/20 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsla(340, 70%, 55%, 0.12)" }}>
            <Heart className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-heading text-sm" style={{ color: "hsl(158,45%,10%)" }}>Travel Compatibility</p>
            <p className="text-[10px] text-muted-foreground">Check if you and your friend travel well together</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-4">
              {!myProfile ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  <p>Plan at least 1 trip to use this feature</p>
                </div>
              ) : (
                <>
                  {/* Your profile summary */}
                  <div className="p-3 rounded-xl" style={{ background: "hsla(158, 42%, 38%, 0.06)" }}>
                    <p className="text-[10px] text-muted-foreground mb-1">Your Travel DNA</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm">{PERSONA_EMOJI[myProfile.persona] || "🧭"}</span>
                      <span className="text-xs font-semibold capitalize" style={{ color: "hsl(158,45%,15%)" }}>{myProfile.persona}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground">{myProfile.tripCount} trips</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground capitalize">{myProfile.avgBudget} budget</span>
                    </div>
                  </div>

                  {/* Friend email input */}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={friendEmail}
                      onChange={e => setFriendEmail(e.target.value)}
                      placeholder="Friend's email"
                      className="glass-input flex-1 px-3 py-2.5 rounded-xl text-sm"
                      onKeyDown={e => e.key === "Enter" && checkCompatibility()}
                    />
                    <button onClick={checkCompatibility} disabled={loading || !friendEmail}
                      className="px-4 py-2.5 rounded-xl bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors disabled:opacity-50">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
                    </button>
                  </div>

                  {/* Result */}
                  {result && friendProfile && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                      {/* Score circle */}
                      <div className="text-center py-3">
                        <div className="relative w-24 h-24 mx-auto mb-3">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="hsla(158,30%,50%,0.15)" strokeWidth="8" />
                            <circle cx="50" cy="50" r="42" fill="none"
                              stroke={getScoreLabel(result.total).color} strokeWidth="8" strokeLinecap="round"
                              strokeDasharray={`${result.total * 2.64} 264`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold" style={{ color: getScoreLabel(result.total).color }}>{result.total}%</span>
                          </div>
                        </div>
                        <p className="font-heading text-sm" style={{ color: getScoreLabel(result.total).color }}>
                          {getScoreLabel(result.total).label}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          with {friendProfile.name} {PERSONA_EMOJI[friendProfile.persona] || ""}
                        </p>
                      </div>

                      {/* Factor breakdown */}
                      <div className="space-y-1.5">
                        {result.factors.map((f, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/15 text-[11px]">
                            <span className="flex items-center gap-1.5">
                              <span>{f.emoji}</span>
                              <span className="text-muted-foreground">{f.label}</span>
                            </span>
                            <span className="font-mono font-semibold text-primary">+{f.score}</span>
                          </div>
                        ))}
                      </div>

                      {/* Share */}
                      <button onClick={shareResult}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        {copied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</> : <><Share2 className="w-3.5 h-3.5" /> Share Result</>}
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TravelCompatibilityScore;
