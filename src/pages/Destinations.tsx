import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Destination {
  name: string;
  tagline: string;
  image: string | null;
  link: string;
}

const Destinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      const { data } = await supabase
        .from("itineraries")
        .select("destination, title, cover_image_url")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (data) {
        const dests = data.map((item) => ({
          name: item.destination.trim(),
          tagline: item.title,
          image: item.cover_image_url,
          link: `/itinerary/${item.destination.trim().toLowerCase()}`,
        }));
        setDestinations(dests);
      }
      setLoading(false);
    };
    fetchDestinations();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">Explore Destinations</h1>
            <p className="text-muted-foreground">Free local guides written by people who actually live there</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : destinations.length === 0 ? (
            <div className="text-center py-20">
              <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No destinations available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map((dest, i) => (
                <motion.div
                  key={dest.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={dest.link} className="block group">
                    <div className="glass-card rounded-2xl overflow-hidden hover-lift">
                      <div className="h-48 bg-muted overflow-hidden">
                        {dest.image ? (
                          <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-heading font-bold mb-1 capitalize">{dest.name}</h3>
                        <p className="text-sm text-muted-foreground italic mb-3">{dest.tagline}</p>
                        <span className="inline-flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                          Read Guide <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Destinations;
