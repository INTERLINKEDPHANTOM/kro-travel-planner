import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit, Trash2, Eye, EyeOff, LogOut, Sparkles, Loader2,
  Users, BarChart3, FileText, Tag, Crown, Shield, Star, RefreshCw,
  TrendingUp, ChevronRight, X, Check, AlertCircle, Download, Ban,
  Gift, Calendar, DollarSign, Activity, Search, UserCheck, Clock,
  Settings, Home, MapPin, Lock, CreditCard, Image, Megaphone, Save,
  ToggleLeft, ToggleRight, Globe, Phone, BookOpen, ScrollText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

/* ─── types ─── */
interface Itinerary { id: string; destination: string; title: string; content: any; is_published: boolean; created_at: string; }
interface UserProfile { id: string; user_id: string; full_name: string | null; email: string | null; phone: string | null; created_at: string; }
interface UserWithStats extends UserProfile { trip_count: number; paid_count: number; last_active: string | null; is_super_premium: boolean; }
interface PromoCode { id: string; code: string; discount_type: string; discount_value: number; uses_count: number; max_uses: number | null; is_active: boolean; expires_at: string | null; new_users_only: boolean; one_time_per_user: boolean; min_cart_value: number; created_at: string; }
interface SuperPremiumUser { id: string; user_id: string; access_type: string; expires_at: string | null; notes: string | null; is_active: boolean; granted_at: string; profiles?: { full_name: string | null; email: string | null } | null; }

type Tab = "dashboard" | "users" | "itineraries" | "promos" | "super_premium" | "page_controls";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "itineraries", label: "Itineraries", icon: FileText },
  { id: "promos", label: "Promo Codes", icon: Tag },
  { id: "super_premium", label: "Super Premium", icon: Crown },
  { id: "page_controls", label: "Page Controls", icon: Settings },
];

const sectionLabels: Record<string, string> = {
  emotional_hook: "🎭 Emotional Hook", local_resident: "🏠 Local Resident", vibe: "🌄 Vibe",
  why_special: "⭐ Why Special", must_visit_places: "📍 Must-Visit", hidden_gems: "💎 Hidden Gems",
  food_spots: "🍜 Food Spots", food_timing_tip: "⏰ Food Timing", daily_cost_breakdown: "💰 Daily Cost",
  transport_guide: "🚌 Transport", transport_warning: "⚠️ Warning", best_time_to_visit: "📅 Best Time",
  ideal_duration: "⏱️ Duration", local_tips: "💡 Tips", resident_moments: "🌅 Moments",
  sample_itinerary: "📋 Sample Itinerary", ending_note: "💭 Ending Note",
};

/* ─── stat card ─── */
const StatCard = ({ icon: Icon, label, value, sub, color = "text-primary" }: { icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string }) => (
  <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
    <div className={`p-3 rounded-xl bg-primary/10 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sub && <p className="text-xs text-primary mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ─── main component ─── */
const Admin = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // dashboard stats
  const [stats, setStats] = useState({ totalUsers: 0, totalPaid: 0, totalFree: 0, todayGenerated: 0, superPremiumCount: 0, activeToday: 0 });


  // itineraries
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [paidTrips, setPaidTrips] = useState<any[]>([]);
  const [editing, setEditing] = useState<Itinerary | null>(null);
  const [form, setForm] = useState({ destination: "", title: "", rawText: "" });
  const [parsing, setParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any>(null);

  // users
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userLoading, setUserLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [userTrips, setUserTrips] = useState<any[]>([]);

  // promo codes
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [promoForm, setPromoForm] = useState({ code: "", discount_type: "percentage", discount_value: 10, max_uses: "", new_users_only: false, one_time_per_user: true, min_cart_value: 0, expires_at: "" });
  const [promoLoading, setPromoLoading] = useState(false);

  // super premium
  const [superUsers, setSuperUsers] = useState<SuperPremiumUser[]>([]);
  const [spEmailInput, setSpEmailInput] = useState("");
  const [spNotes, setSpNotes] = useState("");
  const [spGranting, setSpGranting] = useState(false);

  // page controls
  const [siteSettings, setSiteSettings] = useState<Record<string, any>>({});
  const [activePageControl, setActivePageControl] = useState("home");
  const [settingsSaving, setSettingsSaving] = useState(false);

  /* ── auth check ── */
  useEffect(() => { checkAdmin(); }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
    if (!roles || roles.length === 0) {
      toast({ title: "Access denied", variant: "destructive" });
      navigate("/");
      return;
    }
    setIsAdmin(true);
    fetchAll();
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchDashboardStats(), fetchItineraries(), fetchUsers(), fetchPromos(), fetchSuperPremium(), fetchSiteSettings()]);
    setLoading(false);
  }, []);

  /* ── dashboard stats ── */
  const fetchDashboardStats = async () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const [{ count: totalUsers }, { count: totalPaid }, { count: todayGenerated }, { count: superPremiumCount }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("saved_itineraries").select("*", { count: "exact", head: true }),
      supabase.from("saved_itineraries").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
      supabase.from("super_premium_access").select("*", { count: "exact", head: true }).eq("is_active", true),
    ]);

    const { data: itinCount } = await supabase.from("itineraries").select("*", { count: "exact", head: true });

    setStats({
      totalUsers: totalUsers || 0,
      totalPaid: totalPaid || 0,
      totalFree: (itinCount as any)?.count || 0,
      todayGenerated: todayGenerated || 0,
      superPremiumCount: superPremiumCount || 0,
      activeToday: todayGenerated || 0,
    });
  };

  /* ── itineraries ── */
  const fetchItineraries = async () => {
    const [{ data: free }, { data: paid }] = await Promise.all([
      supabase.from("itineraries").select("*").order("created_at", { ascending: false }),
      supabase.from("saved_itineraries").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setItineraries(free || []);
    setPaidTrips(paid || []);
  };

  const handleParseText = async () => {
    if (!form.rawText.trim()) { toast({ title: "Paste text first", variant: "destructive" }); return; }
    setParsing(true); setParsedPreview(null);
    try {
      const { data, error } = await supabase.functions.invoke("parse-itinerary", { body: { rawText: form.rawText } });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      setParsedPreview(data.data);
      toast({ title: "✨ Parsed successfully!" });
    } catch (err: any) { toast({ title: "Parsing failed", description: err.message, variant: "destructive" }); }
    finally { setParsing(false); }
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const contentToSave = parsedPreview || { raw: form.rawText };
    if (editing) {
      await supabase.from("itineraries").update({ destination: form.destination, title: form.title, content: contentToSave }).eq("id", editing.id);
      toast({ title: "Updated!" });
    } else {
      await supabase.from("itineraries").insert({ destination: form.destination, title: form.title, content: contentToSave, created_by: user.id });
      toast({ title: "Created!" });
    }
    setEditing(null); setForm({ destination: "", title: "", rawText: "" }); setParsedPreview(null);
    fetchItineraries();
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from("itineraries").update({ is_published: !current }).eq("id", id);
    fetchItineraries();
  };

  const deleteItinerary = async (id: string) => {
    await supabase.from("itineraries").delete().eq("id", id);
    fetchItineraries();
    toast({ title: "Deleted" });
  };

  /* ── users ── */
  const fetchUsers = async () => {
    setUserLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
    if (!profiles) { setUserLoading(false); return; }

    // Get super premium status for all users
    const { data: spAccess } = await supabase.from("super_premium_access").select("user_id").eq("is_active", true);
    const spSet = new Set((spAccess || []).map((s: any) => s.user_id));

    // Get trip counts per user
    const { data: tripData } = await supabase.from("saved_itineraries").select("user_id, status");
    const tripMap: Record<string, { total: number; paid: number }> = {};
    (tripData || []).forEach((t: any) => {
      if (!tripMap[t.user_id]) tripMap[t.user_id] = { total: 0, paid: 0 };
      tripMap[t.user_id].total++;
    });

    const enriched: UserWithStats[] = profiles.map((p: any) => ({
      ...p,
      trip_count: tripMap[p.user_id]?.total || 0,
      paid_count: tripMap[p.user_id]?.paid || 0,
      last_active: null,
      is_super_premium: spSet.has(p.user_id),
    }));
    setUsers(enriched);
    setUserLoading(false);
  };

  const fetchUserTrips = async (userId: string) => {
    const { data } = await supabase.from("saved_itineraries").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setUserTrips(data || []);
  };

  const filteredUsers = users.filter(u =>
    !userSearch || [u.full_name, u.email, u.phone].some(v => v?.toLowerCase().includes(userSearch.toLowerCase()))
  );

  /* ── promos ── */
  const fetchPromos = async () => {
    const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
    setPromos(data || []);
  };

  const createPromo = async () => {
    if (!promoForm.code.trim()) { toast({ title: "Enter a code", variant: "destructive" }); return; }
    setPromoLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("promo_codes").insert({
      code: promoForm.code.toUpperCase().trim(),
      discount_type: promoForm.discount_type,
      discount_value: promoForm.discount_value,
      max_uses: promoForm.max_uses ? parseInt(promoForm.max_uses) : null,
      new_users_only: promoForm.new_users_only,
      one_time_per_user: promoForm.one_time_per_user,
      min_cart_value: promoForm.min_cart_value,
      expires_at: promoForm.expires_at || null,
      created_by: user?.id,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "🎉 Promo code created!" });
      setPromoForm({ code: "", discount_type: "percentage", discount_value: 10, max_uses: "", new_users_only: false, one_time_per_user: true, min_cart_value: 0, expires_at: "" });
      fetchPromos();
    }
    setPromoLoading(false);
  };

  const togglePromo = async (id: string, current: boolean) => {
    await supabase.from("promo_codes").update({ is_active: !current }).eq("id", id);
    fetchPromos();
  };

  const deletePromo = async (id: string) => {
    await supabase.from("promo_codes").delete().eq("id", id);
    fetchPromos();
    toast({ title: "Promo deleted" });
  };

  /* ── super premium ── */
  const fetchSuperPremium = async () => {
    const { data } = await supabase.from("super_premium_access").select("*, profiles(full_name, email)").order("granted_at", { ascending: false });
    setSuperUsers((data as any) || []);
  };

  const grantSuperPremium = async () => {
    if (!spEmailInput.trim()) { toast({ title: "Enter email", variant: "destructive" }); return; }
    setSpGranting(true);
    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      // Find user by email
      const { data: profile } = await supabase.from("profiles").select("user_id").eq("email", spEmailInput.trim()).maybeSingle();
      if (!profile) { toast({ title: "User not found", description: "No account with that email.", variant: "destructive" }); setSpGranting(false); return; }

      const { error } = await supabase.from("super_premium_access").upsert({
        user_id: profile.user_id,
        granted_by: adminUser!.id,
        access_type: "unlimited",
        notes: spNotes || null,
        is_active: true,
      }, { onConflict: "user_id" });

      if (error) throw error;
      // Also update user_subscriptions
      await supabase.from("user_subscriptions").update({ is_super_premium: true, plan: "super_premium" }).eq("user_id", profile.user_id);

      toast({ title: "👑 Super Premium granted!" });
      setSpEmailInput(""); setSpNotes("");
      fetchSuperPremium(); fetchDashboardStats();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setSpGranting(false);
  };

  const revokeSuperPremium = async (userId: string, recordId: string) => {
    await supabase.from("super_premium_access").update({ is_active: false, revoked_at: new Date().toISOString() }).eq("id", recordId);
    await supabase.from("user_subscriptions").update({ is_super_premium: false, plan: "free" }).eq("user_id", userId);
    toast({ title: "Access revoked" });
    fetchSuperPremium(); fetchDashboardStats();
  };

  /* ── site settings ── */
  const fetchSiteSettings = async () => {
    const { data } = await supabase.from("site_settings").select("*");
    if (!data) return;
    const map: Record<string, any> = {};
    data.forEach((row: any) => { map[row.page_key] = row.settings; });
    setSiteSettings(map);
  };

  const saveSiteSettings = async (pageKey: string) => {
    setSettingsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("site_settings")
      .upsert({ page_key: pageKey, settings: siteSettings[pageKey], updated_by: user?.id }, { onConflict: "page_key" });
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: `✅ ${pageKey} settings saved!` });
    setSettingsSaving(false);
  };

  const updatePageSetting = (pageKey: string, field: string, value: any) => {
    setSiteSettings(prev => ({
      ...prev,
      [pageKey]: { ...(prev[pageKey] || {}), [field]: value }
    }));
  };

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(","), ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  if (!isAdmin) return null;

  /* ══════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-background noise-overlay">
      <Navbar />

      <div className="pt-20 pb-16">
        {/* ── Header ── */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-0 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-2">
                <Shield className="w-7 h-7 text-primary" /> Admin Control Panel
              </h1>
              <p className="text-sm text-muted-foreground mt-1">KroTravel — Internal Dashboard</p>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm" className="border-border hover:bg-muted">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>

          {/* ── Tab Nav ── */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
                    ${active ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === "super_premium" && stats.superPremiumCount > 0 && (
                    <span className="bg-primary-foreground/20 text-xs px-1.5 py-0.5 rounded-full">{stats.superPremiumCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-6">
          <AnimatePresence mode="wait">
            {/* ═══ DASHBOARD ═══ */}
            {activeTab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
                  <StatCard icon={FileText} label="Paid Trips Generated" value={stats.totalPaid} />
                  <StatCard icon={Activity} label="Generated Today" value={stats.todayGenerated} sub="New itineraries" />
                  <StatCard icon={Crown} label="Super Premium" value={stats.superPremiumCount} color="text-premium" />
                </div>

                {/* Quick overview */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Recent users */}
                  <div className="glass-card rounded-2xl p-5">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Recent Users</h3>
                    <div className="space-y-3">
                      {users.slice(0, 6).map(u => (
                        <div key={u.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{u.full_name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{u.trip_count} trips</p>
                            {u.is_super_premium && <span className="text-xs text-premium">👑 Super</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab("users")} className="text-xs text-primary mt-4 flex items-center gap-1 hover:underline">
                      View all users <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Recent trips */}
                  <div className="glass-card rounded-2xl p-5">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Recent Paid Trips</h3>
                    <div className="space-y-3">
                      {paidTrips.slice(0, 6).map(t => (
                        <div key={t.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{t.destination}</p>
                            <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === "generated" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab("itineraries")} className="text-xs text-primary mt-4 flex items-center gap-1 hover:underline">
                      View all <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Platform info */}
                <div className="mt-6 glass-card rounded-2xl p-5 border border-primary/10">
                  <p className="text-xs text-muted-foreground text-center italic">
                    "The Admin Panel ensures quality, transparency, and control, while allowing AI to handle scale and speed."
                  </p>
                </div>
              </motion.div>
            )}

            {/* ═══ USERS ═══ */}
            {activeTab === "users" && (
              <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search by name, email, phone…" value={userSearch} onChange={e => setUserSearch(e.target.value)} className="pl-9" />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportCSV(users, "krotravel_users")} className="border-border">
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchUsers}><RefreshCw className="w-4 h-4" /></Button>
                </div>

                {/* User detail modal */}
                <AnimatePresence>
                  {selectedUser && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                      onClick={() => setSelectedUser(null)}
                    >
                      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                        className="glass-card rounded-3xl p-6 max-w-xl w-full max-h-[80vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-primary" /> {selectedUser.full_name || "User"}
                            {selectedUser.is_super_premium && <span className="text-premium text-sm">👑 Super</span>}
                          </h3>
                          <button onClick={() => setSelectedUser(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                          <div><p className="text-muted-foreground text-xs">Email</p><p className="text-foreground">{selectedUser.email || "—"}</p></div>
                          <div><p className="text-muted-foreground text-xs">Phone</p><p className="text-foreground">{selectedUser.phone || "—"}</p></div>
                          <div><p className="text-muted-foreground text-xs">Joined</p><p className="text-foreground">{new Date(selectedUser.created_at).toLocaleDateString()}</p></div>
                          <div><p className="text-muted-foreground text-xs">Total Trips</p><p className="text-foreground font-semibold">{selectedUser.trip_count}</p></div>
                        </div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">Trip History</h4>
                        {userTrips.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No trips found.</p>
                        ) : (
                          <div className="space-y-2">
                            {userTrips.map(t => (
                              <div key={t.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-2.5">
                                <div>
                                  <p className="text-sm font-medium text-foreground">{t.destination}</p>
                                  <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t.status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {userLoading ? (
                  <div className="text-center py-16 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading users…</div>
                ) : (
                  <div className="space-y-3">
                    {filteredUsers.map(u => (
                      <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-semibold text-primary">
                            {(u.full_name || u.email || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                              {u.full_name || "—"} {u.is_super_premium && <Crown className="w-3.5 h-3.5 text-premium" />}
                            </p>
                            <p className="text-xs text-muted-foreground">{u.email} · {u.phone || "no phone"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right mr-2">
                            <p className="text-sm font-semibold text-foreground">{u.trip_count}</p>
                            <p className="text-xs text-muted-foreground">trips</p>
                          </div>
                          <p className="text-xs text-muted-foreground hidden sm:block">Joined {new Date(u.created_at).toLocaleDateString()}</p>
                          <Button variant="outline" size="sm" onClick={async () => {
                            setSelectedUser(u);
                            await fetchUserTrips(u.user_id);
                          }}>
                            <Eye className="w-4 h-4 mr-1" /> View
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                    {filteredUsers.length === 0 && <p className="text-center py-12 text-muted-foreground">No users found.</p>}
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══ ITINERARIES ═══ */}
            {activeTab === "itineraries" && (
              <motion.div key="itineraries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Create/Edit Form */}
                <div className="glass-card rounded-3xl p-6 mb-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">{editing ? "Edit Itinerary" : "Create Free Itinerary"}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div><Label>Destination</Label>
                      <Input placeholder="e.g., Manali" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} className="mt-1" />
                    </div>
                    <div><Label>Title</Label>
                      <Input placeholder="e.g., Manali — A Local's Guide" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1" />
                    </div>
                  </div>
                  <Textarea placeholder="Paste itinerary text — AI will auto-classify…" value={form.rawText} onChange={e => setForm({ ...form, rawText: e.target.value })} className="min-h-[180px] mb-4 text-sm" />
                  <div className="flex flex-wrap gap-3">
                    <button onClick={handleParseText} disabled={parsing} className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 disabled:opacity-50">
                      {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {parsing ? "Parsing…" : "Auto-Classify with AI"}
                    </button>
                    <button onClick={handleSave} disabled={!form.destination || !form.title} className="btn-outline-glass text-sm px-5 py-2.5 flex items-center gap-2 disabled:opacity-50">
                      <Plus className="w-4 h-4" /> {editing ? "Update" : "Save"}
                    </button>
                    {editing && <Button variant="outline" onClick={() => { setEditing(null); setForm({ destination: "", title: "", rawText: "" }); setParsedPreview(null); }}>Cancel</Button>}
                  </div>
                </div>

                {/* Parsed Preview */}
                {parsedPreview && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-3xl p-6 mb-6 glow-primary">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> AI Preview</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {Object.entries(parsedPreview).map(([key, value]) => {
                        if (!value || (Array.isArray(value) && !value.length) || value === "") return null;
                        return (
                          <div key={key} className="rounded-xl bg-muted/40 p-3">
                            <p className="text-xs font-semibold text-primary mb-1">{sectionLabels[key] || key}</p>
                            <p className="text-xs text-foreground/80 line-clamp-2">
                              {typeof value === "string" ? value : Array.isArray(value) ? value.slice(0, 2).join(", ") : JSON.stringify(value).slice(0, 80)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Paid Trips Review */}
                {paidTrips.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> Paid Trips ({paidTrips.length})</h3>
                      <Button variant="outline" size="sm" onClick={() => exportCSV(paidTrips, "paid_trips")}><Download className="w-4 h-4 mr-1" /> CSV</Button>
                    </div>
                    <div className="space-y-2">
                      {paidTrips.slice(0, 20).map(t => (
                        <div key={t.id} className="warm-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-medium text-foreground text-sm">{t.destination}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === "generated" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{t.status}</span>
                              {t.regenerate_count > 0 && <span className="text-xs text-muted-foreground">Regen ×{t.regenerate_count}</span>}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(t.created_at).toLocaleDateString()} · {t.preferences?.numPeople || 1} pax · ₹{t.preferences?.budgetMin || 0}–₹{t.preferences?.budgetMax || "—"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Free Itineraries */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Free Itineraries ({itineraries.length})</h3>
                  {loading ? <div className="text-center py-10 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div> : (
                    <div className="space-y-3">
                      {itineraries.map(item => (
                        <div key={item.id} className="warm-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-medium text-foreground text-sm">{item.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                {item.is_published ? "Published" : "Draft"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.destination}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch checked={item.is_published} onCheckedChange={() => togglePublish(item.id, item.is_published)} />
                            <Button variant="outline" size="sm" onClick={() => { setEditing(item); setForm({ destination: item.destination, title: item.title, rawText: (item.content as any)?.raw || "" }); if (item.content && !(item.content as any).raw) setParsedPreview(item.content); }}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteItinerary(item.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══ PROMO CODES ═══ */}
            {activeTab === "promos" && (
              <motion.div key="promos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Create Promo */}
                <div className="glass-card rounded-3xl p-6 mb-6">
                  <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2"><Gift className="w-5 h-5 text-primary" /> Create Promo Code</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label>Code</Label>
                      <Input placeholder="SUMMER25" value={promoForm.code} onChange={e => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} className="mt-1 font-mono tracking-wider" />
                    </div>
                    <div>
                      <Label>Discount Type</Label>
                      <select value={promoForm.discount_type} onChange={e => setPromoForm({ ...promoForm, discount_type: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground">
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <Label>Discount Value</Label>
                      <Input type="number" placeholder={promoForm.discount_type === "percentage" ? "10" : "100"} value={promoForm.discount_value} onChange={e => setPromoForm({ ...promoForm, discount_value: +e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label>Max Uses (blank = unlimited)</Label>
                      <Input type="number" placeholder="100" value={promoForm.max_uses} onChange={e => setPromoForm({ ...promoForm, max_uses: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label>Min Cart Value (₹)</Label>
                      <Input type="number" placeholder="0" value={promoForm.min_cart_value} onChange={e => setPromoForm({ ...promoForm, min_cart_value: +e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label>Expires At</Label>
                      <Input type="date" value={promoForm.expires_at} onChange={e => setPromoForm({ ...promoForm, expires_at: e.target.value })} className="mt-1" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-5 mb-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Switch checked={promoForm.new_users_only} onCheckedChange={v => setPromoForm({ ...promoForm, new_users_only: v })} />
                      <span className="text-sm text-foreground">New users only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Switch checked={promoForm.one_time_per_user} onCheckedChange={v => setPromoForm({ ...promoForm, one_time_per_user: v })} />
                      <span className="text-sm text-foreground">One-time per user</span>
                    </label>
                  </div>
                  <button onClick={createPromo} disabled={promoLoading} className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2 disabled:opacity-50">
                    {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Code
                  </button>
                </div>

                {/* Promo List */}
                <div className="space-y-3">
                  {promos.length === 0 && <p className="text-center py-10 text-muted-foreground">No promo codes yet.</p>}
                  {promos.map(p => (
                    <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-lg font-mono text-sm font-bold tracking-widest ${p.is_active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground line-through"}`}>
                          {p.code}
                        </div>
                        <div>
                          <p className="text-sm text-foreground font-medium">
                            {p.discount_type === "percentage" ? `${p.discount_value}% off` : `₹${p.discount_value} off`}
                            {p.min_cart_value > 0 && ` (min ₹${p.min_cart_value})`}
                          </p>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                            <span>Used: {p.uses_count}{p.max_uses ? `/${p.max_uses}` : ""}</span>
                            {p.new_users_only && <span>• New users</span>}
                            {p.expires_at && <span>• Expires {new Date(p.expires_at).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={p.is_active} onCheckedChange={() => togglePromo(p.id, p.is_active)} />
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => deletePromo(p.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══ SUPER PREMIUM ═══ */}
            {activeTab === "super_premium" && (
              <motion.div key="super_premium" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Warning banner */}
                <div className="rounded-2xl border border-premium/30 bg-premium/5 p-4 mb-6 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-premium shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Internal Use Only — Super Premium Access</p>
                    <p className="text-xs text-muted-foreground mt-0.5">For investor demos, partner walkthroughs, and internal quality testing. Not visible to users. All grants are logged.</p>
                  </div>
                </div>

                {/* Grant Access */}
                <div className="glass-card rounded-3xl p-6 mb-6">
                  <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-premium" /> Grant Super Premium Access
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>User Email</Label>
                      <Input placeholder="user@example.com" value={spEmailInput} onChange={e => setSpEmailInput(e.target.value)} className="mt-1" type="email" />
                    </div>
                    <div>
                      <Label>Internal Notes (optional)</Label>
                      <Input placeholder="e.g., Investor demo — Sequoia" value={spNotes} onChange={e => setSpNotes(e.target.value)} className="mt-1" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={grantSuperPremium} disabled={spGranting} className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2 disabled:opacity-50">
                      {spGranting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                      Grant Unlimited Access
                    </button>
                    <p className="text-xs text-muted-foreground">Access is unlimited by default · Not purchasable · Admin-only</p>
                  </div>
                </div>

                {/* Active Super Premium Users */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-premium" /> Active Super Premium Accounts ({superUsers.filter(s => s.is_active).length})
                  </h3>
                  {superUsers.length === 0 ? (
                    <p className="text-center py-10 text-muted-foreground">No super premium accounts yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {superUsers.map(u => (
                        <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className={`glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between border ${u.is_active ? "border-premium/20" : "border-border opacity-60"}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${u.is_active ? "bg-premium/10" : "bg-muted"}`}>
                              <Crown className={`w-4 h-4 ${u.is_active ? "text-premium" : "text-muted-foreground"}`} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {(u as any).profiles?.full_name || "—"}
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${u.is_active ? "bg-premium/10 text-premium-foreground" : "bg-muted text-muted-foreground"}`}>
                                  {u.is_active ? "Active" : "Revoked"}
                                </span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(u as any).profiles?.email} · Granted {new Date(u.granted_at).toLocaleDateString()}
                              </p>
                              {u.notes && <p className="text-xs text-muted-foreground italic mt-0.5">📝 {u.notes}</p>}
                            </div>
                          </div>
                          {u.is_active && (
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive border-destructive/20"
                              onClick={() => revokeSuperPremium(u.user_id, u.id)}
                            >
                              <Ban className="w-3.5 h-3.5 mr-1" /> Revoke
                            </Button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══ PAGE CONTROLS ═══ */}
            {activeTab === "page_controls" && (
              <motion.div key="page_controls" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex gap-3 mb-6 flex-wrap">
                  {[
                    { key: "home", label: "🏠 Home Page", Icon: Home },
                    { key: "plan_trip", label: "🗺️ Plan My Trip", Icon: MapPin },
                    { key: "auth", label: "🔒 Auth Page", Icon: Lock },
                    { key: "plan_selection", label: "💳 Plan Selection", Icon: CreditCard },
                    { key: "free_itinerary", label: "📄 Free Itinerary", Icon: FileText },
                    { key: "paid_itinerary", label: "⭐ Paid Itinerary", Icon: Star },
                    { key: "memory_vault", label: "🖼️ Memory Vault", Icon: Image },
                    { key: "contact", label: "📞 Contact/Support", Icon: Phone },
                    { key: "legal", label: "📜 Legal Pages", Icon: ScrollText },
                  ].map(p => (
                    <button
                      key={p.key}
                      onClick={() => setActivePageControl(p.key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border
                        ${activePageControl === p.key
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* ── HOME PAGE CONTROLS ── */}
                {activePageControl === "home" && (
                  <div className="glass-card rounded-3xl p-6 space-y-5">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Home className="w-5 h-5 text-primary" /> Home Page Content</h2>
                      <button onClick={() => saveSiteSettings("home")} disabled={settingsSaving} className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-50">
                        {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                      </button>
                    </div>

                    {/* Announcement Banner */}
                    <div className="rounded-2xl border border-border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground flex items-center gap-2"><Megaphone className="w-4 h-4 text-primary" /> Announcement Banner</p>
                        <Switch
                          checked={siteSettings.home?.announcement_banner_active || false}
                          onCheckedChange={v => updatePageSetting("home", "announcement_banner_active", v)}
                        />
                      </div>
                      <Input
                        placeholder="Announcement text (shown site-wide when active)…"
                        value={siteSettings.home?.announcement_banner || ""}
                        onChange={e => updatePageSetting("home", "announcement_banner", e.target.value)}
                      />
                    </div>

                    {/* Hero Content */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">Hero Section</p>
                      <div>
                        <Label className="text-xs text-muted-foreground">Main Headline</Label>
                        <Input className="mt-1" value={siteSettings.home?.hero_headline || ""} onChange={e => updatePageSetting("home", "hero_headline", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Sub Headline</Label>
                        <Textarea className="mt-1 min-h-[70px] text-sm" value={siteSettings.home?.hero_subheadline || ""} onChange={e => updatePageSetting("home", "hero_subheadline", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Primary CTA Text</Label>
                          <Input className="mt-1" value={siteSettings.home?.cta_primary_text || ""} onChange={e => updatePageSetting("home", "cta_primary_text", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Secondary CTA Text</Label>
                          <Input className="mt-1" value={siteSettings.home?.cta_secondary_text || ""} onChange={e => updatePageSetting("home", "cta_secondary_text", e.target.value)} />
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">Hero Stats</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Trips Planned</Label>
                          <Input className="mt-1" value={siteSettings.home?.stats_trips || ""} onChange={e => updatePageSetting("home", "stats_trips", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">User Rating</Label>
                          <Input className="mt-1" value={siteSettings.home?.stats_rating || ""} onChange={e => updatePageSetting("home", "stats_rating", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Generation Time</Label>
                          <Input className="mt-1" value={siteSettings.home?.stats_generation_time || ""} onChange={e => updatePageSetting("home", "stats_generation_time", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PLAN TRIP CONTROLS ── */}
                {activePageControl === "plan_trip" && (
                  <div className="glass-card rounded-3xl p-6 space-y-5">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Plan My Trip — Form Controls</h2>
                      <button onClick={() => saveSiteSettings("plan_trip")} disabled={settingsSaving} className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-50">
                        {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Min Budget (₹)</Label>
                        <Input type="number" className="mt-1" value={siteSettings.plan_trip?.min_budget || 1000} onChange={e => updatePageSetting("plan_trip", "min_budget", +e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Max Budget (₹)</Label>
                        <Input type="number" className="mt-1" value={siteSettings.plan_trip?.max_budget || 500000} onChange={e => updatePageSetting("plan_trip", "max_budget", +e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Max Travellers</Label>
                        <Input type="number" className="mt-1" value={siteSettings.plan_trip?.max_people || 20} onChange={e => updatePageSetting("plan_trip", "max_people", +e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">Feature Toggles</p>
                      {[
                        { key: "multi_city_enabled", label: "Multi-city stops field" },
                        { key: "notes_field_enabled", label: "Special notes field" },
                      ].map(toggle => (
                        <div key={toggle.key} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                          <span className="text-sm text-foreground">{toggle.label}</span>
                          <Switch checked={siteSettings.plan_trip?.[toggle.key] ?? true} onCheckedChange={v => updatePageSetting("plan_trip", toggle.key, v)} />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Enabled Travel Types</p>
                      <p className="text-xs text-muted-foreground">Toggle to enable/disable travel type options in the form</p>
                      <div className="flex flex-wrap gap-2">
                        {["leisure", "adventure", "corporate", "medical", "spiritual"].map(type => {
                          const enabled = (siteSettings.plan_trip?.travel_types_enabled || []).includes(type);
                          return (
                            <button key={type} onClick={() => {
                              const curr = siteSettings.plan_trip?.travel_types_enabled || [];
                              updatePageSetting("plan_trip", "travel_types_enabled", enabled ? curr.filter((t: string) => t !== type) : [...curr, type]);
                            }}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize
                                ${enabled ? "bg-primary/15 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border"}`}
                            >
                              {enabled ? "✓ " : ""}{type}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Enabled Transport Modes</p>
                      <div className="flex flex-wrap gap-2">
                        {["flight", "train", "bus", "own", "public", "mixed"].map(mode => {
                          const enabled = (siteSettings.plan_trip?.transport_modes_enabled || []).includes(mode);
                          return (
                            <button key={mode} onClick={() => {
                              const curr = siteSettings.plan_trip?.transport_modes_enabled || [];
                              updatePageSetting("plan_trip", "transport_modes_enabled", enabled ? curr.filter((m: string) => m !== mode) : [...curr, mode]);
                            }}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize
                                ${enabled ? "bg-primary/15 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border"}`}
                            >
                              {enabled ? "✓ " : ""}{mode}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── AUTH CONTROLS ── */}
                {activePageControl === "auth" && (
                  <div className="glass-card rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> Auth Page Controls</h2>
                      <button onClick={() => saveSiteSettings("auth")} disabled={settingsSaving} className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-50">
                        {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                      </button>
                    </div>
                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-muted-foreground">
                      ⚠️ Admin cannot access user passwords or OTPs. These are UI-level toggles only.
                    </div>
                    {[
                      { key: "email_login_enabled", label: "Email/Password Login", desc: "Standard email + password auth" },
                      { key: "google_login_enabled", label: "Google Login (OAuth)", desc: "Sign in with Google" },
                      { key: "otp_login_enabled", label: "OTP / Phone Login", desc: "Phone number one-time password" },
                      { key: "signup_enabled", label: "New Signups Enabled", desc: "Allow new user registrations" },
                    ].map(toggle => (
                      <div key={toggle.key} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
                        <div>
                          <p className="text-sm font-medium text-foreground">{toggle.label}</p>
                          <p className="text-xs text-muted-foreground">{toggle.desc}</p>
                        </div>
                        <Switch checked={siteSettings.auth?.[toggle.key] ?? true} onCheckedChange={v => updatePageSetting("auth", toggle.key, v)} />
                      </div>
                    ))}
                  </div>
                )}

                {/* ── PLAN SELECTION CONTROLS ── */}
                {activePageControl === "plan_selection" && (
                  <div className="glass-card rounded-3xl p-6 space-y-5">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Plan Selection Page</h2>
                      <button onClick={() => saveSiteSettings("plan_selection")} disabled={settingsSaving} className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-50">
                        {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Paid Plan Price Label</Label>
                        <Input className="mt-1" value={siteSettings.plan_selection?.paid_plan_price_label || ""} onChange={e => updatePageSetting("plan_selection", "paid_plan_price_label", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Premium Plan Price Label</Label>
                        <Input className="mt-1" value={siteSettings.plan_selection?.premium_plan_price_label || ""} onChange={e => updatePageSetting("plan_selection", "premium_plan_price_label", e.target.value)} />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Recommended / Default Plan</Label>
                      <select value={siteSettings.plan_selection?.recommended_plan || "basic"}
                        onChange={e => updatePageSetting("plan_selection", "recommended_plan", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground">
                        <option value="free">Explorer (Free)</option>
                        <option value="basic">Voyager (Paid)</option>
                        <option value="premium">Nomad (Premium)</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">Plan Visibility</p>
                      {[
                        { key: "free_plan_enabled", label: "Show Free (Explorer) Plan" },
                        { key: "paid_plan_enabled", label: "Show Paid (Voyager) Plan" },
                        { key: "premium_plan_enabled", label: "Show Premium (Nomad) Plan" },
                        { key: "show_promotions", label: "Show Active Promotions Banner" },
                      ].map(toggle => (
                        <div key={toggle.key} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                          <span className="text-sm text-foreground">{toggle.label}</span>
                          <Switch checked={siteSettings.plan_selection?.[toggle.key] ?? true} onCheckedChange={v => updatePageSetting("plan_selection", toggle.key, v)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── FREE ITINERARY CONTROLS ── */}
                {activePageControl === "free_itinerary" && (
                  <div className="glass-card rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Free Itinerary Page</h2>
                      <button onClick={() => saveSiteSettings("free_itinerary")} disabled={settingsSaving} className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-50">
                        {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                      </button>
                    </div>
                    {[
                      { key: "feature_enabled", label: "Free Itinerary Feature Active", desc: "Enable/disable free itinerary pages globally" },
                      { key: "show_upgrade_cta", label: "Show Upgrade CTA", desc: "Show the 'Plan Full Trip' upgrade prompt" },
                    ].map(toggle => (
                      <div key={toggle.key} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
                        <div>
                          <p className="text-sm font-medium text-foreground">{toggle.label}</p>
                          <p className="text-xs text-muted-foreground">{toggle.desc}</p>
                        </div>
                        <Switch checked={siteSettings.free_itinerary?.[toggle.key] ?? true} onCheckedChange={v => updatePageSetting("free_itinerary", toggle.key, v)} />
                      </div>
                    ))}
                    <div>
                      <Label className="text-xs text-muted-foreground">Upgrade CTA Button Text</Label>
                      <Input className="mt-1" value={siteSettings.free_itinerary?.cta_text || ""} onChange={e => updatePageSetting("free_itinerary", "cta_text", e.target.value)} />
                    </div>
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                      💡 To edit individual free itinerary content, go to the <strong>Itineraries</strong> tab → Free Itineraries section.
                    </div>
                  </div>
                )}

                {/* ── PAID ITINERARY CONTROLS ── */}
                {activePageControl === "paid_itinerary" && (
                  <div className="glass-card rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Paid Itinerary Page</h2>
                      <button onClick={() => saveSiteSettings("paid_itinerary")} disabled={settingsSaving} className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-50">
                        {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                      </button>
                    </div>
                    {[
                      { key: "download_enabled", label: "PDF Download Enabled", desc: "Allow users to download itinerary as PDF" },
                      { key: "sharing_enabled", label: "Sharing Enabled", desc: "Allow users to share their itinerary link" },
                      { key: "regeneration_enabled", label: "Regeneration Enabled", desc: "Allow users to regenerate their itinerary" },
                      { key: "watermark_enabled", label: "Show Watermark on PDF", desc: "Add KroTravel watermark to downloaded PDFs" },
                    ].map(toggle => (
                      <div key={toggle.key} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
                        <div>
                          <p className="text-sm font-medium text-foreground">{toggle.label}</p>
                          <p className="text-xs text-muted-foreground">{toggle.desc}</p>
                        </div>
                        <Switch checked={siteSettings.paid_itinerary?.[toggle.key] ?? true} onCheckedChange={v => updatePageSetting("paid_itinerary", toggle.key, v)} />
                      </div>
                    ))}
                    <div>
                      <Label className="text-xs text-muted-foreground">Max Regenerations Per Trip</Label>
                      <Input type="number" className="mt-1 max-w-[120px]" value={siteSettings.paid_itinerary?.max_regenerations || 3} onChange={e => updatePageSetting("paid_itinerary", "max_regenerations", +e.target.value)} />
                    </div>
                  </div>
                )}

                {/* ── MEMORY VAULT CONTROLS ── */}
                {activePageControl === "memory_vault" && (
                  <div className="glass-card rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Image className="w-5 h-5 text-primary" /> Memory Vault / Trip Gallery</h2>
                      <button onClick={() => saveSiteSettings("memory_vault")} disabled={settingsSaving} className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-50">
                        {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
                      <div>
                        <p className="text-sm font-medium text-foreground">Feature Globally Enabled</p>
                        <p className="text-xs text-muted-foreground">Turn off to disable trip gallery / photo uploads for all users</p>
                      </div>
                      <Switch checked={siteSettings.memory_vault?.feature_enabled ?? true} onCheckedChange={v => updatePageSetting("memory_vault", "feature_enabled", v)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Free Plan Storage Limit (MB)</Label>
                        <Input type="number" className="mt-1" value={siteSettings.memory_vault?.storage_limit_free_mb || 1024} onChange={e => updatePageSetting("memory_vault", "storage_limit_free_mb", +e.target.value)} />
                        <p className="text-xs text-muted-foreground mt-1">1024 MB = 1 GB</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Premium Plan Storage Limit (MB)</Label>
                        <Input type="number" className="mt-1" value={siteSettings.memory_vault?.storage_limit_premium_mb || 40960} onChange={e => updatePageSetting("memory_vault", "storage_limit_premium_mb", +e.target.value)} />
                        <p className="text-xs text-muted-foreground mt-1">40960 MB = 40 GB</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── CONTACT CONTROLS ── */}
                {activePageControl === "contact" && (
                  <div className="glass-card rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Phone className="w-5 h-5 text-primary" /> Contact & Support Page</h2>
                      <button onClick={() => saveSiteSettings("contact")} disabled={settingsSaving} className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-50">
                        {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
                      <div>
                        <p className="text-sm font-medium text-foreground">WhatsApp Support Enabled</p>
                        <p className="text-xs text-muted-foreground">Show WhatsApp contact button</p>
                      </div>
                      <Switch checked={siteSettings.contact?.whatsapp_enabled ?? true} onCheckedChange={v => updatePageSetting("contact", "whatsapp_enabled", v)} />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">WhatsApp Number</Label>
                      <Input className="mt-1" placeholder="+91 9876543210" value={siteSettings.contact?.whatsapp_number || ""} onChange={e => updatePageSetting("contact", "whatsapp_number", e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Support Email Address</Label>
                      <Input className="mt-1" type="email" value={siteSettings.contact?.email_address || ""} onChange={e => updatePageSetting("contact", "email_address", e.target.value)} />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
                      <div>
                        <p className="text-sm font-medium text-foreground">FAQs Section Enabled</p>
                        <p className="text-xs text-muted-foreground">Show FAQ accordion on contact page</p>
                      </div>
                      <Switch checked={siteSettings.contact?.faqs_enabled ?? true} onCheckedChange={v => updatePageSetting("contact", "faqs_enabled", v)} />
                    </div>
                  </div>
                )}

                {/* ── LEGAL CONTROLS ── */}
                {activePageControl === "legal" && (
                  <div className="glass-card rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><ScrollText className="w-5 h-5 text-primary" /> Legal Pages</h2>
                      <button onClick={() => saveSiteSettings("legal")} disabled={settingsSaving} className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-50">
                        {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                      </button>
                    </div>
                    {[
                      { key: "terms_enabled", label: "Terms of Service Page", desc: "Enable the Terms & Conditions page" },
                      { key: "privacy_enabled", label: "Privacy Policy Page", desc: "Enable the Privacy Policy page" },
                      { key: "refund_enabled", label: "Refund Policy Page", desc: "Enable the Refund Policy page" },
                    ].map(toggle => (
                      <div key={toggle.key} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
                        <div>
                          <p className="text-sm font-medium text-foreground">{toggle.label}</p>
                          <p className="text-xs text-muted-foreground">{toggle.desc}</p>
                        </div>
                        <Switch checked={siteSettings.legal?.[toggle.key] ?? true} onCheckedChange={v => updatePageSetting("legal", toggle.key, v)} />
                      </div>
                    ))}
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                      ⚠️ Content updates to legal pages require approval. Use the Itineraries editor to manage structured content.
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Admin;
