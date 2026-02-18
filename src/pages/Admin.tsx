import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit, Trash2, Eye, EyeOff, LogOut, Sparkles, Loader2,
  Users, BarChart3, FileText, Tag, Crown, Shield, Star, RefreshCw,
  TrendingUp, ChevronRight, X, Check, AlertCircle, Download, Ban,
  Gift, Calendar, DollarSign, Activity, Search, UserCheck, Clock,
  Settings, Home, MapPin, Lock, CreditCard, Image, Megaphone, Save,
  ToggleLeft, ToggleRight, Globe, Phone, BookOpen, ScrollText,
  Camera, Upload, UserPlus, GripVertical, ArrowUp, ArrowDown,
  ChevronDown, ChevronUp, Pencil, Info
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
interface TeamMember { id: string; name: string; role: string; description: string | null; photo_url: string | null; display_order: number; is_active: boolean; }

type Tab = "dashboard" | "users" | "itineraries" | "promos" | "super_premium" | "team" | "page_controls" | "notifications";

const TABS: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "itineraries", label: "Itineraries", icon: FileText },
  { id: "promos", label: "Promos", icon: Tag },
  { id: "super_premium", label: "Super Premium", icon: Crown },
  { id: "team", label: "Team", icon: Camera },
  { id: "notifications", label: "Notifications", icon: Megaphone },
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
  <div className="glass-panel rounded-2xl p-5 flex items-center gap-4 border border-border/50">
    <div className={`p-3 rounded-xl bg-primary/8 flex-shrink-0 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground truncate">{label}</p>
      {sub && <p className="text-xs text-primary mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ─── main component ─── */
const Admin = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // team management
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberForm, setMemberForm] = useState({ name: "", role: "", description: "", display_order: 0 });
  const [memberPhotoFile, setMemberPhotoFile] = useState<File | null>(null);
  const [memberPhotoPreview, setMemberPhotoPreview] = useState<string | null>(null);
  const [memberSaving, setMemberSaving] = useState(false);
  const [founderPhotoFile, setFounderPhotoFile] = useState<File | null>(null);
  const [founderPhotoPreview, setFounderPhotoPreview] = useState<string | null>(null);
  const [founderPhotoUploading, setFounderPhotoUploading] = useState(false);
  const memberPhotoRef = useRef<HTMLInputElement>(null);
  const founderPhotoRef = useRef<HTMLInputElement>(null);

  // destination photos (for free itineraries)
  const [destPhotoFiles, setDestPhotoFiles] = useState<File[]>([]);
  const [destPhotoPreviews, setDestPhotoPreviews] = useState<string[]>([]);
  const [destPhotoUploading, setDestPhotoUploading] = useState(false);
  const [existingDestPhotos, setExistingDestPhotos] = useState<string[]>([]);
  const destPhotoRef = useRef<HTMLInputElement>(null);

  const handleDestPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowed = 12 - destPhotoFiles.length - existingDestPhotos.length;
    const toAdd = files.slice(0, Math.max(0, allowed));
    setDestPhotoFiles(prev => [...prev, ...toAdd]);
    toAdd.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setDestPhotoPreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeDestPhoto = (idx: number) => {
    setDestPhotoFiles(prev => prev.filter((_, i) => i !== idx));
    setDestPhotoPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingDestPhoto = (url: string) => {
    setExistingDestPhotos(prev => prev.filter(u => u !== url));
  };

  const loadExistingDestPhotos = async (itineraryId: string) => {
    const { data } = await supabase.from("itineraries").select("content").eq("id", itineraryId).single();
    if (data?.content && typeof data.content === "object") {
      const content = data.content as any;
      setExistingDestPhotos(content.gallery_images || []);
    } else {
      setExistingDestPhotos([]);
    }
  };

  const uploadDestPhotos = async (itineraryId: string): Promise<string[]> => {
    const urls: string[] = [...existingDestPhotos];
    for (const file of destPhotoFiles) {
      const ext = file.name.split(".").pop();
      const path = `destination-gallery/${itineraryId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("trip-photos").upload(path, file, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from("trip-photos").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  // broadcast notifications
  type BroadcastNotif = { id: string; title: string; message: string; image_url: string | null; type: string; is_active: boolean; created_at: string; expires_at: string | null; };
  const [broadcasts, setBroadcasts] = useState<BroadcastNotif[]>([]);
  const [broadcastForm, setBroadcastForm] = useState({ title: "", message: "", image_url: "", type: "announcement", expires_at: "" });
  const [broadcastImageFile, setBroadcastImageFile] = useState<File | null>(null);
  const [broadcastImagePreview, setBroadcastImagePreview] = useState<string | null>(null);
  const [broadcastSaving, setBroadcastSaving] = useState(false);
  const broadcastImageRef = useRef<HTMLInputElement>(null);

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
    await Promise.all([fetchDashboardStats(), fetchItineraries(), fetchUsers(), fetchPromos(), fetchSuperPremium(), fetchSiteSettings(), fetchTeamMembers(), fetchBroadcasts()]);
    setLoading(false);
  }, []);

  /* ── realtime live updates ── */
  const [liveActivity, setLiveActivity] = useState<{ text: string; time: Date }[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    const addActivity = (text: string) => {
      setLiveActivity(prev => [{ text, time: new Date() }, ...prev].slice(0, 20));
    };

    const channel = supabase
      .channel("admin-realtime-all")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, (payload) => {
        addActivity(`🧑 New user signed up${payload.new?.full_name ? `: ${payload.new.full_name}` : ""}`);
        fetchDashboardStats();
        fetchUsers();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "saved_itineraries" }, (payload) => {
        addActivity(`✈️ New trip planned: ${payload.new?.destination || "Unknown"}`);
        fetchDashboardStats();
        fetchItineraries();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "saved_itineraries" }, () => {
        fetchDashboardStats();
        fetchItineraries();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "promo_code_uses" }, (payload) => {
        addActivity(`🎟️ Promo code used`);
        fetchPromos();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ai_usage_logs" }, (payload) => {
        addActivity(`🤖 AI used: ${payload.new?.usage_type || "itinerary"} – ${payload.new?.destination || ""}`);
        fetchDashboardStats();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "broadcast_notifications" }, () => {
        fetchBroadcasts();
      })
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
      setIsLive(false);
    };
  }, [isAdmin]);

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
    setDestPhotoUploading(true);
    try {
      let galleryImages: string[] = [];
      const contentToSave = parsedPreview || { raw: form.rawText };
      
      if (editing) {
        // Upload new photos + keep existing
        galleryImages = await uploadDestPhotos(editing.id);
        await supabase.from("itineraries").update({
          destination: form.destination,
          title: form.title,
          content: { ...contentToSave, gallery_images: galleryImages },
        }).eq("id", editing.id);
        toast({ title: "Updated!" });
      } else {
        // Insert first, then upload photos with the new id
        const { data: newRow, error } = await supabase.from("itineraries").insert({
          destination: form.destination,
          title: form.title,
          content: contentToSave,
          created_by: user.id,
        }).select("id").single();
        if (error) throw error;
        if (newRow) {
          galleryImages = await uploadDestPhotos(newRow.id);
          if (galleryImages.length > 0) {
            await supabase.from("itineraries").update({ content: { ...contentToSave, gallery_images: galleryImages } }).eq("id", newRow.id);
          }
        }
        toast({ title: "Created!" });
      }
      setEditing(null);
      setForm({ destination: "", title: "", rawText: "" });
      setParsedPreview(null);
      setDestPhotoFiles([]);
      setDestPhotoPreviews([]);
      setExistingDestPhotos([]);
      fetchItineraries();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setDestPhotoUploading(false);
    }
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

  /* ── broadcast notifications ── */
  const fetchBroadcasts = async () => {
    const { data } = await supabase.from("broadcast_notifications").select("*").order("created_at", { ascending: false });
    setBroadcasts((data as any) || []);
  };

  const handleBroadcastImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBroadcastImageFile(file);
    setBroadcastImagePreview(URL.createObjectURL(file));
  };

  const createBroadcast = async () => {
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      toast({ title: "Title and message required", variant: "destructive" }); return;
    }
    setBroadcastSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let imageUrl = broadcastForm.image_url || null;

      if (broadcastImageFile) {
        const ext = broadcastImageFile.name.split(".").pop();
        const path = `broadcast-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("team-photos").upload(path, broadcastImageFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("team-photos").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("broadcast_notifications").insert({
        title: broadcastForm.title.trim(),
        message: broadcastForm.message.trim(),
        image_url: imageUrl,
        type: broadcastForm.type,
        expires_at: broadcastForm.expires_at || null,
        created_by: user?.id,
      });
      if (error) throw error;
      toast({ title: "📣 Notification sent to all users!" });
      setBroadcastForm({ title: "", message: "", image_url: "", type: "announcement", expires_at: "" });
      setBroadcastImageFile(null);
      setBroadcastImagePreview(null);
      fetchBroadcasts();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setBroadcastSaving(false);
  };

  const toggleBroadcast = async (id: string, current: boolean) => {
    await supabase.from("broadcast_notifications").update({ is_active: !current }).eq("id", id);
    fetchBroadcasts();
  };

  const deleteBroadcast = async (id: string) => {
    await supabase.from("broadcast_notifications").delete().eq("id", id);
    fetchBroadcasts();
    toast({ title: "Deleted" });
  };

  /* ── team members ── */
  const fetchTeamMembers = async () => {
    setTeamLoading(true);
    const { data } = await supabase.from("team_members").select("*").order("display_order", { ascending: true });
    setTeamMembers(data || []);
    setTeamLoading(false);
  };

  const openNewMember = () => {
    setEditingMember(null);
    setMemberForm({ name: "", role: "", description: "", display_order: teamMembers.length });
    setMemberPhotoFile(null);
    setMemberPhotoPreview(null);
  };

  const openEditMember = (m: TeamMember) => {
    setEditingMember(m);
    setMemberForm({ name: m.name, role: m.role, description: m.description || "", display_order: m.display_order });
    setMemberPhotoFile(null);
    setMemberPhotoPreview(m.photo_url);
  };

  const handleMemberPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMemberPhotoFile(file);
    setMemberPhotoPreview(URL.createObjectURL(file));
  };

  const saveMember = async () => {
    if (!memberForm.name.trim() || !memberForm.role.trim()) {
      toast({ title: "Name and role are required", variant: "destructive" }); return;
    }
    setMemberSaving(true);
    try {
      let photoUrl = editingMember?.photo_url || null;
      if (memberPhotoFile) {
        const ext = memberPhotoFile.name.split(".").pop();
        const path = `member-${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("team-photos").upload(path, memberPhotoFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("team-photos").getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }

      if (editingMember) {
        await supabase.from("team_members").update({ name: memberForm.name, role: memberForm.role, description: memberForm.description || null, display_order: memberForm.display_order, photo_url: photoUrl }).eq("id", editingMember.id);
        toast({ title: "✅ Member updated!" });
      } else {
        await supabase.from("team_members").insert({ name: memberForm.name, role: memberForm.role, description: memberForm.description || null, display_order: memberForm.display_order, photo_url: photoUrl });
        toast({ title: "✅ Team member added!" });
      }
      setEditingMember(null);
      fetchTeamMembers();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setMemberSaving(false);
  };

  const deleteMember = async (id: string) => {
    await supabase.from("team_members").delete().eq("id", id);
    toast({ title: "Deleted" });
    fetchTeamMembers();
  };

  const toggleMemberActive = async (id: string, current: boolean) => {
    await supabase.from("team_members").update({ is_active: !current }).eq("id", id);
    fetchTeamMembers();
  };

  const handleFounderPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFounderPhotoFile(file);
    setFounderPhotoPreview(URL.createObjectURL(file));
  };

  const uploadFounderPhoto = async () => {
    if (!founderPhotoFile) return;
    setFounderPhotoUploading(true);
    try {
      const ext = founderPhotoFile.name.split(".").pop();
      const path = `founder-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("team-photos").upload(path, founderPhotoFile, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("team-photos").getPublicUrl(path);
      updatePageSetting("founder", "photo_url", data.publicUrl);
      toast({ title: "✅ Photo uploaded! Save settings to apply." });
    } catch (err: any) { toast({ title: "Upload failed", description: err.message, variant: "destructive" }); }
    setFounderPhotoUploading(false);
  };

  if (!isAdmin) return null;

  /* ══════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-background noise-overlay">
      <Navbar />

      <div className="pt-20 pb-16">
        {/* ── Professional Header ── */}
        <div className="border-b border-border/50 bg-card/60 backdrop-blur-sm sticky top-[72px] z-30">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground leading-tight">Admin Panel</h1>
                  <p className="text-xs text-muted-foreground">KroTravel Control Center</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border transition-all ${
                  isLive
                    ? "text-primary bg-primary/8 border-primary/20"
                    : "text-muted-foreground bg-muted/30 border-border/30"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
                  {isLive ? "Live" : "Connecting…"}
                </span>
                <Button variant="outline" onClick={handleLogout} size="sm" className="border-border hover:bg-muted text-xs">
                  <LogOut className="w-3.5 h-3.5 mr-1.5" /> Logout
                </Button>
              </div>
            </div>

            {/* ── Tab Nav ── */}
            <div className="flex gap-0.5 overflow-x-auto pb-0 scrollbar-hide -mx-1 px-1">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-all duration-200 relative
                      ${active
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {tab.id === "super_premium" && stats.superPremiumCount > 0 && (
                      <span className="bg-primary/15 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">{stats.superPremiumCount}</span>
                    )}
                    {tab.id === "team" && teamMembers.length > 0 && (
                      <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full">{teamMembers.length}</span>
                    )}
                  </button>
                );
              })}
            </div>
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

                {/* Live Activity Feed */}
                <div className="mt-6 glass-card rounded-2xl p-5 border border-primary/10">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Live Activity Feed
                    <span className={`ml-auto inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${isLive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
                      {isLive ? "Watching live" : "Connecting…"}
                    </span>
                  </h3>
                  {liveActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Waiting for activity… New user registrations, trip plans, and AI usage will appear here in real-time.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      <AnimatePresence>
                        {liveActivity.map((item, i) => (
                          <motion.div
                            key={`${item.time.getTime()}-${i}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-start justify-between gap-3 bg-muted/30 rounded-lg px-3 py-2"
                          >
                            <p className="text-sm text-foreground">{item.text}</p>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                              {item.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
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
                  
                  {/* Destination Gallery Photos */}
                  <div className="mb-4 p-4 rounded-2xl border border-dashed border-border/60 bg-muted/20">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <Label className="text-sm font-semibold">Destination Gallery</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Upload 10–12 photos for this destination's gallery (shown on free itinerary page)</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => destPhotoRef.current?.click()}
                        disabled={(destPhotoFiles.length + existingDestPhotos.length) >= 12}
                        className="text-xs btn-primary px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-40"
                      >
                        <Upload className="w-3.5 h-3.5" /> Add Photos
                      </button>
                      <input ref={destPhotoRef} type="file" multiple accept="image/*" className="hidden" onChange={handleDestPhotoSelect} />
                    </div>
                    
                    {(existingDestPhotos.length > 0 || destPhotoPreviews.length > 0) ? (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {existingDestPhotos.map((url, i) => (
                          <div key={`existing-${i}`} className="relative aspect-square rounded-xl overflow-hidden ring-1 ring-primary/30">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={() => removeExistingDestPhoto(url)}
                              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center hover:bg-destructive transition-colors"
                            >
                              <X className="w-2.5 h-2.5 text-white" />
                            </button>
                          </div>
                        ))}
                        {destPhotoPreviews.map((src, i) => (
                          <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden ring-2 ring-primary/60">
                            <img src={src} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={() => removeDestPhoto(i)}
                              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center hover:bg-destructive transition-colors"
                            >
                              <X className="w-2.5 h-2.5 text-white" />
                            </button>
                            <div className="absolute bottom-0.5 left-0.5 bg-primary rounded-md px-1 py-0.5">
                              <span className="text-white text-[8px] font-bold">NEW</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Image className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs">No photos added yet. Upload up to 12 images.</p>
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-2 text-right">
                      {destPhotoFiles.length + existingDestPhotos.length} / 12 photos
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button onClick={handleParseText} disabled={parsing} className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 disabled:opacity-50">
                      {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {parsing ? "Parsing…" : "Auto-Classify with AI"}
                    </button>
                    <button onClick={handleSave} disabled={!form.destination || !form.title || destPhotoUploading} className="btn-outline-glass text-sm px-5 py-2.5 flex items-center gap-2 disabled:opacity-50">
                      {destPhotoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {destPhotoUploading ? "Uploading…" : (editing ? "Update" : "Save")}
                    </button>
                    {editing && <Button variant="outline" onClick={() => { setEditing(null); setForm({ destination: "", title: "", rawText: "" }); setParsedPreview(null); setDestPhotoFiles([]); setDestPhotoPreviews([]); setExistingDestPhotos([]); }}>Cancel</Button>}
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
                            <Button variant="outline" size="sm" onClick={() => { setEditing(item); setForm({ destination: item.destination, title: item.title, rawText: (item.content as any)?.raw || "" }); if (item.content && !(item.content as any).raw) setParsedPreview(item.content); setDestPhotoFiles([]); setDestPhotoPreviews([]); loadExistingDestPhotos(item.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
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

            {/* ═══ TEAM MANAGEMENT ═══ */}
            {activeTab === "team" && (
              <motion.div key="team" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left: member form */}
                  <div className="lg:col-span-1">
                    <div className="glass-panel rounded-3xl p-6 space-y-4 border border-border/50">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        {editingMember ? <><Pencil className="w-4 h-4 text-primary" /> Edit Member</> : <><UserPlus className="w-4 h-4 text-primary" /> Add Team Member</>}
                      </h3>

                      {/* Photo upload */}
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer border-2 border-dashed border-border hover:border-primary/50 transition-colors"
                          style={{ background: "hsla(158, 42%, 38%, 0.06)" }}
                          onClick={() => memberPhotoRef.current?.click()}
                        >
                          {memberPhotoPreview ? (
                            <img src={memberPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center">
                              <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                              <p className="text-[10px] text-muted-foreground">Upload photo</p>
                            </div>
                          )}
                        </div>
                        <input ref={memberPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleMemberPhotoChange} />
                        <button onClick={() => memberPhotoRef.current?.click()} className="text-xs text-primary hover:underline">
                          {memberPhotoPreview ? "Change photo" : "Upload photo"}
                        </button>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Full Name *</Label>
                        <Input className="mt-1" placeholder="e.g. Arjun Sharma" value={memberForm.name} onChange={e => setMemberForm(f => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Role / Title *</Label>
                        <Input className="mt-1" placeholder="e.g. Co-founder & CTO" value={memberForm.role} onChange={e => setMemberForm(f => ({ ...f, role: e.target.value }))} />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Short Description</Label>
                        <Textarea className="mt-1 text-sm min-h-[80px]" placeholder="Brief bio or what they do at KroTravel..." value={memberForm.description} onChange={e => setMemberForm(f => ({ ...f, description: e.target.value }))} />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Display Order (lower = first)</Label>
                        <Input type="number" className="mt-1" value={memberForm.display_order} onChange={e => setMemberForm(f => ({ ...f, display_order: +e.target.value }))} />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button onClick={saveMember} disabled={memberSaving} className="btn-primary text-sm px-4 py-2 flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                          {memberSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          {editingMember ? "Update" : "Add Member"}
                        </button>
                        {editingMember && (
                          <button onClick={openNewMember} className="btn-ghost-glass text-sm px-3 py-2">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Founder photo uploader */}
                    <div className="glass-panel rounded-3xl p-6 space-y-4 border border-border/50 mt-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Camera className="w-4 h-4 text-primary" /> Founder Photo
                      </h3>
                      <p className="text-xs text-muted-foreground">Upload a photo that will appear on the Founder page. After upload, go to Page Controls → Founder to save.</p>
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-32 h-32 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer border-2 border-dashed border-border hover:border-primary/50 transition-colors"
                          style={{ background: "hsla(158, 42%, 38%, 0.06)" }}
                          onClick={() => founderPhotoRef.current?.click()}
                        >
                          {founderPhotoPreview ? (
                            <img src={founderPhotoPreview} alt="Founder" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-3">
                              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                              <p className="text-[10px] text-muted-foreground">Click to upload</p>
                            </div>
                          )}
                        </div>
                        <input ref={founderPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleFounderPhotoChange} />
                      </div>
                      {founderPhotoFile && (
                        <button onClick={uploadFounderPhoto} disabled={founderPhotoUploading} className="btn-primary text-sm px-4 py-2 w-full flex items-center justify-center gap-2">
                          {founderPhotoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          Upload & Copy URL
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: team list */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">
                        Team Members <span className="text-muted-foreground text-sm font-normal">({teamMembers.length})</span>
                      </h3>
                      <Button variant="outline" size="sm" onClick={fetchTeamMembers}><RefreshCw className="w-3.5 h-3.5" /></Button>
                    </div>

                    {teamLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : teamMembers.length === 0 ? (
                      <div className="glass-panel rounded-3xl p-10 text-center border border-dashed border-border">
                        <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No team members yet.</p>
                        <p className="text-xs text-muted-foreground mt-1">Add your first team member using the form.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {teamMembers.map((m, i) => (
                          <motion.div
                            key={m.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className={`glass-panel rounded-2xl p-4 flex items-center gap-4 border transition-all ${m.is_active ? "border-border/50" : "border-border/20 opacity-60"}`}
                          >
                            {/* Photo */}
                            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                              style={{ background: "hsla(158, 42%, 38%, 0.10)" }}>
                              {m.photo_url ? (
                                <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" />
                              ) : (
                                <Users className="w-6 h-6 text-primary/40" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-semibold text-foreground truncate">{m.name}</p>
                                {!m.is_active && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Hidden</span>}
                              </div>
                              <p className="text-xs text-primary font-medium">{m.role}</p>
                              {m.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{m.description}</p>}
                            </div>

                            {/* Order badge */}
                            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg flex-shrink-0">#{m.display_order}</div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => toggleMemberActive(m.id, m.is_active)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                title={m.is_active ? "Hide from public" : "Show on public page"}
                              >
                                {m.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => openEditMember(m)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteMember(m.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══ NOTIFICATIONS (Broadcast) ═══ */}
            {activeTab === "notifications" && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Create form */}
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-primary" /> Send Notification to All Users
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Type</Label>
                        <div className="flex gap-2">
                          {["announcement", "offer", "reminder", "alert"].map(t => (
                            <button key={t} onClick={() => setBroadcastForm(f => ({ ...f, type: t }))}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                                broadcastForm.type === t ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Title *</Label>
                        <Input value={broadcastForm.title} onChange={e => setBroadcastForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. New feature launched!" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Message *</Label>
                        <Textarea value={broadcastForm.message} onChange={e => setBroadcastForm(f => ({ ...f, message: e.target.value }))} placeholder="Write your message to all users…" rows={3} />
                      </div>
                      {/* Image upload */}
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Image (optional)</Label>
                        <input ref={broadcastImageRef} type="file" accept="image/*" className="hidden" onChange={handleBroadcastImageChange} />
                        {broadcastImagePreview ? (
                          <div className="relative rounded-xl overflow-hidden h-32 mb-2">
                            <img src={broadcastImagePreview} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => { setBroadcastImageFile(null); setBroadcastImagePreview(null); }}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => broadcastImageRef.current?.click()}
                            className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors text-xs">
                            <Image className="w-5 h-5" /> Upload image
                          </button>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1">Or enter image URL:</p>
                        <Input value={broadcastForm.image_url} onChange={e => setBroadcastForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Expires At (optional)</Label>
                        <Input type="datetime-local" value={broadcastForm.expires_at} onChange={e => setBroadcastForm(f => ({ ...f, expires_at: e.target.value }))} />
                      </div>
                      <Button onClick={createBroadcast} disabled={broadcastSaving} className="w-full">
                        {broadcastSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Megaphone className="w-4 h-4 mr-2" />}
                        Send to All Users
                      </Button>
                    </div>
                  </div>

                  {/* Existing broadcasts */}
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" /> Active Notifications
                      </h3>
                      <Button variant="outline" size="sm" onClick={fetchBroadcasts}><RefreshCw className="w-4 h-4" /></Button>
                    </div>
                    {broadcasts.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground text-sm">
                        <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        No notifications sent yet
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                        {broadcasts.map(b => (
                          <div key={b.id} className={`rounded-xl border p-4 transition-all ${b.is_active ? "border-primary/20 bg-primary/3" : "border-border bg-muted/30 opacity-60"}`}>
                            {b.image_url && (
                              <img src={b.image_url} alt="" className="w-full h-20 object-cover rounded-lg mb-3"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            )}
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{b.title}</p>
                                <p className="text-xs text-muted-foreground capitalize">{b.type} · {new Date(b.created_at).toLocaleDateString()}</p>
                              </div>
                              <div className="flex gap-1.5 flex-shrink-0">
                                <button onClick={() => toggleBroadcast(b.id, b.is_active)}
                                  className={`text-xs px-2 py-1 rounded-lg transition-colors ${b.is_active ? "bg-primary/10 text-primary hover:bg-destructive/10 hover:text-destructive" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}>
                                  {b.is_active ? "Deactivate" : "Activate"}
                                </button>
                                <button onClick={() => deleteBroadcast(b.id)} className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{b.message}</p>
                            {b.expires_at && <p className="text-[10px] text-muted-foreground mt-1">Expires: {new Date(b.expires_at).toLocaleString()}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══ PAGE CONTROLS ═══ */}
            {activeTab === "page_controls" && (
              <motion.div key="page_controls" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex gap-3 mb-6 flex-wrap">
                  {[
                    { key: "home", label: "🏠 Home", Icon: Home },
                    { key: "about", label: "🧭 About", Icon: Info },
                    { key: "founder", label: "👤 Founder", Icon: Users },
                    { key: "plan_trip", label: "🗺️ Plan Trip", Icon: MapPin },
                    { key: "auth", label: "🔒 Auth", Icon: Lock },
                    { key: "plan_selection", label: "💳 Plans", Icon: CreditCard },
                    { key: "free_itinerary", label: "📄 Free Itin.", Icon: FileText },
                    { key: "paid_itinerary", label: "⭐ Paid Itin.", Icon: Star },
                    { key: "memory_vault", label: "🖼️ Memory Vault", Icon: Image },
                    { key: "contact", label: "📞 Contact", Icon: Phone },
                    { key: "legal", label: "📜 Legal", Icon: ScrollText },
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

                {/* ── ABOUT PAGE CONTROLS ── */}
                {activePageControl === "about" && (
                  <div className="glass-panel rounded-3xl p-6 space-y-4 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Info className="w-5 h-5 text-primary" /> About Page</h2>
                      <button onClick={() => saveSiteSettings("about")} disabled={settingsSaving} className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-50">
                        {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                      </button>
                    </div>
                    <div><Label className="text-xs text-muted-foreground">Main Headline</Label><Input className="mt-1" value={siteSettings.about?.headline || ""} onChange={e => updatePageSetting("about", "headline", e.target.value)} /></div>
                    <div><Label className="text-xs text-muted-foreground">Sub Headline</Label><Textarea className="mt-1 text-sm min-h-[70px]" value={siteSettings.about?.sub_headline || ""} onChange={e => updatePageSetting("about", "sub_headline", e.target.value)} /></div>
                    <div><Label className="text-xs text-muted-foreground">Mission Statement</Label><Textarea className="mt-1 text-sm min-h-[70px]" value={siteSettings.about?.mission || ""} onChange={e => updatePageSetting("about", "mission", e.target.value)} /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><Label className="text-xs text-muted-foreground">Trips Planned Stat</Label><Input className="mt-1" value={siteSettings.about?.trips_planned || ""} onChange={e => updatePageSetting("about", "trips_planned", e.target.value)} /></div>
                      <div><Label className="text-xs text-muted-foreground">Cities Covered</Label><Input className="mt-1" value={siteSettings.about?.cities_covered || ""} onChange={e => updatePageSetting("about", "cities_covered", e.target.value)} /></div>
                      <div><Label className="text-xs text-muted-foreground">Avg Rating</Label><Input className="mt-1" value={siteSettings.about?.avg_rating || ""} onChange={e => updatePageSetting("about", "avg_rating", e.target.value)} /></div>
                    </div>
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                      💡 Manage your team members (photos, roles, bios) from the <strong>Team</strong> tab. They automatically appear on the About page.
                    </div>
                  </div>
                )}

                {/* ── FOUNDER PAGE CONTROLS ── */}
                {activePageControl === "founder" && (
                  <div className="glass-panel rounded-3xl p-6 space-y-4 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Founder Page</h2>
                      <button onClick={() => saveSiteSettings("founder")} disabled={settingsSaving} className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-50">
                        {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                      </button>
                    </div>
                    <div><Label className="text-xs text-muted-foreground">Founder Name</Label><Input className="mt-1" placeholder="e.g. Rahul Sharma" value={siteSettings.founder?.name || ""} onChange={e => updatePageSetting("founder", "name", e.target.value)} /></div>
                    <div><Label className="text-xs text-muted-foreground">Title / Role</Label><Input className="mt-1" placeholder="e.g. Founder & CEO, KroTravel" value={siteSettings.founder?.title || ""} onChange={e => updatePageSetting("founder", "title", e.target.value)} /></div>
                    <div><Label className="text-xs text-muted-foreground">Tagline / Quote</Label><Textarea className="mt-1 text-sm min-h-[80px]" placeholder="A short personal quote..." value={siteSettings.founder?.tagline || ""} onChange={e => updatePageSetting("founder", "tagline", e.target.value)} /></div>
                    <div><Label className="text-xs text-muted-foreground">Vision Statement</Label><Textarea className="mt-1 text-sm min-h-[70px]" value={siteSettings.founder?.vision || ""} onChange={e => updatePageSetting("founder", "vision", e.target.value)} /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div><Label className="text-xs text-muted-foreground">Twitter URL</Label><Input className="mt-1" placeholder="https://twitter.com/..." value={siteSettings.founder?.twitter_url || ""} onChange={e => updatePageSetting("founder", "twitter_url", e.target.value)} /></div>
                      <div><Label className="text-xs text-muted-foreground">Instagram URL</Label><Input className="mt-1" placeholder="https://instagram.com/..." value={siteSettings.founder?.instagram_url || ""} onChange={e => updatePageSetting("founder", "instagram_url", e.target.value)} /></div>
                      <div><Label className="text-xs text-muted-foreground">LinkedIn URL</Label><Input className="mt-1" placeholder="https://linkedin.com/in/..." value={siteSettings.founder?.linkedin_url || ""} onChange={e => updatePageSetting("founder", "linkedin_url", e.target.value)} /></div>
                    </div>
                    {siteSettings.founder?.photo_url && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                        <img src={siteSettings.founder.photo_url} alt="Founder" className="w-12 h-12 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">Founder photo set</p>
                          <p className="text-xs text-muted-foreground truncate">{siteSettings.founder.photo_url}</p>
                        </div>
                        <button onClick={() => updatePageSetting("founder", "photo_url", "")} className="text-destructive hover:text-destructive/80 text-xs">Remove</button>
                      </div>
                    )}
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                      💡 Upload the founder photo from the <strong>Team</strong> tab, then paste the URL here, or it'll be auto-filled after upload.
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
