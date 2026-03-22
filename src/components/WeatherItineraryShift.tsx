import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudRain, Sun, Cloud, CloudSnow, Wind, Thermometer,
  AlertTriangle, ArrowRight, RefreshCw, Loader2, CloudLightning,
  Droplets, Eye, Sunrise, Sunset
} from "lucide-react";

interface WeatherData {
  date: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  main: string;
  visibility: number;
}

interface Props {
  destination: string;
  days?: any[];
  onShiftSuggestion?: (dayIndex: number, reason: string) => void;
}

const WEATHER_ICONS: Record<string, any> = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: Droplets,
  Thunderstorm: CloudLightning,
  Snow: CloudSnow,
  Mist: Wind,
  Fog: Wind,
  Haze: Wind,
};

const getWeatherColor = (main: string) => {
  switch (main) {
    case "Clear": return "hsla(45, 90%, 55%, 0.15)";
    case "Rain": case "Drizzle": case "Thunderstorm": return "hsla(210, 70%, 55%, 0.15)";
    case "Snow": return "hsla(200, 30%, 80%, 0.20)";
    case "Clouds": return "hsla(220, 15%, 60%, 0.12)";
    default: return "hsla(158, 42%, 38%, 0.10)";
  }
};

const WeatherItineraryShift = ({ destination, days, onShiftSuggestion }: Props) => {
  const [forecasts, setForecasts] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchWeather();
  }, [destination]);

  const fetchWeather = async () => {
    setLoading(true);
    setError("");
    try {
      // Use Open-Meteo (free, no API key needed)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1`
      );
      const geoData = await geoRes.json();
      if (!geoData.results?.length) throw new Error("Location not found");
      
      const { latitude, longitude } = geoData.results[0];
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_sum,precipitation_probability_max,weathercode,windspeed_10m_max,uv_index_max&timezone=auto&forecast_days=7`
      );
      const weatherData = await weatherRes.json();
      
      const WMO_CODES: Record<number, { main: string; desc: string }> = {
        0: { main: "Clear", desc: "Clear sky" },
        1: { main: "Clear", desc: "Mainly clear" },
        2: { main: "Clouds", desc: "Partly cloudy" },
        3: { main: "Clouds", desc: "Overcast" },
        45: { main: "Fog", desc: "Foggy" },
        48: { main: "Fog", desc: "Rime fog" },
        51: { main: "Drizzle", desc: "Light drizzle" },
        53: { main: "Drizzle", desc: "Moderate drizzle" },
        55: { main: "Drizzle", desc: "Dense drizzle" },
        61: { main: "Rain", desc: "Slight rain" },
        63: { main: "Rain", desc: "Moderate rain" },
        65: { main: "Rain", desc: "Heavy rain" },
        71: { main: "Snow", desc: "Slight snow" },
        73: { main: "Snow", desc: "Moderate snow" },
        75: { main: "Snow", desc: "Heavy snow" },
        80: { main: "Rain", desc: "Rain showers" },
        81: { main: "Rain", desc: "Moderate showers" },
        82: { main: "Rain", desc: "Violent showers" },
        95: { main: "Thunderstorm", desc: "Thunderstorm" },
        96: { main: "Thunderstorm", desc: "Thunderstorm with hail" },
        99: { main: "Thunderstorm", desc: "Severe thunderstorm" },
      };

      const daily = weatherData.daily;
      const parsed: WeatherData[] = daily.time.map((date: string, i: number) => {
        const code = daily.weathercode[i];
        const wmo = WMO_CODES[code] || { main: "Clear", desc: "Unknown" };
        return {
          date,
          temp: Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2),
          feels_like: Math.round(daily.apparent_temperature_max[i]),
          humidity: daily.precipitation_probability_max[i] || 0,
          wind_speed: Math.round(daily.windspeed_10m_max[i]),
          description: wmo.desc,
          icon: code.toString(),
          main: wmo.main,
          visibility: 10,
        };
      });

      setForecasts(parsed);
    } catch (err: any) {
      setError(err.message || "Could not fetch weather");
    } finally {
      setLoading(false);
    }
  };

  const getShiftAdvice = (weather: WeatherData, dayIndex: number) => {
    if (["Rain", "Thunderstorm"].includes(weather.main)) {
      return { warn: true, text: `Day ${dayIndex + 1}: Rain expected — consider indoor activities or shift outdoor plans` };
    }
    if (weather.temp > 42) {
      return { warn: true, text: `Day ${dayIndex + 1}: Extreme heat (${weather.temp}°C) — plan morning/evening outings` };
    }
    if (weather.wind_speed > 50) {
      return { warn: true, text: `Day ${dayIndex + 1}: High winds — avoid hilltop or open-area activities` };
    }
    return null;
  };

  const warnings = forecasts.map((f, i) => getShiftAdvice(f, i)).filter(Boolean);

  if (loading) {
    return (
      <div className="glass-panel p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading weather...
      </div>
    );
  }

  if (error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-accent/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsla(210, 70%, 55%, 0.12)" }}>
            <CloudRain className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-heading text-sm" style={{ color: "hsl(158,45%,10%)" }}>
              Weather Forecast — {destination}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {warnings.length > 0
                ? `⚠️ ${warnings.length} weather alert${warnings.length > 1 ? "s" : ""} for your trip`
                : "✅ Clear skies ahead! Perfect for your plans"}
            </p>
          </div>
        </div>
        <RefreshCw className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
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
            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="px-4 pb-3 space-y-2">
                {warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl text-xs"
                    style={{ background: "hsla(40, 90%, 55%, 0.10)", border: "1px solid hsla(40, 80%, 55%, 0.25)" }}>
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "hsl(40, 80%, 45%)" }} />
                    <span style={{ color: "hsl(40, 60%, 30%)" }}>{w!.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 7-day forecast cards */}
            <div className="px-4 pb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {forecasts.map((f, i) => {
                  const WeatherIcon = WEATHER_ICONS[f.main] || Cloud;
                  const dateObj = new Date(f.date);
                  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                  const dayNum = dateObj.getDate();
                  const isWarning = ["Rain", "Thunderstorm", "Snow"].includes(f.main);

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex-shrink-0 w-[80px] rounded-xl p-3 text-center relative ${isWarning ? "ring-1 ring-orange-300/50" : ""}`}
                      style={{ background: getWeatherColor(f.main) }}
                    >
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">{dayName}</p>
                      <p className="text-xs font-bold mb-1.5" style={{ color: "hsl(158,45%,12%)" }}>{dayNum}</p>
                      <WeatherIcon className={`w-6 h-6 mx-auto mb-1.5 ${isWarning ? "text-orange-500" : "text-primary"}`} />
                      <p className="text-base font-bold tabular-nums" style={{ color: "hsl(158,45%,10%)" }}>{f.temp}°</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight capitalize">{f.description}</p>
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <Droplets className="w-2.5 h-2.5 text-blue-400" />
                        <span className="text-[9px] text-muted-foreground">{f.humidity}%</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WeatherItineraryShift;
