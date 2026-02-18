import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Users, Loader2, Trash2, X, Image as ImageIcon, MessageCircle,
  UserPlus, ChevronDown, Bell
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: string;
  user_id: string;
  sender_name: string;
  message: string;
  message_type: string;
  image_url: string | null;
  created_at: string;
};

interface TripChatPanelProps {
  tripId: string;
  destination: string;
}

const TripChatPanel = ({ tripId, destination }: TripChatPanelProps) => {
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    init();
  }, [tripId]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      setUnreadCount(c => c + 1);
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const init = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { setLoading(false); return; }
    setUser(u);

    const [{ data: prof }, { data: tripData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", u.id).maybeSingle(),
      supabase.from("saved_itineraries").select("user_id").eq("id", tripId).maybeSingle(),
    ]);
    setProfile(prof);

    if (!tripData) { setLoading(false); return; }

    const owner = tripData.user_id === u.id;
    setIsOwner(owner);
    let access = owner;

    if (!owner) {
      const { data: share } = await supabase.from("shared_trips")
        .select("id").eq("trip_id", tripId).eq("shared_with_id", u.id).maybeSingle();
      access = !!share;
    }

    setHasAccess(access);

    if (!access) { setLoading(false); return; }

    // Fetch messages
    const { data: msgs } = await supabase
      .from("trip_messages").select("*")
      .eq("trip_id", tripId).order("created_at", { ascending: true }).limit(100);
    setMessages((msgs as Message[]) || []);

    // Fetch members
    const { data: shared } = await supabase.from("shared_trips").select("*").eq("trip_id", tripId);
    setMembers([
      { user_id: tripData.user_id, label: "Owner", email: prof?.email || "Owner" },
      ...(shared || []).map((s: any) => ({ user_id: s.shared_with_id, label: "Member", email: s.shared_with_email })),
    ]);

    setLoading(false);

    // Realtime
    const channel = supabase.channel(`trip-chat-panel-${tripId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "trip_messages", filter: `trip_id=eq.${tripId}` },
        (payload) => {
          setMessages(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Message];
          });
        })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "trip_messages", filter: `trip_id=eq.${tripId}` },
        (payload) => setMessages(prev => prev.filter(m => m.id !== payload.old.id)))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    setSending(true);
    const senderName = profile?.full_name || user.email?.split("@")[0] || "Traveller";
    const { error } = await supabase.from("trip_messages").insert({
      trip_id: tripId, user_id: user.id, sender_name: senderName,
      message: input.trim(), message_type: "text",
    });
    if (error) toast({ title: "Failed to send", variant: "destructive" });
    else setInput("");
    setSending(false);
  };

  const deleteMessage = async (msgId: string) => {
    await supabase.from("trip_messages").delete().eq("id", msgId);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setSending(true);
    const path = `chat/${tripId}/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("trip-photos").upload(path, file, { upsert: true });
    if (uploadErr) { toast({ title: "Upload failed", variant: "destructive" }); setSending(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("trip-photos").getPublicUrl(path);
    const senderName = profile?.full_name || user.email?.split("@")[0] || "Traveller";
    await supabase.from("trip_messages").insert({
      trip_id: tripId, user_id: user.id, sender_name: senderName,
      message: "📸 Shared a photo", message_type: "image", image_url: publicUrl,
    });
    setSending(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !user) return;
    setInviting(true);
    // Check if already shared
    const { data: existing } = await supabase.from("shared_trips")
      .select("id").eq("trip_id", tripId).eq("shared_with_email", inviteEmail.trim()).maybeSingle();
    if (existing) {
      toast({ title: "Already invited", description: `${inviteEmail} already has access.` });
      setInviting(false); return;
    }
    const { error } = await supabase.from("shared_trips").insert({
      trip_id: tripId, owner_id: user.id,
      shared_with_email: inviteEmail.trim(), shared_with_id: null,
    });
    if (error) { toast({ title: "Invite failed", variant: "destructive" }); }
    else {
      // Send notification (insert into notifications table for the invitee once they register)
      toast({ title: "Invitation sent! 🎉", description: `${inviteEmail} will get access when they sign in.` });
      setMembers(prev => [...prev, { user_id: null, label: "Invited", email: inviteEmail.trim() }]);
      setInviteEmail("");
      setShowInvite(false);
    }
    setInviting(false);
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const formatDay = (iso: string) => {
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
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

  if (!user || !hasAccess) return null;

  return (
    <div className="mb-10 sm:mb-12">
      {/* Section Header / Toggle */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 rounded-2xl transition-all hover-lift"
        style={{
          background: isOpen ? "linear-gradient(135deg, hsl(158,42%,38%), hsl(162,45%,28%))" : "hsla(158,42%,38%,0.10)",
          border: "1px solid hsla(158,42%,50%,0.20)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: isOpen ? "hsla(0,0%,100%,0.15)" : "hsla(158,42%,38%,0.15)" }}>
            <MessageCircle className="w-4.5 h-4.5" style={{ color: isOpen ? "white" : "hsl(158,42%,32%)" }} />
          </div>
          <div className="text-left">
            <p className="font-heading text-sm font-semibold" style={{ color: isOpen ? "white" : "hsl(158,45%,10%)" }}>
              Trip Chat Room
            </p>
            <p className="text-[11px]" style={{ color: isOpen ? "hsla(0,0%,100%,0.75)" : "hsl(0,0%,50%)" }}>
              {members.length} member{members.length !== 1 ? "s" : ""} · {messages.length} messages
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && !isOpen && (
            <span className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center"
              style={{ background: "hsl(158,42%,38%)", color: "white" }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <ChevronDown className="w-4 h-4 transition-transform"
            style={{
              color: isOpen ? "white" : "hsl(158,42%,32%)",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
            }} />
        </div>
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="glass-panel rounded-t-none rounded-b-2xl border-t-0 flex flex-col"
              style={{ height: "440px", borderColor: "hsla(148,35%,78%,0.30)" }}>

              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b"
                style={{ borderColor: "hsla(148,35%,78%,0.25)" }}>
                <p className="text-xs text-muted-foreground font-medium">
                  🔒 Private · Only invited members
                </p>
                <div className="flex items-center gap-1.5">
                  {isOwner && (
                    <button onClick={() => { setShowInvite(v => !v); setShowMembers(false); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                      style={{ background: "hsla(158,42%,38%,0.12)", color: "hsl(158,42%,32%)" }}>
                      <UserPlus className="w-3.5 h-3.5" /> Invite
                    </button>
                  )}
                  <button onClick={() => { setShowMembers(v => !v); setShowInvite(false); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                    style={{ background: "hsla(158,42%,38%,0.08)", color: "hsl(0,0%,45%)" }}>
                    <Users className="w-3.5 h-3.5" /> {members.length}
                  </button>
                </div>
              </div>

              {/* Invite Panel */}
              <AnimatePresence>
                {showInvite && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="px-4 py-3 border-b"
                    style={{ background: "hsla(158,42%,38%,0.06)", borderColor: "hsla(148,35%,78%,0.25)" }}
                  >
                    <p className="text-xs font-semibold mb-2" style={{ color: "hsl(158,42%,28%)" }}>
                      Invite someone by email
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="friend@email.com"
                        onKeyDown={e => e.key === "Enter" && handleInvite()}
                        className="glass-input flex-1 px-3 py-2 text-xs rounded-xl"
                      />
                      <button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50 flex items-center gap-1"
                        style={{ background: "linear-gradient(135deg, hsl(158,42%,40%), hsl(162,45%,28%))" }}>
                        {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                        {inviting ? "Sending…" : "Send"}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      They'll get access as soon as they sign in with this email.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Members Panel */}
              <AnimatePresence>
                {showMembers && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="px-4 py-3 border-b"
                    style={{ background: "hsla(158,42%,38%,0.06)", borderColor: "hsla(148,35%,78%,0.25)" }}
                  >
                    <p className="text-xs font-semibold mb-2" style={{ color: "hsl(158,42%,28%)" }}>Members</p>
                    <div className="flex flex-wrap gap-2">
                      {members.map((m, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px]"
                          style={{ background: "hsla(158,42%,38%,0.10)", color: "hsl(158,42%,28%)" }}>
                          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ background: "hsl(158,42%,40%)" }}>
                            {(m.email || "?").charAt(0).toUpperCase()}
                          </span>
                          <span className="max-w-[100px] truncate">{m.email}</span>
                          {m.label === "Owner" && <span className="text-[9px] font-bold opacity-60">Owner</span>}
                          {m.label === "Invited" && <span className="text-[9px] font-bold text-amber-600">Pending</span>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
                {loading && (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}
                {!loading && messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <span className="text-3xl">💬</span>
                    <p className="text-xs text-muted-foreground text-center">
                      Start chatting about your {destination} trip!
                    </p>
                  </div>
                )}

                {grouped.map(({ day, msgs }) => (
                  <div key={day}>
                    <div className="flex items-center justify-center my-3">
                      <span className="text-[10px] px-3 py-0.5 rounded-full text-muted-foreground"
                        style={{ background: "hsla(158,20%,60%,0.12)" }}>{day}</span>
                    </div>
                    {msgs.map((msg) => {
                      const isOwn = msg.user_id === user?.id;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.18 }}
                          className={`flex gap-2 mb-2.5 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 self-end"
                            style={{
                              background: isOwn ? "linear-gradient(135deg, hsl(158,42%,40%), hsl(162,45%,28%))" : "hsla(158,42%,38%,0.15)",
                              color: isOwn ? "white" : "hsl(158,42%,32%)",
                            }}>
                            {msg.sender_name.charAt(0).toUpperCase()}
                          </div>
                          <div className={`flex flex-col max-w-[72%] ${isOwn ? "items-end" : "items-start"}`}>
                            {!isOwn && <p className="text-[9px] text-muted-foreground mb-0.5 ml-1">{msg.sender_name}</p>}
                            <div className={`relative rounded-2xl px-3 py-2 ${isOwn ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                              style={{
                                background: isOwn
                                  ? "linear-gradient(135deg, hsl(158,42%,38%), hsl(162,45%,28%))"
                                  : "hsla(148,35%,96%,0.90)",
                                color: isOwn ? "white" : "hsl(158,38%,15%)",
                                boxShadow: "0 2px 6px hsla(158,20%,40%,0.08)",
                              }}>
                              {msg.message_type === "image" && msg.image_url ? (
                                <div>
                                  <img src={msg.image_url} alt="shared" className="rounded-lg max-w-[150px] max-h-[150px] object-cover mb-1" />
                                  <p className="text-[11px] opacity-80">{msg.message}</p>
                                </div>
                              ) : (
                                <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                              )}
                            </div>
                            <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? "flex-row-reverse" : ""}`}>
                              <p className="text-[9px] text-muted-foreground">{formatTime(msg.created_at)}</p>
                              {isOwn && (
                                <button onClick={() => deleteMessage(msg.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-destructive">
                                  <Trash2 className="w-2.5 h-2.5" />
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

              {/* Input */}
              <div className="px-3 py-2.5 border-t flex items-end gap-2"
                style={{ borderColor: "hsla(148,35%,78%,0.25)" }}>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <button onClick={() => fileRef.current?.click()} disabled={sending}
                  className="w-8 h-8 rounded-xl glass-panel flex items-center justify-center flex-shrink-0 text-muted-foreground hover:text-primary transition-colors">
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={`Message ${destination} chat…`}
                  rows={1}
                  className="glass-input flex-1 px-3 py-2 text-xs resize-none rounded-xl"
                  style={{ maxHeight: "80px", overflow: "auto" }}
                />
                <button onClick={sendMessage} disabled={!input.trim() || sending}
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-all"
                  style={{ background: "linear-gradient(135deg, hsl(158,42%,40%), hsl(162,45%,28%))" }}>
                  {sending ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripChatPanel;
