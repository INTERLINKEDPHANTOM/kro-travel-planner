import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Menu, X, LayoutDashboard, Film, Map } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Plan Trip", path: "/plan" },
  { label: "Destinations", path: "/destinations" },
  { label: "My Trips", path: "/my-trips" },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setIsLoggedIn(!!s?.user));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="fixed top-0 left-0 right-0 z-50 nav-glass"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 20, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))", boxShadow: "0 4px 12px hsla(158, 42%, 36%, 0.35)" }}
            >
              <Compass className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-heading tracking-tight" style={{ color: "hsl(158, 45%, 12%)" }}>
              KroTravel
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  color: location.pathname === item.path ? "hsl(158, 42%, 38%)" : "hsl(158, 18%, 48%)",
                }}
              >
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="navPill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: "hsla(158, 42%, 38%, 0.10)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            ))}
            {isLoggedIn && (
              <>
                <Link to="/creator-studio"
                  className="relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                  style={{ color: location.pathname === "/creator-studio" ? "hsl(270, 60%, 50%)" : "hsl(158, 18%, 48%)" }}>
                  {location.pathname === "/creator-studio" && (
                    <motion.div layoutId="navPill" className="absolute inset-0 rounded-full"
                      style={{ background: "hsla(270, 60%, 50%, 0.10)" }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                  )}
                  <span className="relative z-10 flex items-center gap-1"><Film className="w-3.5 h-3.5" /> Studio</span>
                </Link>
                <Link to="/travel-map"
                  className="relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                  style={{ color: location.pathname === "/travel-map" ? "hsl(200, 70%, 40%)" : "hsl(158, 18%, 48%)" }}>
                  {location.pathname === "/travel-map" && (
                    <motion.div layoutId="navPill" className="absolute inset-0 rounded-full"
                      style={{ background: "hsla(200, 70%, 40%, 0.10)" }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                  )}
                  <span className="relative z-10 flex items-center gap-1"><Map className="w-3.5 h-3.5" /> Life Map</span>
                </Link>
              </>
            )}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard">
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                    style={{ color: "hsl(158, 42%, 38%)", background: "hsla(158, 42%, 38%, 0.08)" }}>
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </button>
                </Link>
                <Link to="/plan">
                  <button className="btn-primary text-sm px-6 py-2.5">Plan My Trip</button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <button className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                    style={{ color: "hsl(158, 18%, 48%)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(158, 42%, 32%)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(158, 18%, 48%)")}>
                    Log in
                  </button>
                </Link>
                <Link to="/plan">
                  <button className="btn-primary text-sm px-6 py-2.5">Plan My Trip</button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200"
            style={{ background: mobileOpen ? "hsla(158, 42%, 38%, 0.10)" : "transparent" }}
          >
            <AnimatePresence mode="wait">
              {mobileOpen
                ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="w-5 h-5" style={{ color: "hsl(158, 42%, 38%)" }} />
                  </motion.div>
                : <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="w-5 h-5" style={{ color: "hsl(158, 25%, 40%)" }} />
                  </motion.div>
              }
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="md:hidden border-t nav-glass overflow-hidden"
            style={{ borderColor: "hsla(148, 35%, 78%, 0.40)" }}
          >
            <div className="px-4 py-5 space-y-1.5">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: location.pathname === item.path ? "hsla(158, 42%, 38%, 0.10)" : "transparent",
                      color: location.pathname === item.path ? "hsl(158, 42%, 32%)" : "hsl(158, 18%, 42%)",
                    }}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              {isLoggedIn && (
                <>
                  <Link to="/creator-studio" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200"
                    style={{ color: "hsl(270, 55%, 45%)" }}>
                    <Film className="w-4 h-4" /> Creator Studio
                  </Link>
                  <Link to="/travel-map" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200"
                    style={{ color: "hsl(200, 65%, 40%)" }}>
                    <Map className="w-4 h-4" /> Life Map
                  </Link>
                </>
              )}
              <div className="pt-3 space-y-2.5 border-t border-border/30 mt-2">
                {isLoggedIn ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                      <button className="w-full btn-ghost-glass py-3 text-sm flex items-center justify-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </button>
                    </Link>
                    <Link to="/plan" onClick={() => setMobileOpen(false)}>
                      <button className="w-full btn-primary py-3 text-sm">Plan My Trip</button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setMobileOpen(false)}>
                      <button className="w-full btn-ghost-glass py-3 text-sm">Log in</button>
                    </Link>
                    <Link to="/plan" onClick={() => setMobileOpen(false)}>
                      <button className="w-full btn-primary py-3 text-sm">Plan My Trip</button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
