import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Loader2, Share2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BINGO_ITEMS = [
  { key: "street_food", label: "Eat Street Food", emoji: "🍜" },
  { key: "sunrise", label: "Watch a Sunrise", emoji: "🌅" },
  { key: "local_bus", label: "Ride a Local Bus", emoji: "🚌" },
  { key: "temple", label: "Visit a Temple", emoji: "🛕" },
  { key: "mountain", label: "Hike a Mountain", emoji: "🏔️" },
  { key: "beach", label: "Walk on a Beach", emoji: "🏖️" },
  { key: "market", label: "Shop at Local Market", emoji: "🛒" },
  { key: "sunset", label: "Watch a Sunset", emoji: "🌇" },
  { key: "museum", label: "Visit a Museum", emoji: "🏛️" },
  { key: "boat_ride", label: "Take a Boat Ride", emoji: "⛵" },
  { key: "waterfall", label: "See a Waterfall", emoji: "💧" },
  { key: "night_market", label: "Night Market Visit", emoji: "🌃" },
  { key: "free_star", label: "FREE ⭐", emoji: "⭐" },
  { key: "homestay", label: "Stay at Homestay", emoji: "🏡" },
  { key: "try_language", label: "Speak Local Language", emoji: "🗣️" },
  { key: "photo_stranger", label: "Photo with a Local", emoji: "📸" },
  { key: "train_ride", label: "Take a Train Ride", emoji: "🚂" },
  { key: "dance", label: "Dance at an Event", emoji: "💃" },
  { key: "monument", label: "Visit a Monument", emoji: "🗿" },
  { key: "local_dish", label: "Try Regional Dish", emoji: "🍛" },
  { key: "wildlife", label: "Spot Wildlife", emoji: "🦋" },
  { key: "camping", label: "Sleep Under Stars", emoji: "⛺" },
  { key: "fort", label: "Explore a Fort", emoji: "🏰" },
  { key: "chai", label: "Roadside Chai/Coffee", emoji: "☕" },
  { key: "souvenir", label: "Buy a Souvenir", emoji: "🎁" },
];

const TravelBingo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth?redirect=/travel-bingo"); return; }
    setUser(user);

    const { data } = await supabase
      .from("travel_bingo_items")
      .select("item_key")
      .eq("user_id", user.id)
      .eq("completed", true);

    const set = new Set((data || []).map(d => d.item_key));
    set.add("free_star"); // Free space always completed
    setCompletedItems(set);
    setLoading(false);
  };

  const toggleItem = async (key: string) => {
    if (key === "free_star" || !user) return;
    const isCompleted = completedItems.has(key);

    if (isCompleted) {
      await supabase.from("travel_bingo_items").delete().eq("user_id", user.id).eq("item_key", key);
      setCompletedItems(prev => { const n = new Set(prev); n.delete(key); return n; });
    } else {
      await supabase.from("travel_bingo_items").upsert({
        user_id: user.id,
        item_key: key,
        completed: true,
        completed_at: new Date().toISOString(),
      });
      setCompletedItems(prev => new Set(prev).add(key));
      toast({ title: `${BINGO_ITEMS.find(b => b.key === key)?.emoji} Completed!`, description: BINGO_ITEMS.find(b => b.key === key)?.label });
    }
  };

  // Check bingo lines
  const checkBingo = () => {
    const grid = BINGO_ITEMS.map(b => completedItems.has(b.key));
    let lines = 0;
    // Rows
    for (let r = 0; r < 5; r++) {
      if ([0,1,2,3,4].every(c => grid[r * 5 + c])) lines++;
    }
    // Cols
    for (let c = 0; c < 5; c++) {
      if ([0,1,2,3,4].every(r => grid[r * 5 + c])) lines++;
    }
    // Diagonals
    if ([0,6,12,18,24].every(i => grid[i])) lines++;
    if ([4,8,12,16,20].every(i => grid[i])) lines++;
    return lines;
  };

  const bingoLines = checkBingo();
  const progress = Math.round((completedItems.size / 25) * 100);

  const shareBingo = () => {
    const text = `🎯 Travel Bingo Progress: ${completedItems.size}/25 completed! ${bingoLines > 0 ? `🏆 ${bingoLines} BINGO line${bingoLines > 1 ? "s" : ""}!` : ""} #KroTravel`;
    if (navigator.share) navigator.share({ text });
    else { navigator.clipboard.writeText(text); toast({ title: "Copied to clipboard!" }); }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <h1 className="text-3xl font-heading mb-1">🎯 Travel Bingo</h1>
            <p className="text-muted-foreground text-sm mb-3">Complete experiences to earn BINGO lines!</p>

            <div className="flex justify-center gap-4 mb-4">
              <div className="glass-panel px-4 py-2 rounded-full text-sm">
                <span className="font-bold text-primary">{completedItems.size}</span>/25
              </div>
              {bingoLines > 0 && (
                <div className="glass-panel px-4 py-2 rounded-full text-sm bg-primary/10">
                  🏆 {bingoLines} BINGO!
                </div>
              )}
              <Button variant="outline" size="sm" className="rounded-full" onClick={shareBingo}>
                <Share2 className="w-3.5 h-3.5 mr-1" /> Share
              </Button>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden mx-auto max-w-xs">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </motion.div>

          {/* Bingo Grid */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {BINGO_ITEMS.map((item, i) => {
              const done = completedItems.has(item.key);
              return (
                <motion.button
                  key={item.key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => toggleItem(item.key)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 text-center transition-all border ${
                    done
                      ? "bg-primary/15 border-primary/40 shadow-[0_0_12px_hsla(158,42%,36%,0.2)]"
                      : "glass-panel border-border/30 hover:border-primary/30"
                  }`}
                >
                  <span className="text-lg sm:text-xl">{item.emoji}</span>
                  <span className="text-[9px] sm:text-[10px] leading-tight mt-0.5 text-foreground/80 line-clamp-2">
                    {item.label}
                  </span>
                  {done && item.key !== "free_star" && (
                    <Check className="w-3 h-3 text-primary mt-0.5" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {bingoLines >= 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 text-center glass-panel p-6 rounded-2xl bg-primary/10"
            >
              <Star className="w-10 h-10 text-primary mx-auto mb-2" />
              <h3 className="font-heading text-lg">Travel Master! 🎉</h3>
              <p className="text-sm text-muted-foreground">You've completed {bingoLines} bingo lines!</p>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TravelBingo;
