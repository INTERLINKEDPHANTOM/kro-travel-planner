import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Film, Download, Loader2, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TripMontage = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [user, setUser] = useState<any>(null);
  const [trip, setTrip] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [narration, setNarration] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => { init(); }, [tripId]);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    setUser(user);

    if (!tripId) { navigate("/my-trips"); return; }

    const { data: tripData } = await supabase.from("saved_itineraries").select("*").eq("id", tripId).single();
    if (!tripData) { navigate("/my-trips"); return; }
    setTrip(tripData);

    const { data: photoData } = await supabase.from("trip_photos").select("*").eq("trip_id", tripId).order("created_at");
    setPhotos(photoData || []);

    // Generate narration text from itinerary
    const itData = tripData.itinerary_data as any;
    const lines: string[] = [];
    lines.push(`Welcome to ${tripData.destination}`);
    if (itData?.days) {
      for (const day of itData.days.slice(0, 5)) {
        const acts = (day.activities || []).slice(0, 2).map((a: any) => a.activity || a.description || "");
        if (acts.length) lines.push(`${day.title || `Day ${day.day}`}: ${acts.join(", ")}`);
      }
    }
    lines.push(`A journey to remember. Made with KroTravel.`);
    setNarration(lines);
    setLoading(false);
  };

  const getPhotoUrl = (path: string) => {
    const { data } = supabase.storage.from("trip-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const generateMontage = async () => {
    if (photos.length < 3) {
      toast({ title: "Need at least 3 photos", variant: "destructive" });
      return;
    }
    setGenerating(true);
    setProgress(0);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 1080;
    canvas.height = 1920;

    // Load all images
    const images: HTMLImageElement[] = [];
    for (const photo of photos.slice(0, 10)) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = getPhotoUrl(photo.storage_path);
      await new Promise(r => { img.onload = r; img.onerror = r; });
      images.push(img);
    }

    const fps = 24;
    const secondsPerPhoto = 3;
    const transitionFrames = 12;
    const totalFrames = images.length * secondsPerPhoto * fps;

    // Create audio context for background beat
    const audioCtx = new AudioContext();
    const audioDest = audioCtx.createMediaStreamDestination();

    // Simple ambient pad
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = 220;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(audioDest);
    osc.start();

    // Add subtle rhythm
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "triangle";
    osc2.frequency.value = 330;
    gain2.gain.value = 0.04;
    osc2.connect(gain2);
    gain2.connect(audioDest);
    osc2.start();

    const stream = canvas.captureStream(fps);
    audioDest.stream.getAudioTracks().forEach(t => stream.addTrack(t));

    const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp8,opus" });
    const chunks: Blob[] = [];
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };

    recorder.start(100);

    const drawFrame = (frameNum: number) => {
      const photoIdx = Math.min(Math.floor(frameNum / (secondsPerPhoto * fps)), images.length - 1);
      const localFrame = frameNum % (secondsPerPhoto * fps);
      const img = images[photoIdx];

      // Ken Burns effect
      const kenBurns = (localFrame / (secondsPerPhoto * fps));
      const scale = 1.05 + kenBurns * 0.1;
      const panX = Math.sin(kenBurns * Math.PI) * 30;
      const panY = Math.cos(kenBurns * Math.PI * 0.5) * 20;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
      gradient.addColorStop(0, "#0a1f14");
      gradient.addColorStop(1, "#1a3d2c");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1920);

      if (img.complete && img.naturalWidth) {
        ctx.save();
        ctx.translate(540 + panX, 960 + panY);
        ctx.scale(scale, scale);
        
        const imgRatio = img.width / img.height;
        const canvasRatio = 1080 / 1920;
        let dw, dh;
        if (imgRatio > canvasRatio) {
          dh = 1920; dw = dh * imgRatio;
        } else {
          dw = 1080; dh = dw / imgRatio;
        }
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      }

      // Transition fade
      if (localFrame < transitionFrames && photoIdx > 0) {
        const alpha = localFrame / transitionFrames;
        ctx.fillStyle = `rgba(10, 31, 20, ${1 - alpha})`;
        ctx.fillRect(0, 0, 1080, 1920);
      }

      // Bottom gradient overlay for text
      const textGrad = ctx.createLinearGradient(0, 1400, 0, 1920);
      textGrad.addColorStop(0, "rgba(10, 31, 20, 0)");
      textGrad.addColorStop(1, "rgba(10, 31, 20, 0.85)");
      ctx.fillStyle = textGrad;
      ctx.fillRect(0, 1400, 1080, 520);

      // Narration text
      const narrationIdx = Math.min(photoIdx, narration.length - 1);
      const textAlpha = Math.min(1, localFrame / 20);
      ctx.globalAlpha = textAlpha;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      
      const text = narration[narrationIdx] || "";
      const words = text.split(" ");
      let line = "", y = 1750;
      const lines: string[] = [];
      for (const word of words) {
        const test = line + word + " ";
        if (ctx.measureText(test).width > 900) {
          lines.push(line.trim());
          line = word + " ";
        } else line = test;
      }
      lines.push(line.trim());
      y -= (lines.length - 1) * 22;
      for (const l of lines) {
        ctx.fillText(l, 540, y);
        y += 44;
      }
      ctx.globalAlpha = 1;

      // Place name badge
      const place = photos[photoIdx]?.place_name;
      if (place) {
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        const tw = ctx.measureText(place).width + 30;
        ctx.beginPath();
        ctx.roundRect(540 - tw / 2, 1650, tw, 36, 18);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px sans-serif";
        ctx.fillText(place, 540, 1674);
      }

      // Progress indicator
      const progWidth = (photoIdx / images.length) * 980;
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.roundRect(50, 100, 980, 4, 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath();
      ctx.roundRect(50, 100, progWidth, 4, 2);
      ctx.fill();

      // KroTravel watermark
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.fillText("KroTravel", 540, 1890);
      ctx.globalAlpha = 1;
    };

    // Render frames
    for (let f = 0; f < totalFrames; f++) {
      drawFrame(f);
      setProgress(Math.round((f / totalFrames) * 100));
      await new Promise(r => setTimeout(r, 1000 / fps));
    }

    recorder.stop();
    osc.stop();
    osc2.stop();

    await new Promise<void>(r => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setVideoUrl(URL.createObjectURL(blob));
        setGenerating(false);
        r();
      };
    });

    toast({ title: "Montage ready! 🎬" });
  };

  const downloadVideo = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `KroTravel_Montage_${trip?.destination || "trip"}.webm`;
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
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl font-heading mb-2">🎬 Trip Montage</h1>
            <p className="text-muted-foreground">{trip?.destination} — AI-narrated video documentary</p>
          </motion.div>

          {/* Narration preview */}
          <div className="glass-panel p-5 rounded-2xl mb-6">
            <h3 className="text-sm font-medium mb-3">Narration Script</h3>
            <div className="space-y-2">
              {narration.map((line, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  <span className="text-primary font-medium">{i + 1}.</span> {line}
                </p>
              ))}
            </div>
          </div>

          {/* Photo count */}
          <div className="glass-panel p-4 rounded-2xl mb-6 text-center">
            <p className="text-sm">
              <span className="font-bold text-primary">{photos.length}</span> photos available
              {photos.length < 3 && <span className="text-destructive ml-2">(minimum 3 needed)</span>}
            </p>
          </div>

          {videoUrl ? (
            <div className="space-y-4">
              <video src={videoUrl} controls className="w-full rounded-2xl shadow-lg" />
              <Button onClick={downloadVideo} className="w-full rounded-xl">
                <Download className="w-4 h-4 mr-2" /> Download Montage
              </Button>
            </div>
          ) : (
            <div>
              {generating && (
                <div className="glass-panel p-6 rounded-2xl mb-4 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm font-medium">Generating montage...</p>
                  <div className="h-2 bg-muted/50 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
                </div>
              )}
              <Button
                onClick={generateMontage}
                disabled={generating || photos.length < 3}
                className="w-full rounded-xl"
              >
                <Film className="w-4 h-4 mr-2" /> Generate Trip Montage
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TripMontage;
