import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Clock, ChevronDown, TrendingUp, TrendingDown, Minus, MapPin } from "lucide-react";

interface Props {
  destination: string;
  days?: any[];
}

type CrowdLevel = "low" | "moderate" | "high" | "very_high";

interface SpotCrowd {
  name: string;
  crowdByHour: Record<number, CrowdLevel>;
  bestTime: string;
  peakTime: string;
  type: string;
}

const CROWD_CONFIG: Record<CrowdLevel, { label: string; color: string; bg: string; icon: any }> = {
  low: { label: "Low", color: "hsl(158, 50%, 40%)", bg: "hsla(158, 50%, 40%, 0.15)", icon: TrendingDown },
  moderate: { label: "Moderate", color: "hsl(45, 80%, 45%)", bg: "hsla(45, 80%, 45%, 0.15)", icon: Minus },
  high: { label: "High", color: "hsl(25, 80%, 50%)", bg: "hsla(25, 80%, 50%, 0.15)", icon: TrendingUp },
  very_high: { label: "Very High", color: "hsl(0, 70%, 50%)", bg: "hsla(0, 70%, 50%, 0.15)", icon: TrendingUp },
};

// AI-estimated crowd patterns based on spot type and time
const generateCrowdPattern = (type: string, isWeekend: boolean): Record<number, CrowdLevel> => {
  const base: Record<string, Record<number, CrowdLevel>> = {
    temple: { 5: "moderate", 6: "high", 7: "very_high", 8: "high", 9: "moderate", 10: "low", 11: "low", 12: "low", 13: "low", 14: "low", 15: "moderate", 16: "high", 17: "very_high", 18: "high", 19: "moderate" },
    market: { 8: "low", 9: "moderate", 10: "high", 11: "very_high", 12: "high", 13: "moderate", 14: "low", 15: "low", 16: "moderate", 17: "high", 18: "very_high", 19: "high", 20: "moderate" },
    monument: { 6: "low", 7: "low", 8: "moderate", 9: "high", 10: "very_high", 11: "very_high", 12: "high", 13: "moderate", 14: "moderate", 15: "high", 16: "very_high", 17: "high", 18: "moderate" },
    park: { 5: "moderate", 6: "high", 7: "moderate", 8: "low", 9: "low", 10: "low", 11: "low", 12: "low", 13: "low", 14: "low", 15: "low", 16: "moderate", 17: "high", 18: "very_high", 19: "high" },
    beach: { 5: "low", 6: "moderate", 7: "high", 8: "moderate", 9: "low", 10: "moderate", 11: "high", 12: "very_high", 13: "very_high", 14: "high", 15: "high", 16: "very_high", 17: "high", 18: "moderate" },
    restaurant: { 7: "moderate", 8: "high", 9: "moderate", 10: "low", 11: "low", 12: "high", 13: "very_high", 14: "high", 15: "low", 16: "low", 17: "low", 18: "moderate", 19: "high", 20: "very_high", 21: "high" },
    museum: { 9: "low", 10: "moderate", 11: "high", 12: "very_high", 13: "high", 14: "high", 15: "very_high", 16: "high", 17: "moderate", 18: "low" },
  };

  const pattern = base[type] || base.monument;
  if (isWeekend) {
    const upgraded: Record<number, CrowdLevel> = {};
    for (const [h, level] of Object.entries(pattern)) {
      upgraded[Number(h)] = level === "low" ? "moderate" : level === "moderate" ? "high" : level === "high" ? "very_high" : "very_high";
    }
    return upgraded;
  }
  return pattern;
};

const classifySpotType = (name: string): string => {
  const lower = name.toLowerCase();
  if (/temple|mandir|church|mosque|gurudwara|shrine|monastery/i.test(lower)) return "temple";
  if (/market|bazaar|mall|shop|haat/i.test(lower)) return "market";
  if (/fort|palace|monument|memorial|tomb|mahal|qila|gate/i.test(lower)) return "monument";
  if (/park|garden|lake|dam|waterfall|valley/i.test(lower)) return "park";
  if (/beach|coast|shore|sea/i.test(lower)) return "beach";
  if (/restaurant|cafe|dhaba|food|eat/i.test(lower)) return "restaurant";
  if (/museum|gallery|exhibit/i.test(lower)) return "museum";
  return "monument";
};

const CrowdDensityHeatmap = ({ destination, days }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());

  const isWeekend = useMemo(() => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  }, []);

  // Extract spot names from itinerary days
  const spots: SpotCrowd[] = useMemo(() => {
    const places = new Set<string>();
    if (days) {
      for (const day of days) {
        if (day.activities) {
          for (const act of day.activities) {
            const name = act.place || act.activity || act.title || "";
            if (name && name.length > 3) places.add(name);
          }
        }
      }
    }
    if (places.size === 0) {
      // Fallback generic spots
      places.add(`${destination} Main Temple`);
      places.add(`${destination} Central Market`);
      places.add(`${destination} Fort`);
      places.add(`${destination} Park`);
    }

    return Array.from(places).slice(0, 8).map(name => {
      const type = classifySpotType(name);
      const crowdByHour = generateCrowdPattern(type, isWeekend);
      const hours = Object.entries(crowdByHour);
      const bestEntry = hours.reduce((a, b) => {
        const levels = { low: 0, moderate: 1, high: 2, very_high: 3 };
        return levels[a[1] as CrowdLevel] < levels[b[1] as CrowdLevel] ? a : b;
      });
      const peakEntry = hours.reduce((a, b) => {
        const levels = { low: 0, moderate: 1, high: 2, very_high: 3 };
        return levels[a[1] as CrowdLevel] > levels[b[1] as CrowdLevel] ? a : b;
      });

      return {
        name,
        crowdByHour,
        bestTime: `${bestEntry[0]}:00`,
        peakTime: `${peakEntry[0]}:00`,
        type,
      };
    });
  }, [days, destination, isWeekend]);

  const displayHours = [6, 8, 10, 12, 14, 16, 18, 20];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-accent/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsla(0, 70%, 50%, 0.10)" }}>
            <Users className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-heading text-sm" style={{ color: "hsl(158,45%,10%)" }}>Crowd Density Forecast</p>
            <p className="text-[10px] text-muted-foreground">
              AI-estimated crowd levels at {spots.length} tourist spots {isWeekend ? "(Weekend)" : "(Weekday)"}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Legend */}
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {Object.entries(CROWD_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-3 h-3 rounded-sm" style={{ background: cfg.bg, border: `1px solid ${cfg.color}` }} />
                  <span className="text-muted-foreground">{cfg.label}</span>
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="px-4 pb-4 overflow-x-auto">
              <div className="min-w-[480px]">
                {/* Time header */}
                <div className="flex items-center mb-2">
                  <div className="w-[140px] flex-shrink-0" />
                  {displayHours.map(h => (
                    <div key={h} className="flex-1 text-center">
                      <span className={`text-[9px] font-mono ${h === selectedHour ? "text-primary font-bold" : "text-muted-foreground"}`}>
                        {h > 12 ? `${h - 12}PM` : h === 12 ? "12PM" : `${h}AM`}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Spot rows */}
                {spots.map((spot, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center mb-1.5"
                  >
                    <div className="w-[140px] flex-shrink-0 pr-2">
                      <p className="text-[10px] font-medium truncate" style={{ color: "hsl(158,45%,15%)" }}>{spot.name}</p>
                      <p className="text-[8px] text-muted-foreground">Best: {spot.bestTime}</p>
                    </div>
                    {displayHours.map(h => {
                      const level = spot.crowdByHour[h] || "low";
                      const cfg = CROWD_CONFIG[level];
                      return (
                        <div key={h} className="flex-1 px-0.5">
                          <div
                            className="h-7 rounded-md flex items-center justify-center cursor-default transition-all hover:scale-105"
                            style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}
                            title={`${spot.name} at ${h}:00 — ${cfg.label}`}
                          >
                            <span className="text-[8px] font-bold" style={{ color: cfg.color }}>
                              {level === "very_high" ? "!!" : level === "high" ? "!" : ""}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Smart tips */}
            <div className="px-4 pb-4">
              <div className="p-3 rounded-xl" style={{ background: "hsla(158, 42%, 38%, 0.06)", border: "1px solid hsla(158, 42%, 50%, 0.15)" }}>
                <p className="text-[10px] font-semibold text-primary mb-1">💡 Smart Tips</p>
                <ul className="text-[10px] text-muted-foreground space-y-0.5">
                  <li>• Visit temples early morning (5-7 AM) for least crowds</li>
                  <li>• Markets are quieter during afternoon siesta (2-4 PM)</li>
                  <li>• {isWeekend ? "Weekend crowds are 30-50% higher than weekdays" : "Weekday visits offer smoother experiences"}</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CrowdDensityHeatmap;
