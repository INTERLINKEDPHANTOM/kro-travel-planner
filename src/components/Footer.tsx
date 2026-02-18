import { Link } from "react-router-dom";
import { Compass, Instagram, Twitter, Mail } from "lucide-react";

const Footer = () => (
  <footer className="relative z-10 border-t" style={{ borderColor: "hsla(145, 30%, 80%, 0.4)", background: "hsla(145, 35%, 97%, 0.6)", backdropFilter: "blur(20px)" }}>
    <div className="max-w-7xl mx-auto section-padding">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-10">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-heading text-foreground">KroTravel</span>
          </Link>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            AI-powered travel planning that creates realistic, budget-aware itineraries written like a local friend planned your trip.
          </p>
          <div className="flex gap-3">
            {[Instagram, Twitter, Mail].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all duration-300 text-muted-foreground">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Plan */}
        <div>
          <h4 className="font-semibold text-sm mb-4 text-foreground">Plan</h4>
          <div className="space-y-2.5 text-sm text-muted-foreground">
            <Link to="/plan" className="block hover:text-primary transition-colors">Plan a Trip</Link>
            <Link to="/destinations" className="block hover:text-primary transition-colors">Destinations</Link>
            <Link to="/plans" className="block hover:text-primary transition-colors">Pricing Plans</Link>
            <Link to="/offers" className="block hover:text-primary transition-colors">Offers & Promos</Link>
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold text-sm mb-4 text-foreground">Company</h4>
          <div className="space-y-2.5 text-sm text-muted-foreground">
            <Link to="/about" className="block hover:text-primary transition-colors">About KroTravel</Link>
            <Link to="/founder" className="block hover:text-primary transition-colors">Founder's Story</Link>
            <Link to="/contact" className="block hover:text-primary transition-colors">Contact & Support</Link>
            <Link to="/auth" className="block hover:text-primary transition-colors">Sign In</Link>
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold text-sm mb-4 text-foreground">Legal</h4>
          <div className="space-y-2.5 text-sm text-muted-foreground">
            <Link to="/legal" className="block hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/legal" className="block hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/legal" className="block hover:text-primary transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>© 2026 KroTravel. All rights reserved.</span>
        <div className="flex gap-4">
          <Link to="/legal" className="hover:text-primary transition-colors">Privacy</Link>
          <Link to="/legal" className="hover:text-primary transition-colors">Terms</Link>
          <Link to="/contact" className="hover:text-primary transition-colors">Support</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
