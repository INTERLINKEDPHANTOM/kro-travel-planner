import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Compass, Twitter, Instagram, Linkedin,
  Quote, MapPin, Heart, Lightbulb, Target
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { duration: 0.65 },
};

const beliefs = [
  { Icon: Heart, text: "Travel is not a luxury — it's a way of understanding the world." },
  { Icon: Lightbulb, text: "Technology should make things feel more human, not less." },
  { Icon: MapPin, text: "The best trip isn't the most Instagrammed — it's the one you actually lived." },
  { Icon: Target, text: "Honest tools beat impressive ones every time." },
];

const Founder = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-orb-1" style={{ top: "10%", right: "8%" }} />
        <div className="ambient-orb-2" style={{ bottom: "25%", left: "6%" }} />
      </div>

      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left — text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-6 text-xs sm:text-sm font-medium"
                style={{ color: "hsl(158, 38%, 28%)" }}>
                <Compass className="w-3.5 h-3.5 text-primary" />
                Founder's Story
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading tracking-tight mb-4 leading-[1.1]"
                style={{ color: "hsl(158, 45%, 10%)" }}>
                The person behind{" "}
                <span className="text-mint-gradient italic">KroTravel</span>
              </h1>

              <p className="text-sm sm:text-lg font-medium mb-2" style={{ color: "hsl(158, 38%, 30%)" }}>
                Founder & CEO, KroTravel
              </p>

              <p className="text-sm sm:text-base leading-relaxed" style={{ color: "hsl(158, 18%, 44%)" }}>
                Building the travel brain every Indian traveler deserves — smart, honest, and deeply local.
              </p>

              {/* Social */}
              <div className="flex gap-3 mt-6">
                {[
                  { Icon: Twitter, href: "#", label: "Twitter" },
                  { Icon: Instagram, href: "#", label: "Instagram" },
                  { Icon: Linkedin, href: "#", label: "LinkedIn" },
                ].map(({ Icon, href, label }) => (
                  <a key={label} href={href}
                    className="w-10 h-10 rounded-xl flex items-center justify-center glass-panel hover:bg-primary/10 hover:text-primary transition-all duration-300 text-muted-foreground"
                    aria-label={label}>
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Right — avatar card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="flex justify-center"
            >
              <div className="relative">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-3xl animate-glow-ring" style={{ borderRadius: "24px" }} />
                <div className="prism-card p-2 rounded-3xl relative z-10">
                  <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl flex items-center justify-center overflow-hidden"
                    style={{ background: "linear-gradient(135deg, hsla(158, 42%, 38%, 0.12), hsla(162, 45%, 28%, 0.08))" }}>
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4 border-4 border-primary/20">
                        <Compass className="w-10 h-10 text-primary" />
                      </div>
                      <p className="text-sm font-bold" style={{ color: "hsl(158, 38%, 20%)" }}>KroTravel Founder</p>
                      <p className="text-xs text-muted-foreground mt-1">CEO & Builder</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="prism-card p-8 sm:p-12 text-center">
            <Quote className="w-10 h-10 text-primary/40 mx-auto mb-5" />
            <blockquote className="text-xl sm:text-2xl font-heading leading-relaxed mb-6 italic"
              style={{ color: "hsl(158, 38%, 18%)" }}>
              "I built KroTravel because I was tired of travel plans that looked great on paper but fell apart in reality."
            </blockquote>
            <p className="text-sm font-medium text-primary">— Founder, KroTravel</p>
          </motion.div>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.div {...fadeUp} className="text-center mb-10">
            <p className="section-label mb-3">The Story</p>
            <h2 className="text-3xl sm:text-5xl font-heading tracking-tight" style={{ color: "hsl(158, 45%, 10%)" }}>
              Why KroTravel <span className="text-mint-gradient">exists</span>
            </h2>
          </motion.div>

          {[
            {
              para: "I've been a traveler my whole life — solo trips, family trips, last-minute weekend escapes. And every time I tried to plan, I found myself lost in a sea of generic blog posts and cookie-cutter itineraries that had no idea what my budget was, how many people I was traveling with, or what I actually wanted to experience.",
            },
            {
              para: "The breaking point was a trip to Himachal where I followed a '3-day Manali itinerary' I found online. Day 1 was fine. Day 2 had us trying to reach a place that closes at 12pm — the itinerary didn't mention that. Day 3 we ran over budget by ₹4,000 because the 'budget estimates' were from 2019.",
            },
            {
              para: "So I built KroTravel. An AI that doesn't just give you a list of places — it thinks about bus timings, lunch spots that are actually open, how long it really takes to walk from one place to another, and what things genuinely cost in 2025.",
            },
            {
              para: "KroTravel is my answer to the question: what if your smartest, most well-traveled friend planned your entire trip for you? Someone who is honest about costs, knows the shortcuts, and actually cares whether you have a good time.",
            },
          ].map((s, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="text-base sm:text-lg leading-relaxed"
              style={{ color: "hsl(158, 18%, 38%)" }}
            >
              {s.para}
            </motion.p>
          ))}
        </div>
      </section>

      {/* ── Beliefs ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <p className="section-label mb-3">What I Believe</p>
            <h2 className="text-3xl sm:text-4xl font-heading tracking-tight" style={{ color: "hsl(158, 45%, 10%)" }}>
              The principles that guide <span className="text-mint-gradient">KroTravel</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {beliefs.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-5 rounded-2xl flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <b.Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(158, 25%, 30%)" }}>{b.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vision ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp} className="glass-panel rounded-3xl p-8 sm:p-12">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Target className="w-7 h-7 text-primary" />
            </div>
            <p className="section-label mb-3">The Vision</p>
            <h2 className="text-2xl sm:text-3xl font-heading mb-4" style={{ color: "hsl(158, 45%, 10%)" }}>
              To be the travel brain every Indian traveler deserves
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: "hsl(158, 18%, 44%)" }}>
              Smart, honest, and deeply local. Not just for the metros. For every traveler, every budget, every kind of trip — from a solo spiritual journey to a large family road trip.
            </p>
            <Link to="/plan">
              <button className="btn-primary px-8 py-3.5 text-sm flex items-center gap-2 mx-auto group">
                Start planning with us
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Founder;
