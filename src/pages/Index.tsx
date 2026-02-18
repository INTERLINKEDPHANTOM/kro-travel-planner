import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Compass, Clock, Wallet, Star, CheckCircle2, Map, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    icon: Compass,
    title: "AI-Powered Planning",
    desc: "Realistic itineraries that feel like a local friend planned your trip — not a brochure.",
  },
  {
    icon: Clock,
    title: "Hour-Wise Schedules",
    desc: "Every hour accounted for with transport, meals, rest breaks, and human-paced timing.",
  },
  {
    icon: Wallet,
    title: "Budget Aware",
    desc: "Plans built around your real budget — with honest cost breakdowns, not hidden fees.",
  },
];

const steps = [
  { icon: "👤", title: "Set Preferences", desc: "Tell us your travel style, budget & dates" },
  { icon: "🤖", title: "AI Crafts Plan", desc: "Smart routing with real-time transport data" },
  { icon: "😊", title: "Travel Freely", desc: "Download, share, and explore with confidence" },
];

const testimonials = [
  { name: "Priya S.", place: "Manali Trip", text: "The itinerary felt like my best friend who lives there wrote it. Every tip was gold." },
  { name: "Rahul M.", place: "Goa Weekend", text: "Saved me hours of research. The budget breakdown was spot on — I actually spent less than planned." },
  { name: "Ananya K.", place: "Kerala Tour", text: "We traveled with elderly parents. The pacing suggestions were incredibly thoughtful." },
];

const destinations = [
  { name: "Manali", tag: "Mountain Escape", emoji: "🏔️" },
  { name: "Goa", tag: "Beach Bliss", emoji: "🌊" },
  { name: "Kerala", tag: "Backwater Serenity", emoji: "🌿" },
  { name: "Rajasthan", tag: "Desert Heritage", emoji: "🏜️" },
];

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Global ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-orb-1" style={{ top: "10%", left: "15%" }} />
        <div className="ambient-orb-2" style={{ bottom: "20%", right: "10%" }} />
        <div className="ambient-orb" style={{
          width: "300px", height: "300px",
          top: "50%", left: "60%",
          background: "radial-gradient(circle, hsla(160, 50%, 70%, 0.1) 0%, transparent 70%)",
          filter: "blur(60px)",
        }} />
      </div>

      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-16 z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-panel mb-8 text-sm font-medium"
            style={{ color: "hsl(161, 33%, 32%)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            AI + Human Verified Itineraries
            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-heading leading-[1.05] mb-6 tracking-tight"
            style={{ color: "hsl(155, 40%, 12%)" }}
          >
            Plan trips that{" "}
            <span className="text-mint-gradient italic">feel real.</span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-light"
            style={{ color: "hsl(155, 20%, 42%)" }}
          >
            Within budget, without stress. AI-powered itineraries written like a local planned your trip.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/plan">
              <button className="btn-primary text-base px-10 py-4 flex items-center gap-2 group">
                Plan My Trip
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/destinations">
              <button className="btn-ghost-glass text-base px-10 py-4">
                Explore Destinations
              </button>
            </Link>
          </motion.div>

          {/* Floating hero glass card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="prism-card p-6 sm:p-8 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "hsla(153, 50%, 65%, 0.2)" }}>
                  <Map className="w-4 h-4" style={{ color: "hsl(161, 33%, 32%)" }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: "hsl(155, 35%, 20%)" }}>AI Trip Preview — Manali 3 Days</span>
              </div>
              <span className="text-xs px-3 py-1 rounded-full" style={{ background: "hsla(153, 55%, 60%, 0.15)", color: "hsl(161, 33%, 30%)" }}>
                ₹12,500 budget
              </span>
            </div>
            {/* Fake itinerary preview */}
            <div className="space-y-3 text-left">
              {[
                { time: "Day 1", act: "Arrive Manali → Hadimba Temple → Mall Road dinner", icon: "🏔️" },
                { time: "Day 2", act: "Solang Valley → Snow activities → Café BoomBox", icon: "⛷️" },
                { time: "Day 3", act: "Rohtang Pass drive → Departure by Volvo overnight", icon: "🌄" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-2xl"
                  style={{ background: "hsla(145, 40%, 97%, 0.5)" }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <span className="text-xs font-semibold block mb-0.5" style={{ color: "hsl(161, 33%, 35%)" }}>{item.time}</span>
                    <span className="text-sm" style={{ color: "hsl(155, 25%, 30%)" }}>{item.act}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "hsl(153, 45%, 48%)" }}>How It Works</p>
            <h2 className="text-3xl sm:text-5xl font-heading tracking-tight mb-4" style={{ color: "hsl(155, 40%, 12%)" }}>
              Three steps to your <span className="text-mint-gradient">perfect trip</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="prism-card p-8 text-center"
              >
                {/* Step number */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-5 mx-auto"
                  style={{ background: "hsla(153, 50%, 60%, 0.2)", color: "hsl(161, 33%, 30%)" }}>
                  {i + 1}
                </div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "hsl(155, 38%, 15%)" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(155, 15%, 45%)" }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features / Prism Cards ── */}
      <section className="section-padding relative z-10">
        {/* Soft glow behind section */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div style={{
            width: "600px", height: "400px",
            background: "radial-gradient(ellipse, hsla(153, 55%, 65%, 0.1) 0%, transparent 70%)",
            filter: "blur(60px)",
          }} />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "hsl(153, 45%, 48%)" }}>Why KroTravel</p>
            <h2 className="text-3xl sm:text-5xl font-heading tracking-tight mb-4" style={{ color: "hsl(155, 40%, 12%)" }}>
              Built <span className="text-mint-gradient">differently</span>
            </h2>
            <p className="max-w-md mx-auto text-base font-light" style={{ color: "hsl(155, 15%, 45%)" }}>
              No promotional fluff. No generic lists. Just real, human-friendly travel plans.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="prism-card p-8"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: "hsla(153, 50%, 60%, 0.15)" }}>
                  <f.icon className="w-6 h-6" style={{ color: "hsl(161, 33%, 32%)" }} />
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: "hsl(155, 38%, 15%)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(155, 15%, 45%)" }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Destinations Grid ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "hsl(153, 45%, 48%)" }}>Popular Destinations</p>
            <h2 className="text-3xl sm:text-5xl font-heading tracking-tight" style={{ color: "hsl(155, 40%, 12%)" }}>
              Where will you <span className="text-mint-gradient italic">go next?</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destinations.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to="/destinations">
                  <div className="prism-card p-6 text-center group cursor-pointer">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{d.emoji}</div>
                    <div className="font-semibold mb-1 text-sm" style={{ color: "hsl(155, 38%, 15%)" }}>{d.name}</div>
                    <div className="text-xs" style={{ color: "hsl(155, 15%, 50%)" }}>{d.tag}</div>
                    <div className="mt-3 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-medium" style={{ color: "hsl(153, 45%, 45%)" }}>
                      Explore <ArrowRight className="w-3 h-3" />
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
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-heading tracking-tight" style={{ color: "hsl(155, 40%, 12%)" }}>
              Travelers <span className="text-mint-gradient">love us</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-8"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color: "hsl(153, 50%, 52%)" }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6 font-light" style={{ color: "hsl(155, 25%, 30%)" }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: "hsla(153, 50%, 60%, 0.2)", color: "hsl(161, 33%, 32%)" }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <span className="font-semibold text-sm block" style={{ color: "hsl(155, 38%, 18%)" }}>{t.name}</span>
                    <span className="text-xs" style={{ color: "hsl(155, 15%, 50%)" }}>{t.place}</span>
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
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="prism-card p-12 sm:p-16 text-center relative overflow-hidden">
              {/* Inner glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div style={{
                  width: "400px", height: "300px",
                  background: "radial-gradient(ellipse, hsla(153, 60%, 65%, 0.12) 0%, transparent 70%)",
                  filter: "blur(40px)",
                }} />
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-medium"
                  style={{ background: "hsla(153, 55%, 60%, 0.15)", color: "hsl(161, 33%, 30%)" }}>
                  <Zap className="w-3 h-3" />
                  Start free, no credit card needed
                </div>

                <h2 className="text-3xl sm:text-5xl font-heading tracking-tight mb-5" style={{ color: "hsl(155, 40%, 12%)" }}>
                  Ready to travel{" "}
                  <span className="text-mint-gradient italic">smarter?</span>
                </h2>
                <p className="mb-10 max-w-md mx-auto text-base font-light" style={{ color: "hsl(155, 15%, 45%)" }}>
                  Stop spending hours on research. Let AI create a plan that actually works.
                </p>
                <Link to="/plan">
                  <button className="btn-primary text-base px-12 py-4 flex items-center gap-2 mx-auto animate-glow-pulse">
                    Plan My Trip — It's Free
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
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
