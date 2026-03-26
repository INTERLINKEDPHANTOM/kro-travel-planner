import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Heart, MapPin, Calendar, Send, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STYLES = ["Explorer", "Backpacker", "Luxury", "Adventure", "Cultural", "Foodie", "Spiritual"];

export default function DuoTravel() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState({ destination: "", start: "", end: "", style: "Explorer", bio: "" });
  const { toast } = useToast();

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
    const { data } = await supabase.from("duo_travel_matches").select("*").eq("is_active", true).order("created_at", { ascending: false });
    setListings(data || []);
    setLoading(false);
  };

  const createListing = async () => {
    if (!userId || !form.destination || !form.start || !form.end) {
      toast({ title: "Fill all fields", variant: "destructive" }); return;
    }
    setCreating(true);
    await supabase.from("duo_travel_matches").insert({
      user_id: userId, destination: form.destination,
      travel_dates_start: form.start, travel_dates_end: form.end,
      travel_style: form.style.toLowerCase(), bio: form.bio
    });
    toast({ title: "🎉 Listing created!", description: "Travelers with similar plans will find you" });
    setForm({ destination: "", start: "", end: "", style: "Explorer", bio: "" });
    setCreating(false);
    init();
  };

  const otherListings = listings.filter(l => l.user_id !== userId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Duo Travel</h1>
          <p className="text-muted-foreground mt-2">Find a travel buddy with similar plans</p>
        </motion.div>

        {/* Create listing */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-2xl mb-8 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2"><Send className="w-4 h-4" /> Post Your Travel Plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Destination (e.g. Goa)" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} />
            <select value={form.style} onChange={e => setForm(f => ({ ...f, style: e.target.value }))}
              className="h-10 rounded-xl border border-border/60 bg-card/40 backdrop-blur-xl px-3 text-sm text-foreground">
              {STYLES.map(s => <option key={s}>{s}</option>)}
            </select>
            <Input type="date" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
            <Input type="date" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
          </div>
          <Input placeholder="Short bio — what kind of traveler are you?" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
          <Button onClick={createListing} disabled={creating} className="w-full">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post My Travel Plan"}
          </Button>
        </motion.div>

        {/* Listings */}
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-primary" /> Available Travel Buddies</h2>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : otherListings.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary/40" />
            No travel plans yet. Be the first to post!
          </div>
        ) : (
          <div className="grid gap-4">
            {otherListings.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-panel p-4 rounded-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-foreground">{l.destination}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{l.travel_style}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(l.travel_dates_start).toLocaleDateString()} — {new Date(l.travel_dates_end).toLocaleDateString()}
                    </div>
                    {l.bio && <p className="text-sm text-muted-foreground mt-2">{l.bio}</p>}
                  </div>
                  <Button size="sm" variant="glass" onClick={() => toast({ title: "🤝 Interest sent!", description: "We'll notify them about your interest" })}>
                    Connect
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
