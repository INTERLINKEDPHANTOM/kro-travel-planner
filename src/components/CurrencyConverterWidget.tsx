import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, RefreshCw, Loader2, TrendingUp, ChevronDown, IndianRupee, Wallet } from "lucide-react";

interface Props {
  destination: string;
  budget?: number;
}

interface Rate {
  code: string;
  name: string;
  rate: number; // relative to INR (1 INR = X foreign)
  flag: string;
}

const POPULAR_CURRENCIES: Record<string, { name: string; flag: string }> = {
  USD: { name: "US Dollar", flag: "🇺🇸" },
  EUR: { name: "Euro", flag: "🇪🇺" },
  GBP: { name: "British Pound", flag: "🇬🇧" },
  JPY: { name: "Japanese Yen", flag: "🇯🇵" },
  AED: { name: "UAE Dirham", flag: "🇦🇪" },
  THB: { name: "Thai Baht", flag: "🇹🇭" },
  SGD: { name: "Singapore Dollar", flag: "🇸🇬" },
  MYR: { name: "Malaysian Ringgit", flag: "🇲🇾" },
  LKR: { name: "Sri Lankan Rupee", flag: "🇱🇰" },
  NPR: { name: "Nepalese Rupee", flag: "🇳🇵" },
  BDT: { name: "Bangladeshi Taka", flag: "🇧🇩" },
  IDR: { name: "Indonesian Rupiah", flag: "🇮🇩" },
  VND: { name: "Vietnamese Dong", flag: "🇻🇳" },
  KRW: { name: "South Korean Won", flag: "🇰🇷" },
  AUD: { name: "Australian Dollar", flag: "🇦🇺" },
  CAD: { name: "Canadian Dollar", flag: "🇨🇦" },
};

// Map destination to likely currency
const guessCurrencyFromDest = (dest: string): string => {
  const d = dest.toLowerCase();
  if (/thailand|bangkok|phuket|pattaya|chiang/i.test(d)) return "THB";
  if (/singapore/i.test(d)) return "SGD";
  if (/malaysia|kuala|langkawi/i.test(d)) return "MYR";
  if (/japan|tokyo|osaka|kyoto/i.test(d)) return "JPY";
  if (/dubai|abu dhabi|uae|sharjah/i.test(d)) return "AED";
  if (/sri lanka|colombo|kandy/i.test(d)) return "LKR";
  if (/nepal|kathmandu|pokhara/i.test(d)) return "NPR";
  if (/bangladesh|dhaka/i.test(d)) return "BDT";
  if (/indonesia|bali|jakarta/i.test(d)) return "IDR";
  if (/vietnam|hanoi|ho chi minh/i.test(d)) return "VND";
  if (/korea|seoul|busan/i.test(d)) return "KRW";
  if (/usa|america|new york|los angeles|san francisco/i.test(d)) return "USD";
  if (/uk|london|manchester|england/i.test(d)) return "GBP";
  if (/europe|paris|rome|berlin|amsterdam|spain|italy|france|germany/i.test(d)) return "EUR";
  if (/australia|sydney|melbourne/i.test(d)) return "AUD";
  if (/canada|toronto|vancouver/i.test(d)) return "CAD";
  return "USD";
};

const CurrencyConverterWidget = ({ destination, budget }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState(guessCurrencyFromDest(destination));
  const [amount, setAmount] = useState(budget ? String(budget) : "1000");
  const [direction, setDirection] = useState<"inr_to_foreign" | "foreign_to_inr">("inr_to_foreign");
  const [lastUpdated, setLastUpdated] = useState("");

  // Daily spending tracker
  const [dailySpend, setDailySpend] = useState<{ label: string; amount: number }[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newAmount, setNewAmount] = useState("");

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      // Using exchangerate.host free API (no key needed)
      const res = await fetch("https://open.er-api.com/v6/latest/INR");
      const data = await res.json();
      if (data.rates) {
        setRates(data.rates);
        setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      }
    } catch {
      // Fallback approximate rates
      setRates({ USD: 0.012, EUR: 0.011, GBP: 0.0094, JPY: 1.78, AED: 0.044, THB: 0.41, SGD: 0.016, MYR: 0.055, LKR: 3.6, NPR: 1.6, BDT: 1.42, IDR: 189.5, VND: 302, KRW: 16.4, AUD: 0.018, CAD: 0.016 });
      setLastUpdated("Offline rates");
    } finally {
      setLoading(false);
    }
  };

  const convert = useCallback(() => {
    const num = parseFloat(amount) || 0;
    const rate = rates[selectedCurrency] || 1;
    if (direction === "inr_to_foreign") return (num * rate).toFixed(2);
    return (num / rate).toFixed(2);
  }, [amount, rates, selectedCurrency, direction]);

  const addSpend = () => {
    if (!newLabel || !newAmount) return;
    setDailySpend(prev => [...prev, { label: newLabel, amount: parseFloat(newAmount) || 0 }]);
    setNewLabel("");
    setNewAmount("");
  };

  const totalSpend = dailySpend.reduce((s, e) => s + e.amount, 0);
  const curr = POPULAR_CURRENCIES[selectedCurrency];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 flex items-center justify-between hover:bg-accent/20 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
            <IndianRupee className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-heading text-sm" style={{ color: "hsl(158,45%,10%)" }}>Currency Converter</p>
            <p className="text-[10px] text-muted-foreground">
              1 INR = {loading ? "..." : (rates[selectedCurrency] || 0).toFixed(4)} {selectedCurrency} {curr?.flag}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-4">
              {/* Currency selector */}
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(POPULAR_CURRENCIES).slice(0, 10).map(([code, info]) => (
                  <button key={code} onClick={() => setSelectedCurrency(code)}
                    className={`text-[10px] px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                      selectedCurrency === code
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    }`}>
                    {info.flag} {code}
                  </button>
                ))}
              </div>

              {/* Converter */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1 block">
                    {direction === "inr_to_foreign" ? "🇮🇳 INR" : `${curr?.flag} ${selectedCurrency}`}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="glass-input w-full px-3 py-2.5 rounded-xl text-sm font-mono tabular-nums"
                    placeholder="Enter amount"
                  />
                </div>

                <button onClick={() => setDirection(d => d === "inr_to_foreign" ? "foreign_to_inr" : "inr_to_foreign")}
                  className="w-9 h-9 rounded-xl flex items-center justify-center mt-4 bg-primary/10 hover:bg-primary/20 transition-colors">
                  <ArrowLeftRight className="w-4 h-4 text-primary" />
                </button>

                <div className="flex-1">
                  <label className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1 block">
                    {direction === "inr_to_foreign" ? `${curr?.flag} ${selectedCurrency}` : "🇮🇳 INR"}
                  </label>
                  <div className="glass-input w-full px-3 py-2.5 rounded-xl text-sm font-mono tabular-nums bg-muted/20">
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : convert()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[9px] text-muted-foreground">Last updated: {lastUpdated}</p>
                <button onClick={fetchRates} className="text-[9px] text-primary flex items-center gap-1 hover:underline">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              {/* Daily Spending Tracker */}
              <div className="pt-3 border-t border-border/30">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-4 h-4 text-primary" />
                  <p className="font-heading text-xs" style={{ color: "hsl(158,45%,10%)" }}>Daily Spending Tracker</p>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    placeholder="What (e.g. Lunch)"
                    className="glass-input flex-1 px-2.5 py-2 rounded-lg text-[11px]"
                  />
                  <input
                    type="number"
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                    placeholder="₹ Amount"
                    className="glass-input w-24 px-2.5 py-2 rounded-lg text-[11px] font-mono"
                  />
                  <button onClick={addSpend} className="px-3 py-2 rounded-lg bg-primary/15 text-primary text-[11px] font-semibold hover:bg-primary/25 transition-colors">
                    +
                  </button>
                </div>

                {dailySpend.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {dailySpend.map((s, i) => (
                      <div key={i} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-muted/20 text-[11px]">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-mono font-semibold" style={{ color: "hsl(158,45%,15%)" }}>₹{s.amount.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-2.5 py-2 rounded-xl font-semibold text-xs" style={{ background: "hsla(158, 42%, 38%, 0.08)" }}>
                      <span className="text-primary">Total Today</span>
                      <span className="font-mono text-primary">₹{totalSpend.toLocaleString("en-IN")}</span>
                    </div>
                    {budget && (
                      <div className="mt-1">
                        <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                          <span>Budget used</span>
                          <span>{Math.round((totalSpend / budget) * 100)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${Math.min((totalSpend / budget) * 100, 100)}%`,
                            background: totalSpend > budget ? "hsl(0, 70%, 50%)" : "hsl(158, 50%, 40%)",
                          }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CurrencyConverterWidget;
