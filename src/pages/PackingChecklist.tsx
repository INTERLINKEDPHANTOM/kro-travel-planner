import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Package, ArrowLeft, Loader2, Plus, Trash2, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Predefined checklist categories with items
const CHECKLIST_TEMPLATES: Record<string, { emoji: string; items: string[] }> = {
  "Essentials": {
    emoji: "🎒",
    items: [
      "Government ID (Aadhaar / Passport / Driving License)",
      "Phone charger & power bank",
      "Earphones / headphones",
      "Reusable water bottle",
      "Backpack / day bag",
      "Sunglasses",
      "Wallet with cash & cards",
      "Travel insurance details",
    ],
  },
  "Documents": {
    emoji: "📄",
    items: [
      "Train / bus / flight tickets (printout or digital)",
      "Hotel booking confirmation",
      "Photo ID copies (2 photocopies)",
      "Emergency contact list",
      "Trip itinerary printout",
      "Medical prescriptions (if any)",
      "Visa / permit (if required)",
    ],
  },
  "Clothing": {
    emoji: "👗",
    items: [
      "T-shirts / shirts (as per trip days)",
      "Trousers / shorts",
      "Comfortable walking shoes",
      "Socks & undergarments",
      "Lightweight jacket / hoodie",
      "Rain poncho / umbrella",
      "Sleepwear",
      "Flip flops / sandals",
      "Warm layers (for cold destinations)",
    ],
  },
  "Hygiene & Health": {
    emoji: "💊",
    items: [
      "Toothbrush & toothpaste",
      "Shampoo & soap (travel size)",
      "Sunscreen SPF 50+",
      "Moisturizer & lip balm",
      "Hand sanitizer",
      "Basic first-aid kit",
      "Prescribed medicines",
      "ORS sachets & antacids",
      "Insect repellent",
    ],
  },
  "Tech & Entertainment": {
    emoji: "📱",
    items: [
      "Smartphone fully charged",
      "Camera + memory card",
      "Universal travel adapter",
      "Laptop / tablet (if needed)",
      "Download offline maps",
      "Download music / podcasts",
      "E-books or physical book",
    ],
  },
  "Special Needs": {
    emoji: "⭐",
    items: [
      "Baby essentials (if travelling with infant)",
      "Senior medication kit",
      "Pet carrier & food (if pet travel)",
      "Disability aids / wheelchair",
      "Allergy medication",
      "CPAP machine / medical device",
    ],
  },
};

interface ChecklistItem {
  text: string;
  checked: boolean;
  custom?: boolean;
}

type CategoryData = Record<string, ChecklistItem[]>;

const PackingChecklist = () => {
  const { tripId } = useParams<{ tripId?: string }>();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Essentials");
  const [checklist, setChecklist] = useState<CategoryData>({});
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth?redirect=/my-trips"); return; }
    setUserId(user.id);

    if (tripId) {
      const { data } = await supabase.from("saved_itineraries").select("id, destination").eq("id", tripId).maybeSingle();
      setTrip(data);
    }

    // Load saved checklist from trip_photos (using same pattern as journal)
    const storageKey = tripId ? `checklist-${tripId}` : `checklist-general`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setChecklist(JSON.parse(saved));
      } catch {
        initDefaultChecklist();
      }
    } else {
      initDefaultChecklist();
    }

    setLoading(false);
  };

  const initDefaultChecklist = () => {
    const data: CategoryData = {};
    Object.entries(CHECKLIST_TEMPLATES).forEach(([cat, { items }]) => {
      data[cat] = items.map(text => ({ text, checked: false }));
    });
    setChecklist(data);
  };

  const saveChecklist = (updated: CategoryData) => {
    const storageKey = tripId ? `checklist-${tripId}` : `checklist-general`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setChecklist(updated);
  };

  const toggleItem = (category: string, idx: number) => {
    const updated = { ...checklist };
    updated[category] = [...(updated[category] || [])];
    updated[category][idx] = { ...updated[category][idx], checked: !updated[category][idx].checked };
    saveChecklist(updated);
  };

  const addCustomItem = () => {
    if (!newItem.trim()) return;
    const updated = { ...checklist };
    if (!updated[activeCategory]) updated[activeCategory] = [];
    updated[activeCategory] = [...updated[activeCategory], { text: newItem.trim(), checked: false, custom: true }];
    saveChecklist(updated);
    setNewItem("");
    setShowAddItem(false);
  };

  const removeCustomItem = (category: string, idx: number) => {
    const updated = { ...checklist };
    updated[category] = updated[category].filter((_, i) => i !== idx);
    saveChecklist(updated);
  };

  const resetCategory = (category: string) => {
    const updated = { ...checklist };
    const template = CHECKLIST_TEMPLATES[category];
    if (template) {
      updated[category] = template.items.map(text => ({ text, checked: false }));
    }
    saveChecklist(updated);
  };

  const categories = Object.keys(CHECKLIST_TEMPLATES);
  const currentItems = checklist[activeCategory] || [];
  const checkedCount = currentItems.filter(i => i.checked).length;
  const totalCount = currentItems.length;

  const allItems = Object.values(checklist).flat();
  const totalChecked = allItems.filter(i => i.checked).length;
  const totalItems = allItems.length;

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <Navbar />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-24 pb-28">
        {/* Back + Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link to={tripId ? `/paid-itinerary` : "/my-trips"}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(158,42%,40%), hsl(162,45%,28%))" }}>
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-heading" style={{ color: "hsl(158, 45%, 10%)" }}>Packing Checklist</h1>
              {trip && <p className="text-sm text-muted-foreground mt-0.5">For your trip to {trip.destination}</p>}
            </div>
          </div>
        </motion.div>

        {/* Overall progress */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="prism-card p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-heading text-sm" style={{ color: "hsl(158,45%,10%)" }}>Overall Progress</p>
              <p className="text-xs text-muted-foreground">{totalChecked} of {totalItems} items packed</p>
            </div>
            <div className="text-right">
              <p className="font-heading text-2xl font-bold text-primary">{Math.round((totalChecked / Math.max(1, totalItems)) * 100)}%</p>
              <p className="text-[10px] text-muted-foreground">complete</p>
            </div>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "hsla(158,30%,80%,0.4)" }}>
            <motion.div className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, hsl(158,42%,40%), hsl(162,52%,55%))" }}
              animate={{ width: `${(totalChecked / Math.max(1, totalItems)) * 100}%` }}
              transition={{ duration: 0.5 }} />
          </div>
          {totalChecked === totalItems && totalItems > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 mt-3 p-2.5 rounded-xl"
              style={{ background: "hsla(158,42%,38%,0.10)" }}>
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <p className="text-xs font-medium text-primary">All packed! You're ready to go! 🎉</p>
            </motion.div>
          )}
        </motion.div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none" }}>
          {categories.map(cat => {
            const items = checklist[cat] || [];
            const done = items.filter(i => i.checked).length;
            const total = items.length;
            const isActive = activeCategory === cat;
            return (
              <motion.button key={cat} onClick={() => setActiveCategory(cat)}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all border"
                style={isActive ? {
                  background: "linear-gradient(135deg, hsl(158,42%,40%), hsl(162,45%,28%))",
                  color: "white",
                  border: "1px solid transparent",
                  boxShadow: "0 4px 14px hsla(158,42%,36%,0.3)",
                } : {
                  background: "hsla(148,40%,98%,0.55)",
                  border: "1px solid hsla(148,35%,80%,0.45)",
                  color: "hsl(158,30%,40%)",
                }}>
                <span className="text-sm">{CHECKLIST_TEMPLATES[cat]?.emoji}</span>
                <span>{cat}</span>
                {done > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                    style={isActive ? { background: "rgba(255,255,255,0.25)" } : { background: "hsla(158,42%,40%,0.15)", color: "hsl(158,42%,30%)" }}>
                    {done}/{total}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Active category checklist */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="prism-card overflow-hidden mb-4"
        >
          {/* Category header */}
          <div className="p-4 border-b border-border/20 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, hsla(148,45%,98%,0.6), hsla(155,40%,95%,0.4))" }}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{CHECKLIST_TEMPLATES[activeCategory]?.emoji}</span>
              <div>
                <h2 className="font-heading text-sm" style={{ color: "hsl(158,45%,10%)" }}>{activeCategory}</h2>
                <p className="text-[10px] text-muted-foreground">{checkedCount} / {totalCount} packed</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 relative">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" stroke="hsla(148,35%,80%,0.4)" />
                  <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                    stroke="hsl(158,42%,40%)" strokeLinecap="round"
                    strokeDasharray={`${(checkedCount / Math.max(1, totalCount)) * 94} 94`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{Math.round((checkedCount / Math.max(1, totalCount)) * 100)}%</span>
                </div>
              </div>
              <button onClick={() => resetCategory(activeCategory)}
                className="text-[10px] text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg glass-panel">
                Reset
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="p-2">
            <AnimatePresence>
              {currentItems.map((item, idx) => (
                <motion.div key={`${activeCategory}-${idx}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ delay: idx * 0.025 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/40 transition-all group cursor-pointer"
                  onClick={() => toggleItem(activeCategory, idx)}
                >
                  <motion.div animate={{ scale: item.checked ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.2 }}>
                    {item.checked
                      ? <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      : <Circle className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />}
                  </motion.div>
                  <span className={`flex-1 text-sm leading-relaxed transition-all ${item.checked ? "line-through text-muted-foreground/60" : ""}`}
                    style={{ color: item.checked ? undefined : "hsl(158,35%,18%)" }}>
                    {item.text}
                  </span>
                  {item.custom && (
                    <button onClick={e => { e.stopPropagation(); removeCustomItem(activeCategory, idx); }}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: "hsla(0,72%,55%,0.10)", color: "hsl(0,72%,55%)" }}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add custom item */}
          <div className="p-3 border-t border-border/20">
            {showAddItem ? (
              <div className="flex gap-2">
                <input
                  value={newItem}
                  onChange={e => setNewItem(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCustomItem()}
                  placeholder={`Add to ${activeCategory}...`}
                  autoFocus
                  className="flex-1 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  style={{
                    background: "hsla(148,35%,97%,0.8)",
                    border: "1px solid hsla(148,35%,78%,0.45)",
                    color: "hsl(158,38%,18%)",
                  }}
                />
                <button onClick={addCustomItem} className="btn-primary px-4 py-2 text-xs rounded-xl">Add</button>
                <button onClick={() => { setShowAddItem(false); setNewItem(""); }}
                  className="btn-ghost-glass px-3 py-2 text-xs rounded-xl">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShowAddItem(true)}
                className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors py-2 px-2 rounded-xl hover:bg-white/30">
                <Plus className="w-4 h-4" />
                Add custom item to {activeCategory}
              </button>
            )}
          </div>
        </motion.div>

        {/* Quick summary of all categories */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-heading text-sm mb-3" style={{ color: "hsl(158,45%,10%)" }}>All Categories</h3>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(cat => {
              const items = checklist[cat] || [];
              const done = items.filter(i => i.checked).length;
              const total = items.length;
              const pct = Math.round((done / Math.max(1, total)) * 100);
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className="glass-panel p-3.5 rounded-2xl text-left hover-lift transition-all"
                  style={activeCategory === cat ? { border: "2px solid hsla(158,42%,50%,0.4)" } : {}}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{CHECKLIST_TEMPLATES[cat]?.emoji}</span>
                    <span className="text-xs font-bold text-primary">{pct}%</span>
                  </div>
                  <p className="text-xs font-semibold mb-1" style={{ color: "hsl(158,45%,12%)" }}>{cat}</p>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsla(158,30%,80%,0.35)" }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: "hsl(158,42%,40%)" }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{done}/{total} packed</p>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default PackingChecklist;
