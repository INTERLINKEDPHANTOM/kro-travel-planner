import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Compass, Clock, Wallet, Sparkles, Globe, Shield, Star, ChevronRight } from "lucide-react";
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

const stats = [
  { value: "10K+", label: "Trips Planned" },
  { value: "98%", label: "Satisfaction" },
  { value: "150+", label: "Destinations" },
  { value: "4.9★", label: "Rating" },
];

const testimonials = [
  { name: "Priya S.", place: "Manali Trip", text: "The itinerary felt like my best friend who lives there wrote it. Every tip was gold." },
  { name: "Rahul M.", place: "Goa Weekend", text: "Saved me hours of research. The budget breakdown was spot on — I actually spent less than planned." },
  { name: "Ananya K.", place: "Kerala Tour", text: "We traveled with elderly parents. The pacing suggestions were incredibly thoughtful." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background noise-overlay">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/6 blur-[100px]" />
          <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[80px] animate-float" />
        </div>

        {/* Floating glass orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-32 right-[15%] w-20 h-20 rounded-2xl glass-card flex items-center justify-center"
          >
            <Globe className="w-8 h-8 text-primary/60" />
          </motion.div>
          <motion.div
            animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-52 right-[8%] w-16 h-16 rounded-2xl glass-card flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6 text-accent/60" />
          </motion.div>
          <motion.div
            animate={{ y: [-8, 12, -8] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-40 right-[20%] w-14 h-14 rounded-2xl glass-card flex items-center justify-center"
          >
            <Shield className="w-5 h-5 text-primary/50" />
          </motion.div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-primary mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">AI-Powered Travel Planning</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-heading font-bold text-foreground leading-[1.05] mb-8 tracking-tight">
              Travel Like a
              <br />
              <span className="gradient-text-warm">Local Planned</span>
              <br />
              Your Trip
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
              Realistic, budget-aware itineraries that respect your time, your wallet, and how real humans actually travel.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link to="/plan">
                <button className="btn-primary text-base px-10 py-4 flex items-center gap-2 group">
                  Plan My Trip
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/destinations">
                <button className="btn-outline-glass text-base px-10 py-4">
                  Explore Destinations
                </button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="glass-card rounded-2xl px-5 py-4 text-center"
                >
                  <div className="text-2xl font-heading font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-heading font-bold text-foreground mb-5 tracking-tight">
              Why Kro Travel Is <span className="gradient-text">Different</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
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
                className="glass-card-hover rounded-3xl p-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <f.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-heading font-bold mb-5 tracking-tight">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-muted-foreground text-lg">Three simple steps to your perfect trip</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Share Your Preferences", desc: "Tell us where, when, how many, and your budget. We handle the rest." },
              { step: "02", title: "Get Your Itinerary", desc: "Preview a free rough plan or unlock a fully personalized hour-wise itinerary." },
              { step: "03", title: "Travel With Confidence", desc: "Download, share, or access your plan anytime. Updated and saved to your account." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="text-7xl font-heading font-bold gradient-text mb-6 opacity-80">{item.step}</div>
                <h3 className="text-xl font-heading font-semibold mb-3 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-heading font-bold mb-5 tracking-tight">
              Travelers <span className="gradient-text">Love Us</span>
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
                className="glass-card-hover rounded-3xl p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground/90 mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{t.name[0]}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground text-sm">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">{t.place}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[150px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="glass-card rounded-[2rem] p-12 sm:p-16 glow-primary">
              <h2 className="text-3xl sm:text-5xl font-heading font-bold text-foreground mb-5 tracking-tight">
                Ready to Travel <span className="gradient-text">Smarter</span>?
              </h2>
              <p className="text-muted-foreground mb-10 max-w-lg mx-auto text-lg">
                Stop spending hours on research. Let our AI create a plan that actually works for you.
              </p>
              <Link to="/plan">
                <button className="btn-primary text-base px-12 py-5 animate-pulse-glow flex items-center gap-2 mx-auto">
                  Plan My Trip — It's Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
