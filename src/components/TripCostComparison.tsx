import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, TrendingUp, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";

// Average trip costs (INR) based on popular Indian destinations
const AVG_COSTS: Record<string, number> = {
  goa: 18000, manali: 15000, jaipur: 12000, mumbai: 20000, delhi: 14000,
  varanasi: 10000, udaipur: 16000, shimla: 13000, darjeeling: 14000, ooty: 12000,
  rishikesh: 11000, agra: 9000, kerala: 17000, ladakh: 25000, meghalaya: 16000,
  andaman: 22000, kashmir: 20000, rajasthan: 15000, hampi: 8000, pondicherry: 13000,
};

interface Props { destination: string; totalCost: number; }

export default function TripCostComparison({ destination, totalCost }: Props) {
  const [open, setOpen] = useState(false);
  const dest = destination.toLowerCase().trim();
  const avgCost = Object.entries(AVG_COSTS).find(([k]) => dest.includes(k))?.[1] || 15000;
  const diff = ((totalCost - avgCost) / avgCost) * 100;
  const isLess = diff < 0;
  const formatINR = (n: number) => "₹" + n.toLocaleString("en-IN");

  return (
    <motion.div className="glass-panel p-4 rounded-2xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLess ? "bg-green-500/20" : "bg-orange-500/20"}`}>
            {isLess ? <TrendingDown className="w-5 h-5 text-green-600" /> : <TrendingUp className="w-5 h-5 text-orange-600" />}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Trip Cost Comparison</h3>
            <p className="text-xs text-muted-foreground">
              {isLess ? `${Math.abs(diff).toFixed(0)}% less than average!` : `${diff.toFixed(0)}% more than average`}
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-panel p-3 rounded-xl text-center">
                <p className="text-xs text-muted-foreground">Your Cost</p>
                <p className="text-lg font-bold text-foreground">{formatINR(totalCost)}</p>
              </div>
              <div className="glass-panel p-3 rounded-xl text-center">
                <p className="text-xs text-muted-foreground">Avg for {destination}</p>
                <p className="text-lg font-bold text-muted-foreground">{formatINR(avgCost)}</p>
              </div>
            </div>
            <div className={`p-3 rounded-xl text-center text-sm font-medium ${isLess ? "bg-green-500/10 text-green-700" : "bg-orange-500/10 text-orange-700"}`}>
              <BarChart3 className="w-4 h-4 inline mr-1" />
              {isLess
                ? `Great deal! You saved ${formatINR(avgCost - totalCost)} compared to average travelers.`
                : `You spent ${formatINR(totalCost - avgCost)} more. Consider budget-friendly options next time.`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
