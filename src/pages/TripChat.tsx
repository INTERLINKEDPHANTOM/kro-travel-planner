import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, ArrowLeft, Users, Loader2, Trash2, MapPin, Lock, X, Image as ImageIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

type Message = {
  id: string;
  user_id: string;
  sender_name: string;
  sender_avatar: string | null;
  message: string;
  message_type: string;
  image_url: string | null;
  created_at: string;
};

const TripChat = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [trip, setTrip] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    init();
  }, [tripId]);

  const init = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { navigate(`/auth?redirect=/trip-chat/${tripId}`); return; }
    setUser(u);

    const [{ data: prof }, { data: tripData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", u.id).maybeSingle(),
      supabase.from("saved_itineraries").select("*").eq("id", tripId).maybeSingle(),
    ]);
    setProfile(prof);

    if (!tripData) { setAccessDenied(true); setLoading(false); return; }

    // Check access: must be owner or shared with
    const isOwner = tripData.user_id === u.id;
    let hasAccess = isOwner;
    if (!isOwner) {
      const { data: share } = await supabase.from("shared_trips")
        .select("id").eq("trip_id", tripId!).eq("shared_with_id", u.id).maybeSingle();
      hasAccess = !!share;
    }

    if (!hasAccess) { setAccessDenied(true); setLoading(false); return; }

    setTrip(tripData);

    // Fetch initial messages
    const { data: msgs } = await supabase
      .from("trip_messages")
      .select("*")
      .eq("trip_id", tripId!)
      .order("created_at", { ascending: true })
      .limit(100);
    setMessages((msgs as Message[]) || []);

    // Fetch members (owner + shared users)
    const { data: shared } = await supabase.from("shared_trips").select("*").eq("trip_id", tripId!);
    setMembers([{ user_id: tripData.user_id, label: "Owner" }, ...(shared || []).map((s: any) => ({ user_id: s.shared_with_id, label: "Member", email: s.shared_with_email }))]);

    setLoading(false);

    // Subscribe to realtime
    const channel = supabase
      .channel(`trip-chat-${tripId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "trip_messages",
        filter: `trip_id=eq.${tripId}`,
      }, (payload) => {
        setMessages((prev) => {
          const exists = prev.find(m => m.id === payload.new.id);
          if (exists) return prev;
          return [...prev, payload.new as Message];
        });
      })
      .on("postgres_changes", {
        event: "DELETE",
        schema: "public",
        table: "trip_messages",
        filter: `trip_id=eq.${tripId}`,
      }, (payload) => {
        setMessages((prev) => prev.filter(m => m.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user || !trip) return;
    setSending(true);
    const senderName = profile?.full_name || user.email?.split("@")[0] || "Traveller";

    const { error } = await supabase.from("trip_messages").insert({
      trip_id: tripId!,
      user_id: user.id,
      sender_name: senderName,
      message: input.trim(),
      message_type: "text",
    });

    if (error) {
      toast({ title: "Failed to send", variant: "destructive" });
    } else {
      setInput("");
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const deleteMessage = async (msgId: string) => {
    await supabase.from("trip_messages").delete().eq("id", msgId);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !trip) return;
    setSending(true);
    const path = `chat/${tripId}/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("trip-photos").upload(path, file, { upsert: true });
    if (uploadErr) { toast({ title: "Upload failed", variant: "destructive" }); setSending(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("trip-photos").getPublicUrl(path);
    const senderName = profile?.full_name || user.email?.split("@")[0] || "Traveller";
    await supabase.from("trip_messages").insert({
      trip_id: tripId!,
      user_id: user.id,
      sender_name: senderName,
      message: "📸 Shared a photo",
      message_type: "image",
      image_url: publicUrl,
    });
    setSending(false);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDay = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  // Group messages by day
  const grouped: { day: string; msgs: Message[] }[] = [];
  messages.forEach((m) => {
    const day = formatDay(m.created_at);
    const last = grouped[grouped.length - 1];
    if (last && last.day === day) last.msgs.push(m);
    else grouped.push({ day, msgs: [m] });
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (accessDenied) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <Lock className="w-12 h-12 text-muted-foreground" />
      <h2 className="font-heading text-xl" style={{ color: "hsl(158, 45%, 10%)" }}>Access Denied</h2>
      <p className="text-muted-foreground text-sm text-center">You don't have access to this trip chat.</p>
      <Link to="/my-trips"><button className="btn-primary px-6 py-3">My Trips</button></Link>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(var(--background))" }}>
      <Navbar />

      {/* Members panel */}
      <AnimatePresence>
        {showMembers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowMembers(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="glass-intense rounded-3xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-base" style={{ color: "hsl(158, 45%, 10%)" }}>Chat Members</h3>
                <button onClick={() => setShowMembers(false)} className="w-7 h-7 rounded-full glass-panel flex items-center justify-center">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                {members.map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: "hsla(158, 42%, 38%, 0.15)", color: "hsl(158, 42%, 32%)" }}>
                      {(m.email || "T").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "hsl(158, 38%, 18%)" }}>{m.email || "Owner"}</p>
                      <p className="text-[11px] text-muted-foreground">{m.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Share your trip from My Trips to invite people.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="fixed top-16 sm:top-20 left-0 right-0 z-40 nav-glass border-b"
        style={{ borderColor: "hsla(148, 35%, 78%, 0.30)" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl glass-panel flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: "hsla(158, 42%, 38%, 0.12)" }}>🗺️</div>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-sm truncate" style={{ color: "hsl(158, 45%, 10%)" }}>
              {trip?.destination}
            </p>
            <p className="text-[11px] text-muted-foreground">Trip Chat Room • {messages.length} messages</p>
          </div>
          <button onClick={() => setShowMembers(true)}
            className="w-8 h-8 rounded-xl glass-panel flex items-center justify-center"
            title="View members">
            <Users className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-36 pb-28 sm:pt-40" style={{ maxWidth: "672px", margin: "0 auto", width: "100%" }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="text-4xl">💬</div>
            <p className="font-heading text-base" style={{ color: "hsl(158, 45%, 12%)" }}>No messages yet</p>
            <p className="text-sm text-muted-foreground text-center">Start the conversation! Share your plans, tips, or memories.</p>
          </div>
        )}

        {grouped.map(({ day, msgs }) => (
          <div key={day}>
            <div className="flex items-center justify-center my-4">
              <span className="text-[11px] px-3 py-1 rounded-full text-muted-foreground"
                style={{ background: "hsla(158, 20%, 60%, 0.12)" }}>{day}</span>
            </div>
            {msgs.map((msg) => {
              const isOwn = msg.user_id === user?.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2 mb-3 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 self-end"
                    style={{
                      background: isOwn ? "linear-gradient(135deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))" : "hsla(158, 42%, 38%, 0.15)",
                      color: isOwn ? "white" : "hsl(158, 42%, 32%)"
                    }}>
                    {msg.sender_name.charAt(0).toUpperCase()}
                  </div>

                  <div className={`flex flex-col max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                    {!isOwn && (
                      <p className="text-[10px] text-muted-foreground mb-1 ml-1">{msg.sender_name}</p>
                    )}
                    <div className={`relative rounded-2xl px-4 py-2.5 ${isOwn ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                      style={{
                        background: isOwn
                          ? "linear-gradient(135deg, hsl(158, 42%, 38%), hsl(162, 45%, 28%))"
                          : "hsla(148, 35%, 96%, 0.85)",
                        color: isOwn ? "white" : "hsl(158, 38%, 15%)",
                        boxShadow: "0 2px 8px hsla(158, 20%, 40%, 0.10)",
                        backdropFilter: "blur(8px)",
                      }}>
                      {msg.message_type === "image" && msg.image_url ? (
                        <div>
                          <img src={msg.image_url} alt="shared" className="rounded-xl max-w-[200px] max-h-[200px] object-cover mb-1" />
                          <p className="text-xs opacity-80">{msg.message}</p>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                      )}
                    </div>
                    <div className={`flex items-center gap-1.5 mt-0.5 ${isOwn ? "flex-row-reverse" : ""}`}>
                      <p className="text-[10px] text-muted-foreground">{formatTime(msg.created_at)}</p>
                      {isOwn && (
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 nav-glass border-t"
        style={{ borderColor: "hsla(148, 35%, 78%, 0.30)" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-end gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
            disabled={sending}
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${trip?.destination} chat…`}
              rows={1}
              className="glass-input w-full px-4 py-2.5 text-sm resize-none rounded-2xl pr-12"
              style={{ maxHeight: "120px", overflow: "auto" }}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ background: "linear-gradient(135deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))" }}
          >
            {sending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
          </button>
        </div>
        <div className="pb-safe" />
      </div>
    </div>
  );
};

export default TripChat;
