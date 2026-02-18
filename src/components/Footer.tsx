import { Link } from "react-router-dom";
import { Compass, Instagram, Twitter, Mail } from "lucide-react";

const Footer = () => (
  <footer className="relative z-10 border-t" style={{ borderColor: "hsla(145, 30%, 80%, 0.4)", background: "hsla(145, 35%, 97%, 0.6)", backdropFilter: "blur(20px)" }}>
    <div className="max-w-7xl mx-auto section-padding">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-heading text-foreground">
              KroTravel
            </span>
          </Link>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
            AI-powered travel planning that creates realistic, budget-aware itineraries written like a local friend planned your trip.
          </p>
        </div>
        <div>
          <h4 className="font-heading text-lg mb-4 text-foreground">Quick Links</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Link to="/plan" className="block hover:text-primary transition-colors">Plan a Trip</Link>
            <Link to="/destinations" className="block hover:text-primary transition-colors">Destinations</Link>
            <Link to="/auth" className="block hover:text-primary transition-colors">Sign In</Link>
          </div>
        </div>
        <div>
          <h4 className="font-heading text-lg mb-4 text-foreground">Connect</h4>
          <div className="flex gap-3">
            {[Instagram, Twitter, Mail].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all duration-300 text-muted-foreground">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
        © 2026 KroTravel. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
