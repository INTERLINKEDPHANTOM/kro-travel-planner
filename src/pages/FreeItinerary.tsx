import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Clock, Wallet, Star, Mountain, Utensils, Bus, Calendar,
  Lightbulb, Heart, ArrowRight, ExternalLink, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const getPhoto = (query: string, w = 800, h = 500) =>
  `https://picsum.photos/seed/${encodeURIComponent(query.replace(/\s+/g, "-").toLowerCase())}/${w}/${h}`;

const formatCost = (val: any): string => {
  if (!val) return "";
  const str = String(val);
  if (str.includes("₹") || str.includes("-") || str.includes("Free") || str.includes("free")) return str;
  const num = parseInt(str.replace(/[^\d]/g, ""), 10);
  if (!isNaN(num) && num > 0) return "₹" + num.toLocaleString("en-IN");
  return str;
};

const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <h2 className="text-xl sm:text-2xl font-heading mb-5 sm:mb-6 flex items-center gap-2 sm:gap-3" style={{ color: "hsl(158, 45%, 12%)" }}>
    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    </div>
    {title}
  </h2>
);

const FreeItinerary = () => {
  const { destination } = useParams<{ destination: string }>();
  const [content, setContent] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItinerary = async () => {
      const { data } = await supabase
        .from("itineraries")
        .select("*")
        .ilike("destination", `%${(destination || "").trim()}%`)
        .eq("is_published", true)
        .limit(1)
        .maybeSingle();

      if (data) {
        setContent(data.content);
        setTitle(data.title);
      }
      setLoading(false);
    };
    fetchItinerary();
  }, [destination]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-border/40" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 text-center px-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>
            <MapPin className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading mb-3" style={{ color: "hsl(158, 45%, 12%)" }}>
            Itinerary Not Found
          </h1>
          <p className="text-muted-foreground mb-8 text-sm max-w-xs mx-auto">
            No published itinerary found for "{destination}".
          </p>
          <Link to="/destinations">
            <button className="btn-primary px-8 py-3">Browse Destinations</button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const c = content;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-orb-1" style={{ top: "8%", left: "10%", opacity: 0.35 }} />
        <div className="ambient-orb-2" style={{ bottom: "20%", right: "8%", opacity: 0.3 }} />
      </div>

      <Navbar />

      {/* Hero */}
      <section className="relative pt-0">
        <div className="relative overflow-hidden" style={{ height: "clamp(220px, 45vw, 420px)" }}>
          <motion.img
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src={getPhoto(destination || "travel-india", 1400, 700)}
            alt={`${destination} landscape`}
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/seed/india-travel/1400/700"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8 sm:pb-12">
            <motion.div {...fadeUp} className="max-w-4xl mx-auto">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3"
                style={{ background: "hsla(158, 42%, 38%, 0.85)", color: "white" }}>
                <MapPin className="w-3 h-3" /> Free Explorer Guide
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading leading-tight capitalize mb-3" style={{ color: "hsl(158, 45%, 10%)" }}>
                {title || `Vibes of ${destination}`}
              </h1>
              {c.emotional_hook && (
                <p className="text-muted-foreground max-w-lg text-sm sm:text-base italic line-clamp-2 sm:line-clamp-none">
                  {c.emotional_hook.substring(0, 140)}...
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Emotional Hook */}
        {c.emotional_hook && (
          <motion.section {...fadeUp} className="py-10 sm:py-14">
            <blockquote className="text-lg sm:text-2xl font-heading italic leading-relaxed border-l-4 border-primary pl-5 sm:pl-6"
              style={{ color: "hsl(158, 38%, 18%)" }}>
              {c.emotional_hook}
            </blockquote>
          </motion.section>
        )}

        {/* Local Resident */}
        {c.local_resident && (
          <motion.section {...fadeUp} className="glass-panel p-5 sm:p-7 mb-10 sm:mb-12">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-sm sm:text-base" style={{ color: "hsl(158, 45%, 12%)" }}>Written by a Local</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{c.local_resident}</p>
              </div>
            </div>
          </motion.section>
        )}

        {/* Vibe */}
        {c.vibe && (
          <motion.section {...fadeUp} className="mb-10 sm:mb-14">
            <SectionHeader icon={Mountain} title="The Vibe" />
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{c.vibe}</p>
          </motion.section>
        )}

        {/* Why Special */}
        {c.why_special?.length > 0 && (
          <motion.section {...fadeUp} className="mb-10 sm:mb-14">
            <SectionHeader icon={Star} title={`Why ${destination} Is Special`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {c.why_special.map((item: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, ease: "easeOut" }}
                  className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl glass-panel"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Must-Visit Places */}
        {c.must_visit_places?.length > 0 && (
          <motion.section {...fadeUp} className="mb-10 sm:mb-14">
            <SectionHeader icon={MapPin} title="Must Visit" />
            <div className="space-y-4 sm:space-y-5">
              {c.must_visit_places.map((place: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, ease: "easeOut" }}
                  className="prism-card overflow-hidden"
                >
                  {/* Place image */}
                  <div className="overflow-hidden" style={{ height: "clamp(140px, 28vw, 200px)" }}>
                    <img
                      src={getPhoto(`${place.name}-${destination}`, 800, 400)}
                      alt={place.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/place${i + 10}/800/400`; }}
                    />
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-heading mb-1.5" style={{ color: "hsl(158, 45%, 12%)" }}>{place.name}</h3>
                        {place.vibe && <p className="text-muted-foreground italic text-sm mb-3 leading-relaxed">{place.vibe}</p>}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {place.best_time && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                              style={{ background: "hsla(158, 42%, 38%, 0.10)", color: "hsl(158, 42%, 32%)" }}>
                              <Clock className="w-3 h-3" /> {place.best_time}
                            </span>
                          )}
                          {place.cost && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold"
                              style={{ background: "hsla(152, 55%, 52%, 0.12)", color: "hsl(152, 40%, 32%)" }}>
                              <Wallet className="w-3 h-3" /> {formatCost(place.cost)}
                            </span>
                          )}
                        </div>
                      </div>
                      {place.maps_url && (
                        <a href={place.maps_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline flex-shrink-0 font-medium">
                          <ExternalLink className="w-3.5 h-3.5" /> Maps
                        </a>
                      )}
                    </div>
                    {place.local_tip && (
                      <div className="mt-3.5 flex items-start gap-2.5 text-xs rounded-xl p-3"
                        style={{ background: "hsla(158, 42%, 38%, 0.07)", border: "1px solid hsla(158, 42%, 60%, 0.18)" }}>
                        <Lightbulb className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                        <span style={{ color: "hsl(158, 30%, 30%)" }}>
                          <strong className="font-semibold" style={{ color: "hsl(158, 45%, 18%)" }}>Local tip:</strong> {place.local_tip}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Hidden Gems */}
        {c.hidden_gems?.length > 0 && (
          <motion.section {...fadeUp} className="mb-10 sm:mb-14">
            <SectionHeader icon={Star} title="Hidden Gems Only Locals Know" />
            <div className="glass-panel p-4 sm:p-6 space-y-2">
              {c.hidden_gems.map((gem: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, ease: "easeOut" }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors"
                >
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "hsla(158, 42%, 38%, 0.12)", color: "hsl(158, 42%, 35%)" }}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-muted-foreground leading-relaxed">{gem}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Food Spots */}
        {c.food_spots?.length > 0 && (
          <motion.section {...fadeUp} className="mb-10 sm:mb-14">
            <SectionHeader icon={Utensils} title="Local Food Spots" />
            {c.food_timing_tip && (
              <div className="flex items-start gap-2 mb-4 text-xs sm:text-sm text-muted-foreground italic">
                <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                {c.food_timing_tip}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {c.food_spots.map((spot: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, ease: "easeOut" }}
                  className="glass-panel p-4 sm:p-5 hover-lift"
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <h4 className="font-heading text-sm sm:text-base leading-tight" style={{ color: "hsl(158, 45%, 12%)" }}>{spot.name}</h4>
                    <span className="text-xs font-semibold text-primary flex-shrink-0 tabular-nums">{formatCost(spot.cost)}</span>
                  </div>
                  {spot.area && <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">{spot.area}</p>}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Must try: <strong className="font-semibold" style={{ color: "hsl(158, 38%, 22%)" }}>{spot.dish}</strong>
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Cost Breakdown */}
        {c.daily_cost_breakdown?.items?.length > 0 && (
          <motion.section {...fadeUp} className="mb-10 sm:mb-14">
            <SectionHeader icon={Wallet} title={`Daily Cost ${c.daily_cost_breakdown.people_count ? `(${c.daily_cost_breakdown.people_count})` : ""}`} />
            <div className="glass-panel p-4 sm:p-7">
              {c.daily_cost_breakdown.items.map((item: any) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0 gap-3">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="font-semibold text-sm tabular-nums flex-shrink-0" style={{ color: "hsl(158, 45%, 15%)" }}>
                    {formatCost(item.range)}
                  </span>
                </div>
              ))}
              {c.daily_cost_breakdown.total && (
                <div className="flex items-center justify-between pt-4 mt-2 border-t-2 border-primary/20">
                  <span className="font-heading text-base sm:text-lg" style={{ color: "hsl(158, 45%, 12%)" }}>Total / Day</span>
                  <span className="font-heading text-base sm:text-lg text-primary tabular-nums">{formatCost(c.daily_cost_breakdown.total)}</span>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* Transport */}
        {c.transport_guide?.length > 0 && (
          <motion.section {...fadeUp} className="mb-10 sm:mb-14">
            <SectionHeader icon={Bus} title="Transport Guide" />
            <div className="space-y-2.5">
              {c.transport_guide.map((t: any, i: number) => (
                <motion.div
                  key={t.mode || i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, ease: "easeOut" }}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl glass-panel gap-3"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-medium text-sm" style={{ color: "hsl(158, 45%, 12%)" }}>{t.mode}</span>
                    {t.tag && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: "hsla(158, 42%, 38%, 0.10)", color: "hsl(158, 38%, 32%)" }}>
                        {t.tag}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-primary flex-shrink-0 tabular-nums">{formatCost(t.cost)}</span>
                </motion.div>
              ))}
            </div>
            {c.transport_warning && (
              <div className="mt-4 flex items-start gap-2.5 text-xs p-3.5 rounded-xl"
                style={{ background: "hsla(0, 72%, 55%, 0.08)", border: "1px solid hsla(0, 72%, 55%, 0.18)", color: "hsl(0, 60%, 40%)" }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {c.transport_warning}
              </div>
            )}
          </motion.section>
        )}

        {/* Best Time */}
        {c.best_time_to_visit?.length > 0 && (
          <motion.section {...fadeUp} className="mb-10 sm:mb-14">
            <SectionHeader icon={Calendar} title="Best Time & Duration" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {c.best_time_to_visit.map((s: any, i: number) => (
                <motion.div
                  key={s.period || i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, ease: "easeOut" }}
                  className="glass-panel p-4 sm:p-5 text-center hover-lift"
                >
                  {s.emoji && <div className="text-2xl mb-2">{s.emoji}</div>}
                  <div className="font-heading text-xs sm:text-sm" style={{ color: "hsl(158, 45%, 12%)" }}>{s.period}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">{s.description}</div>
                </motion.div>
              ))}
            </div>
            {c.ideal_duration && (
              <p className="text-center mt-4 text-xs sm:text-sm text-muted-foreground">
                Ideal stay: <strong className="font-semibold" style={{ color: "hsl(158, 38%, 22%)" }}>{c.ideal_duration}</strong>
              </p>
            )}
          </motion.section>
        )}

        {/* Local Tips */}
        {c.local_tips?.length > 0 && (
          <motion.section {...fadeUp} className="mb-10 sm:mb-14">
            <SectionHeader icon={Lightbulb} title="Local Tips" />
            <div className="glass-panel p-4 sm:p-7 space-y-3">
              {c.local_tips.map((tip: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, ease: "easeOut" }}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: "hsl(158, 25%, 30%)" }}
                >
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Resident Moments */}
        {c.resident_moments && (
          <motion.section {...fadeUp} className="mb-10 sm:mb-14">
            <div className="prism-card p-6 sm:p-10 text-center">
              <p className="text-base sm:text-xl font-heading italic leading-relaxed max-w-2xl mx-auto"
                style={{ color: "hsl(158, 35%, 25%)" }}>
                "{c.resident_moments}"
              </p>
            </div>
          </motion.section>
        )}

        {/* Sample Itinerary */}
        {c.sample_itinerary?.length > 0 && (
          <motion.section {...fadeUp} className="mb-10 sm:mb-14">
            <SectionHeader icon={Calendar} title="Sample Itinerary" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {c.sample_itinerary.map((day: any, di: number) => (
                <motion.div
                  key={day.day || di}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: di * 0.08, ease: "easeOut" }}
                  className="glass-panel p-4 sm:p-6 hover-lift"
                >
                  <h3 className="text-sm sm:text-base font-heading mb-3 text-primary">{day.day}</h3>
                  <ul className="space-y-2.5 mb-3">
                    {day.items?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {day.cost && (
                    <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Estimated</span>
                      <span className="font-bold text-primary tabular-nums">{formatCost(day.cost)}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Ending Note */}
        {c.ending_note && (
          <motion.section {...fadeUp} className="mb-10 sm:mb-14">
            <blockquote className="text-lg sm:text-2xl font-heading italic text-center max-w-2xl mx-auto leading-relaxed"
              style={{ color: "hsl(158, 38%, 20%)" }}>
              {c.ending_note}
            </blockquote>
          </motion.section>
        )}

        {/* CTA */}
        <motion.section {...fadeUp} className="mb-16 sm:mb-20">
          <div className="prism-card p-6 sm:p-10 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
              style={{ background: "hsla(158, 42%, 38%, 0.12)", color: "hsl(158, 42%, 32%)" }}>
              <Star className="w-3 h-3" /> Premium Plan
            </span>
            <h2 className="text-xl sm:text-2xl font-heading mb-3" style={{ color: "hsl(158, 45%, 12%)" }}>
              Want a trip planned <em className="text-primary not-italic">exactly for you?</em>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-7 text-sm leading-relaxed">
              This was just the overview. Get hour-wise planning, transport timing, and budget optimization tailored to your dates.
            </p>
            <Link to="/plans">
              <button className="btn-primary text-sm sm:text-base px-8 py-3.5 flex items-center gap-2 mx-auto group">
                Upgrade to Custom Plan
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </motion.section>
      </div>

      <Footer />
    </div>
  );
};


export default FreeItinerary;
