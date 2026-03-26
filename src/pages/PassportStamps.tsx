import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Stamp, Globe, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STAMP_COLORS = [
  "from-red-500/80 to-red-700/80",
  "from-blue-500/80 to-blue-700/80",
  "from-green-500/80 to-green-700/80",
  "from-purple-500/80 to-purple-700/80",
  "from-orange-500/80 to-orange-700/80",
  "from-teal-500/80 to-teal-700/80",
  "from-pink-500/80 to-pink-700/80",
  "from-indigo-500/80 to-indigo-700/80",
];

export default function PassportStamps() {
  const [stamps, setStamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Auto-generate stamps from saved itineraries
    const { data: trips } = await supabase.from("saved_itineraries").select("id, destination, created_at").eq("user_id", user.id);
    const { data: existingStamps } = await supabase.from("passport_stamps").select("*").eq("user_id", user.id);

    const existingDests = new Set(existingStamps?.map(s => s.destination.toLowerCase()) || []);
    const newStamps = (trips || []).filter(t => !existingDests.has(t.destination.toLowerCase()));

    if (newStamps.length > 0) {
      await supabase.from("passport_stamps").insert(
        newStamps.map(t => ({
          user_id: user.id, destination: t.destination,
          trip_id: t.id, stamp_date: t.created_at?.split("T")[0] || new Date().toISOString().split("T")[0]
        }))
      );
    }

    const { data: allStamps } = await supabase.from("passport_stamps").select("*").eq("user_id", user.id).order("stamp_date", { ascending: false });
    setStamps(allStamps || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <Stamp className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Digital Passport</h1>
          <p className="text-muted-foreground mt-2">{stamps.length} stamps collected</p>
        </motion.div>

        {/* Passport Book */}
        <div className="glass-panel rounded-2xl p-6 border-2 border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

          <div className="text-center mb-6 pb-4 border-b border-border/30">
            <Globe className="w-8 h-8 text-primary mx-auto mb-2" />
            <h2 className="text-lg font-bold text-foreground tracking-widest uppercase">Travel Passport</h2>
            <p className="text-xs text-muted-foreground">KroTravel Digital Edition</p>
          </div>

          {loading ? (
            <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
          ) : stamps.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Plan your first trip to get your first stamp! ✈️</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {stamps.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: Math.random() * 10 - 5 }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
                  className="relative">
                  <div className={`bg-gradient-to-br ${STAMP_COLORS[i % STAMP_COLORS.length]} rounded-xl p-4 text-white text-center shadow-lg
                    border-2 border-white/20 transform hover:scale-105 transition-transform`}>
                    <div className="border-2 border-white/40 border-dashed rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-widest opacity-70">Visited</p>
                      <p className="font-bold text-sm mt-1 truncate">{s.destination}</p>
                      <p className="text-[10px] mt-1 opacity-70">{new Date(s.stamp_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
                      <div className="mt-2 text-lg">✈️</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
