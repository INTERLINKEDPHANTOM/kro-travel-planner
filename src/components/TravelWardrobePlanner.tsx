import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shirt, ChevronDown, ChevronUp, Sun, Cloud, CloudRain, Snowflake, Thermometer } from "lucide-react";

interface DayInfo { day: string; activities?: { name?: string; category?: string }[]; }
interface Props { destination: string; days: DayInfo[]; weatherData?: { temp: number; condition: string }[]; }

const WEATHER_OUTFITS: Record<string, { base: string[]; accessories: string[]; tip: string }> = {
  hot: { base: ["Light cotton t-shirt", "Shorts / Linen pants", "Breathable sneakers"], accessories: ["Sunglasses", "Cap / Hat", "Sunscreen SPF 50"], tip: "Layer with a light scarf for AC interiors" },
  warm: { base: ["Casual shirt", "Chinos / Jeans", "Comfortable walking shoes"], accessories: ["Light jacket", "Sunglasses"], tip: "Carry a small umbrella for unexpected showers" },
  cool: { base: ["Full-sleeve top", "Jeans / Trousers", "Closed shoes"], accessories: ["Light sweater", "Scarf"], tip: "Layer so you can adjust through the day" },
  cold: { base: ["Thermal inner", "Sweater / Hoodie", "Warm pants", "Boots"], accessories: ["Warm jacket", "Beanie", "Gloves", "Thick socks"], tip: "Wear moisture-wicking base layers" },
  rainy: { base: ["Quick-dry t-shirt", "Waterproof pants / Shorts", "Waterproof sandals"], accessories: ["Rain jacket", "Umbrella", "Waterproof bag cover"], tip: "Pack extra socks and a dry bag for electronics" },
};

const ACTIVITY_OUTFITS: Record<string, { add: string[]; emoji: string }> = {
  temple: { add: ["Modest clothing covering shoulders & knees", "Slip-on shoes (easy removal)"], emoji: "🛕" },
  beach: { add: ["Swimwear", "Cover-up", "Flip flops", "Beach towel"], emoji: "🏖️" },
  trek: { add: ["Hiking boots", "Quick-dry cargo pants", "Moisture-wicking top"], emoji: "🥾" },
  nightlife: { add: ["Smart casual outfit", "Comfortable dress shoes"], emoji: "🎶" },
  shopping: { add: ["Comfortable walking shoes", "Crossbody bag"], emoji: "🛍️" },
  sightseeing: { add: ["Comfortable sneakers", "Backpack", "Camera strap"], emoji: "📸" },
};

function guessWeather(destination: string): string {
  const d = destination.toLowerCase();
  if (["ladakh", "manali", "shimla", "darjeeling", "kashmir", "auli"].some(p => d.includes(p))) return "cold";
  if (["goa", "kerala", "andaman", "mumbai"].some(p => d.includes(p))) return "hot";
  if (["meghalaya", "cherrapunji", "coorg"].some(p => d.includes(p))) return "rainy";
  if (["jaipur", "udaipur", "rajasthan", "varanasi"].some(p => d.includes(p))) return "warm";
  return "warm";
}

function guessActivity(day: DayInfo): string {
  const text = JSON.stringify(day).toLowerCase();
  if (text.includes("temple") || text.includes("mandir") || text.includes("church") || text.includes("mosque")) return "temple";
  if (text.includes("beach") || text.includes("swim") || text.includes("water")) return "beach";
  if (text.includes("trek") || text.includes("hike") || text.includes("mountain")) return "trek";
  if (text.includes("market") || text.includes("shop") || text.includes("mall")) return "shopping";
  if (text.includes("club") || text.includes("bar") || text.includes("night")) return "nightlife";
  return "sightseeing";
}

const WeatherIcon = ({ weather }: { weather: string }) => {
  const icons: Record<string, any> = { hot: Sun, warm: Thermometer, cool: Cloud, cold: Snowflake, rainy: CloudRain };
  const Icon = icons[weather] || Sun;
  return <Icon className="w-3.5 h-3.5" />;
};

export default function TravelWardrobePlanner({ destination, days }: Props) {
  const [open, setOpen] = useState(false);
  const weather = guessWeather(destination);
  const weatherOutfit = WEATHER_OUTFITS[weather] || WEATHER_OUTFITS.warm;

  return (
    <motion.div className="glass-panel p-4 rounded-2xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400/20 to-rose-400/20 flex items-center justify-center">
            <Shirt className="w-5 h-5 text-pink-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Travel Wardrobe Planner</h3>
            <p className="text-xs text-muted-foreground">AI outfit suggestions for {days?.length || 0} days</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 space-y-3">
            {/* Weather base outfit */}
            <div className="glass-panel p-3 rounded-xl bg-primary/5">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                <WeatherIcon weather={weather} /> Base Outfit ({weather.charAt(0).toUpperCase() + weather.slice(1)} Weather)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {weatherOutfit.base.map(item => (
                  <span key={item} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">👕 {item}</span>
                ))}
                {weatherOutfit.accessories.map(item => (
                  <span key={item} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground">🎒 {item}</span>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 italic">💡 {weatherOutfit.tip}</p>
            </div>

            {/* Day-by-day suggestions */}
            {(days || []).slice(0, 7).map((day, i) => {
              const activity = guessActivity(day);
              const activityOutfit = ACTIVITY_OUTFITS[activity] || ACTIVITY_OUTFITS.sightseeing;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-panel p-3 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">Day {i + 1}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize flex items-center gap-1">
                      {activityOutfit.emoji} {activity}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activityOutfit.add.map(item => (
                      <span key={item} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{item}</span>
                    ))}
                  </div>
                </motion.div>
              );
            })}

            {/* Packing summary */}
            <div className="glass-panel p-3 rounded-xl border border-primary/20">
              <p className="text-xs font-semibold text-primary mb-1">📦 Essential Packing List</p>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                {[...new Set([...weatherOutfit.base, ...weatherOutfit.accessories,
                  ...(days || []).slice(0, 7).flatMap(d => (ACTIVITY_OUTFITS[guessActivity(d)] || ACTIVITY_OUTFITS.sightseeing).add)
                ])].map(item => (
                  <span key={item} className="flex items-center gap-1">☑️ {item}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
