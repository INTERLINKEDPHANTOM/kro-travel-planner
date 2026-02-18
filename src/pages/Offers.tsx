import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Tag, Gift, Zap, Star, Clock, Copy, CheckCircle2, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_cart_value: number;
  expires_at: string | null;
  new_users_only: boolean;
  one_time_per_user: boolean;
  max_uses: number | null;
  uses_count: number;
}

const howItWorks = [
  { step: "1", title: "Choose a trip", desc: "Fill out your travel preferences and pick a destination" },
  { step: "2", title: "Select Paid Plan", desc: "Choose the Voyager plan on the plan selection page" },
  { step: "3", title: "Apply promo code", desc: "Enter your promo code at checkout for instant discount" },
  { step: "4", title: "Get your itinerary", desc: "Your personalized AI trip plan is ready in under 60 seconds" },
];

const Offers = () => {
  const { toast } = useToast();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    const { data } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    setPromos(data || []);
    setLoading(false);
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    toast({ title: `✅ Code "${code}" copied!`, description: "Paste it at checkout." });
    setTimeout(() => setCopied(null), 2500);
  };

  const isExpired = (expires_at: string | null) => {
    if (!expires_at) return false;
    return new Date(expires_at) < new Date();
  };

  const activePromos = promos.filter(p => !isExpired(p.expires_at));

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-orb-1" style={{ top: "8%", right: "12%" }} />
        <div className="ambient-orb-2" style={{ bottom: "18%", left: "5%" }} />
      </div>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8 z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-5 text-xs sm:text-sm font-medium"
            style={{ color: "hsl(158, 38%, 28%)" }}>
            <Gift className="w-3.5 h-3.5 text-primary" />
            Exclusive Offers
          </div>
          <h1 className="text-4xl sm:text-6xl font-heading tracking-tight mb-4" style={{ color: "hsl(158, 45%, 10%)" }}>
            Travel more, <span className="text-mint-gradient italic">spend less.</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Use an active promo code at checkout to unlock instant discounts on your trip plans.
          </p>
        </motion.div>
      </section>

      {/* ── Active promo codes ── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-heading mb-5 text-foreground flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Active Promo Codes
          </h2>

          {loading ? (
            <div className="text-center py-16 text-muted-foreground">Loading offers…</div>
          ) : activePromos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass-panel rounded-3xl p-12 text-center"
            >
              <Gift className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No active offers right now</h3>
              <p className="text-sm text-muted-foreground mb-6">Check back soon — we regularly run campaigns and seasonal offers.</p>
              <Link to="/plan">
                <button className="btn-primary text-sm px-6 py-3 flex items-center gap-2 mx-auto group">
                  Plan My Trip Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {activePromos.map((promo, i) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="prism-card p-6 relative overflow-hidden"
                >
                  {/* Decorative dashes */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-gradient-to-b from-primary to-primary/50" />

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xl font-bold tracking-widest" style={{ color: "hsl(158, 42%, 30%)" }}>
                          {promo.code}
                        </span>
                        {promo.new_users_only && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{ background: "hsla(158, 42%, 38%, 0.12)", color: "hsl(158, 42%, 32%)" }}>
                            New Users
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-bold text-foreground">
                        {promo.discount_type === "percentage"
                          ? `${promo.discount_value}% OFF`
                          : `₹${promo.discount_value} OFF`}
                      </p>
                      {promo.min_cart_value > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">Min. order ₹{promo.min_cart_value}</p>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Tag className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                    {promo.expires_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expires {new Date(promo.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                    {promo.one_time_per_user && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" /> One-time use
                      </span>
                    )}
                    {promo.max_uses && (
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {Math.max(0, promo.max_uses - promo.uses_count)} left
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => copyCode(promo.code)}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 border
                      ${copied === promo.code
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "glass-panel hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-foreground"}`}
                  >
                    {copied === promo.code
                      ? <><CheckCircle2 className="w-4 h-4" /> Copied!</>
                      : <><Copy className="w-4 h-4" /> Copy Code</>}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── How to use ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="section-label mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-heading tracking-tight" style={{ color: "hsl(158, 45%, 10%)" }}>
              Using a promo code is <span className="text-mint-gradient">simple</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-4 gap-4">
            {howItWorks.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel rounded-2xl p-5 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 text-sm font-bold text-primary">
                  {step.step}
                </div>
                <h4 className="text-sm font-semibold mb-1 text-foreground">{step.title}</h4>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-padding relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="prism-card p-8 sm:p-10"
          >
            <Gift className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-heading mb-3" style={{ color: "hsl(158, 45%, 10%)" }}>
              Ready to plan your trip?
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Copy a promo code above and use it when you checkout.</p>
            <Link to="/plan">
              <button className="btn-primary px-8 py-3.5 text-sm flex items-center gap-2 mx-auto group">
                Start Planning
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

export default Offers;
