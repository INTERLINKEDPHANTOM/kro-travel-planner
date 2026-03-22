import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, Users, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReferralRewardsProps {
  userId: string;
}

const ReferralRewards = ({ userId }: ReferralRewardsProps) => {
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState("");
  const [usesCount, setUsesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchOrCreate(); }, [userId]);

  const fetchOrCreate = async () => {
    // Try to fetch existing
    const { data } = await supabase
      .from("referral_codes")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setReferralCode(data.code);
      setUsesCount(data.uses_count);
    } else {
      // Generate unique code
      const code = "KRO" + Math.random().toString(36).slice(2, 8).toUpperCase();
      await supabase.from("referral_codes").insert({ user_id: userId, code });
      setReferralCode(code);
      setUsesCount(0);
    }
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({ title: "Copied!", description: "Share this code with friends" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = () => {
    const text = `Join me on KroTravel! Use my referral code ${referralCode} to get 3 free premium days. Plan amazing trips with AI-powered itineraries! 🌍✈️`;
    if (navigator.share) navigator.share({ text });
    else copyCode();
  };

  const rewards = usesCount * 3; // 3 premium days per referral

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-5 rounded-2xl"
    >
      <div className="flex items-center gap-2 mb-3">
        <Gift className="w-5 h-5 text-primary" />
        <h3 className="font-heading text-sm">Referral Rewards</h3>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        Invite friends & earn 3 premium days per referral!
      </p>

      {/* Code display */}
      <div className="flex gap-2 mb-4">
        <Input
          readOnly
          value={loading ? "Loading..." : referralCode}
          className="rounded-xl text-center font-mono tracking-wider bg-primary/5 border-primary/20"
        />
        <Button variant="outline" size="icon" className="rounded-xl shrink-0" onClick={copyCode}>
          {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center glass-panel p-3 rounded-xl">
          <Users className="w-4 h-4 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold">{usesCount}</p>
          <p className="text-[10px] text-muted-foreground">Friends Joined</p>
        </div>
        <div className="text-center glass-panel p-3 rounded-xl">
          <Gift className="w-4 h-4 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold">{rewards}</p>
          <p className="text-[10px] text-muted-foreground">Days Earned</p>
        </div>
      </div>

      <Button onClick={shareCode} className="w-full rounded-xl" size="sm">
        <Gift className="w-4 h-4 mr-2" /> Share & Earn
      </Button>
    </motion.div>
  );
};

export default ReferralRewards;
