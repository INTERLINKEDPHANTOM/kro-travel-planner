import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, ChevronDown, Sparkles } from "lucide-react";

interface WhyThisReason {
  icon?: string;
  text: string;
}

interface WhyThisTooltipProps {
  reasons: WhyThisReason[];
  alternative?: string;
  compact?: boolean;
}

const WhyThisTooltip = ({ reasons, alternative, compact = false }: WhyThisTooltipProps) => {
  const [open, setOpen] = useState(false);

  if (!reasons || reasons.length === 0) return null;

  return (
    <div className="relative inline-flex flex-col">
      <button
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(!open); }}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer select-none"
        style={{
          background: open
            ? "hsla(158, 42%, 38%, 0.14)"
            : "hsla(158, 42%, 38%, 0.07)",
          color: "hsl(158, 42%, 35%)",
          border: `1px solid ${open ? "hsla(158, 42%, 50%, 0.30)" : "transparent"}`,
        }}
      >
        <Info className="w-3 h-3" />
        <span>Why this?</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-2.5 h-2.5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 6 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden w-full"
          >
            <div
              className="rounded-xl p-3 space-y-1.5"
              style={{
                background: "hsla(148, 40%, 98%, 0.85)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid hsla(148, 35%, 82%, 0.50)",
                boxShadow: "0 4px 16px hsla(158, 42%, 36%, 0.08)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Personalized for you
                </span>
              </div>

              {reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] leading-relaxed" style={{ color: "hsl(158, 30%, 25%)" }}>
                  <span className="flex-shrink-0 mt-0.5 text-xs">{r.icon || "→"}</span>
                  <span>{r.text}</span>
                </div>
              ))}

              {alternative && (
                <div
                  className="flex items-start gap-2 mt-2 pt-2 text-[11px]"
                  style={{
                    borderTop: "1px solid hsla(148, 35%, 82%, 0.50)",
                    color: "hsl(158, 42%, 32%)",
                  }}
                >
                  <span className="flex-shrink-0 text-xs">💡</span>
                  <span className="font-medium">{alternative}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhyThisTooltip;
