import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back! 🎉" });
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin");
        if (roles && roles.length > 0) navigate("/admin");
        else navigate(redirectTo);
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: "Check your email 📬", description: "We sent you a verification link." });
      }
    } catch (err: any) {
      toast({ title: "Oops!", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-orb-1" style={{ top: "0%", left: "5%", opacity: 0.7 }} />
        <div className="ambient-orb-2" style={{ bottom: "10%", right: "5%", opacity: 0.6 }} />
        <div className="ambient-orb" style={{
          width: "300px", height: "300px",
          top: "40%", left: "50%", transform: "translate(-50%,-50%)",
          background: "radial-gradient(circle, hsla(152, 65%, 65%, 0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
      </div>

      <Navbar />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-20 pb-16">
        <div className="w-full max-w-md">

          {/* Logo mark */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 relative"
              style={{ background: "linear-gradient(135deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))", boxShadow: "0 8px 32px hsla(158, 42%, 36%, 0.40)" }}>
              <span className="text-3xl">🎒</span>
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-3xl animate-glow-ring" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="text-3xl sm:text-4xl font-heading tracking-tight mb-2" style={{ color: "hsl(158, 45%, 10%)" }}>
                  {isLogin ? "Welcome back" : "Join KroTravel"}
                </h1>
                <p className="text-muted-foreground text-sm font-light">
                  {isLogin ? "Continue planning your perfect trip" : "Start your AI travel journey today"}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Auth card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="glass-intense p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "hsl(158, 35%, 28%)" }}>
                      <User className="w-4 h-4" /> Full Name
                    </label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      required={!isLogin}
                      className="glass-input w-full px-4 py-3.5 text-sm"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "hsl(158, 35%, 28%)" }}>
                  <Mail className="w-4 h-4" /> Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="glass-input w-full px-4 py-3.5 text-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: "hsl(158, 35%, 28%)" }}>
                  <Lock className="w-4 h-4" /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="glass-input w-full px-4 py-3.5 text-sm pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-base mt-2 relative overflow-hidden"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/40 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "New to KroTravel?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-semibold hover:underline transition-all"
                  style={{ color: "hsl(158, 42%, 38%)" }}
                >
                  {isLogin ? "Create a free account" : "Sign in"}
                </button>
              </p>
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-5 mt-6 text-xs text-muted-foreground"
          >
            <span>🔒 Secure login</span>
            <span>🌿 No spam</span>
            <span>🎒 Free forever</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
