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

const testimonials = [
  { name: "Priya S.", place: "Manali Trip", text: "The itinerary felt like my best friend who lives there wrote it. Every tip was gold." },
  { name: "Rahul M.", place: "Goa Weekend", text: "Saved me hours of research. The budget breakdown was spot on — I actually spent less than planned." },
  { name: "Ananya K.", place: "Kerala Tour", text: "We traveled with elderly parents. The pacing suggestions were incredibly thoughtful." },
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
  const heroHeadline = hs.hero_headline || "Plan trips that feel real.";
  const heroSubheadline = hs.hero_subheadline || "Within budget, without stress. AI-powered itineraries written like a local planned your trip.";
  const ctaPrimary = hs.cta_primary_text || "Plan My Trip";
  const ctaSecondary = hs.cta_secondary_text || "Explore Destinations";
  const announcementBannerActive = hs.announcement_banner_active === true || hs.announcement_banner_active === "true";
  const announcementBannerText = hs.announcement_banner || "";

  const stats = [
    { value: hs.stats_trips || "50K+", label: "Trips Planned" },
    { value: hs.stats_rating || "4.9", label: "User Rating" },
    { value: hs.stats_generation_time || "60s", label: "Avg. Generation" },
    { value: "Free", label: "To Start" },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Global ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-orb-1" style={{ top: "8%", left: "12%" }} />
        <div className="ambient-orb-2" style={{ bottom: "18%", right: "8%" }} />
        <div className="ambient-orb" style={{
          width: "350px", height: "350px", top: "55%", left: "58%",
          background: "radial-gradient(circle, hsla(162, 55%, 68%, 0.11) 0%, transparent 70%)",
          filter: "blur(70px)",
        }} />
      </div>

      <Navbar />

      {/* ── Announcement Banner ── */}
      <AnimatePresence>
        {announcementBannerActive && announcementBannerText && !bannerDismissed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-20 overflow-hidden"
            style={{ background: "linear-gradient(90deg, hsl(158, 42%, 36%), hsl(162, 45%, 28%))" }}
          >
            <div className="flex items-center justify-center gap-3 px-4 py-2.5 text-white text-sm font-medium">
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
      <section className="section-padding relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <p className="section-label mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-5xl font-heading tracking-tight mb-4" style={{ color: "hsl(158, 45%, 10%)" }}>
              Three steps to your <span className="text-mint-gradient">perfect trip</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 relative">
            {/* Connector line – desktop only */}
            <div className="hidden sm:block absolute top-12 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-px"
              style={{ background: "linear-gradient(90deg, transparent, hsl(158, 42%, 50%), transparent)" }} />

            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="prism-card p-6 sm:p-8 text-center relative"
              >
                <div className="absolute top-4 right-4 text-xs font-bold opacity-30 text-primary">{step.num}</div>
                <div className="w-14 h-14 rounded-3xl flex items-center justify-center mb-5 mx-auto"
                  style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-3" style={{ color: "hsl(158, 38%, 15%)" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(158, 18%, 48%)" }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section-padding relative z-10">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div style={{ width: "700px", height: "450px", background: "radial-gradient(ellipse, hsla(152, 60%, 65%, 0.10) 0%, transparent 70%)", filter: "blur(80px)" }} />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <p className="section-label mb-3">Why KroTravel</p>
            <h2 className="text-3xl sm:text-5xl font-heading tracking-tight mb-4" style={{ color: "hsl(158, 45%, 10%)" }}>
              Built <span className="text-mint-gradient">differently</span>
            </h2>
            <p className="max-w-md mx-auto text-sm sm:text-base font-light px-4" style={{ color: "hsl(158, 18%, 48%)" }}>
              No promotional fluff. No generic lists. Just real, human-friendly travel plans.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="prism-card p-6 sm:p-8 cursor-default"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
                  <f.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-3" style={{ color: "hsl(158, 38%, 15%)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(158, 18%, 48%)" }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Destinations ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <p className="section-label mb-3">Popular Destinations</p>
            <h2 className="text-3xl sm:text-5xl font-heading tracking-tight" style={{ color: "hsl(158, 45%, 10%)" }}>
              Where will you <span className="text-mint-gradient italic">go next?</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {destinations.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to="/destinations">
                  <div className="dest-photo-card group cursor-pointer" style={{ height: "clamp(160px, 22vw, 220px)" }}>
                    <img
                      src={`https://picsum.photos/seed/${d.seed}/${600 + i * 10}/${500 + i * 10}`}
                      alt={d.name}
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${d.name.toLowerCase()}${i}/600/500`; }}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-1.5"
                        style={{ background: "hsla(255,255%,255%,0.18)", backdropFilter: "blur(8px)" }}>
                        <d.Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="text-white font-bold text-sm sm:text-base">{d.name}</div>
                      <div className="text-white/70 text-[10px] sm:text-xs">{d.tag}</div>
                    </div>
                    <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      <ChevronRight className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-3xl sm:text-5xl font-heading tracking-tight" style={{ color: "hsl(158, 45%, 10%)" }}>
              Travelers <span className="text-mint-gradient">love us</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="glass-panel p-6 sm:p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-current text-primary" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6 font-light italic" style={{ color: "hsl(158, 25%, 30%)" }}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))", color: "white" }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <span className="font-bold text-sm block" style={{ color: "hsl(158, 38%, 18%)" }}>{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.place}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-intense p-8 sm:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[-40px] right-[-60px] w-[300px] h-[300px] rounded-full"
                style={{ background: "radial-gradient(circle, hsla(152, 65%, 65%, 0.18) 0%, transparent 70%)", filter: "blur(60px)" }} />
              <div className="absolute bottom-[-40px] left-[-60px] w-[250px] h-[250px] rounded-full"
                style={{ background: "radial-gradient(circle, hsla(162, 55%, 60%, 0.14) 0%, transparent 70%)", filter: "blur(50px)" }} />
            </div>

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-3xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "linear-gradient(135deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))", boxShadow: "0 6px 24px hsla(158, 42%, 36%, 0.35)" }}>
                <Compass className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-heading mb-4 tracking-tight" style={{ color: "hsl(158, 45%, 10%)" }}>
                Your next adventure<br />
                <span className="text-mint-gradient">starts in 60 seconds</span>
              </h2>
              <p className="text-sm sm:text-base mb-8 font-light max-w-sm mx-auto" style={{ color: "hsl(158, 18%, 44%)" }}>
                Free to start. No credit card needed. AI does the heavy lifting.
              </p>
              <Link to="/plan">
                <button className="btn-primary text-sm sm:text-base px-10 py-4 flex items-center gap-2 group mx-auto">
                  Plan My Trip for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> Private & secure</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> No spam ever</span>
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" /> AI-crafted</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
