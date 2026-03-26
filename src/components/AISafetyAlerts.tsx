import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Fallback AI-generated safety data when no admin alerts exist
const SAFETY_DATA: Record<string, { level: string; alerts: { title: string; description: string }[] }> = {
  default: { level: "low", alerts: [{ title: "General Advisory", description: "Always carry ID, keep emergency contacts handy, and stay aware of your surroundings." }] },
  goa: { level: "low", alerts: [{ title: "Beach Safety", description: "Swim only in lifeguard-patrolled areas. Strong currents during monsoon season." }, { title: "Road Safety", description: "Wear helmets on two-wheelers. Roads can be narrow and winding." }] },
  manali: { level: "medium", alerts: [{ title: "Altitude Sickness", description: "Acclimatize properly above 3000m. Carry basic medication." }, { title: "Road Conditions", description: "Mountain roads can be dangerous during monsoon. Check conditions before travel." }] },
  ladakh: { level: "medium", alerts: [{ title: "High Altitude Warning", description: "Altitude above 3500m requires acclimatization. AMS risk is real." }, { title: "Limited Connectivity", description: "Phone/internet may not work in remote areas. Carry offline maps." }] },
  varanasi: { level: "low", alerts: [{ title: "Crowd Safety", description: "Ghats can be extremely crowded during festivals. Keep belongings close." }, { title: "Food & Water", description: "Drink only bottled water. Be cautious with street food hygiene." }] },
  kashmir: { level: "medium", alerts: [{ title: "Security Advisory", description: "Check latest government advisories before travel. Stick to tourist areas." }, { title: "Weather Changes", description: "Weather can change rapidly. Carry warm layers even in summer." }] },
};

interface Props { destination: string; }

export default function AISafetyAlerts({ destination }: Props) {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<{ title: string; description: string; level?: string }[]>([]);
  const [level, setLevel] = useState("low");

  useEffect(() => { if (open) load(); }, [open]);

  const load = async () => {
    // Check admin-managed alerts first
    const { data: dbAlerts } = await supabase.from("safety_alerts").select("*")
      .eq("is_active", true).ilike("destination", `%${destination}%`);

    if (dbAlerts && dbAlerts.length > 0) {
      setAlerts(dbAlerts.map(a => ({ title: a.title, description: a.description, level: a.alert_level })));
      const maxLevel = dbAlerts.some(a => a.alert_level === "high") ? "high" : dbAlerts.some(a => a.alert_level === "medium") ? "medium" : "low";
      setLevel(maxLevel);
    } else {
      // Fallback to static data
      const dest = destination.toLowerCase().trim();
      const match = Object.entries(SAFETY_DATA).find(([k]) => dest.includes(k));
      const data = match ? match[1] : SAFETY_DATA.default;
      setAlerts(data.alerts);
      setLevel(data.level);
    }
  };

  const levelConfig = {
    low: { color: "text-green-600", bg: "bg-green-500/10", icon: CheckCircle, label: "Safe" },
    medium: { color: "text-yellow-600", bg: "bg-yellow-500/10", icon: AlertTriangle, label: "Moderate" },
    high: { color: "text-red-600", bg: "bg-red-500/10", icon: AlertTriangle, label: "Caution" },
  }[level] || { color: "text-green-600", bg: "bg-green-500/10", icon: CheckCircle, label: "Safe" };

  const LevelIcon = levelConfig.icon;

  return (
    <motion.div className="glass-panel p-4 rounded-2xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${levelConfig.bg} flex items-center justify-center`}>
            <Shield className={`w-5 h-5 ${levelConfig.color}`} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">AI Safety Alerts</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <LevelIcon className={`w-3 h-3 ${levelConfig.color}`} />
              <span className={levelConfig.color}>{levelConfig.label}</span> — {destination}
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 space-y-2">
            {alerts.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="glass-panel p-3 rounded-xl flex gap-3">
                <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
