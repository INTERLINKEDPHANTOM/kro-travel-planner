import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Star, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PlanSelection = () => {
  // Get the destination from trip preferences stored in sessionStorage
  const stored = sessionStorage.getItem("tripPreferences");
  const tripPrefs = stored ? JSON.parse(stored) : null;
  const destination = tripPrefs?.arrival?.trim().toLowerCase() || "";

  const plans = [
    {
      name: "Explorer",
      badge: "Free",
      price: "₹0",
      description: "Get a rough overview of your destination — enough to start dreaming.",
      features: [
        "General places to visit",
        "High-level daily flow",
        "Approximate budget estimate",
        "Popular attractions & food spots",
        "Local tips & hidden gems",
      ],
      cta: "View Free Itinerary",
      link: destination ? `/itinerary/${destination}` : "/destinations",
      highlight: false,
    },
    {
      name: "Voyager",
      badge: "Premium",
      price: "₹499",
      description: "A fully personalized, hour-wise itinerary crafted for your exact trip.",
      features: [
        "Everything in Explorer",
        "Hour-wise day-wise schedule",
        "Transport logic & timing",
        "Meal & rest break planning",
        "Budget optimization",
        "Downloadable & shareable",
        "Saved to your account",
      ],
      cta: "Get Personalized Plan",
      link: "/auth",
      highlight: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">Choose Your Plan</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {destination
                ? `Pick how you want to explore ${destination.charAt(0).toUpperCase() + destination.slice(1)}`
                : "Start free with a rough overview, or go premium for a complete, personalized travel plan."}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`relative rounded-2xl p-8 sm:p-10 ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-elevated)]"
                    : "glass-card"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wide">
                      <Star className="w-3 h-3" /> Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <span className={`text-xs font-bold uppercase tracking-wider ${plan.highlight ? "text-accent" : "text-primary"}`}>
                    {plan.badge}
                  </span>
                  <h2 className="text-2xl font-heading font-bold mt-1">{plan.name}</h2>
                  <div className="mt-3">
                    <span className="text-4xl font-heading font-bold">{plan.price}</span>
                    {plan.price !== "₹0" && <span className={`text-sm ml-1 ${plan.highlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>per trip</span>}
                  </div>
                  <p className={`mt-3 text-sm leading-relaxed ${plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-accent" : "text-primary"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.link}>
                  <Button
                    size="lg"
                    className={`w-full py-6 rounded-xl text-base group ${
                      plan.highlight
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {plan.highlight && <Lock className="w-4 h-4 mr-2" />}
                    {plan.cta}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PlanSelection;
