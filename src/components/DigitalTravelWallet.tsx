import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, ChevronDown, ChevronUp, Plus, Trash2, FileText, Ticket, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DOC_TYPES = [
  { key: "booking", label: "Hotel Booking", emoji: "🏨", icon: FileText },
  { key: "flight", label: "Flight Ticket", emoji: "✈️", icon: Ticket },
  { key: "train", label: "Train Ticket", emoji: "🚂", icon: Ticket },
  { key: "id", label: "ID / Passport", emoji: "🪪", icon: CreditCard },
  { key: "insurance", label: "Travel Insurance", emoji: "🛡️", icon: FileText },
  { key: "visa", label: "Visa", emoji: "📋", icon: FileText },
  { key: "other", label: "Other Document", emoji: "📄", icon: FileText },
];

interface Props { tripId?: string; }

export default function DigitalTravelWallet({ tripId }: Props) {
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ type: "booking", label: "", reference: "" });
  const { toast } = useToast();

  useEffect(() => { if (open) loadDocs(); }, [open]);

  const loadDocs = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Store wallet docs as trip_photos with a special place_name prefix
    const query = supabase.from("trip_photos").select("*").eq("user_id", user.id)
      .like("place_name", "wallet:%").order("created_at", { ascending: false });
    if (tripId) query.eq("trip_id", tripId);

    const { data } = await query;
    setDocs(data || []);
    setLoading(false);
  };

  const addDoc = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !form.label) { toast({ title: "Enter a document label", variant: "destructive" }); return; }
    setUploading(true);

    const docType = DOC_TYPES.find(d => d.key === form.type);
    await supabase.from("trip_photos").insert({
      user_id: user.id,
      trip_id: tripId || null,
      storage_path: `wallet-doc-${Date.now()}`,
      place_name: `wallet:${form.type}:${form.label}`,
      caption: form.reference || null,
    });

    toast({ title: `${docType?.emoji} ${form.label} added to wallet` });
    setForm({ type: "booking", label: "", reference: "" });
    setUploading(false);
    loadDocs();
  };

  const removeDoc = async (id: string) => {
    await supabase.from("trip_photos").delete().eq("id", id);
    loadDocs();
  };

  const parseDoc = (doc: any) => {
    const parts = (doc.place_name || "").replace("wallet:", "").split(":");
    const type = parts[0] || "other";
    const label = parts.slice(1).join(":") || "Document";
    const docType = DOC_TYPES.find(d => d.key === type) || DOC_TYPES[6];
    return { type, label, docType, reference: doc.caption };
  };

  return (
    <motion.div className="glass-panel p-4 rounded-2xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-400/20 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Digital Travel Wallet</h3>
            <p className="text-xs text-muted-foreground">{docs.length} documents stored</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 space-y-3">
            {/* Add doc form */}
            <div className="glass-panel p-3 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-foreground">Add Document</p>
              <div className="grid grid-cols-2 gap-2">
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="h-9 rounded-lg border border-border/60 bg-card/40 backdrop-blur-xl px-2 text-xs text-foreground">
                  {DOC_TYPES.map(d => <option key={d.key} value={d.key}>{d.emoji} {d.label}</option>)}
                </select>
                <Input placeholder="Label (e.g. Taj Hotel)" value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="h-9 text-xs" />
              </div>
              <Input placeholder="Reference # / PNR (optional)" value={form.reference}
                onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} className="h-9 text-xs" />
              <Button onClick={addDoc} disabled={uploading} size="sm" className="w-full h-8 text-xs">
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Plus className="w-3 h-3" /> Save to Wallet</>}
              </Button>
            </div>

            {/* Document list */}
            {loading ? (
              <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></div>
            ) : docs.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-4">No documents yet. Add your bookings & tickets above.</p>
            ) : (
              docs.map(doc => {
                const { label, docType, reference } = parseDoc(doc);
                return (
                  <motion.div key={doc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="glass-panel p-3 rounded-xl flex items-center gap-3">
                    <span className="text-lg">{docType.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{docType.label}{reference ? ` • ${reference}` : ""}</p>
                    </div>
                    <button onClick={() => removeDoc(doc.id)} className="text-destructive/50 hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
