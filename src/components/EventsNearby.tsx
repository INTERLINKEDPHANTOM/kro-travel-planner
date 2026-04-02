import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ExternalLink, Sparkles, MapPin, Clock, Ticket, Loader2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EventsNearbyProps {
  destination: string;
  departureDate?: string;
  arrivalDate?: string;
  travelStyle?: string;
}

interface LocalEvent {
  name: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  description: string;
  isBestForYou: boolean;
  bookingQuery: string;
}

const EventsNearby = ({ destination, departureDate, arrivalDate, travelStyle = "explorer" }: EventsNearbyProps) => {
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchEvents = async () => {
    if (loaded || loading) return;
    setLoading(true);

    try {
      const startDate = departureDate ? new Date(departureDate) : new Date();
      const endDate = arrivalDate ? new Date(arrivalDate) : new Date(startDate.getTime() + 3 * 86400000);

      // Extend range ±2 days
      const searchStart = new Date(startDate.getTime() - 2 * 86400000);
      const searchEnd = new Date(endDate.getTime() + 2 * 86400000);

      const formatD = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

      const prompt = `You are an event discovery assistant. Find real, plausible events happening in or near "${destination}" between ${formatD(searchStart)} and ${formatD(searchEnd)}.

Include a mix of: concerts, festivals, cultural events, food fairs, exhibitions, sports, nightlife, workshops, markets, religious events, local celebrations.

The traveler's style is "${travelStyle}". Mark 2-3 events as "bestForYou" that match this style.

Return ONLY a valid JSON array of 8-10 events:
[{
  "name": "Event Name",
  "date": "12 Apr 2026",
  "time": "6:00 PM",
  "venue": "Venue Name, ${destination}",
  "category": "Festival|Concert|Exhibition|Sports|Cultural|Food|Nightlife|Workshop|Market|Religious",
  "description": "One line description",
  "isBestForYou": true/false,
  "bookingQuery": "search query for BookMyShow or Google"
}]`;

      const { data, error } = await supabase.functions.invoke("generate-travel-blog", {
        body: {
          prompt,
          systemPrompt: "You are an event discovery engine. Return ONLY valid JSON array, no markdown, no explanation.",
        },
      });

      if (error) throw error;

      const content = data?.content || data?.blog || "";
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setEvents(parsed);
      }
    } catch (e) {
      console.error("Events fetch error:", e);
      // Fallback events
      setEvents([
        { name: `${destination} Cultural Festival`, date: departureDate?.split("T")[0] || "Upcoming", time: "5:00 PM", venue: `City Center, ${destination}`, category: "Cultural", description: "Annual cultural celebration with local art and music", isBestForYou: true, bookingQuery: `${destination} cultural festival` },
        { name: "Live Music Night", date: departureDate?.split("T")[0] || "Upcoming", time: "8:00 PM", venue: `Popular Venue, ${destination}`, category: "Concert", description: "Live performances by local artists", isBestForYou: false, bookingQuery: `live music ${destination}` },
        { name: "Street Food Festival", date: arrivalDate?.split("T")[0] || "Upcoming", time: "11:00 AM", venue: `Food Street, ${destination}`, category: "Food", description: "Taste the best local street food", isBestForYou: travelStyle === "foodie", bookingQuery: `food festival ${destination}` },
      ]);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  const handleToggle = () => {
    if (!expanded && !loaded) fetchEvents();
    setExpanded(!expanded);
  };

  const getCategoryEmoji = (cat: string) => {
    const map: Record<string, string> = {
      Festival: "🎪", Concert: "🎵", Exhibition: "🎨", Sports: "⚽",
      Cultural: "🏛️", Food: "🍜", Nightlife: "🌙", Workshop: "🛠️",
      Market: "🛍️", Religious: "🕉️",
    };
    return map[cat] || "🎉";
  };

  const getBookingUrl = (query: string) =>
    `https://www.google.com/search?q=${encodeURIComponent(query + " tickets booking")}`;

  const getBmsUrl = (query: string) =>
    `https://in.bookmyshow.com/explore/events-${destination.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-10 sm:mb-12"
    >
      <button
        onClick={handleToggle}
        className="w-full glass-panel p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3 hover-lift transition-all group cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: "hsla(280, 60%, 55%, 0.12)" }}>
            🎪
          </div>
          <div className="text-left">
            <h3 className="font-heading text-sm sm:text-base font-semibold" style={{ color: "hsl(158,45%,12%)" }}>
              Events Happening in {destination}
            </h3>
            <p className="text-xs text-muted-foreground">
              Festivals, concerts, exhibitions & more during your trip
            </p>
          </div>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          className="text-primary text-lg"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">
              {loading ? (
                <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Discovering events in {destination}…</p>
                </div>
              ) : (
                <>
                  {/* Best For You Section */}
                  {events.filter(e => e.isBestForYou).length > 0 && (
                    <div className="glass-panel p-4 rounded-2xl border border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Best For You</span>
                      </div>
                      <div className="space-y-2.5">
                        {events.filter(e => e.isBestForYou).map((event, i) => (
                          <EventCard key={`best-${i}`} event={event} destination={destination}
                            getCategoryEmoji={getCategoryEmoji} getBookingUrl={getBookingUrl} getBmsUrl={getBmsUrl} highlight />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Events */}
                  <div className="glass-panel p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(158,45%,12%)" }}>
                        All Events
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {events.filter(e => !e.isBestForYou).map((event, i) => (
                        <EventCard key={`all-${i}`} event={event} destination={destination}
                          getCategoryEmoji={getCategoryEmoji} getBookingUrl={getBookingUrl} getBmsUrl={getBmsUrl} />
                      ))}
                    </div>
                  </div>

                  {/* Browse More */}
                  <div className="flex flex-wrap gap-2">
                    <a href={getBmsUrl("")} target="_blank" rel="noopener noreferrer"
                      className="glass-panel px-4 py-2.5 rounded-xl text-xs font-semibold text-primary flex items-center gap-2 hover-lift transition-all">
                      <Ticket className="w-3.5 h-3.5" />
                      Browse on BookMyShow
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a href={`https://www.google.com/search?q=events+in+${encodeURIComponent(destination)}+this+week`}
                      target="_blank" rel="noopener noreferrer"
                      className="glass-panel px-4 py-2.5 rounded-xl text-xs font-semibold text-primary flex items-center gap-2 hover-lift transition-all">
                      🔍 Search on Google
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const EventCard = ({
  event, destination, getCategoryEmoji, getBookingUrl, getBmsUrl, highlight = false,
}: {
  event: LocalEvent; destination: string;
  getCategoryEmoji: (c: string) => string; getBookingUrl: (q: string) => string;
  getBmsUrl: (q: string) => string; highlight?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-xl p-3 flex flex-col gap-2 transition-all ${
      highlight ? "bg-primary/5 border border-primary/15" : "bg-card/30 border border-border/30"
    }`}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <span className="text-lg flex-shrink-0 mt-0.5">{getCategoryEmoji(event.category)}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "hsl(158,45%,12%)" }}>
            {event.name}
            {highlight && <Star className="w-3 h-3 text-amber-500 inline ml-1 -mt-0.5" />}
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{event.description}</p>
        </div>
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">
        {event.category}
      </span>
    </div>

    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{event.date}</span>
      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>
      <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 flex-shrink-0" />{event.venue}</span>
    </div>

    <a href={getBookingUrl(event.bookingQuery)} target="_blank" rel="noopener noreferrer"
      className="self-start mt-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-primary bg-primary/8 hover:bg-primary/15 transition-colors flex items-center gap-1.5">
      Know More & Book
      <ExternalLink className="w-3 h-3" />
    </a>
  </motion.div>
);

export default EventsNearby;
