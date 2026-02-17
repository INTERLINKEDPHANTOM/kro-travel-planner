import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Wallet, Star, Mountain, Utensils, Bus, Calendar, Lightbulb, Heart, ArrowRight, ExternalLink, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-background noise-overlay">
        <Navbar />
        <div className="pt-32 text-center px-4">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-4">Itinerary Not Found</h1>
          <p className="text-muted-foreground mb-8">No published itinerary found for "{destination}".</p>
          <Link to="/destinations"><button className="btn-primary px-8 py-3">Browse Destinations</button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const c = content;

  return (
    <div className="min-h-screen bg-background noise-overlay">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/6 blur-[100px]" />
          </div>
        </div>
        <div className="relative z-10 w-full p-6 sm:p-12 pb-12">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <MapPin className="w-3 h-3" /> Free Explorer Itinerary
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold text-foreground leading-tight capitalize">
              {destination}
            </h1>
            {c.emotional_hook && (
              <p className="text-muted-foreground mt-4 max-w-xl text-lg italic font-heading">
                {c.emotional_hook.substring(0, 120)}...
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Emotional Hook */}
        {c.emotional_hook && (
          <motion.section {...fadeUp} className="py-12 sm:py-16">
            <blockquote className="text-xl sm:text-2xl font-heading italic text-foreground leading-relaxed border-l-4 border-primary pl-6">
              {c.emotional_hook}
            </blockquote>
          </motion.section>
        )}

        {/* Local Resident */}
        {c.local_resident && (
          <motion.section {...fadeUp} className="glass-card rounded-3xl p-8 mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">Written by a Local</h3>
                <p className="text-sm text-muted-foreground">{c.local_resident}</p>
              </div>
            </div>
          </motion.section>
        )}

        {/* Vibe */}
        {c.vibe && (
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-6 flex items-center gap-3 text-foreground">
              <Mountain className="w-7 h-7 text-primary" /> The Vibe
            </h2>
            <p className="text-foreground/80 leading-relaxed text-lg">{c.vibe}</p>
          </motion.section>
        )}

        {/* Why Special */}
        {c.why_special?.length > 0 && (
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-6 flex items-center gap-3 text-foreground">
              <Star className="w-7 h-7 text-primary" /> Why {destination} Is Special
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {c.why_special.map((item: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/30 border border-white/[0.06]"
                >
                  <span className="text-primary font-bold">✦</span>
                  <span className="text-foreground/80">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Must-Visit Places */}
        {c.must_visit_places?.length > 0 && (
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-8 flex items-center gap-3 text-foreground">
              <MapPin className="w-7 h-7 text-primary" /> Must-Visit Places
            </h2>
            <div className="space-y-6">
              {c.must_visit_places.map((place: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card-hover rounded-3xl p-6 sm:p-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-heading font-bold text-foreground mb-2">{place.name}</h3>
                      {place.vibe && <p className="text-foreground/60 italic font-heading mb-4">{place.vibe}</p>}
                      <div className="flex flex-wrap gap-3 text-sm">
                        {place.best_time && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                            <Clock className="w-3 h-3" /> {place.best_time}
                          </span>
                        )}
                        {place.cost && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                            <Wallet className="w-3 h-3" /> {place.cost}
                          </span>
                        )}
                      </div>
                    </div>
                    {place.maps_url && (
                      <a href={place.maps_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline flex-shrink-0">
                        <ExternalLink className="w-4 h-4" /> Maps
                      </a>
                    )}
                  </div>
                  {place.local_tip && (
                    <div className="mt-4 flex items-start gap-2 text-sm bg-primary/5 border border-primary/10 rounded-xl p-3">
                      <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/70"><strong className="text-foreground">Local tip:</strong> {place.local_tip}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Hidden Gems */}
        {c.hidden_gems?.length > 0 && (
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-6 flex items-center gap-3 text-foreground">
              <Star className="w-7 h-7 text-primary" /> Hidden Gems Only Locals Know
            </h2>
            <div className="glass-card rounded-3xl p-6 sm:p-8">
              <div className="space-y-3">
                {c.hidden_gems.map((gem: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-foreground/80">{gem}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Food Spots */}
        {c.food_spots?.length > 0 && (
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-6 flex items-center gap-3 text-foreground">
              <Utensils className="w-7 h-7 text-primary" /> Local Food Spots
            </h2>
            {c.food_timing_tip && (
              <p className="text-sm text-muted-foreground mb-6 italic">⏰ {c.food_timing_tip}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {c.food_spots.map((spot: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card-hover rounded-2xl p-5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-heading font-semibold text-foreground">{spot.name}</h4>
                      {spot.area && <span className="text-xs text-muted-foreground">{spot.area}</span>}
                    </div>
                    <span className="text-sm font-semibold text-primary">{spot.cost}</span>
                  </div>
                  <p className="text-sm text-foreground/60 mt-2">Must try: <strong className="text-foreground">{spot.dish}</strong></p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Cost Breakdown */}
        {c.daily_cost_breakdown?.items?.length > 0 && (
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-6 flex items-center gap-3 text-foreground">
              <Wallet className="w-7 h-7 text-primary" /> Daily Cost {c.daily_cost_breakdown.people_count && `(${c.daily_cost_breakdown.people_count})`}
            </h2>
            <div className="glass-card rounded-3xl p-6 sm:p-8">
              {c.daily_cost_breakdown.items.map((item: any) => (
                <div key={item.label} className="flex justify-between items-center py-3 border-b border-white/[0.06] last:border-0">
                  <span className="text-foreground/70">{item.label}</span>
                  <span className="font-semibold text-foreground">{item.range}</span>
                </div>
              ))}
              {c.daily_cost_breakdown.total && (
                <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-primary/20">
                  <span className="font-heading font-bold text-lg text-foreground">Total</span>
                  <span className="font-heading font-bold text-lg gradient-text">{c.daily_cost_breakdown.total}</span>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* Transport */}
        {c.transport_guide?.length > 0 && (
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-6 flex items-center gap-3 text-foreground">
              <Bus className="w-7 h-7 text-primary" /> Transport Guide
            </h2>
            <div className="space-y-3">
              {c.transport_guide.map((t: any) => (
                <div key={t.mode} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-white/[0.06]">
                  <div>
                    <span className="font-medium text-foreground">{t.mode}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{t.tag}</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">{t.cost}</span>
                </div>
              ))}
            </div>
            {c.transport_warning && (
              <p className="mt-4 text-sm text-destructive/80 italic">⚠️ {c.transport_warning}</p>
            )}
          </motion.section>
        )}

        {/* Best Time */}
        {c.best_time_to_visit?.length > 0 && (
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-6 flex items-center gap-3 text-foreground">
              <Calendar className="w-7 h-7 text-primary" /> Best Time & Duration
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {c.best_time_to_visit.map((s: any) => (
                <div key={s.period} className="glass-card-hover rounded-2xl p-5 text-center">
                  <div className="text-2xl mb-2">{s.emoji}</div>
                  <div className="font-heading font-semibold text-sm text-foreground">{s.period}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.description}</div>
                </div>
              ))}
            </div>
            {c.ideal_duration && (
              <p className="text-center mt-4 text-sm text-muted-foreground">Ideal stay: <strong className="text-foreground">{c.ideal_duration}</strong></p>
            )}
          </motion.section>
        )}

        {/* Local Tips */}
        {c.local_tips?.length > 0 && (
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-6 flex items-center gap-3 text-foreground">
              <Lightbulb className="w-7 h-7 text-primary" /> Local Tips That Make This Gold
            </h2>
            <div className="glass-card rounded-3xl p-6 sm:p-8">
              <ul className="space-y-3">
                {c.local_tips.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-foreground/80">
                    <span className="text-primary">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>
        )}

        {/* Resident Moments */}
        {c.resident_moments && (
          <motion.section {...fadeUp} className="mb-16">
            <div className="glass-card rounded-3xl p-8 sm:p-10 text-center glow-primary">
              <p className="text-lg font-heading italic text-foreground/80 leading-relaxed max-w-2xl mx-auto">
                {c.resident_moments}
              </p>
            </div>
          </motion.section>
        )}

        {/* Sample Itinerary */}
        {c.sample_itinerary?.length > 0 && (
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-8 flex items-center gap-3 text-foreground">
              <Calendar className="w-7 h-7 text-primary" /> Sample Itinerary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {c.sample_itinerary.map((day: any) => (
                <div key={day.day} className="glass-card-hover rounded-3xl p-6 sm:p-8">
                  <h3 className="text-xl font-heading font-bold mb-4 gradient-text">{day.day}</h3>
                  <ul className="space-y-3 mb-4">
                    {day.items.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 text-foreground/80">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {day.cost && (
                    <div className="pt-3 border-t border-white/[0.06] text-sm">
                      <span className="text-muted-foreground">Estimated: </span>
                      <span className="font-semibold text-primary">{day.cost}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Ending Note */}
        {c.ending_note && (
          <motion.section {...fadeUp} className="mb-16">
            <blockquote className="text-xl sm:text-2xl font-heading italic text-foreground leading-relaxed text-center max-w-2xl mx-auto">
              {c.ending_note}
            </blockquote>
          </motion.section>
        )}

        {/* CTA */}
        <motion.section {...fadeUp} className="mb-20">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center glow-primary">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
              Want a Fully <span className="gradient-text">Personalized</span> Itinerary?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              This was just the overview. Get hour-wise planning, transport timing, budget optimization, and comfort-first pacing tailored to <em>your</em> trip.
            </p>
            <Link to="/plans">
              <button className="btn-primary text-base px-10 py-5 animate-pulse-glow flex items-center gap-2 mx-auto group">
                Upgrade to Personalized Plan
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
