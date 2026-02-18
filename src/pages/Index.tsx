import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Compass, Clock, Wallet, Star, CheckCircle2, Map, Zap, Shield, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  { icon: Compass, title: "AI-Powered Planning", desc: "Realistic itineraries that feel like a local friend planned your trip — not a brochure." },
  { icon: Clock, title: "Hour-Wise Schedules", desc: "Every hour accounted for with transport, meals, rest breaks, and human-paced timing." },
  { icon: Wallet, title: "Budget Aware", desc: "Plans built around your real budget with honest cost breakdowns, not hidden fees." },
];

const steps = [
  { icon: "📝", num: "01", title: "Set Preferences", desc: "Tell us your travel style, budget & dates in our interactive form." },
  { icon: "🤖", num: "02", title: "AI Crafts Plan", desc: "Smart routing with real-time data and local knowledge." },
  { icon: "🌍", num: "03", title: "Travel Freely", desc: "Download, share, and explore with full confidence." },
];

const testimonials = [
  { name: "Priya S.", place: "Manali Trip", text: "The itinerary felt like my best friend who lives there wrote it. Every tip was gold." },
  { name: "Rahul M.", place: "Goa Weekend", text: "Saved me hours of research. The budget breakdown was spot on — I actually spent less than planned." },
  { name: "Ananya K.", place: "Kerala Tour", text: "We traveled with elderly parents. The pacing suggestions were incredibly thoughtful." },
];

const destinations = [
  { name: "Manali", tag: "Mountain Escape", emoji: "🏔️", img: "manali+mountains+himachal" },
  { name: "Goa", tag: "Beach Bliss", emoji: "🌊", img: "goa+beach+india" },
  { name: "Kerala", tag: "Backwater Serenity", emoji: "🌿", img: "kerala+backwaters" },
  { name: "Rajasthan", tag: "Desert Heritage", emoji: "🏜️", img: "rajasthan+palace+india" },
];

const stats = [
  { value: "50K+", label: "Trips Planned" },
  { value: "4.9★", label: "User Rating" },
  { value: "60s", label: "Avg. Generation" },
  { value: "₹0", label: "To Start" },
];

const Index = () => {
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

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-16 z-10">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-panel mb-8 text-sm font-medium"
            style={{ color: "hsl(158, 38%, 28%)" }}
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            AI + Human Verified Itineraries
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-heading leading-[1.05] mb-6 tracking-tight"
            style={{ color: "hsl(158, 45%, 10%)" }}
          >
            Plan trips that{" "}
            <motion.span
              className="text-mint-gradient italic inline-block"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              feel real.
            </motion.span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-light"
            style={{ color: "hsl(158, 20%, 44%)" }}
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
              <button className="btn-primary text-base px-10 py-4 flex items-center gap-2 group animate-glow-ring">
                Plan My Trip
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/destinations">
              <button className="btn-ghost-glass text-base px-10 py-4 flex items-center gap-2 group">
                <Globe className="w-4 h-4" />
                Explore Destinations
              </button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center gap-8 sm:gap-12 mb-16"
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-mint-gradient">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Hero glass preview card */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="glass-intense p-6 sm:p-8 max-w-2xl mx-auto animate-float"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
                  style={{ background: "hsla(158, 42%, 38%, 0.15)" }}>
                  <Map className="w-4.5 h-4.5 text-primary" />
                </div>
                <span className="text-sm font-bold" style={{ color: "hsl(158, 45%, 18%)" }}>
                  AI Trip Preview — Manali 3 Days
                </span>
              </div>
              <span className="text-xs px-3 py-1.5 rounded-full font-semibold"
                style={{ background: "hsla(158, 42%, 38%, 0.12)", color: "hsl(158, 42%, 32%)" }}>
                ₹12,500
              </span>
            </div>

            <div className="space-y-2.5 text-left">
              {[
                { time: "Day 1", act: "Arrive Manali → Hadimba Temple → Mall Road dinner", icon: "🏔️" },
                { time: "Day 2", act: "Solang Valley → Snow activities → Café BoomBox", icon: "⛷️" },
                { time: "Day 3", act: "Rohtang Pass drive → Departure by Volvo overnight", icon: "🌄" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.12 }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl transition-all hover-lift cursor-default"
                  style={{ background: "hsla(148, 40%, 97%, 0.55)", border: "1px solid hsla(148, 35%, 80%, 0.40)" }}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold block mb-0.5" style={{ color: "hsl(158, 42%, 38%)" }}>{item.time}</span>
                    <span className="text-sm" style={{ color: "hsl(158, 30%, 28%)" }}>{item.act}</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 opacity-70" />
                </motion.div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> AI-verified</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" /> Real-time data</span>
              <span className="flex items-center gap-1.5">⏱ 45 sec to generate</span>
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
            <p className="section-label mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-5xl font-heading tracking-tight mb-4" style={{ color: "hsl(158, 45%, 10%)" }}>
              Three steps to your <span className="text-mint-gradient">perfect trip</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-px"
              style={{ background: "linear-gradient(90deg, transparent, hsl(158, 42%, 50%), transparent)" }} />

            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="prism-card p-8 text-center relative"
              >
                <div className="absolute top-5 right-5 text-xs font-bold opacity-30 text-primary">{step.num}</div>
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-5 mx-auto"
                  style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: "hsl(158, 38%, 15%)" }}>{step.title}</h3>
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
            className="text-center mb-16"
          >
            <p className="section-label mb-3">Why KroTravel</p>
            <h2 className="text-3xl sm:text-5xl font-heading tracking-tight mb-4" style={{ color: "hsl(158, 45%, 10%)" }}>
              Built <span className="text-mint-gradient">differently</span>
            </h2>
            <p className="max-w-md mx-auto text-base font-light" style={{ color: "hsl(158, 18%, 48%)" }}>
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
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="prism-card p-8 cursor-default"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
                  <f.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: "hsl(158, 38%, 15%)" }}>{f.title}</h3>
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
            className="text-center mb-14"
          >
            <p className="section-label mb-3">Popular Destinations</p>
            <h2 className="text-3xl sm:text-5xl font-heading tracking-tight" style={{ color: "hsl(158, 45%, 10%)" }}>
              Where will you <span className="text-mint-gradient italic">go next?</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destinations.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to="/destinations">
                  <div className="dest-photo-card group cursor-pointer" style={{ height: "220px" }}>
                    <img
                      src={`https://source.unsplash.com/600x500/?${encodeURIComponent(d.img)}`}
                      alt={d.name}
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="text-2xl mb-1">{d.emoji}</div>
                      <div className="text-white font-bold text-base">{d.name}</div>
                      <div className="text-white/70 text-xs">{d.tag}</div>
                    </div>
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      <ArrowRight className="w-4 h-4 text-white" />
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
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-5xl font-heading tracking-tight" style={{ color: "hsl(158, 45%, 10%)" }}>
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
                transition={{ delay: i * 0.12 }}
                className="glass-panel p-8"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current text-primary" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6 font-light italic" style={{ color: "hsl(158, 25%, 30%)" }}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
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
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="glass-intense p-12 sm:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div style={{ width: "500px", height: "350px", background: "radial-gradient(ellipse, hsla(152, 65%, 65%, 0.15) 0%, transparent 70%)", filter: "blur(50px)" }} />
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold"
                  style={{ background: "hsla(158, 42%, 38%, 0.12)", color: "hsl(158, 42%, 30%)" }}>
                  <Zap className="w-3 h-3" /> Start free — no credit card
                </div>
                <h2 className="text-3xl sm:text-5xl font-heading tracking-tight mb-5" style={{ color: "hsl(158, 45%, 10%)" }}>
                  Ready to travel{" "}
                  <span className="text-mint-gradient italic">smarter?</span>
                </h2>
                <p className="mb-10 max-w-md mx-auto text-base font-light" style={{ color: "hsl(158, 18%, 46%)" }}>
                  Stop spending hours on research. Let AI create a plan that actually works.
                </p>
                <Link to="/plan">
                  <button className="btn-primary text-base px-12 py-4 flex items-center gap-2 mx-auto animate-glow-ring">
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
