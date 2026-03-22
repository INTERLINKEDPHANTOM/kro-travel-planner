import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Download, Loader2, MapPin, Calendar, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import jsPDF from "jspdf";

const TravelYearbook = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth?redirect=/travel-yearbook"); return; }
    setUser(user);
    const { data: t } = await supabase.from("saved_itineraries").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setTrips(t || []);
    const { data: p } = await supabase.from("trip_photos").select("*").eq("user_id", user.id);
    setPhotos(p || []);
    setLoading(false);
  };

  const yearTrips = trips.filter(t => new Date(t.created_at).getFullYear() === selectedYear);
  const years = [...new Set(trips.map(t => new Date(t.created_at).getFullYear()))].sort((a, b) => b - a);
  if (years.length === 0) years.push(new Date().getFullYear());

  const getPhotoUrl = (path: string) => {
    const { data } = supabase.storage.from("trip-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const generateYearbook = async () => {
    setGenerating(true);
    const doc = new jsPDF("p", "mm", "a4");
    const PW = 210, PH = 297;

    // Cover page
    doc.setFillColor(26, 60, 45);
    doc.rect(0, 0, PW, PH, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(42);
    doc.text(`${selectedYear}`, PW / 2, 100, { align: "center" });
    doc.setFontSize(16);
    doc.text("Travel Yearbook", PW / 2, 120, { align: "center" });
    doc.setFontSize(12);
    doc.text(`${yearTrips.length} trips · ${[...new Set(yearTrips.map(t => t.destination))].length} destinations`, PW / 2, 140, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(180, 220, 200);
    doc.text("Powered by KroTravel", PW / 2, PH - 30, { align: "center" });

    // Stats page
    doc.addPage();
    doc.setFillColor(245, 248, 245);
    doc.rect(0, 0, PW, PH, "F");
    doc.setTextColor(26, 60, 45);
    doc.setFontSize(24);
    doc.text("Year at a Glance", PW / 2, 40, { align: "center" });

    const totalBudget = yearTrips.reduce((sum, t) => {
      const prefs = t.preferences as any;
      return sum + (prefs?.budget_max || 0);
    }, 0);

    const stats = [
      { label: "Total Trips", value: `${yearTrips.length}` },
      { label: "Unique Destinations", value: `${[...new Set(yearTrips.map(t => t.destination))].length}` },
      { label: "Total Budget", value: `₹${totalBudget.toLocaleString("en-IN")}` },
      { label: "Photos Captured", value: `${photos.filter(p => yearTrips.some(t => t.id === p.trip_id)).length}` },
    ];

    stats.forEach((s, i) => {
      const y = 65 + i * 35;
      doc.setFillColor(230, 240, 235);
      doc.roundedRect(30, y, 150, 25, 4, 4, "F");
      doc.setFontSize(14);
      doc.setTextColor(26, 60, 45);
      doc.text(s.value, 45, y + 16);
      doc.setFontSize(10);
      doc.setTextColor(100, 120, 110);
      doc.text(s.label, 110, y + 16);
    });

    // Trip pages
    for (const trip of yearTrips) {
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, PW, PH, "F");

      // Header bar
      doc.setFillColor(26, 60, 45);
      doc.rect(0, 0, PW, 50, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text(trip.destination, 20, 32);
      doc.setFontSize(10);
      doc.text(new Date(trip.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }), PW - 20, 32, { align: "right" });

      // Trip details
      const prefs = trip.preferences as any;
      doc.setTextColor(60, 80, 70);
      doc.setFontSize(11);
      let y = 70;
      const details = [
        `Travel Type: ${prefs?.travel_type || "N/A"}`,
        `Travelers: ${prefs?.num_people || "N/A"}`,
        `Budget: Rs.${(prefs?.budget_max || 0).toLocaleString("en-IN")}`,
        `Transport: ${prefs?.transport_mode || "N/A"}`,
      ];
      details.forEach(d => { doc.text(d, 20, y); y += 12; });

      // Itinerary summary
      const itData = trip.itinerary_data as any;
      if (itData?.days) {
        y += 10;
        doc.setFontSize(13);
        doc.setTextColor(26, 60, 45);
        doc.text("Itinerary Highlights", 20, y);
        y += 10;
        doc.setFontSize(9);
        doc.setTextColor(80, 100, 90);
        for (const day of itData.days.slice(0, 5)) {
          if (y > PH - 30) break;
          doc.setFontSize(10);
          doc.setTextColor(26, 60, 45);
          doc.text(day.title || `Day ${day.day}`, 20, y);
          y += 7;
          doc.setFontSize(8);
          doc.setTextColor(100, 120, 110);
          for (const act of (day.activities || []).slice(0, 3)) {
            if (y > PH - 30) break;
            doc.text(`- ${act.activity || act.description || ""}`.slice(0, 80), 25, y);
            y += 6;
          }
          y += 3;
        }
      }
    }

    // Closing page
    doc.addPage();
    doc.setFillColor(26, 60, 45);
    doc.rect(0, 0, PW, PH, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text("Until the next", PW / 2, 120, { align: "center" });
    doc.text("adventure...", PW / 2, 150, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor(180, 220, 200);
    doc.text(`${selectedYear} Travel Yearbook by KroTravel`, PW / 2, PH - 30, { align: "center" });

    doc.save(`KroTravel_Yearbook_${selectedYear}.pdf`);
    setGenerating(false);
    toast({ title: "Yearbook downloaded!", description: `Your ${selectedYear} travel yearbook is ready` });
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
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-heading mb-2">📖 Travel Yearbook</h1>
            <p className="text-muted-foreground">Your year of adventures, beautifully compiled</p>
          </motion.div>

          {/* Year selector */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {years.map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedYear === y
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "glass-panel hover:bg-primary/10"
                }`}
              >
                {y}
              </button>
            ))}
          </div>

          {/* Year Summary */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-6 rounded-2xl mb-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <MapPin className="w-6 h-6 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold">{yearTrips.length}</p>
                <p className="text-xs text-muted-foreground">Trips</p>
              </div>
              <div>
                <Calendar className="w-6 h-6 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold">{[...new Set(yearTrips.map(t => t.destination))].length}</p>
                <p className="text-xs text-muted-foreground">Destinations</p>
              </div>
              <div>
                <Wallet className="w-6 h-6 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold">{photos.filter(p => yearTrips.some(t => t.id === p.trip_id)).length}</p>
                <p className="text-xs text-muted-foreground">Photos</p>
              </div>
            </div>
          </motion.div>

          {/* Trip cards */}
          <div className="space-y-3 mb-8">
            {yearTrips.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel p-4 rounded-xl flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{trip.destination}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(trip.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {photos.filter(p => p.trip_id === trip.id).length} photos
                </span>
              </motion.div>
            ))}
          </div>

          {yearTrips.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No trips in {selectedYear} yet</p>
            </div>
          ) : (
            <Button onClick={generateYearbook} disabled={generating} className="w-full rounded-xl">
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
              {generating ? "Generating..." : `Download ${selectedYear} Yearbook PDF`}
            </Button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TravelYearbook;
