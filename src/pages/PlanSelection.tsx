import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Star, ArrowRight, Camera, Film, Cloud, Crown, Zap, Shield, Map, Plane, Gift } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PlanSelection = () => {
  const stored = sessionStorage.getItem("tripPreferences");
  const tripPrefs = stored ? JSON.parse(stored) : null;
  const destination = tripPrefs?.arrival?.trim() || "";
  const destinationDisplay = destination.charAt(0).toUpperCase() + destination.slice(1);

  const plans = [
    {
      id: "free",
      name: "Explorer",
      Icon: Map,
      price: "Free",
      priceNote: "forever",
      badge: null,
      color: "hsl(158, 25%, 48%)",
      features: [
        { text: "Destination overview & vibe", ok: true },
        { text: "Top must-visit places", ok: true },
        { text: "Rough budget estimate", ok: true },
        { text: "Hour-by-hour schedule", ok: false },
        { text: "Hotel & transport picks", ok: false },
        { text: "PDF download", ok: false },
      ],
      cta: "View Free Guide",
      link: destination ? `/itinerary/${destination.toLowerCase()}` : "/destinations",
      highlight: false,
    },
    {
      id: "basic",
      name: "Voyager",
      Icon: Plane,
      price: "Per Trip",
      priceNote: "one-time",
      badge: "Most Popular",
      color: "hsl(158, 42%, 38%)",
      features: [
        { text: "Hour-by-hour AI itinerary", ok: true },
        { text: "Transport & hotel picks", ok: true },
        { text: "Exact budget breakdown", ok: true },
        { text: "PDF download", ok: true },
        { text: "1 GB trip cloud storage", ok: true },
        { text: "Auto virtual album + reel", ok: true },
      ],
      cta: "Plan My Trip",
      link: "/paid-itinerary",
      highlight: true,
    },
    {
      id: "premium",
      name: "Nomad",
      Icon: Crown,
      price: "₹799/yr",
      priceNote: "best value",
      badge: "Best Value",
      color: "hsl(162, 45%, 28%)",
      features: [
        { text: "Everything in Voyager", ok: true },
        { text: "40 GB cloud storage", ok: true },
        { text: "3 reels per trip", ok: true },
        { text: "Unlimited regenerations", ok: true },
        { text: "Multi-city trip planning", ok: true },
        { text: "Priority AI support", ok: true },
      ],
      cta: "Go Premium",
      link: "/paid-itinerary",
      highlight: false,
    },
  ];

  const perks = [
    { Icon: Cloud, title: "1 GB Cloud", desc: "Private photo storage" },
    { Icon: Camera, title: "Auto Album", desc: "10–15 page virtual album" },
    { Icon: Film, title: "Instant Reel", desc: "Template video reel" },
    { Icon: Crown, title: "Shared Space", desc: "Invite friends & family" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-orb-1" style={{ top: "5%", right: "10%", opacity: 0.6 }} />
        <div className="ambient-orb-2" style={{ bottom: "20%", left: "5%", opacity: 0.5 }} />
      </div>

      <Navbar />

      <div className="relative z-10 pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 sm:mb-14"
          >
            {destination && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-5 text-sm font-medium"
                style={{ color: "hsl(158, 38%, 28%)" }}>
                <Map className="w-3.5 h-3.5 text-primary" />
                Planning trip to <strong>{destinationDisplay}</strong>
              </div>
            )}
            <p className="section-label mb-3">Choose Your Plan</p>
            <h1 className="text-3xl sm:text-5xl font-heading tracking-tight mb-4" style={{ color: "hsl(158, 45%, 10%)" }}>
              How deep do you want <span className="text-mint-gradient">to explore?</span>
            </h1>
            <p className="max-w-md mx-auto text-sm sm:text-base font-light text-muted-foreground px-4">
              From a quick peek to a full AI-crafted experience — pick what fits your trip.
            </p>
          </motion.div>

          {/* Plans grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto mb-12 sm:mb-16">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.12, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className={`relative flex flex-col ${
                  plan.highlight
                    ? "prism-card p-6 sm:p-8 sm:scale-105 shadow-2xl"
                    : "glass-panel p-6 sm:p-8"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap"
                      style={{ background: "linear-gradient(135deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))", boxShadow: "0 4px 16px hsla(158, 42%, 36%, 0.40)" }}>
                      <Star className="w-3 h-3" /> {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-5 sm:mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>
                    <plan.Icon className="w-6 h-6" style={{ color: plan.color }} />
                  </div>
                  <h2 className="text-lg sm:text-xl font-heading mb-1" style={{ color: plan.color }}>{plan.name}</h2>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-bold" style={{ color: "hsl(158, 45%, 10%)" }}>{plan.price}</span>
                    <span className="text-xs text-muted-foreground">{plan.priceNote}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 sm:mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className={`flex items-start gap-2.5 text-sm ${f.ok ? "text-foreground/85" : "text-muted-foreground/60"}`}>
                      <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5 ${
                        f.ok ? "bg-primary/15" : "bg-muted/60"
                      }`}>
                        {f.ok
                          ? <Check className="w-2.5 h-2.5" style={{ color: plan.color }} />
                          : <span className="text-[9px] text-muted-foreground/60">—</span>
                        }
                      </div>
                      <span className={f.ok ? "" : "line-through decoration-muted-foreground/40"}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.link}>
                  {plan.highlight ? (
                    <button className="btn-primary w-full py-3.5 text-sm sm:text-base flex items-center justify-center gap-2 group">
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button className="btn-ghost-glass w-full py-3.5 text-sm sm:text-base flex items-center justify-center gap-2 group">
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Perks banner */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="prism-card p-6 sm:p-10 max-w-4xl mx-auto"
          >
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>
                <Gift className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-heading mb-1" style={{ color: "hsl(158, 45%, 12%)" }}>Free With Every Paid Trip</h2>
              <p className="text-sm text-muted-foreground">Your memories, beautifully preserved</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {perks.map((f) => (
                <div key={f.title} className="glass-panel p-4 sm:p-5 text-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2.5"
                    style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>
                    <f.Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1" style={{ color: "hsl(158, 38%, 20%)" }}>{f.title}</h4>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Trust line */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 mt-6 sm:mt-8 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" /> Ready in 60 sec</span>
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> Data private</span>
              <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-primary" /> Human-verified AI</span>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PlanSelection;
