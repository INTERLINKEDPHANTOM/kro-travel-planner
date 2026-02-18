import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BroadcastNotif {
  id: string;
  title: string;
  message: string;
  image_url: string | null;
  type: string;
}

const DISMISS_KEY = "kro_dismissed_broadcasts";

const getDismissed = (): string[] => {
  try { return JSON.parse(localStorage.getItem(DISMISS_KEY) || "[]"); }
  catch { return []; }
};

const addDismissed = (id: string) => {
  const current = getDismissed();
  if (!current.includes(id)) {
    localStorage.setItem(DISMISS_KEY, JSON.stringify([...current, id]));
  }
};

const BroadcastNotificationPopup = () => {
  const [notifications, setNotifications] = useState<BroadcastNotif[]>([]);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("broadcast_notifications")
        .select("id, title, message, image_url, type")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const dismissed = getDismissed();
        const unseen = data.filter((n) => !dismissed.includes(n.id));
        if (unseen.length > 0) {
          setNotifications(unseen);
          // small delay so page loads first
          setTimeout(() => setVisible(true), 1500);
        }
      }
    };
    fetchNotifications();
  }, []);

  const dismiss = () => {
    if (notifications[current]) {
      addDismissed(notifications[current].id);
    }
    if (current < notifications.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setVisible(false);
    }
  };

  const notif = notifications[current];

  return (
    <AnimatePresence>
      {visible && notif && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Popup */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-sm pointer-events-auto"
            >
              <div className="glass-intense rounded-3xl overflow-hidden shadow-2xl"
                style={{ boxShadow: "0 24px 80px hsla(158, 42%, 28%, 0.25)" }}>

                {/* Image */}
                {notif.image_url && (
                  <div className="relative overflow-hidden" style={{ height: 180 }}>
                    <img
                      src={notif.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, hsl(158, 42%, 40%), hsl(162, 45%, 28%))" }}>
                        {notif.type === "announcement" ? (
                          <Megaphone className="w-4 h-4 text-white" />
                        ) : (
                          <Bell className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5">
                          From KroTravel
                        </p>
                        <h3 className="text-base font-heading leading-tight" style={{ color: "hsl(158, 45%, 10%)" }}>
                          {notif.title}
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={dismiss}
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{notif.message}</p>

                  <div className="flex items-center justify-between gap-3">
                    {notifications.length > 1 && (
                      <div className="flex gap-1">
                        {notifications.map((_, i) => (
                          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === current ? "w-4 bg-primary" : "w-1.5 bg-border"
                          }`} />
                        ))}
                      </div>
                    )}
                    <button
                      onClick={dismiss}
                      className="btn-primary px-5 py-2.5 text-sm ml-auto"
                    >
                      {current < notifications.length - 1 ? "Next" : "Got it!"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BroadcastNotificationPopup;
