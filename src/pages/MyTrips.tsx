import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, Wallet, Trash2, Eye, RotateCcw, Bell, Loader2,
  X, AlertCircle, Lightbulb, ArrowRight, CheckCircle2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ISSUE_PRESETS = [
  "I forgot to include a specific place",
  "Budget is too high, need cheaper options",
  "I need more time at certain stops",
  "Hotel options don't fit my preference",
  "I want to add a day-trip",
  "The transport plan needs updating",
  "I want vegetarian food options only",
  "Want more local / offbeat experiences",
];

// ── Regenerate Modal ─────────────────────────────────────────────────────────
const RegenerateModal = ({
  trip,
  onClose,
  onConfirm,
}: {
  trip: any;
  onClose: () => void;
  onConfirm: (issue: string) => void;
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");

  const toggle = (p: string) =>
    setSelected((s) => s.includes(p) ? s.filter((x) => x !== p) : [...s, p]);

  const handleConfirm = () => {
    const combined = [...selected, ...(custom.trim() ? [custom.trim()] : [])].join(". ");
    if (!combined) return;
    onConfirm(combined);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="glass-intense rounded-3xl p-6 sm:p-8 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
          style={{ boxShadow: "0 24px 80px hsla(158, 42%, 28%, 0.25)" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
                <RotateCcw className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-base" style={{ color: "hsl(158, 45%, 10%)" }}>
                  Regenerate Itinerary
                </h2>
                <p className="text-xs text-muted-foreground">{trip.destination}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full glass-panel flex items-center justify-center text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl p-3 mb-5 text-xs"
            style={{ background: "hsla(158, 42%, 38%, 0.07)", border: "1px solid hsla(158, 42%, 60%, 0.18)" }}>
            <Lightbulb className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
            <span style={{ color: "hsl(158, 30%, 30%)" }}>
              Tell us what you missed or want to change — AI will update only those parts, not the whole plan.
            </span>
          </div>

          {/* Preset chips */}
          <p className="text-xs font-semibold mb-2" style={{ color: "hsl(158, 38%, 22%)" }}>Quick select:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {ISSUE_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => toggle(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selected.includes(p)
                    ? "text-white shadow-sm"
                    : "glass-panel text-muted-foreground hover:text-foreground"
                }`}
                style={selected.includes(p) ? { background: "linear-gradient(135deg, hsl(158, 42%, 38%), hsl(162, 45%, 28%))" } : {}}
              >
                {selected.includes(p) && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                {p}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <p className="text-xs font-semibold mb-2" style={{ color: "hsl(158, 38%, 22%)" }}>Or describe in detail:</p>
          <textarea
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="e.g. I wanted to visit Triund trek but it wasn't included. Also need budget options under ₹2000/day…"
            className="glass-input w-full px-4 py-3 text-sm resize-none rounded-xl mb-5"
            rows={3}
          />

          {selected.length === 0 && !custom.trim() && (
            <div className="flex items-center gap-2 text-xs text-destructive mb-4">
              <AlertCircle className="w-3.5 h-3.5" /> Select at least one issue or describe your concern.
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost-glass flex-1 py-3 text-sm">Cancel</button>
            <button
              onClick={handleConfirm}
              disabled={selected.length === 0 && !custom.trim()}
              className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Regenerate <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center mt-3">
            {trip.regenerate_count}/3 regenerations used
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const MyTrips = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [regeneratingTrip, setRegeneratingTrip] = useState<any>(null);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth?redirect=/my-trips"); return; }
    setUser(user);
    fetchTrips(user.id);
  };

  const fetchTrips = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("saved_itineraries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setTrips(data || []);
    setLoading(false);
  };

  const deleteTrip = async (id: string) => {
    await supabase.from("saved_itineraries").delete().eq("id", id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "Trip deleted" });
  };

  const viewTrip = (trip: any) => {
    sessionStorage.setItem("tripPreferences", JSON.stringify(trip.preferences));
    sessionStorage.setItem("savedItinerary", JSON.stringify(trip.itinerary_data));
    sessionStorage.setItem("savedItineraryId", trip.id);
    navigate("/paid-itinerary");
  };

  const handleRegenerateConfirm = (trip: any, issue: string) => {
    setRegeneratingTrip(null);
    // Store preferences + issue description so PaidItinerary can use it for partial update
    const prefs = { ...trip.preferences, regenerateIssue: issue };
    sessionStorage.setItem("tripPreferences", JSON.stringify(prefs));
    sessionStorage.setItem("regenerateTrip", trip.id);
    sessionStorage.setItem("regenerateIssue", issue);
    navigate("/paid-itinerary");
  };

  const openRegenerate = (trip: any) => {
    if (trip.regenerate_count >= 3) {
      toast({ title: "Regeneration limit reached", description: "You can regenerate up to 3 times per trip.", variant: "destructive" });
      return;
    }
    setRegeneratingTrip(trip);
  };

  const toggleReminder = async (trip: any) => {
    const prefs = trip.preferences;
    const departureDate = prefs?.departureDate;
    if (!departureDate || !user) return;

    const { data: existing } = await supabase.from("notifications").select("id").eq("trip_id", trip.id).eq("user_id", user.id).limit(1);

    if (existing && existing.length > 0) {
      await supabase.from("notifications").delete().eq("trip_id", trip.id);
      toast({ title: "Reminder removed" });
    } else {
      const depDate = new Date(departureDate);
      await supabase.from("notifications").insert([
        {
          user_id: user.id, trip_id: trip.id, type: "departure_reminder",
          title: `🧳 Trip to ${trip.destination} tomorrow!`,
          message: `Don't forget to pack! Your trip to ${trip.destination} starts ${new Date(departureDate).toLocaleDateString()}.`,
          scheduled_for: new Date(depDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          user_id: user.id, trip_id: trip.id, type: "packing_reminder",
          title: `📦 Packing reminder for ${trip.destination}`,
          message: `Start packing for your trip! Check your packing checklist in the itinerary.`,
          scheduled_for: new Date(depDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
      toast({ title: "Reminders set!", description: "You'll get packing & departure reminders." });
    }
    fetchTrips(user.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Regenerate modal */}
      {regeneratingTrip && (
        <RegenerateModal
          trip={regeneratingTrip}
          onClose={() => setRegeneratingTrip(null)}
          onConfirm={(issue) => handleRegenerateConfirm(regeneratingTrip, issue)}
        />
      )}

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-heading mb-3" style={{ color: "hsl(158, 45%, 10%)" }}>My Trips</h1>
            <p className="text-muted-foreground text-sm">Your saved itineraries and travel history</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : trips.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-heading mb-2" style={{ color: "hsl(158, 45%, 12%)" }}>No trips yet</h2>
              <p className="text-muted-foreground mb-6 text-sm">Plan your first trip and it'll appear here</p>
              <Link to="/plan">
                <button className="btn-primary px-8 py-3">Plan a Trip</button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip, i) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-panel rounded-2xl p-5 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-heading text-lg mb-1" style={{ color: "hsl(158, 45%, 10%)" }}>{trip.destination}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {trip.preferences?.departureDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(trip.preferences.departureDate).toLocaleDateString()}
                          </span>
                        )}
                        {trip.preferences?.numPeople && <span>{trip.preferences.numPeople} people</span>}
                        {trip.preferences?.budgetMax && (
                          <span className="flex items-center gap-1">
                            <Wallet className="w-3 h-3" /> ₹{trip.preferences.budgetMax}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {trip.status === "generated" ? "Generated" : trip.status}
                        </span>
                        {trip.regenerate_count > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            Regenerated {trip.regenerate_count}x
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => viewTrip(trip)}>
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate(`/trip-gallery/${trip.id}`)}>
                        📸
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => openRegenerate(trip)}
                        title={trip.regenerate_count >= 3 ? "Limit reached" : "Regenerate itinerary"}
                        disabled={trip.regenerate_count >= 3}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Regenerate
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => toggleReminder(trip)}>
                        <Bell className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-destructive hover:text-destructive"
                        onClick={() => deleteTrip(trip.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
};

export default MyTrips;
