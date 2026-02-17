import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, Wallet, Trash2, Eye, RotateCcw, Bell, BellOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MyTrips = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth?redirect=/my-trips");
      return;
    }
    setUser(user);
    fetchTrips(user.id);
  };

  const fetchTrips = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("saved_itineraries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching trips:", error);
    }
    setTrips(data || []);
    setLoading(false);
  };

  const deleteTrip = async (id: string) => {
    const { error } = await supabase.from("saved_itineraries").delete().eq("id", id);
    if (!error) {
      setTrips((prev) => prev.filter((t) => t.id !== id));
      toast({ title: "Trip deleted" });
    }
  };

  const viewTrip = (trip: any) => {
    sessionStorage.setItem("tripPreferences", JSON.stringify(trip.preferences));
    sessionStorage.setItem("savedItinerary", JSON.stringify(trip.itinerary_data));
    sessionStorage.setItem("savedItineraryId", trip.id);
    navigate("/paid-itinerary");
  };

  const regenerateTrip = (trip: any) => {
    if (trip.regenerate_count >= 3) {
      toast({ title: "Regeneration limit reached", description: "You can regenerate up to 3 times per trip.", variant: "destructive" });
      return;
    }
    sessionStorage.setItem("tripPreferences", JSON.stringify(trip.preferences));
    sessionStorage.setItem("regenerateTrip", trip.id);
    navigate("/paid-itinerary");
  };

  const toggleReminder = async (trip: any) => {
    const prefs = trip.preferences;
    const departureDate = prefs?.departureDate;
    if (!departureDate || !user) return;

    // Check if reminder exists
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("trip_id", trip.id)
      .eq("user_id", user.id)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase.from("notifications").delete().eq("trip_id", trip.id);
      toast({ title: "Reminder removed" });
    } else {
      const depDate = new Date(departureDate);
      const reminderDate = new Date(depDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before

      await supabase.from("notifications").insert([
        {
          user_id: user.id,
          trip_id: trip.id,
          type: "departure_reminder",
          title: `🧳 Trip to ${trip.destination} tomorrow!`,
          message: `Don't forget to pack! Your trip to ${trip.destination} starts ${new Date(departureDate).toLocaleDateString()}.`,
          scheduled_for: reminderDate.toISOString(),
        },
        {
          user_id: user.id,
          trip_id: trip.id,
          type: "packing_reminder",
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

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-heading mb-3">My Trips</h1>
            <p className="text-muted-foreground">Your saved itineraries and travel history</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : trips.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-heading mb-2">No trips yet</h2>
              <p className="text-muted-foreground mb-6">Plan your first trip and it'll appear here</p>
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
                  className="warm-card rounded-2xl p-5 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-heading text-lg mb-1">{trip.destination}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {trip.preferences?.departureDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(trip.preferences.departureDate).toLocaleDateString()}
                          </span>
                        )}
                        {trip.preferences?.numPeople && (
                          <span>{trip.preferences.numPeople} people</span>
                        )}
                        {trip.preferences?.budgetMax && (
                          <span className="flex items-center gap-1">
                            <Wallet className="w-3 h-3" />
                            ₹{trip.preferences.budgetMax}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
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
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => viewTrip(trip)}>
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => regenerateTrip(trip)}
                        title={trip.regenerate_count >= 3 ? "Limit reached" : "Regenerate"}
                      >
                        <RotateCcw className="w-4 h-4" />
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
