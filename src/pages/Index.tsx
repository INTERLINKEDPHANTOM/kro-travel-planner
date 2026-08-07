import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Compass, Clock, Wallet, Star, CheckCircle2, Map, Zap, Shield,
  Globe, Mountain, Waves, TreePine, Landmark, ChevronRight, Megaphone, X
} from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const features = [
  { icon: Compass, title: "AI-Powered Planning", desc: "Realistic itineraries that feel like a local friend planned your trip — not a brochure." },
  { icon: Clock, title: "Hour-Wise Schedules", desc: "Every hour accounted for with transport, meals, rest breaks, and human-paced timing." },
  { icon: Wallet, title: "Budget Aware", desc: "Plans built around your real budget with honest cost breakdowns, not hidden fees." },
];

const steps = [
  { icon: Map, num: "01", title: "Set Preferences", desc: "Tell us your travel style, budget & dates in our interactive form." },
  { icon: Zap, num: "02", title: "AI Crafts Plan", desc: "Smart routing with real-time data and local knowledge." },
  { icon: Globe, num: "03", title: "Travel Freely", desc: "Download, share, and explore with full confidence." },
];

const destinations = [
  { name: "Manali", tag: "Mountain Escape", Icon: Mountain, seed: "manali-mountains-snow" },
  { name: "Goa", tag: "Beach Bliss", Icon: Waves, seed: "goa-beach-ocean" },
  { name: "Kerala", tag: "Backwater Serenity", Icon: TreePine, seed: "kerala-backwaters-green" },
  { name: "Rajasthan", tag: "Desert Heritage", Icon: Landmark, seed: "rajasthan-palace-desert" },
];

const Index = () => {
  const { settings: hs } = useSiteSettings("home");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // DB-driven values with fallbacks
  const heroSubheadline = hs.hero_subheadline || "Within budget, without stress. AI-powered itineraries written like a local planned your trip.";
  const ctaPrimary = hs.cta_primary_text || "Plan My Trip";
  const ctaSecondary = hs.cta_secondary_text || "Explore Destinations";
  const announcementBannerActive = hs.announcement_banner_active === true || hs.announcement_banner_active === "true";
  const announcementBannerText = hs.announcement_banner || "";

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <Navbar />

      {/* ── Announcement Banner ── */}
      <AnimatePresence>
        {announcementBannerActive && announcementBannerText && !bannerDismissed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-20 overflow-hidden bg-primary"
          >
            <div className="flex items-center justify-center gap-3 px-4 py-2.5 text-primary-foreground text-sm font-medium">
              <Megaphone className="w-4 h-4 flex-shrink-0 opacity-80" />
              <span>{announcementBannerText}</span>
              <button
                onClick={() => setBannerDismissed(true)}
                className="ml-2 opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-32 pb-16 z-10 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8 text-xs font-medium text-primary"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI-Engine v2.0 Live
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-8 text-foreground"
          >
            Travel planning, <br />
            <span className="text-primary italic">redefined by AI.</span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            {heroSubheadline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/plan" className="w-full sm:w-auto">
              <button className="btn-primary w-full sm:w-auto text-base px-10 py-4">
                {ctaPrimary}
              </button>
            </Link>
            <Link to="/destinations" className="w-full sm:w-auto">
              <button className="btn-secondary w-full sm:w-auto text-base px-10 py-4 flex items-center justify-center gap-2">
                <Globe className="w-4 h-4" />
                {ctaSecondary}
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Floating AI Preview Card - Bento Style */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 w-full max-w-5xl mx-auto px-4"
        >
          <div className="bento-grid grid-cols-1 md:grid-cols-3">
            <div className="bento-card md:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Map className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Personalized Route</h3>
                    <p className="text-xs text-muted-foreground">Optimized for your pace</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="text-xs font-bold text-primary">0{i}</div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${40 + i * 20}%` }}
                          transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
                          className="h-full bg-primary/40"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-4">
                <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Verified Data</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Updated 2m ago</span>
              </div>
            </div>
            
            <div className="bento-card bg-primary text-primary-foreground">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <Zap className="w-8 h-8 mb-4 opacity-80" />
                  <h3 className="text-xl font-bold mb-2">Instant Gen</h3>
                  <p className="text-sm opacity-80">Generate full trips in under 30 seconds with our neural engine.</p>
                </div>
                <div className="text-3xl font-mono font-bold">99.8%</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── How It Works ── */}
      <section className="section-padding relative z-10 bg-background/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label">The Process</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter">
              Complexity simplified <br />
              <span className="text-muted-foreground font-normal italic">through intelligence.</span>
            </h2>
          </div>

          <div className="bento-grid">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bento-card group"
              >
                <div className="text-xs font-mono text-primary mb-4">Step {step.num}</div>
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Bento ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="bento-grid">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bento-card ${i === 0 ? 'md:col-span-2' : ''}`}
              >
                <div className="flex flex-col h-full">
                  <f.icon className="w-8 h-8 text-primary mb-6" />
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Destinations ── */}
      <section className="section-padding relative z-10 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <p className="section-label">Discovery</p>
              <h2 className="text-4xl font-bold tracking-tight">Popular nodes</h2>
            </div>
            <Link to="/destinations" className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
              View all coordinates <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destinations.map((d, i) => (
              <motion.div
                key={d.name}
                whileHover={{ y: -4 }}
                className="dest-photo-card aspect-[3/4]"
              >
                <img
                  src={`https://picsum.photos/seed/${d.seed}/600/800`}
                  alt={d.name}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent p-4 flex flex-col justify-end">
                  <span className="text-xs font-mono text-primary uppercase tracking-tighter mb-1">{d.tag}</span>
                  <h4 className="font-bold text-lg">{d.name}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-panel p-12 md:p-20 relative overflow-hidden bg-primary text-primary-foreground border-none">
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-6xl font-bold tracking-tighter mb-8">
                Ready to deploy your next journey?
              </h2>
              <Link to="/plan">
                <button className="bg-primary-foreground text-primary px-10 py-4 rounded-full font-bold hover:bg-primary-foreground/90 transition-colors">
                  Start Planning
                </button>
              </Link>
            </div>
            {/* Abstract Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;