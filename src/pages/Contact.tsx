import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail, MessageSquare, Phone, ChevronDown, ChevronUp,
  Send, MapPin, Clock, Shield, CheckCircle2, Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const faqs = [
  {
    q: "Is KroTravel free to use?",
    a: "Yes! The Explorer (Free) plan gives you a complete destination overview and rough itinerary at no cost. The Voyager plan gives you a full AI-crafted, hour-by-hour personalized itinerary for a one-time fee per trip.",
  },
  {
    q: "How long does it take to generate my itinerary?",
    a: "Our AI generates your complete itinerary in under 60 seconds. The paid plan includes hotel suggestions, transport picks, and a full budget breakdown — all generated in real-time.",
  },
  {
    q: "Can I download or share my itinerary?",
    a: "Yes! Paid itineraries can be downloaded as a professionally designed PDF. You can also share them with friends and family via a unique link.",
  },
  {
    q: "What if I'm not happy with my itinerary?",
    a: "You can regenerate your itinerary (up to the plan limit) with tweaked preferences. We want you to love your plan before you pack your bags.",
  },
  {
    q: "Is my data safe with KroTravel?",
    a: "Absolutely. Your travel data and memories stay yours. We don't sell data to third parties and don't serve ads. Privacy is built into how we operate.",
  },
  {
    q: "Do you cover international destinations?",
    a: "We're currently focused on India with 200+ cities covered. International routes are in our roadmap for 2026.",
  },
];

const contactMethods = [
  {
    Icon: Mail,
    title: "Email Support",
    desc: "support@krotravel.com",
    action: "mailto:support@krotravel.com",
    label: "Send Email",
  },
  {
    Icon: MessageSquare,
    title: "WhatsApp",
    desc: "Chat with us for quick help",
    action: "https://wa.me/919876543210",
    label: "Open WhatsApp",
  },
  {
    Icon: Clock,
    title: "Response Time",
    desc: "Usually within 2–4 hours",
    action: null,
    label: null,
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    // Basic email validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    toast({ title: "✅ Message sent!", description: "We'll get back to you within 2–4 hours." });
    setForm({ name: "", email: "", subject: "", message: "" });
    setSending(false);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-orb-1" style={{ top: "10%", right: "10%" }} />
        <div className="ambient-orb-2" style={{ bottom: "20%", left: "5%" }} />
      </div>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8 z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-5 text-xs sm:text-sm font-medium"
            style={{ color: "hsl(158, 38%, 28%)" }}>
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            We're here to help
          </div>
          <h1 className="text-4xl sm:text-6xl font-heading tracking-tight mb-4"
            style={{ color: "hsl(158, 45%, 10%)" }}>
            Contact <span className="text-mint-gradient">& Support</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Have a question, feedback, or need help with your trip? We'd love to hear from you.
          </p>
        </motion.div>
      </section>

      {/* ── Contact methods + Form ── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-8">

          {/* Left — Contact methods */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-2 space-y-4"
          >
            {contactMethods.map((m, i) => (
              <div key={i} className="glass-panel rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <m.Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{m.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{m.desc}</p>
                {m.action && m.label && (
                  <a href={m.action} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                    {m.label} →
                  </a>
                )}
              </div>
            ))}

            {/* Trust badges */}
            <div className="glass-panel rounded-2xl p-5 space-y-2">
              {[
                "Private & secure — no data sold",
                "No spam, ever",
                "Replies within 2–4 hours",
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-3"
          >
            <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-1">Send us a message</h2>
              <p className="text-xs text-muted-foreground mb-4">We read every message and respond personally.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "hsl(158, 35%, 28%)" }}>
                    Your Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    className="glass-input w-full px-4 py-3 text-sm"
                    placeholder="Rahul Sharma"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value.slice(0, 100) }))}
                    maxLength={100}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "hsl(158, 35%, 28%)" }}>
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    className="glass-input w-full px-4 py-3 text-sm"
                    type="email"
                    placeholder="rahul@email.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value.slice(0, 255) }))}
                    maxLength={255}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "hsl(158, 35%, 28%)" }}>
                  Subject
                </label>
                <input
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="e.g., Problem with my itinerary"
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value.slice(0, 200) }))}
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "hsl(158, 35%, 28%)" }}>
                  Message <span className="text-destructive">*</span>
                </label>
                <textarea
                  className="glass-input w-full px-4 py-3 text-sm resize-none"
                  placeholder="Tell us how we can help you…"
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value.slice(0, 2000) }))}
                  maxLength={2000}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{form.message.length}/2000</p>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? "Sending…" : "Send Message"}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="section-label mb-3">FAQs</p>
            <h2 className="text-3xl sm:text-5xl font-heading tracking-tight" style={{ color: "hsl(158, 45%, 10%)" }}>
              Common <span className="text-mint-gradient">questions</span>
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass-panel rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold pr-4" style={{ color: "hsl(158, 38%, 18%)" }}>{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-primary flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-5 pb-4"
                  >
                    <p className="text-sm leading-relaxed" style={{ color: "hsl(158, 18%, 44%)" }}>{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
