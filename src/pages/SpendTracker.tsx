import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, Plus, Trash2, Loader2, PieChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const CATEGORIES = [
  { key: "food", label: "Food & Drinks", emoji: "🍜", color: "bg-orange-500" },
  { key: "transport", label: "Transport", emoji: "🚗", color: "bg-blue-500" },
  { key: "stay", label: "Accommodation", emoji: "🏨", color: "bg-purple-500" },
  { key: "shopping", label: "Shopping", emoji: "🛍️", color: "bg-pink-500" },
  { key: "activities", label: "Activities", emoji: "🎯", color: "bg-green-500" },
  { key: "other", label: "Other", emoji: "📦", color: "bg-gray-500" },
];

const formatINR = (n: number) => "₹" + n.toLocaleString("en-IN");

export default function SpendTracker() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<string>("");
  const [budget, setBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ amount: "", category: "food", description: "" });
  const { toast } = useToast();

  useEffect(() => { init(); }, []);
  useEffect(() => { if (selectedTrip) loadExpenses(); }, [selectedTrip]);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from("saved_itineraries").select("id, destination, preferences").eq("user_id", user.id).order("created_at", { ascending: false });
    setTrips(data || []);
    if (data && data.length > 0) {
      setSelectedTrip(data[0].id);
      const prefs = data[0].preferences as any;
      setBudget(prefs?.budget_max || 0);
    }
    setLoading(false);
  };

  const loadExpenses = async () => {
    const { data } = await supabase.from("trip_expenses").select("*").eq("trip_id", selectedTrip).order("expense_date", { ascending: false });
    setExpenses(data || []);
    const trip = trips.find(t => t.id === selectedTrip);
    setBudget((trip?.preferences as any)?.budget_max || 0);
  };

  const addExpense = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !form.amount || !selectedTrip) return;
    await supabase.from("trip_expenses").insert({
      user_id: user.id, trip_id: selectedTrip, amount: parseFloat(form.amount),
      category: form.category, description: form.description
    });
    setForm({ amount: "", category: "food", description: "" });
    toast({ title: "💸 Expense logged!" });
    loadExpenses();
  };

  const deleteExpense = async (id: string) => {
    await supabase.from("trip_expenses").delete().eq("id", id);
    loadExpenses();
  };

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const byCategory = CATEGORIES.map(c => ({
    ...c, total: expenses.filter(e => e.category === c.key).reduce((s, e) => s + Number(e.amount), 0)
  })).filter(c => c.total > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Daily Spend Tracker</h1>
          <p className="text-muted-foreground mt-2">Track expenses by category in real-time</p>
        </motion.div>

        {/* Trip selector */}
        <select value={selectedTrip} onChange={e => setSelectedTrip(e.target.value)}
          className="w-full h-10 rounded-xl border border-border/60 bg-card/40 backdrop-blur-xl px-3 text-sm text-foreground mb-4">
          {trips.map(t => <option key={t.id} value={t.id}>{t.destination}</option>)}
        </select>

        {/* Budget overview */}
        {budget > 0 && (
          <div className="glass-panel p-4 rounded-2xl mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Budget</span>
              <span className="font-semibold text-foreground">{formatINR(totalSpent)} / {formatINR(budget)}</span>
            </div>
            <Progress value={Math.min((totalSpent / budget) * 100, 100)} className="h-3" />
            <p className={`text-xs mt-1 ${totalSpent > budget ? "text-destructive" : "text-muted-foreground"}`}>
              {totalSpent > budget ? `Over budget by ${formatINR(totalSpent - budget)}` : `${formatINR(budget - totalSpent)} remaining`}
            </p>
          </div>
        )}

        {/* Category breakdown */}
        {byCategory.length > 0 && (
          <div className="glass-panel p-4 rounded-2xl mb-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><PieChart className="w-4 h-4" /> By Category</h3>
            {byCategory.map(c => (
              <div key={c.key} className="flex items-center gap-2">
                <span className="text-lg">{c.emoji}</span>
                <span className="text-sm text-muted-foreground flex-1">{c.label}</span>
                <div className="w-20"><Progress value={totalSpent > 0 ? (c.total / totalSpent) * 100 : 0} className="h-2" /></div>
                <span className="text-sm font-medium text-foreground w-20 text-right">{formatINR(c.total)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Add expense */}
        <div className="glass-panel p-4 rounded-2xl mb-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Add Expense</h3>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder="Amount (₹)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="h-10 rounded-xl border border-border/60 bg-card/40 backdrop-blur-xl px-3 text-sm text-foreground">
              {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
            </select>
          </div>
          <Input placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <Button onClick={addExpense} className="w-full" size="sm"><Plus className="w-4 h-4" /> Log Expense</Button>
        </div>

        {/* Expense list */}
        <div className="space-y-2">
          {expenses.map(e => {
            const cat = CATEGORIES.find(c => c.key === e.category);
            return (
              <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="glass-panel p-3 rounded-xl flex items-center gap-3">
                <span className="text-lg">{cat?.emoji || "📦"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{e.description || cat?.label}</p>
                  <p className="text-xs text-muted-foreground">{new Date(e.expense_date).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-bold text-foreground">{formatINR(Number(e.amount))}</span>
                <button onClick={() => deleteExpense(e.id)} className="text-destructive/60 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </motion.div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
