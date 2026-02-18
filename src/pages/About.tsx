import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Compass, Heart, Zap, Globe, Users, Star, Shield,
  CheckCircle2, TrendingUp, Sparkles, Map, Clock, Wallet
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { duration: 0.6 },
};

const values = [
  {
    Icon: Heart,
    title: "Human-First AI",
    desc: "Our AI doesn't just plan routes — it thinks about your comfort, pace, and real costs. Every suggestion is filtered through the lens of a real traveler.",
  },
  {
    Icon: Wallet,
    title: "Budget Honest",
    desc: "We show you real numbers, not aspirational ones. No hidden costs, no promotional fluff. Just an honest breakdown of what your trip will actually cost.",
  },
  {
    Icon: Globe,
    title: "Local Intelligence",
    desc: "Every itinerary is verified against local knowledge — bus timings, seasonal crowds, actual walking distances. Things travel blogs never tell you.",
  },
  {
    Icon: Zap,
    title: "Built for Speed",
    desc: "From preference form to full itinerary in under 60 seconds. Because your wanderlust shouldn't have to wait.",
  },
  {
    Icon: Shield,
    title: "Private by Design",
    desc: "Your travel data, your memories — they stay yours. No selling data, no third-party trackers inside your journey.",
  },
  {
    Icon: Sparkles,
    title: "Always Evolving",
    desc: "We update our AI with real traveler feedback after every trip. Every itinerary makes the next one smarter.",
  },
];

const milestones = [
  { year: "2024", label: "KroTravel Founded", desc: "Born from a frustration with generic travel planning" },
  { year: "Early 2024", label: "AI v1 Launched", desc: "First AI itinerary generation going live" },
  { year: "Mid 2024", label: "10K Trips Planned", desc: "Travelers across India discover human-paced planning" },
  { year: "2025", label: "Memory Vault Launched", desc: "Trip photos, albums & reels — all in one place" },
  { year: "2026", label: "50K+ Trips & Growing", desc: "Expanding to more Indian cities and international routes" },
];

const stats = [
  { value: "50K+", label: "Trips Planned" },
  { value: "200+", label: "Cities Covered" },
  { value: "4.9★", label: "Average Rating" },
  { value: "60s", label: "To Generate" },
];

const About = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-orb-1" style={{ top: "8%", right: "12%" }} />
        <div className="ambient-orb-2" style={{ bottom: "20%", left: "5%" }} />
      </div>

      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-6 text-xs sm:text-sm font-medium"
            style={{ color: "hsl(158, 38%, 28%)" }}
          >
            <Compass className="w-3.5 h-3.5 text-primary" />
            Our Story
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-heading tracking-tight mb-6 leading-[1.08]"
            style={{ color: "hsl(158, 45%, 10%)" }}
          >
            We believe travel should{" "}
            <span className="text-mint-gradient italic">feel human.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light px-4"
            style={{ color: "hsl(158, 20%, 44%)" }}
          >
            KroTravel was born from a simple frustration — generic itineraries that list the same 10 places every tourist visits. We set out to build something that thinks like a local.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mb-12"
          >
            {stats.map((s, i) => (
              <div key={i} className="glass-panel rounded-2xl p-4 text-center">
                <div className="text-xl sm:text-3xl font-bold text-mint-gradient">{s.value}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div {...fadeUp}>
              <p className="section-label mb-3">Our Mission</p>
              <h2 className="text-3xl sm:text-4xl font-heading tracking-tight mb-5" style={{ color: "hsl(158, 45%, 10%)" }}>
                To make every journey feel{" "}
                <span className="text-mint-gradient">personally crafted.</span>
              </h2>
              <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: "hsl(158, 18%, 44%)" }}>
                Not copy-pasted from a travel blog. Not generated by a chatbot that's never seen the place. KroTravel creates itineraries that are grounded in how real travel actually works — missed buses, crowded cafés, the restaurant that's better at lunch than dinner.
              </p>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: "hsl(158, 18%, 44%)" }}>
                We combine AI speed with local intelligence to give you a plan that's honest, human-paced, and actually useful on the ground.
              </p>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
              <div className="prism-card p-6 sm:p-8 space-y-4">
                {[
                  { Icon: CheckCircle2, text: "Hour-by-hour plans that respect real travel time" },
                  { Icon: CheckCircle2, text: "Honest budget breakdowns with zero hidden costs" },
                  { Icon: CheckCircle2, text: "Local food, transport & sleep recommendations" },
                  { Icon: CheckCircle2, text: "Verified by real traveler feedback loops" },
                  { Icon: CheckCircle2, text: "Built for India — trains, buses, local pricing" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <item.Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm" style={{ color: "hsl(158, 25%, 28%)" }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="section-label mb-3">Our Values</p>
            <h2 className="text-3xl sm:text-5xl font-heading tracking-tight" style={{ color: "hsl(158, 45%, 10%)" }}>
              What we stand <span className="text-mint-gradient">for</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, transition: { duration: 0.25 } }}
                className="glass-panel p-6 rounded-3xl cursor-default"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>
                  <v.Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: "hsl(158, 38%, 15%)" }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(158, 18%, 48%)" }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Journey / Timeline ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="section-label mb-3">Our Journey</p>
            <h2 className="text-3xl sm:text-5xl font-heading tracking-tight" style={{ color: "hsl(158, 45%, 10%)" }}>
              How we got <span className="text-mint-gradient italic">here</span>
            </h2>
          </motion.div>

          <div className="relative pl-6 border-l-2" style={{ borderColor: "hsla(158, 42%, 50%, 0.30)" }}>
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="mb-10 relative"
              >
                <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-primary border-2 border-background" />
                <span className="text-xs font-bold text-primary mb-1 block">{m.year}</span>
                <h4 className="text-base font-bold mb-1" style={{ color: "hsl(158, 38%, 15%)" }}>{m.label}</h4>
                <p className="text-sm" style={{ color: "hsl(158, 18%, 48%)" }}>{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder CTA ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="prism-card p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-heading mb-4" style={{ color: "hsl(158, 45%, 10%)" }}>
              Meet the founder
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-lg mx-auto">
              Learn about the person who built KroTravel and why they believe every traveler deserves a smarter, more honest way to plan.
            </p>
            <Link to="/founder">
              <button className="btn-primary text-sm px-8 py-3.5 flex items-center gap-2 mx-auto group">
                Read the founder's story
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl sm:text-5xl font-heading tracking-tight mb-4" style={{ color: "hsl(158, 45%, 10%)" }}>
              Ready to plan your next <span className="text-mint-gradient">adventure?</span>
            </h2>
            <p className="text-muted-foreground mb-8">Start free. No credit card needed.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/plan">
                <button className="btn-primary px-8 py-4 text-sm flex items-center gap-2 group">
                  Plan My Trip Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/contact">
                <button className="btn-ghost-glass px-8 py-4 text-sm">Talk to Us</button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
