import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ExternalLink, Sparkles, MapPin, Clock, Ticket, Star } from "lucide-react";

interface EventsNearbyProps {
  destination: string;
  departureDate?: string;
  arrivalDate?: string;
  travelStyle?: string;
  events?: LocalEvent[];
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

const getBmsUrl = (destination: string) =>
  `https://in.bookmyshow.com/explore/events-${destination.toLowerCase().replace(/\s+/g, "-")}`;

const EventsNearby = ({ destination, events: prefetchedEvents = [], travelStyle = "explorer" }: EventsNearbyProps) => {
  const [expanded, setExpanded] = useState(false);

  const events = prefetchedEvents;

  if (!events || events.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-10 sm:mb-12"
    >
      <button
        onClick={() => setExpanded(!expanded)}
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
              {events.length} events found during your trip
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
              {/* Best For You Section */}
              {events.filter(e => e.isBestForYou).length > 0 && (
                <div className="glass-panel p-4 rounded-2xl border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Best For You</span>
                  </div>
                  <div className="space-y-2.5">
                    {events.filter(e => e.isBestForYou).map((event, i) => (
                      <EventCard key={`best-${i}`} event={event} destination={destination} highlight />
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
                    <EventCard key={`all-${i}`} event={event} destination={destination} />
                  ))}
                </div>
              </div>

              {/* Browse More */}
              <div className="flex flex-wrap gap-2">
                <a href={getBmsUrl(destination)} target="_blank" rel="noopener noreferrer"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const EventCard = ({
  event, destination, highlight = false,
}: {
  event: LocalEvent; destination: string; highlight?: boolean;
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
