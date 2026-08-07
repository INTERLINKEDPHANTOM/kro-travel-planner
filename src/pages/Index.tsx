import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Compass, Clock, Wallet, Star, CheckCircle2, Map, Zap, Shield,
  Globe, Mountain, Waves, TreePine, Landmark, ChevronRight, Megaphone, X,
  Terminal, Activity, Sparkles, Cpu
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // DB-driven values with fallbacks
  const heroSubheadline = hs.hero_subheadline || "The intelligent operating system for modern travel. Precision planning meet human curiosity.";
  const ctaPrimary = hs.cta_primary_text || "Initialize Journey";
  const ctaSecondary = hs.cta_secondary_text || "Network Overview";
  const announcementBannerActive = hs.announcement_banner_active === true || hs.announcement_banner_active === "true";
  const announcementBannerText = hs.announcement_banner || "";

  // Mouse tracking for bento hover effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.bento-card');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
        (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      <motion.section 
        style={{ opacity, scale }}
        className="relative min-h-[95vh] flex flex-col items-center justify-center px-4 pt-32 pb-16 z-10 overflow-hidden"
      >
        {/* Background Grid Accent */}
        <div className="absolute inset-0 z-[-1] opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(162, 76, 25, 0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="max-w-6xl mx-auto text-center w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-8 text-[10px] font-mono uppercase tracking-[0.2em] text-primary"
          >
            <Activity className="w-3 h-3 animate-pulse" />
            <span>Core v4.0.2 Stable Release</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="text-6xl sm:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 text-foreground"
          >
            Travel at the <br />
            <span className="text-primary italic font-serif">speed of thought.</span>
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
          transition={{ duration: 1, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="mt-20 w-full max-w-5xl mx-auto px-4"
        >
          <div className="bento-grid md:grid-cols-3">
            <div className="bento-card md:col-span-2 flex flex-col justify-between group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Sparkles className="w-24 h-24 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Terminal className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-sm uppercase tracking-wider">Neural Routing Engine</h3>
                    <p className="text-[10px] text-muted-foreground font-mono">Process-ID: RT-8829-X</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Temporal Alignment", val: 94 },
                    { label: "Spatial Optimization", val: 82 },
                    { label: "Human Variance", val: 67 }
                  ].map((stat, i) => (
                    <div key={stat.label} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono uppercase tracking-tighter text-muted-foreground">
                        <span>{stat.label}</span>
                        <span>{stat.val}%</span>
                      </div>
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.val}%` }}
                          transition={{ duration: 1.5, delay: 1 + i * 0.2, ease: "circOut" }}
                          className="h-full bg-primary/60"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-12 flex items-center justify-between text-[10px] font-mono text-muted-foreground border-t border-border/20 pt-4">
                <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> Encrypted Payload</span>
                <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3" /> Hardware Accel</span>
              </div>
            </div>
            
            <div className="bento-card bg-foreground text-background border-none flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <div>
                <Zap className="w-8 h-8 mb-6 text-primary" />
                <h3 className="text-2xl font-bold mb-4 tracking-tighter">Instant Deployment.</h3>
                <p className="text-xs opacity-60 leading-relaxed font-medium">Full global itinerary synchronization in under 400ms. Zero-latency planning.</p>
              </div>
              <div className="mt-8">
                <div className="text-4xl font-mono font-bold tracking-tighter text-primary">0.4s</div>
                <div className="text-[10px] font-mono opacity-40 uppercase tracking-widest mt-1">Response Time</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

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