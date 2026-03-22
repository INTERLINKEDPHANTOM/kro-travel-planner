import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, MapPin, Globe, Loader2, Crown, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface LeaderEntry {
  user_id: string;
  email: string;
  name: string;
  trip_count: number;
  destinations: string[];
  unique_cities: number;
}

const RANK_ICONS = [Crown, Medal, Award];
const RANK_COLORS = ["text-yellow-500", "text-slate-400", "text-amber-600"];

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth?redirect=/leaderboard"); return; }
    setCurrentUserId(user.id);

    // Get all itineraries with user profiles
    const { data: itineraries } = await supabase
      .from("saved_itineraries")
      .select("user_id, destination")
      .eq("status", "saved");

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, email");

    if (!itineraries) { setLoading(false); return; }

    // Aggregate by user
    const userMap: Record<string, LeaderEntry> = {};
    for (const it of itineraries) {
      if (!userMap[it.user_id]) {
        const profile = profiles?.find(p => p.user_id === it.user_id);
        userMap[it.user_id] = {
          user_id: it.user_id,
          email: profile?.email || "",
          name: profile?.full_name || "Traveler",
          trip_count: 0,
          destinations: [],
          unique_cities: 0,
        };
      }
      userMap[it.user_id].trip_count++;
      if (!userMap[it.user_id].destinations.includes(it.destination)) {
        userMap[it.user_id].destinations.push(it.destination);
      }
    }

    const sorted = Object.values(userMap)
      .map(u => ({ ...u, unique_cities: u.destinations.length }))
      .sort((a, b) => b.trip_count - a.trip_count || b.unique_cities - a.unique_cities);

    setLeaders(sorted.slice(0, 50));
    setLoading(false);
  };

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??";

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-heading mb-2">🏆 Traveler Leaderboard</h1>
            <p className="text-muted-foreground">Top explorers ranked by trips & destinations</p>
          </motion.div>

          {/* Top 3 Podium */}
          {leaders.length >= 3 && (
            <div className="flex items-end justify-center gap-3 mb-10">
              {[1, 0, 2].map((idx) => {
                const l = leaders[idx];
                const isFirst = idx === 0;
                return (
                  <motion.div
                    key={l.user_id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className={`glass-panel p-4 rounded-2xl text-center ${isFirst ? "pb-8 -mt-4" : ""}`}
                    style={{ width: isFirst ? "140px" : "120px" }}
                  >
                    <div className={`w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold mb-2 ${RANK_COLORS[idx]}`}>
                      {getInitials(l.name)}
                    </div>
                    {(() => { const Icon = RANK_ICONS[idx]; return <Icon className={`w-6 h-6 mx-auto mb-1 ${RANK_COLORS[idx]}`} />; })()}
                    <p className="font-semibold text-sm truncate">{l.name || "Traveler"}</p>
                    <p className="text-xs text-muted-foreground">{l.trip_count} trips</p>
                    <p className="text-xs text-primary">{l.unique_cities} cities</p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Full list */}
          <div className="space-y-2">
            {leaders.map((l, i) => (
              <motion.div
                key={l.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`glass-panel p-4 rounded-xl flex items-center gap-4 ${
                  l.user_id === currentUserId ? "ring-2 ring-primary/40 bg-primary/5" : ""
                }`}
              >
                <span className={`w-8 text-center font-bold text-lg ${i < 3 ? RANK_COLORS[i] : "text-muted-foreground"}`}>
                  {i + 1}
                </span>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {getInitials(l.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {l.name || "Traveler"}
                    {l.user_id === currentUserId && <span className="text-xs text-primary ml-2">(You)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {l.destinations.slice(0, 3).join(", ")}{l.destinations.length > 3 ? ` +${l.destinations.length - 3}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{l.trip_count}</p>
                  <p className="text-[10px] text-muted-foreground">trips</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-primary">{l.unique_cities}</p>
                  <p className="text-[10px] text-muted-foreground">cities</p>
                </div>
              </motion.div>
            ))}
          </div>

          {leaders.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No travelers yet. Be the first to plan a trip!</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Leaderboard;
