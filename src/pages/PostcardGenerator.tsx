import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Download, Image, Loader2, Type, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const POSTCARD_STYLES = [
  { id: "classic", label: "Classic", bg: "linear-gradient(135deg, hsl(35,80%,92%), hsl(28,70%,85%))", text: "#3d2c1a", stamp: "🏛️" },
  { id: "tropical", label: "Tropical", bg: "linear-gradient(135deg, hsl(180,60%,85%), hsl(160,50%,80%))", text: "#1a3d2c", stamp: "🌴" },
  { id: "vintage", label: "Vintage", bg: "linear-gradient(135deg, hsl(45,50%,88%), hsl(40,40%,82%))", text: "#4a3f2f", stamp: "📮" },
  { id: "modern", label: "Modern", bg: "linear-gradient(135deg, hsl(220,30%,95%), hsl(210,25%,90%))", text: "#1a2a3d", stamp: "✈️" },
];

const PostcardGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [user, setUser] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTrip, setSelectedTrip] = useState<string>("");
  const [selectedPhoto, setSelectedPhoto] = useState<string>("");
  const [message, setMessage] = useState("Wish you were here! 🌍");
  const [recipientName, setRecipientName] = useState("");
  const [style, setStyle] = useState(POSTCARD_STYLES[0]);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth?redirect=/postcard"); return; }
    setUser(user);
    const { data: t } = await supabase.from("saved_itineraries").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setTrips(t || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!selectedTrip) return;
    (async () => {
      const { data } = await supabase.from("trip_photos").select("*").eq("trip_id", selectedTrip);
      setPhotos(data || []);
    })();
  }, [selectedTrip]);

  const getPhotoUrl = (path: string) => {
    const { data } = supabase.storage.from("trip-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const generatePostcard = async () => {
    if (!selectedPhoto || !message) return;
    setGenerating(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 1200;
    canvas.height = 800;

    // Draw background
    const grad = ctx.createLinearGradient(0, 0, 1200, 800);
    grad.addColorStop(0, style.id === "classic" ? "#f5e6d3" : style.id === "tropical" ? "#c8ede3" : style.id === "vintage" ? "#ede5d0" : "#e8edf5");
    grad.addColorStop(1, style.id === "classic" ? "#e8d5c0" : style.id === "tropical" ? "#b8ddd0" : style.id === "vintage" ? "#ddd5c0" : "#dde2f0");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 800);

    // Draw border
    ctx.strokeStyle = style.text + "33";
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 1160, 760);

    // Load and draw photo
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = getPhotoUrl(selectedPhoto);
    await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });

    // Photo on left side
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(50, 50, 520, 500, 12);
    ctx.clip();
    const scale = Math.max(520 / img.width, 500 / img.height);
    const sw = img.width * scale, sh = img.height * scale;
    ctx.drawImage(img, 50 + (520 - sw) / 2, 50 + (500 - sh) / 2, sw, sh);
    ctx.restore();

    // Photo shadow
    ctx.strokeStyle = style.text + "22";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(50, 50, 520, 500, 12);
    ctx.stroke();

    // Stamp
    ctx.font = "60px serif";
    ctx.fillText(style.stamp, 1080, 100);

    // Stamp lines
    ctx.strokeStyle = style.text + "44";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(650, 140 + i * 50);
      ctx.lineTo(1050, 140 + i * 50);
      ctx.stroke();
    }

    // "To:" label
    ctx.fillStyle = style.text + "88";
    ctx.font = "italic 18px Georgia, serif";
    ctx.fillText("To:", 650, 130);

    // Recipient
    ctx.fillStyle = style.text;
    ctx.font = "bold 28px Georgia, serif";
    ctx.fillText(recipientName || "Dear Friend", 700, 170);

    // Divider line
    ctx.strokeStyle = style.text + "33";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(620, 50);
    ctx.lineTo(620, 750);
    ctx.stroke();

    // Message
    ctx.fillStyle = style.text;
    ctx.font = "22px Georgia, serif";
    const words = message.split(" ");
    let line = "", y = 380;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > 480) {
        ctx.fillText(line, 650, y);
        line = word + " ";
        y += 34;
      } else line = test;
    }
    ctx.fillText(line, 650, y);

    // Trip name at bottom
    const trip = trips.find(t => t.id === selectedTrip);
    ctx.fillStyle = style.text + "66";
    ctx.font = "italic 16px Georgia, serif";
    ctx.fillText(`From ${trip?.destination || "my travels"} with love ❤️`, 50, 600);

    // Postage mark
    ctx.strokeStyle = style.text + "44";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(1100, 80, 35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = "10px sans-serif";
    ctx.fillStyle = style.text + "66";
    ctx.textAlign = "center";
    ctx.fillText("KroTravel", 1100, 78);
    ctx.fillText("POST", 1100, 92);
    ctx.textAlign = "start";

    // KroTravel branding
    ctx.fillStyle = style.text + "44";
    ctx.font = "12px sans-serif";
    ctx.fillText("Made with KroTravel ✨", 50, 770);

    setPreviewUrl(canvas.toDataURL("image/png"));
    setGenerating(false);
    toast({ title: "Postcard ready!", description: "Download or share your postcard" });
  };

  const downloadPostcard = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `KroTravel_Postcard_${Date.now()}.png`;
    a.click();
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <canvas ref={canvasRef} className="hidden" />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl sm:text-4xl font-heading mb-2">📬 Postcard Generator</h1>
            <p className="text-muted-foreground mb-8">Create beautiful postcards from your trip memories</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left - Controls */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              {/* Trip Selection */}
              <div className="glass-panel p-5 rounded-2xl">
                <label className="text-sm font-medium text-foreground mb-2 block">Select Trip</label>
                <select
                  value={selectedTrip}
                  onChange={e => { setSelectedTrip(e.target.value); setSelectedPhoto(""); }}
                  className="w-full rounded-xl bg-card/60 border border-border/50 p-3 text-sm backdrop-blur-md"
                >
                  <option value="">Choose a trip...</option>
                  {trips.map(t => <option key={t.id} value={t.id}>{t.destination}</option>)}
                </select>
              </div>

              {/* Photo Selection */}
              {photos.length > 0 && (
                <div className="glass-panel p-5 rounded-2xl">
                  <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                    <Image className="w-4 h-4" /> Select Photo
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {photos.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPhoto(p.storage_path)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedPhoto === p.storage_path ? "border-primary ring-2 ring-primary/30" : "border-transparent"
                        }`}
                      >
                        <img src={getPhotoUrl(p.storage_path)} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Style */}
              <div className="glass-panel p-5 rounded-2xl">
                <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Postcard Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {POSTCARD_STYLES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all border ${
                        style.id === s.id ? "border-primary bg-primary/10" : "border-border/50 bg-card/40"
                      }`}
                    >
                      {s.stamp} {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="glass-panel p-5 rounded-2xl space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Type className="w-4 h-4" /> Your Message
                </label>
                <Input
                  placeholder="Recipient name"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className="rounded-xl"
                />
                <Textarea
                  placeholder="Write your postcard message..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="rounded-xl min-h-[100px]"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">{message.length}/200</p>
              </div>

              <Button
                onClick={generatePostcard}
                disabled={!selectedPhoto || !message || generating}
                className="w-full rounded-xl"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                {generating ? "Creating..." : "Generate Postcard"}
              </Button>
            </motion.div>

            {/* Right - Preview */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="glass-panel p-5 rounded-2xl sticky top-24">
                <h3 className="text-sm font-medium text-foreground mb-3">Preview</h3>
                {previewUrl ? (
                  <div className="space-y-4">
                    <img src={previewUrl} alt="Postcard preview" className="w-full rounded-xl shadow-lg" />
                    <Button onClick={downloadPostcard} className="w-full rounded-xl" variant="outline">
                      <Download className="w-4 h-4 mr-2" /> Download Postcard
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-[3/2] rounded-xl border-2 border-dashed border-border/50 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Mail className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Your postcard preview will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PostcardGenerator;
