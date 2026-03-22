import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Loader2, Copy, CheckCircle2, ChevronDown, Share2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  destination: string;
  days?: any[];
  preferences?: any;
  tripSummary?: any;
}

const AutoTravelBlog = ({ destination, days, preferences, tripSummary }: Props) => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [blog, setBlog] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateBlog = async () => {
    setLoading(true);
    setBlog("");
    try {
      const { data, error } = await supabase.functions.invoke("generate-travel-blog", {
        body: { destination, days, preferences, tripSummary },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        return;
      }

      setBlog(data.blog || "");
      toast({ title: "Blog Generated! ✍️", description: "Your travel story is ready" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to generate blog", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyBlog = () => {
    navigator.clipboard.writeText(blog);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBlog = () => {
    const blob = new Blob([blog], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${destination.replace(/\s+/g, "-").toLowerCase()}-travel-blog.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simple markdown to HTML (basic)
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gm, '<h3 class="text-base font-heading mt-4 mb-2" style="color: hsl(158,45%,12%)">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-lg font-heading mt-5 mb-2" style="color: hsl(158,45%,10%)">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-xl font-heading mt-6 mb-3" style="color: hsl(158,45%,8%)">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-3 border-primary/40 pl-3 my-3 text-muted-foreground italic text-sm">$1</blockquote>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 text-sm mb-1 list-disc text-muted-foreground">$1</li>')
      .replace(/\n\n/g, '</p><p class="text-sm leading-relaxed text-foreground/80 mb-3">')
      .replace(/\n/g, '<br/>');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 flex items-center justify-between hover:bg-accent/20 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsla(270, 60%, 55%, 0.12)" }}>
            <PenLine className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-heading text-sm" style={{ color: "hsl(158,45%,10%)" }}>AI Travel Blog</p>
            <p className="text-[10px] text-muted-foreground">Auto-generate a blog from your itinerary</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-4 pb-4">
              {!blog && !loading && (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    AI will write a vivid, emotional travel blog from your itinerary — perfect for sharing on social media or your travel page
                  </p>
                  <button onClick={generateBlog}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    ✍️ Generate My Travel Blog
                  </button>
                </div>
              )}

              {loading && (
                <div className="text-center py-8 space-y-3">
                  <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
                  <p className="text-sm text-muted-foreground">Writing your travel story...</p>
                  <p className="text-[10px] text-muted-foreground">This takes about 15-20 seconds</p>
                </div>
              )}

              {blog && !loading && (
                <div className="space-y-4">
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={copyBlog}
                      className="flex-1 py-2 rounded-lg bg-primary/10 text-primary text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:bg-primary/20 transition-colors">
                      {copied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                    <button onClick={downloadBlog}
                      className="flex-1 py-2 rounded-lg bg-primary/10 text-primary text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:bg-primary/20 transition-colors">
                      <Download className="w-3.5 h-3.5" /> Download .md
                    </button>
                    <button onClick={generateBlog}
                      className="py-2 px-3 rounded-lg bg-muted/30 text-muted-foreground text-[11px] font-semibold hover:bg-muted/50 transition-colors">
                      Regenerate
                    </button>
                  </div>

                  {/* Blog content */}
                  <div className="prose-sm max-h-[500px] overflow-y-auto p-4 rounded-xl bg-background/40 border border-border/30">
                    <div
                      className="text-sm leading-relaxed"
                      style={{ color: "hsl(158, 20%, 25%)" }}
                      dangerouslySetInnerHTML={{ __html: `<p class="text-sm leading-relaxed text-foreground/80 mb-3">${renderMarkdown(blog)}</p>` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AutoTravelBlog;
