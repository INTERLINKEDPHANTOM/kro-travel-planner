import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Wallet, Plane, Utensils, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const travelTypes = [
  { value: "leisure", label: "🏖️ Leisure" },
  { value: "corporate", label: "💼 Corporate" },
  { value: "medical", label: "🏥 Medical" },
  { value: "adventure", label: "🏔️ Adventure" },
  { value: "religious", label: "🕉️ Religious / Spiritual" },
];

const transportModes = [
  { value: "own", label: "🚗 Own Transport" },
  { value: "public", label: "🚌 Public Transport" },
  { value: "bus", label: "🚍 Bus" },
  { value: "train", label: "🚆 Train" },
  { value: "flight", label: "✈️ Flight" },
  { value: "mixed", label: "🔄 Mixed" },
];

const foodPrefs = [
  { value: "vegetarian", label: "🥗 Vegetarian" },
  { value: "non-vegetarian", label: "🍖 Non-Vegetarian" },
  { value: "mixed", label: "🍽️ Mixed" },
];

const PlanTrip = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    departure: "",
    arrival: "",
    departureDate: "",
    arrivalDate: "",
    numPeople: "2",
    budgetMin: "",
    budgetMax: "",
    travelType: "",
    transport: "",
    food: "",
    notes: "",
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("tripPreferences", JSON.stringify(form));
    
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      navigate("/plans");
    } else {
      // Redirect to auth with a return URL
      navigate("/auth?redirect=/plans");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">Plan Your Perfect Trip</h1>
            <p className="text-muted-foreground">Tell us about your trip and we'll craft the perfect plan</p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 sm:p-10 space-y-8"
          >
            {/* Departure / Arrival */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Departure</Label>
                <Input
                  placeholder="e.g., New Delhi"
                  value={form.departure}
                  onChange={(e) => update("departure", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" /> Destination</Label>
                <Input
                  placeholder="e.g., Manali"
                  value={form.arrival}
                  onChange={(e) => update("arrival", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Departure Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={form.departureDate}
                  onChange={(e) => update("departureDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Calendar className="w-4 h-4 text-accent" /> Return Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={form.arrivalDate}
                  onChange={(e) => update("arrivalDate", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* People & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> People</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={form.numPeople}
                  onChange={(e) => update("numPeople", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Wallet className="w-4 h-4 text-accent" /> Min Budget (₹)</Label>
                <Input
                  type="number"
                  placeholder="5,000"
                  value={form.budgetMin}
                  onChange={(e) => update("budgetMin", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Wallet className="w-4 h-4 text-accent" /> Max Budget (₹)</Label>
                <Input
                  type="number"
                  placeholder="20,000"
                  value={form.budgetMax}
                  onChange={(e) => update("budgetMax", e.target.value)}
                />
              </div>
            </div>

            {/* Travel Type, Transport, Food */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Plane className="w-4 h-4 text-primary" /> Travel Type</Label>
                <Select value={form.travelType} onValueChange={(v) => update("travelType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {travelTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Plane className="w-4 h-4 text-primary" /> Transport</Label>
                <Select value={form.transport} onValueChange={(v) => update("transport", v)}>
                  <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                  <SelectContent>
                    {transportModes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Utensils className="w-4 h-4 text-accent" /> Food</Label>
                <Select value={form.food} onValueChange={(v) => update("food", v)}>
                  <SelectTrigger><SelectValue placeholder="Preference" /></SelectTrigger>
                  <SelectContent>
                    {foodPrefs.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Special Notes */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Special Requirements</Label>
              <Textarea
                placeholder="Traveling with children, elderly, pets, medical conditions, specific comfort needs..."
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 rounded-xl text-base group">
              Continue to Plan Selection
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PlanTrip;
