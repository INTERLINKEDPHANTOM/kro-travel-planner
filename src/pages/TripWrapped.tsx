import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Calendar, Users, Wallet, Loader2, Share2, Download,
  ArrowLeft, Star, Zap, TrendingUp, Clock, Crown, Heart, Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const EMOJIS = ["🏔️", "🏖️", "🌆", "🏕️", "🌅", "🗺️", "🚂", "✈️", "🛺", "🧳"];

const TripWrapped = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<any>(null);
  const [allTrips, setAllTrips] = useState<any[]>([]);
  const [titleData, setTitleData] = useState<any>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    init();
  }, [tripId]);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    const [{ data: tripData }, { data: tripsData }, { data: titleInfo }] = await Promise.all([
      supabase.from("saved_itineraries").select("*").eq("id", tripId!).maybeSingle(),
      supabase.from("saved_itineraries").select("*").eq("user_id", user.id),
      supabase.from("user_titles").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

    setTrip(tripData);
    setAllTrips(tripsData || []);
    setTitleData(titleInfo);
    setLoading(false);

    // Auto-advance slides
    let s = 0;
    const interval = setInterval(() => {
      s++;
      if (s >= 6) { clearInterval(interval); }
      setStep(s);
    }, 2400);
    return () => clearInterval(interval);
  };

  const sharePage = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `My Trip Wrapped – ${trip?.destination}`, url });
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Link copied! 🔗" });
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!trip) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Navbar />
      <p className="text-muted-foreground">Trip not found.</p>
      <Link to="/my-trips"><button className="btn-primary px-6 py-3">My Trips</button></Link>
    </div>
  );

  const prefs = trip.preferences || {};
  const depDate = prefs.departureDate ? new Date(prefs.departureDate) : null;
  const arrDate = prefs.arrivalDate ? new Date(prefs.arrivalDate) : null;
  const days = depDate && arrDate
    ? Math.max(1, Math.ceil((arrDate.getTime() - depDate.getTime()) / 86400000))
    : prefs.numDays || "?";
  const numPeople = prefs.numPeople || 1;
  const budget = prefs.budgetMax ? `₹${Number(prefs.budgetMax).toLocaleString("en-IN")}` : "—";
  const persona = prefs.travelPersona || "explorer";
  const travelType = prefs.travelType || "leisure";

  const PERSONA_EMOJI: Record<string, string> = {
    budget: "🥷", luxury: "💎", backpacker: "🎒", spiritual: "🙏",
    adventure: "⛰️", family: "👨‍👩‍👧", solo: "🧍", group: "👥", explorer: "🧭"
  };

  const slides = [
    {
      bg: "linear-gradient(135deg, hsl(158, 60%, 18%), hsl(162, 65%, 10%))",
      content: (
        <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="text-7xl">{EMOJIS[Math.floor(Math.random() * EMOJIS.length)]}</motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <p className="text-white/60 text-sm mb-2 uppercase tracking-widest">Your Trip Wrapped</p>
            <h2 className="text-3xl font-heading text-white">{trip.destination}</h2>
            {depDate && <p className="text-white/70 mt-2 text-sm">{depDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>}
          </motion.div>
        </div>
      ),
    },
    {
      bg: "linear-gradient(135deg, hsl(200, 70%, 20%), hsl(220, 65%, 12%))",
      content: (
        <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/60 text-sm uppercase tracking-widest">The Journey</motion.p>
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-8xl font-heading text-white">{days}</motion.div>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-white/80 text-xl">days of adventure</motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex items-center gap-2 text-white/60 text-sm">
            <Users className="w-4 h-4" /> {numPeople} traveller{numPeople !== 1 ? "s" : ""}
          </motion.div>
        </div>
      ),
    },
    {
      bg: "linear-gradient(135deg, hsl(35, 80%, 20%), hsl(45, 70%, 12%))",
      content: (
        <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/60 text-sm uppercase tracking-widest">Your Traveller Persona</motion.p>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 180, delay: 0.2 }}
            className="text-8xl">{PERSONA_EMOJI[persona] || "🧭"}</motion.div>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-2xl font-heading text-white capitalize">{persona}</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-white/60 text-sm capitalize">{travelType} travel</motion.p>
        </div>
      ),
    },
    {
      bg: "linear-gradient(135deg, hsl(270, 60%, 18%), hsl(280, 55%, 10%))",
      content: (
        <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/60 text-sm uppercase tracking-widest">Budget Snapshot</motion.p>
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-5xl font-heading text-white">{budget}</motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-white/70 text-sm">total budget planned</motion.p>
          {prefs.food_preference && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="px-4 py-2 rounded-full text-sm text-white border border-white/20 capitalize">
              🍽️ {prefs.food_preference} food
            </motion.div>
          )}
        </div>
      ),
    },
    {
      bg: "linear-gradient(135deg, hsl(340, 60%, 18%), hsl(0, 55%, 12%))",
      content: (
        <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/60 text-sm uppercase tracking-widest">Your Traveller Title</motion.p>
          {titleData ? (
            <>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="text-8xl">{titleData.badge_emoji}</motion.div>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="text-2xl font-heading text-white">{titleData.title}</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="text-white/60 text-sm">{titleData.trips_count} trips completed</motion.p>
            </>
          ) : (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/70 text-lg">Keep exploring to unlock titles! 🌍</motion.p>
          )}
        </div>
      ),
    },
    {
      bg: "linear-gradient(135deg, hsl(158, 60%, 12%), hsl(160, 65%, 7%))",
      content: (
        <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "hsla(158, 42%, 40%, 0.3)", border: "1px solid hsla(158, 42%, 60%, 0.3)" }}>
            <Heart className="w-8 h-8 text-white" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-2xl font-heading text-white mb-2">What a trip! 🎉</h2>
            <p className="text-white/60 text-sm">This was trip #{allTrips.length} of your journey. Keep exploring the world with KroTravel.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex gap-3 flex-wrap justify-center">
            <button onClick={sharePage}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white border border-white/30 hover:bg-white/10 transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <Link to={`/trip-chat/${tripId}`}>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white border border-white/30 hover:bg-white/10 transition-colors">
                💬 Open Chat
              </button>
            </Link>
          </motion.div>
        </div>
      ),
    },
  ];

  const currentSlide = slides[Math.min(step, slides.length - 1)];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "hsl(158, 20%, 6%)" }}>
      <Navbar />

      <div className="w-full max-w-sm mx-auto px-4 pt-20 pb-10">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Card */}
        <div ref={cardRef} className="relative rounded-3xl overflow-hidden" style={{ minHeight: 520 }}>
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 p-8"
            style={{ background: currentSlide.bg }}
          >
            {currentSlide.content}
          </motion.div>

          {/* KroTravel watermark */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <span className="text-white/30 text-xs font-heading tracking-widest">KroTravel</span>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${i === Math.min(step, slides.length - 1) ? "w-6 bg-white" : "w-1.5 bg-white/30"}`}
            />
          ))}
        </div>

        {/* Nav */}
        <div className="flex gap-3 mt-5">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 rounded-2xl text-sm font-medium text-white border border-white/20 hover:bg-white/10 transition-colors">
              ← Prev
            </button>
          )}
          {step < slides.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="flex-1 py-3 rounded-2xl text-sm font-medium text-white border border-white/20 hover:bg-white/10 transition-colors">
              Next →
            </button>
          ) : (
            <Link to="/my-trips" className="flex-1">
              <button className="w-full py-3 rounded-2xl text-sm font-medium btn-primary">
                Back to Trips
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripWrapped;
