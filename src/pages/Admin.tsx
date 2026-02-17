import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, EyeOff, LogOut, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

interface Itinerary {
  id: string;
  destination: string;
  title: string;
  content: any;
  is_published: boolean;
  created_at: string;
}

const Admin = () => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Itinerary | null>(null);
  const [form, setForm] = useState({ destination: "", title: "", rawText: "" });
  const [parsing, setParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      toast({ title: "Access denied", description: "You need admin privileges.", variant: "destructive" });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchItineraries();
  };

  const [paidTrips, setPaidTrips] = useState<any[]>([]);

  const fetchItineraries = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("itineraries")
      .select("*")
      .order("created_at", { ascending: false });
    setItineraries(data || []);

    // Fetch paid itineraries for admin review
    const { data: paid } = await supabase
      .from("saved_itineraries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setPaidTrips(paid || []);

    setLoading(false);
  };

  const handleParseText = async () => {
    if (!form.rawText.trim()) {
      toast({ title: "Please paste itinerary text first", variant: "destructive" });
      return;
    }

    setParsing(true);
    setParsedPreview(null);

    try {
      const { data, error } = await supabase.functions.invoke("parse-itinerary", {
        body: { rawText: form.rawText },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setParsedPreview(data.data);
      toast({ title: "✨ Text parsed successfully!", description: "Review the classified sections below." });
    } catch (err: any) {
      toast({ title: "Parsing failed", description: err.message, variant: "destructive" });
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const contentToSave = parsedPreview || { raw: form.rawText };

    if (editing) {
      await supabase.from("itineraries").update({
        destination: form.destination,
        title: form.title,
        content: contentToSave,
      }).eq("id", editing.id);
      toast({ title: "Updated!" });
    } else {
      await supabase.from("itineraries").insert({
        destination: form.destination,
        title: form.title,
        content: contentToSave,
        created_by: user.id,
      });
      toast({ title: "Created!" });
    }

    setEditing(null);
    setForm({ destination: "", title: "", rawText: "" });
    setParsedPreview(null);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!isAdmin) return null;

  const sectionLabels: Record<string, string> = {
    emotional_hook: "🎭 Emotional Hook",
    local_resident: "🏠 Local Resident",
    vibe: "🌄 Vibe & Atmosphere",
    why_special: "⭐ Why Special",
    must_visit_places: "📍 Must-Visit Places",
    hidden_gems: "💎 Hidden Gems",
    food_spots: "🍜 Food Spots",
    food_timing_tip: "⏰ Food Timing Tip",
    daily_cost_breakdown: "💰 Daily Cost Breakdown",
    transport_guide: "🚌 Transport Guide",
    transport_warning: "⚠️ Transport Warning",
    best_time_to_visit: "📅 Best Time to Visit",
    ideal_duration: "⏱️ Ideal Duration",
    local_tips: "💡 Local Tips",
    resident_moments: "🌅 Resident Moments",
    sample_itinerary: "📋 Sample Itinerary",
    ending_note: "💭 Ending Note",
  };

  return (
    <div className="min-h-screen bg-background noise-overlay">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground">Admin Dashboard</h1>
            <Button variant="outline" onClick={handleLogout} size="sm" className="border-white/10 hover:bg-white/[0.04]">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>

          {/* Create / Edit Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-6 sm:p-8 mb-8"
          >
            <h2 className="text-xl font-heading font-semibold mb-6 text-foreground">
              {editing ? "Edit Itinerary" : "Create New Itinerary"}
            </h2>
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Destination</Label>
                  <Input
                    placeholder="e.g., Manali"
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    className="bg-secondary/50 border-white/10 focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Title</Label>
                  <Input
                    placeholder="e.g., Manali — A Local's Guide"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="bg-secondary/50 border-white/10 focus:border-primary/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Paste Raw Itinerary Text</Label>
                <Textarea
                  placeholder="Paste your full itinerary content here — the AI will auto-classify it into sections like emotional hook, places, food, costs, tips, etc."
                  value={form.rawText}
                  onChange={(e) => setForm({ ...form, rawText: e.target.value })}
                  className="min-h-[250px] text-sm bg-secondary/50 border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleParseText}
                  disabled={parsing}
                  className="btn-primary text-sm px-6 py-3 flex items-center gap-2 disabled:opacity-50"
                >
                  {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {parsing ? "AI Parsing..." : "Auto-Classify with AI"}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.destination || !form.title}
                  className="btn-outline-glass text-sm px-6 py-3 flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> {editing ? "Update" : "Save Itinerary"}
                </button>
                {editing && (
                  <Button variant="outline" className="border-white/10" onClick={() => { setEditing(null); setForm({ destination: "", title: "", rawText: "" }); setParsedPreview(null); }}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Parsed Preview */}
          {parsedPreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-6 sm:p-8 mb-8 glow-primary"
            >
              <h2 className="text-xl font-heading font-semibold mb-6 text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> AI-Classified Preview
              </h2>
              <div className="space-y-4">
                {Object.entries(parsedPreview).map(([key, value]) => {
                  if (!value || (Array.isArray(value) && value.length === 0) || value === "") return null;
                  return (
                    <div key={key} className="rounded-2xl bg-secondary/30 border border-white/[0.06] p-4">
                      <h3 className="text-sm font-semibold text-primary mb-2">
                        {sectionLabels[key] || key}
                      </h3>
                      <div className="text-sm text-foreground/80">
                        {typeof value === "string" ? (
                          <p className="leading-relaxed">{value}</p>
                        ) : Array.isArray(value) ? (
                          <ul className="space-y-1">
                            {value.map((item: any, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary/60">•</span>
                                <span>{typeof item === "string" ? item : JSON.stringify(item)}</span>
                              </li>
                            ))}
                          </ul>
                        ) : typeof value === "object" ? (
                          <pre className="text-xs overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Paid Itineraries (Admin Review) */}
          {paidTrips.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-heading font-semibold mb-4 text-foreground flex items-center gap-2">
                💰 Paid Itineraries (User Generated)
              </h2>
              <div className="space-y-3">
                {paidTrips.map((trip) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="warm-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-heading font-semibold text-foreground">{trip.destination}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                          {trip.status}
                        </span>
                        {trip.regenerate_count > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            Regen x{trip.regenerate_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(trip.created_at).toLocaleDateString()} · 
                        {trip.preferences?.numPeople} people · 
                        Budget: ₹{trip.preferences?.budgetMin || 0} – ₹{trip.preferences?.budgetMax || "flexible"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const itData = trip.itinerary_data;
                        setForm({
                          destination: trip.destination,
                          title: itData?.cover_title || `Paid: ${trip.destination}`,
                          rawText: JSON.stringify(itData, null, 2),
                        });
                        setParsedPreview(itData);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" /> Review & Edit
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Free Itinerary List */}
          <h2 className="text-xl font-heading font-semibold mb-4 text-foreground">📋 Free Itineraries</h2>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : itineraries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No itineraries yet. Create your first one above.</div>
            ) : (
              itineraries.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="warm-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-heading font-semibold text-foreground">{item.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_published ? "bg-primary/15 text-primary border border-primary/20" : "bg-secondary text-muted-foreground"}`}>
                        {item.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.destination}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                      <Switch
                        checked={item.is_published}
                        onCheckedChange={() => togglePublish(item.id, item.is_published)}
                      />
                      {item.is_published ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(item);
                        const content = item.content;
                        setForm({
                          destination: item.destination,
                          title: item.title,
                          rawText: content?.raw || "",
                        });
                        if (content && !content.raw) {
                          setParsedPreview(content);
                        }
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteItinerary(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
