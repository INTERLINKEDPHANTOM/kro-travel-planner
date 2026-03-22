import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TravelStreaksProps {
  userId: string;
  trips: any[];
}

const TravelStreaks = ({ userId, trips }: TravelStreaksProps) => {
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [monthsActive, setMonthsActive] = useState<string[]>([]);

  useEffect(() => {
    if (!trips.length) return;
    calculateStreaks();
  }, [trips]);

  const calculateStreaks = () => {
    // Get unique months with trips
    const months = [...new Set(trips.map(t => {
      const d = new Date(t.created_at);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }))].sort();

    setMonthsActive(months);

    // Calculate consecutive month streaks
    let current = 0, longest = 0;
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;

    // Check from most recent backwards
    const sortedDesc = [...months].reverse();
    if (sortedDesc[0] === currentMonth || sortedDesc[0] === lastMonthStr) {
      current = 1;
      for (let i = 1; i < sortedDesc.length; i++) {
        const [y1, m1] = sortedDesc[i - 1].split("-").map(Number);
        const [y2, m2] = sortedDesc[i].split("-").map(Number);
        const d1 = new Date(y1, m1 - 1);
        const d2 = new Date(y2, m2 - 1);
        const diff = (d1.getFullYear() - d2.getFullYear()) * 12 + d1.getMonth() - d2.getMonth();
        if (diff === 1) current++;
        else break;
      }
    }

    // Find longest streak
    let tempStreak = 1;
    for (let i = 1; i < months.length; i++) {
      const [y1, m1] = months[i - 1].split("-").map(Number);
      const [y2, m2] = months[i].split("-").map(Number);
      const diff = (y2 - y1) * 12 + m2 - m1;
      if (diff === 1) { tempStreak++; longest = Math.max(longest, tempStreak); }
      else tempStreak = 1;
    }
    longest = Math.max(longest, tempStreak, current);

    setStreak(current);
    setLongestStreak(longest);
  };

  // Last 6 months grid
  const last6 = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    last6.push({
      key,
      label: d.toLocaleDateString("en", { month: "short" }),
      active: monthsActive.includes(key),
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-5 rounded-2xl"
    >
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-5 h-5 text-orange-500" />
        <h3 className="font-heading text-sm">Travel Streaks</h3>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-500">{streak}</p>
          <p className="text-[10px] text-muted-foreground">Current Streak</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{longestStreak}</p>
          <p className="text-[10px] text-muted-foreground">Longest Streak</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{monthsActive.length}</p>
          <p className="text-[10px] text-muted-foreground">Active Months</p>
        </div>
      </div>

      {/* Last 6 months */}
      <div className="flex gap-1.5">
        {last6.map(m => (
          <div key={m.key} className="flex-1 text-center">
            <div className={`h-8 rounded-lg mb-1 flex items-center justify-center text-xs ${
              m.active
                ? "bg-primary/20 border border-primary/40 text-primary"
                : "bg-muted/30 border border-border/30 text-muted-foreground"
            }`}>
              {m.active ? "🔥" : "—"}
            </div>
            <p className="text-[9px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {streak >= 3 && (
        <p className="text-xs text-orange-500 mt-3 text-center font-medium">
          🔥 You've traveled {streak} months in a row!
        </p>
      )}
    </motion.div>
  );
};

export default TravelStreaks;
