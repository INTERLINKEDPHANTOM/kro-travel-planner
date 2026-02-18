import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  CreditCard, Tag, Check, X, Loader2, Shield, Lock, Zap,
  MapPin, Calendar, Users, Wallet, ArrowRight, ChevronRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PLAN_PRICE = 299; // ₹299 per trip (example)

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<any>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("tripPreferences");
    if (stored) setPrefs(JSON.parse(stored));
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate("/auth?redirect=/checkout"); return; }
      setUser(user);
    });
  }, [navigate]);

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    setPromoApplied(null);

    const code = promoCode.trim().toUpperCase();
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      setPromoError("Invalid or expired promo code.");
      setPromoLoading(false);
      return;
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setPromoError("This promo code has expired.");
      setPromoLoading(false);
      return;
    }

    // Check max uses
    if (data.max_uses && data.uses_count >= data.max_uses) {
      setPromoError("This promo code has reached its usage limit.");
      setPromoLoading(false);
      return;
    }

    // Check min cart
    if (data.min_cart_value && PLAN_PRICE < data.min_cart_value) {
      setPromoError(`Minimum order of ₹${data.min_cart_value} required.`);
      setPromoLoading(false);
      return;
    }

    setPromoApplied(data);
    toast({ title: `🎉 Promo applied! ${data.discount_type === "percentage" ? `${data.discount_value}% off` : `₹${data.discount_value} off`}` });
    setPromoLoading(false);
  };

  const removePromo = () => {
    setPromoApplied(null);
    setPromoCode("");
    setPromoError("");
  };

  const getDiscount = () => {
    if (!promoApplied) return 0;
    if (promoApplied.discount_type === "percentage") return Math.round(PLAN_PRICE * promoApplied.discount_value / 100);
    return Math.min(promoApplied.discount_value, PLAN_PRICE);
  };

  const finalPrice = Math.max(0, PLAN_PRICE - getDiscount());

  const handlePay = async () => {
    setProcessing(true);
    // Simulate payment processing — in production integrate Razorpay/Stripe here
    await new Promise(r => setTimeout(r, 1800));
    toast({ title: "✅ Payment successful!", description: "Generating your itinerary now…" });
    navigate("/paid-itinerary");
    setProcessing(false);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-orb-1" style={{ top: "8%", right: "10%" }} />
        <div className="ambient-orb-2" style={{ bottom: "20%", left: "5%" }} />
      </div>
      <Navbar />

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-5 text-xs font-medium"
              style={{ color: "hsl(158, 38%, 28%)" }}>
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              Secure Checkout
            </div>
            <h1 className="text-3xl sm:text-5xl font-heading tracking-tight mb-3" style={{ color: "hsl(158, 45%, 10%)" }}>
              Complete your <span className="text-mint-gradient">booking</span>
            </h1>
            <p className="text-muted-foreground text-sm">One-time payment · No subscription · Itinerary ready in 60 seconds</p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Left — Trip summary + promo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="md:col-span-3 space-y-5"
            >
              {/* Trip Summary */}
              {prefs && (
                <div className="glass-panel rounded-3xl p-6">
                  <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Trip Summary
                  </h2>
                  <div className="space-y-3">
                    {[
                      { Icon: MapPin, label: "Route", value: `${prefs.departure || "—"} → ${prefs.arrival || "—"}` },
                      { Icon: Calendar, label: "Dates", value: prefs.departureDate ? `${new Date(prefs.departureDate).toLocaleDateString("en-IN")} – ${new Date(prefs.arrivalDate).toLocaleDateString("en-IN")}` : "—" },
                      { Icon: Users, label: "Travellers", value: `${prefs.numPeople || 1} ${prefs.numPeople === 1 ? "person" : "people"}` },
                      { Icon: Wallet, label: "Budget", value: prefs.budgetMin ? `₹${Number(prefs.budgetMin).toLocaleString("en-IN")} – ₹${Number(prefs.budgetMax).toLocaleString("en-IN")}` : "—" },
                    ].map(({ Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-muted-foreground w-20">{label}</span>
                        <span className="text-foreground font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What you get */}
              <div className="glass-panel rounded-3xl p-6">
                <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> What's included
                </h2>
                <div className="space-y-2.5">
                  {[
                    "Hour-by-hour AI itinerary",
                    "Transport & hotel picks",
                    "Exact budget breakdown",
                    "PDF download",
                    "1 GB trip cloud storage",
                    "Auto virtual album + reel",
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-foreground/80">
                      <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-primary" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo code */}
              <div className="glass-panel rounded-3xl p-6">
                <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" /> Promo Code
                </h2>
                {promoApplied ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/25">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="font-mono text-sm font-bold text-primary">{promoApplied.code}</span>
                      <span className="text-xs text-primary/80">
                        {promoApplied.discount_type === "percentage" ? `${promoApplied.discount_value}% off` : `₹${promoApplied.discount_value} off`}
                      </span>
                    </div>
                    <button onClick={removePromo} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      className="glass-input flex-1 px-4 py-3 text-sm font-mono tracking-wider uppercase"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={e => { setPromoCode(e.target.value.toUpperCase().slice(0, 30)); setPromoError(""); }}
                      onKeyDown={e => e.key === "Enter" && applyPromo()}
                      maxLength={30}
                    />
                    <button
                      onClick={applyPromo}
                      disabled={promoLoading || !promoCode.trim()}
                      className="btn-ghost-glass px-4 py-3 text-sm font-medium disabled:opacity-50"
                    >
                      {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                    <X className="w-3 h-3" /> {promoError}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  <Link to="/offers" className="text-primary hover:underline">View active promo codes →</Link>
                </p>
              </div>
            </motion.div>

            {/* Right — Price summary + Pay */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="md:col-span-2"
            >
              <div className="prism-card p-6 sticky top-24">
                <h2 className="text-base font-semibold text-foreground mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Voyager Plan</span>
                    <span className="text-foreground">₹{PLAN_PRICE}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-primary flex items-center gap-1"><Tag className="w-3 h-3" /> Discount</span>
                      <span className="text-primary">−₹{getDiscount()}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-mint-gradient">₹{finalPrice}</span>
                  </div>
                </div>

                <button
                  onClick={handlePay}
                  disabled={processing}
                  className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2 disabled:opacity-50 mb-4"
                >
                  {processing
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                    : <><Lock className="w-4 h-4" /> Pay ₹{finalPrice} Securely</>}
                </button>

                <div className="space-y-2">
                  {[
                    { Icon: Shield, text: "SSL encrypted payment" },
                    { Icon: Zap, text: "Itinerary ready in 60 seconds" },
                    { Icon: Check, text: "Full refund if AI fails" },
                  ].map(({ Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    By paying you agree to our{" "}
                    <Link to="/legal" className="text-primary hover:underline">Terms of Service</Link>
                    {" & "}
                    <Link to="/legal" className="text-primary hover:underline">Refund Policy</Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Checkout;
