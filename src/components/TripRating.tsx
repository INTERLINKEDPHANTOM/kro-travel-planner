import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronDown, ChevronUp, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface Props { tripId: string; destination: string; }

const StarRow = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} onClick={() => onChange(s)} className="transition-transform hover:scale-110">
          <Star className={`w-5 h-5 ${s <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
        </button>
      ))}
    </div>
  </div>
);

export default function TripRating({ tripId, destination }: Props) {
  const [open, setOpen] = useState(false);
  const [existing, setExisting] = useState<any>(null);
  const [form, setForm] = useState({ overall: 0, food: 0, stay: 0, experience: 0, review: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { if (open) load(); }, [open]);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("trip_ratings").select("*").eq("trip_id", tripId).eq("user_id", user.id).maybeSingle();
    if (data) {
      setExisting(data);
      setForm({ overall: data.overall_rating, food: data.food_rating || 0, stay: data.stay_rating || 0, experience: data.experience_rating || 0, review: data.review_text || "" });
    }
  };

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || form.overall === 0) { toast({ title: "Please rate overall", variant: "destructive" }); return; }
    setSaving(true);

    const payload = {
      user_id: user.id, trip_id: tripId, overall_rating: form.overall,
      food_rating: form.food || null, stay_rating: form.stay || null,
      experience_rating: form.experience || null, review_text: form.review || null
    };

    if (existing) {
      await supabase.from("trip_ratings").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("trip_ratings").insert(payload);
    }
    toast({ title: "⭐ Rating saved!" });
    setSaving(false);
    load();
  };

  return (
    <motion.div className="glass-panel p-4 rounded-2xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-400/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Rate This Trip</h3>
            <p className="text-xs text-muted-foreground">{existing ? `Rated ${existing.overall_rating}/5` : "Share your experience"}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 space-y-3">
            <StarRow label="Overall" value={form.overall} onChange={v => setForm(f => ({ ...f, overall: v }))} />
            <StarRow label="Food" value={form.food} onChange={v => setForm(f => ({ ...f, food: v }))} />
            <StarRow label="Stay" value={form.stay} onChange={v => setForm(f => ({ ...f, stay: v }))} />
            <StarRow label="Experience" value={form.experience} onChange={v => setForm(f => ({ ...f, experience: v }))} />
            <textarea value={form.review} onChange={e => setForm(f => ({ ...f, review: e.target.value }))}
              placeholder="Write a short review..." rows={3}
              className="w-full rounded-xl border border-border/60 bg-card/40 backdrop-blur-xl px-3 py-2 text-sm text-foreground resize-none" />
            <Button onClick={save} disabled={saving} className="w-full" size="sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> {existing ? "Update Rating" : "Submit Rating"}</>}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
