import { Link } from "react-router-dom";
import { MapPin, Instagram, Twitter, Mail } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-white/[0.06] bg-background/80 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto section-padding">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-heading font-bold text-foreground">
              Kro<span className="gradient-text">Travel</span>
            </span>
          </Link>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
            AI-powered travel planning that creates realistic, budget-aware itineraries written like a local friend planned your trip.
          </p>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-4 text-foreground">Quick Links</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Link to="/plan" className="block hover:text-primary transition-colors">Plan a Trip</Link>
            <Link to="/destinations" className="block hover:text-primary transition-colors">Destinations</Link>
            <Link to="/auth" className="block hover:text-primary transition-colors">Sign In</Link>
          </div>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-4 text-foreground">Connect</h4>
          <div className="flex gap-3">
            {[Instagram, Twitter, Mail].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-xl glass-card flex items-center justify-center hover:border-primary/30 hover:text-primary transition-all duration-300">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-white/[0.06] text-center text-xs text-muted-foreground">
        © 2026 Kro Travel. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
