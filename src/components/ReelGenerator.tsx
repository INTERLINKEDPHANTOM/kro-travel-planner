import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Download, Film, Sparkles, Music, Loader2, CheckCircle2, AlertCircle, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TripPhoto {
  id: string;
  storage_path: string;
  place_name: string | null;
}

interface ReelGeneratorProps {
  tripId: string;
  destination: string;
  onClose: () => void;
}

const REQUIRED_PHOTOS = 10;

const TEMPLATES = [
  {
    id: "cinematic",
    name: "🎬 Cinematic",
    gradient: ["#0f2027", "#203a43", "#2c5364"],
    accentColor: "#00e5a0",
    textColor: "#e8f5f0",
    overlayOpacity: 0.65,
    beatStyle: "dramatic",
  },
  {
    id: "golden",
    name: "✨ Golden Hour",
    gradient: ["#7b4f12", "#c88b2a", "#f7d070"],
    accentColor: "#fff8dc",
    textColor: "#2d1a00",
    overlayOpacity: 0.52,
    beatStyle: "warm",
  },
  {
    id: "ocean",
    name: "🌊 Ocean Vibes",
    gradient: ["#0052d4", "#4364f7", "#6fb1fc"],
    accentColor: "#a8f0ff",
    textColor: "#fff",
    overlayOpacity: 0.55,
    beatStyle: "chill",
  },
  {
    id: "neon",
    name: "💜 Neon Nights",
    gradient: ["#1a0533", "#3d1a6e", "#6e1aab"],
    accentColor: "#e040fb",
    textColor: "#fff",
    overlayOpacity: 0.68,
    beatStyle: "electric",
  },
];

const TRANSITIONS_CONFIG = ["fade", "slide-left", "slide-up", "zoom-in", "zoom-out", "blur", "rotate-fade", "flip", "slide-diagonal", "warp"] as const;
type Transition = typeof TRANSITIONS_CONFIG[number];

const FPS = 24;
const FRAME_DURATION = 3;
const FRAME_TOTAL_FRAMES = FRAME_DURATION * FPS;
const TRANSITION_FRAMES = 22;
const STATIC_FRAMES = FRAME_TOTAL_FRAMES - TRANSITION_FRAMES;

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ── Generate synthesized travel-vibe audio beats using Web Audio API ───────
function createAudioContext(): AudioContext {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
}

function generateBeatPattern(
  ctx: AudioContext,
  totalSeconds: number,
  style: string,
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const totalSamples = Math.ceil(totalSeconds * sampleRate);
  const buffer = ctx.createBuffer(2, totalSamples, sampleRate);
  const L = buffer.getChannelData(0);
  const R = buffer.getChannelData(1);

  const bpm = style === "electric" ? 128 : style === "dramatic" ? 90 : style === "warm" ? 80 : 100;
  const beatInterval = (60 / bpm) * sampleRate;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    // Base ambient pad — harmonic sine waves layered for warmth
    const baseFreq = style === "dramatic" ? 55 : style === "warm" ? 65 : style === "electric" ? 80 : 60;
    sample += Math.sin(2 * Math.PI * baseFreq * t) * 0.04;
    sample += Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.025;
    sample += Math.sin(2 * Math.PI * baseFreq * 3 * t) * 0.012;
    sample += Math.sin(2 * Math.PI * baseFreq * 0.5 * t) * 0.018;

    // Slow melody arpeggiation
    const melodyNotes = [1, 1.25, 1.5, 2, 1.5, 1.25];
    const noteIdx = Math.floor(t * 1.5) % melodyNotes.length;
    const melFreq = baseFreq * 2 * melodyNotes[noteIdx];
    const noteT = (t * 1.5) % 1;
    const noteEnv = Math.sin(Math.PI * noteT) * Math.exp(-noteT * 2);
    sample += Math.sin(2 * Math.PI * melFreq * t) * noteEnv * 0.035;

    // Rhythm kick drum on beat
    const beatPos = i % Math.round(beatInterval);
    const kickDecay = Math.exp(-beatPos / (sampleRate * 0.12));
    const kickFreq = 60 * Math.exp(-beatPos / (sampleRate * 0.08));
    sample += Math.sin(2 * Math.PI * kickFreq * (beatPos / sampleRate)) * kickDecay * 0.18;

    // Snare on 2 & 4
    const halfBeat = Math.round(beatInterval / 2);
    const snareOffset = (i + halfBeat) % Math.round(beatInterval);
    if (snareOffset < sampleRate * 0.04) {
      const snareDecay = Math.exp(-snareOffset / (sampleRate * 0.04));
      const noise = (Math.random() * 2 - 1) * 0.12 * snareDecay;
      const tonalSnare = Math.sin(2 * Math.PI * 220 * (snareOffset / sampleRate)) * snareDecay * 0.06;
      sample += noise + tonalSnare;
    }

    // Hi-hat on 8ths
    const eighthBeat = Math.round(beatInterval / 4);
    const hihatOffset = i % eighthBeat;
    if (hihatOffset < sampleRate * 0.015) {
      const hhDecay = Math.exp(-hihatOffset / (sampleRate * 0.015));
      sample += (Math.random() * 2 - 1) * 0.04 * hhDecay;
    }

    // Risers every 8 beats for excitement
    const phraseLen = Math.round(beatInterval * 8);
    const phrasePos = i % phraseLen;
    const riserT = phrasePos / phraseLen;
    if (riserT > 0.85) {
      const riserEnv = (riserT - 0.85) / 0.15;
      const riserFreq = 200 + riserEnv * 800;
      sample += Math.sin(2 * Math.PI * riserFreq * t) * riserEnv * 0.06;
    }

    // Cinematic swell every 4 bars
    const swellLen = phraseLen * 4;
    const swellT = (i % swellLen) / swellLen;
    const swellEnv = Math.sin(Math.PI * swellT) * 0.5;
    sample += Math.sin(2 * Math.PI * baseFreq * 4 * t) * swellEnv * 0.02;

    // Volume envelope — fade in and out
    const volEnv = Math.min(1, Math.min(t / 1.5, (totalSeconds - t) / 1.5));
    sample *= volEnv * 0.85;

    // Soft clip to prevent distortion
    sample = Math.tanh(sample * 1.8) / 1.8;

    // Stereo spread
    L[i] = sample * (1 + 0.05 * Math.sin(2 * Math.PI * 0.3 * t));
    R[i] = sample * (1 - 0.05 * Math.sin(2 * Math.PI * 0.3 * t));
  }

  return buffer;
}

// ── Main Component ─────────────────────────────────────────────────────────
const ReelGenerator = ({ tripId, destination, onClose }: ReelGeneratorProps) => {
  const [step, setStep] = useState<"upload" | "generating" | "done">("upload");
  const [existingPhotos, setExistingPhotos] = useState<TripPhoto[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ file: File; preview: string }[]>([]);
  const [selectedExisting, setSelectedExisting] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [genProgress, setGenProgress] = useState(0);
  const [genLabel, setGenLabel] = useState("Initializing...");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchExisting(); }, []);

  const fetchExisting = async () => {
    const { data } = await supabase.from("trip_photos")
      .select("id,storage_path,place_name").eq("trip_id", tripId).order("created_at", { ascending: false });
    setExistingPhotos((data || []).filter(p => p.place_name !== "__before_after_journal__"));
    setLoading(false);
  };

  const getPublicUrl = (path: string) =>
    supabase.storage.from("trip-photos").getPublicUrl(path).data.publicUrl;

  const allSelectedImages: { src: string; caption: string }[] = [
    ...uploadedFiles.map(f => ({ src: f.preview, caption: destination })),
    ...existingPhotos
      .filter(p => selectedExisting.includes(p.id))
      .map(p => ({ src: getPublicUrl(p.storage_path), caption: p.place_name || destination })),
  ];

  const totalCount = allSelectedImages.length;
  const canGenerate = totalCount === REQUIRED_PHOTOS;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = REQUIRED_PHOTOS - totalCount;
    Array.from(files).slice(0, remaining).forEach(f => {
      const preview = URL.createObjectURL(f);
      setUploadedFiles(prev => [...prev, { file: f, preview }]);
    });
  };

  const toggleExisting = (id: string) => {
    if (selectedExisting.includes(id)) {
      setSelectedExisting(prev => prev.filter(x => x !== id));
    } else if (totalCount < REQUIRED_PHOTOS) {
      setSelectedExisting(prev => [...prev, id]);
    }
  };

  const removeUploaded = (i: number) => {
    setUploadedFiles(prev => prev.filter((_, j) => j !== i));
  };

  // ── Canvas + Audio video generation ────────────────────────────────────
  const generateVideo = useCallback(async () => {
    if (!canGenerate) return;
    setStep("generating");
    setGenProgress(0);
    setError(null);

    const W = 540, H = 960;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // 1. Load all images
    setGenLabel("Loading your 10 photos...");
    const loadedImgs: HTMLImageElement[] = [];
    for (let i = 0; i < allSelectedImages.length; i++) {
      try {
        const img = await loadImage(allSelectedImages[i].src);
        loadedImgs.push(img);
      } catch {
        const fc = document.createElement("canvas");
        fc.width = W; fc.height = H;
        const fCtx = fc.getContext("2d")!;
        fCtx.fillStyle = "#1a1a2e"; fCtx.fillRect(0, 0, W, H);
        const fi = new Image(); fi.src = fc.toDataURL();
        loadedImgs.push(fi);
      }
      setGenProgress(Math.round((i / allSelectedImages.length) * 15));
    }

    // 2. Generate audio beats using Web Audio API
    setGenLabel("Composing beats & audio...");
    const totalVideoSecs = (allSelectedImages.length * FRAME_DURATION) + 1;
    let audioBuffer: AudioBuffer | null = null;
    let audioCtx: AudioContext | null = null;
    let audioStream: MediaStream | null = null;

    try {
      audioCtx = createAudioContext();
      audioBuffer = generateBeatPattern(audioCtx, totalVideoSecs, template.beatStyle);

      // Create an offline context to render the beat to a buffer source
      const dest = audioCtx.createMediaStreamDestination();
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      // Compressor for punch
      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 6;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.15;
      // Reverb simulation via convolver-like delay chain
      const delay = audioCtx.createDelay(0.5);
      delay.delayTime.value = 0.22;
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.92;
      const feedbackGain = audioCtx.createGain();
      feedbackGain.gain.value = 0.15;
      source.connect(compressor);
      compressor.connect(gainNode);
      gainNode.connect(dest);
      gainNode.connect(delay);
      delay.connect(feedbackGain);
      feedbackGain.connect(delay);
      delay.connect(dest);
      audioStream = dest.stream;
      source.start(0);
      setGenProgress(20);
    } catch (e) {
      console.warn("Audio generation failed, continuing without audio:", e);
    }

    setGenLabel("Setting up video encoder...");
    await new Promise(r => setTimeout(r, 80));

    // 3. Combine canvas stream + audio stream
    const canvasStream = canvas.captureStream(FPS);
    let combinedStream: MediaStream;

    if (audioStream) {
      const videoTrack = canvasStream.getVideoTracks()[0];
      const audioTrack = audioStream.getAudioTracks()[0];
      combinedStream = new MediaStream([videoTrack, audioTrack]);
    } else {
      combinedStream = canvasStream;
    }

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
      ? "video/webm;codecs=vp8,opus"
      : "video/webm";

    const recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 5_000_000,
      audioBitsPerSecond: 192_000,
    });
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

    let resolveRecording: () => void;
    const recordingDone = new Promise<void>(r => { resolveRecording = r; });
    recorder.onstop = () => resolveRecording();
    recorder.start(80);

    // ── Canvas helpers ──────────────────────────────────────────────────
    const drawGradientBg = (colors: string[]) => {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    };

    const drawFrame = (img: HTMLImageElement, kenT: number, panX = 0, panY = 0) => {
      const scale = 1 + kenT * 0.08;
      const srcAspect = img.width / img.height;
      const dstAspect = W / H;
      let sw, sh, sx, sy;
      if (srcAspect > dstAspect) {
        sh = img.height; sw = sh * dstAspect; sx = (img.width - sw) / 2; sy = 0;
      } else {
        sw = img.width; sh = sw / dstAspect; sx = 0; sy = (img.height - sh) / 2;
      }
      const dw = W * scale, dh = H * scale;
      const dx = (W - dw) / 2 + panX * kenT * 20;
      const dy = (H - dh) / 2 + panY * kenT * 15;
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    };

    const drawOverlay = (idx: number) => {
      // Multi-layer cinematic overlay
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, `rgba(0,0,0,${template.overlayOpacity * 0.6})`);
      grad.addColorStop(0.35, "rgba(0,0,0,0.0)");
      grad.addColorStop(0.7, "rgba(0,0,0,0.05)");
      grad.addColorStop(1, `rgba(0,0,0,${template.overlayOpacity})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Template color tint
      const tGrad = ctx.createLinearGradient(0, 0, W, H);
      tGrad.addColorStop(0, template.gradient[0] + "44");
      tGrad.addColorStop(1, template.gradient[template.gradient.length - 1] + "22");
      ctx.fillStyle = tGrad;
      ctx.fillRect(0, 0, W, H);

      // Cinematic letterbox bars (subtle)
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, W, 28);
      ctx.fillRect(0, H - 28, W, 28);
    };

    const drawUI = (idx: number, caption: string, globalProgress: number, beatPulse: number) => {
      const pulse = 1 + beatPulse * 0.04;

      // Destination badge (top left)
      const badgeW = Math.min(W - 90, 220);
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 12;
      roundRect(ctx, 14, 36, badgeW, 34, 17);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = `bold ${Math.round(13 * pulse)}px system-ui, -apple-system`;
      ctx.fillStyle = template.accentColor;
      ctx.fillText(`📍 ${destination}`, 26, 59, badgeW - 20);

      // Photo counter (top right)
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      roundRect(ctx, W - 66, 36, 52, 28, 14);
      ctx.fill();
      ctx.font = "bold 11px system-ui";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.textAlign = "right";
      ctx.fillText(`${idx + 1} / ${loadedImgs.length}`, W - 20, 54);
      ctx.textAlign = "left";

      // Bottom gradient content area
      // Caption text
      if (caption && caption !== destination) {
        ctx.font = "bold 17px system-ui";
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 8;
        ctx.fillText(caption, 18, H - 90, W - 36);
        ctx.shadowBlur = 0;
      }

      // KroTravel watermark
      ctx.font = "bold 11px system-ui";
      ctx.fillStyle = "rgba(255,255,255,0.32)";
      ctx.textAlign = "right";
      ctx.fillText("KroTravel", W - 16, H - 16);
      ctx.textAlign = "left";

      // Progress bar (animated, with beat pulse highlight)
      const barY = H - 32;
      const barW = W - 32;
      const barFill = globalProgress * barW;

      // Track
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      roundRect(ctx, 16, barY, barW, 4, 2);
      ctx.fill();

      // Fill with accent gradient
      const barGrad = ctx.createLinearGradient(16, 0, 16 + barFill, 0);
      barGrad.addColorStop(0, template.accentColor);
      barGrad.addColorStop(1, template.gradient[template.gradient.length - 1]);
      ctx.fillStyle = barGrad;
      roundRect(ctx, 16, barY, barFill, 4, 2);
      ctx.fill();

      // Beat pulse dot at fill end
      if (barFill > 8) {
        ctx.fillStyle = template.accentColor;
        ctx.beginPath();
        ctx.arc(16 + barFill, barY + 2, 4 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // Photo grid dots (bottom center)
      const dotY = H - 52;
      const totalDots = loadedImgs.length;
      const dotSpacing = 10;
      const dotsW = totalDots * dotSpacing;
      const dotsStartX = (W - dotsW) / 2;
      for (let d = 0; d < totalDots; d++) {
        ctx.beginPath();
        ctx.arc(dotsStartX + d * dotSpacing, dotY, d === idx ? 4 * pulse : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = d === idx ? template.accentColor : "rgba(255,255,255,0.35)";
        ctx.fill();
      }
    };

    // ── Transition renderer ─────────────────────────────────────────────
    const renderTransitionFrame = (
      prev: HTMLImageElement | null,
      cur: HTMLImageElement,
      t: number,
      transition: Transition,
      frameIdx: number,
      caption: string,
      kenT: number,
      panX: number,
      panY: number,
      beatPulse: number,
      globalProgress: number,
    ) => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (t < 0.35 && prev) {
        const exitT = easeOut(t / 0.35);
        switch (transition) {
          case "fade":
            drawGradientBg(template.gradient);
            ctx.globalAlpha = 1 - exitT;
            drawFrame(prev, 0, panX, panY);
            ctx.globalAlpha = 1;
            break;
          case "slide-left":
            drawGradientBg(template.gradient);
            ctx.save(); ctx.translate(-W * exitT, 0); drawFrame(prev, 0, panX, panY); ctx.restore();
            break;
          case "slide-up":
            drawGradientBg(template.gradient);
            ctx.save(); ctx.translate(0, -H * exitT); drawFrame(prev, 0, panX, panY); ctx.restore();
            break;
          case "slide-diagonal":
            drawGradientBg(template.gradient);
            ctx.save(); ctx.translate(-W * exitT * 0.6, -H * exitT * 0.4); drawFrame(prev, 0, panX, panY); ctx.restore();
            break;
          case "zoom-in":
            drawGradientBg(template.gradient);
            ctx.save();
            ctx.translate(W / 2, H / 2);
            ctx.scale(1 + exitT * 0.4, 1 + exitT * 0.4);
            ctx.translate(-W / 2, -H / 2);
            ctx.globalAlpha = 1 - exitT;
            drawFrame(prev, 0, panX, panY);
            ctx.restore(); ctx.globalAlpha = 1;
            break;
          case "zoom-out":
            drawGradientBg(template.gradient);
            ctx.save();
            ctx.translate(W / 2, H / 2);
            ctx.scale(Math.max(0.01, 1 - exitT * 0.4), Math.max(0.01, 1 - exitT * 0.4));
            ctx.translate(-W / 2, -H / 2);
            ctx.globalAlpha = 1 - exitT;
            drawFrame(prev, 0, panX, panY);
            ctx.restore(); ctx.globalAlpha = 1;
            break;
          case "warp":
            drawGradientBg(template.gradient);
            ctx.save();
            ctx.translate(W / 2, H / 2);
            ctx.scale(1 + exitT * 1.2, 1 + exitT * 1.2);
            ctx.translate(-W / 2, -H / 2);
            ctx.globalAlpha = (1 - exitT) * (1 - exitT);
            drawFrame(prev, 0, panX, panY);
            ctx.restore(); ctx.globalAlpha = 1;
            break;
          default:
            drawGradientBg(template.gradient);
            ctx.globalAlpha = 1 - exitT;
            drawFrame(prev, 0, panX, panY);
            ctx.globalAlpha = 1;
            break;
        }
      } else if (t < 0.62) {
        drawGradientBg(template.gradient);
        // Flash frame with template glow
        const flashT = Math.sin(Math.PI * (t - 0.35) / 0.27);
        ctx.fillStyle = template.accentColor + Math.round(flashT * 12).toString(16).padStart(2, "0");
        ctx.fillRect(0, 0, W, H);
      } else {
        const enterT = easeInOut((t - 0.62) / 0.38);
        switch (transition) {
          case "fade":
            drawGradientBg(template.gradient);
            ctx.globalAlpha = enterT;
            drawFrame(cur, kenT, panX, panY);
            ctx.globalAlpha = 1;
            break;
          case "slide-left":
            drawGradientBg(template.gradient);
            ctx.save(); ctx.translate(W * (1 - enterT), 0); drawFrame(cur, kenT, panX, panY); ctx.restore();
            break;
          case "slide-up":
            drawGradientBg(template.gradient);
            ctx.save(); ctx.translate(0, H * (1 - enterT)); drawFrame(cur, kenT, panX, panY); ctx.restore();
            break;
          case "slide-diagonal":
            drawGradientBg(template.gradient);
            ctx.save(); ctx.translate(W * (1 - enterT) * 0.6, H * (1 - enterT) * 0.4); drawFrame(cur, kenT, panX, panY); ctx.restore();
            break;
          case "zoom-in": {
            drawGradientBg(template.gradient);
            const s = lerp(1.3, 1, enterT);
            ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2);
            ctx.globalAlpha = enterT; drawFrame(cur, kenT, panX, panY);
            ctx.restore(); ctx.globalAlpha = 1;
            break;
          }
          case "zoom-out": {
            drawGradientBg(template.gradient);
            const s2 = lerp(0.7, 1, enterT);
            ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s2, s2); ctx.translate(-W / 2, -H / 2);
            ctx.globalAlpha = enterT; drawFrame(cur, kenT, panX, panY);
            ctx.restore(); ctx.globalAlpha = 1;
            break;
          }
          case "rotate-fade":
            drawGradientBg(template.gradient);
            ctx.save(); ctx.translate(W / 2, H / 2);
            ctx.rotate((1 - enterT) * 0.12);
            ctx.translate(-W / 2, -H / 2);
            ctx.globalAlpha = enterT; drawFrame(cur, kenT, panX, panY);
            ctx.restore(); ctx.globalAlpha = 1;
            break;
          case "flip":
            drawGradientBg(template.gradient);
            ctx.save(); ctx.translate(W / 2, 0);
            ctx.scale(enterT, 1);
            ctx.translate(-W / 2, 0);
            drawFrame(cur, kenT, panX, panY);
            ctx.restore();
            break;
          case "warp": {
            drawGradientBg(template.gradient);
            const wS = lerp(0.01, 1, enterT * enterT);
            ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(wS, wS); ctx.translate(-W / 2, -H / 2);
            drawFrame(cur, kenT, panX, panY);
            ctx.restore();
            break;
          }
          default:
            drawGradientBg(template.gradient);
            ctx.globalAlpha = enterT;
            drawFrame(cur, kenT, panX, panY);
            ctx.globalAlpha = 1;
            break;
        }
      }

      drawOverlay(frameIdx);
      drawUI(frameIdx, caption, globalProgress, beatPulse);
    };

    // ── Frame render loop ───────────────────────────────────────────────
    setGenLabel("Rendering cinematic frames...");

    const frameTransitions: Transition[] = loadedImgs.map((_, i) =>
      TRANSITIONS_CONFIG[i % TRANSITIONS_CONFIG.length]
    );

    // Ken Burns pan directions (varies per photo)
    const panDirections = loadedImgs.map((_, i) => ({
      x: Math.sin(i * 1.3) > 0 ? 1 : -1,
      y: Math.cos(i * 0.8) > 0 ? 1 : -1,
    }));

    let totalFramesDrawn = 0;
    const totalFrames = loadedImgs.length * FRAME_TOTAL_FRAMES;

    for (let imgIdx = 0; imgIdx < loadedImgs.length; imgIdx++) {
      const img = loadedImgs[imgIdx];
      const prevImg = imgIdx > 0 ? loadedImgs[imgIdx - 1] : null;
      const caption = allSelectedImages[imgIdx].caption;
      const transition = frameTransitions[imgIdx];
      const { x: panX, y: panY } = panDirections[imgIdx];

      // Transition frames
      for (let f = 0; f < TRANSITION_FRAMES; f++) {
        const transT = f / TRANSITION_FRAMES;
        const globalProgress = (imgIdx * FRAME_TOTAL_FRAMES + f) / totalFrames;
        // Beat pulse: every ~12 frames (simulates ~2 beats/sec at 24fps)
        const beatPulse = Math.abs(Math.sin((totalFramesDrawn / 12) * Math.PI));
        renderTransitionFrame(prevImg, img, transT, transition, imgIdx, caption, 0, panX, panY, beatPulse, globalProgress);
        totalFramesDrawn++;
        setGenProgress(25 + Math.round((totalFramesDrawn / totalFrames) * 68));
        setGenLabel(`Rendering scene ${imgIdx + 1}/10 — ${transition} transition...`);
        await new Promise(r => setTimeout(r, 1000 / FPS));
      }

      // Static Ken Burns frames
      for (let f = 0; f < STATIC_FRAMES; f++) {
        const kenT = f / STATIC_FRAMES;
        const globalProgress = (imgIdx * FRAME_TOTAL_FRAMES + TRANSITION_FRAMES + f) / totalFrames;
        const beatPulse = Math.abs(Math.sin((totalFramesDrawn / 12) * Math.PI));
        ctx.clearRect(0, 0, W, H);
        ctx.globalAlpha = 1;
        drawFrame(img, kenT, panX, panY);
        drawOverlay(imgIdx);
        drawUI(imgIdx, caption, globalProgress, beatPulse);
        totalFramesDrawn++;
        setGenProgress(25 + Math.round((totalFramesDrawn / totalFrames) * 68));
        await new Promise(r => setTimeout(r, 1000 / FPS));
      }
    }

    setGenLabel("Finalizing with audio...");
    recorder.stop();
    await recordingDone;

    if (audioCtx) {
      try { audioCtx.close(); } catch {}
    }

    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);
    setGenProgress(100);
    setStep("done");
  }, [canGenerate, allSelectedImages, destination, template]);

  // ── Render ─────────────────────────────────────────────────────────────
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 bg-black/90 backdrop-blur-2xl"
      onClick={onClose}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: "hsl(var(--background))",
          maxHeight: "92vh",
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/20 sticky top-0 z-10"
          style={{ background: "hsl(var(--background))" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(270,60%,45%), hsl(300,55%,35%))" }}>
              <Film className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-heading text-sm font-bold" style={{ color: "hsl(158, 45%, 10%)" }}>30s Cinematic Reel</p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Volume2 className="w-2.5 h-2.5" /> Beats + transitions + HD video
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload step */}
        {step === "upload" && (
          <div className="p-5 space-y-5">
            {/* Template picker */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground mb-2.5 uppercase tracking-widest">Visual Style</p>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setTemplate(t)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all border-2 flex items-center gap-2 ${template.id === t.id ? "border-primary shadow-lg scale-[1.02] ring-2 ring-primary/30" : "border-transparent"}`}
                    style={{
                      background: `linear-gradient(135deg, ${t.gradient[0]}, ${t.gradient[t.gradient.length - 1]})`,
                      color: t.textColor,
                    }}>
                    <span className="text-base">{t.name.split(" ")[0]}</span>
                    <div className="text-left min-w-0">
                      <p className="text-[11px] font-bold truncate">{t.name.split(" ").slice(1).join(" ")}</p>
                      <p className="text-[9px] opacity-70">{t.beatStyle} beats</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo count progress */}
            <div className="p-3.5 rounded-2xl" style={{
              background: canGenerate ? "hsla(158,42%,38%,0.10)" : "hsla(40,85%,55%,0.08)",
              border: `1px solid ${canGenerate ? "hsla(158,42%,50%,0.25)" : "hsla(40,85%,55%,0.20)"}`,
            }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {canGenerate
                    ? <CheckCircle2 className="w-4 h-4 text-primary" />
                    : <AlertCircle className="w-4 h-4" style={{ color: "hsl(40,85%,45%)" }} />}
                  <span className="text-xs font-bold" style={{ color: canGenerate ? "hsl(158,42%,25%)" : "hsl(40,85%,30%)" }}>
                    {totalCount} / {REQUIRED_PHOTOS} photos
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {canGenerate ? "✓ Ready!" : `Need ${REQUIRED_PHOTOS - totalCount} more`}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsla(158,30%,75%,0.3)" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(totalCount / REQUIRED_PHOTOS) * 100}%`,
                    background: canGenerate ? "hsl(158,42%,40%)" : "hsl(40,85%,50%)",
                  }} />
              </div>
            </div>

            {/* Grid of selected photos */}
            {uploadedFiles.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Uploaded ({uploadedFiles.length})</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden ring-2 ring-primary/40">
                      <img src={f.preview} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeUploaded(i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center">
                        <X className="w-2.5 h-2.5 text-white" />
                      </button>
                      <div className="absolute bottom-0.5 left-0.5 bg-black/60 rounded-md px-1 py-0.5">
                        <span className="text-white text-[8px] font-bold">{i + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload zone */}
            {totalCount < REQUIRED_PHOTOS && (
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Upload Photos — {REQUIRED_PHOTOS - totalCount} more needed
                </p>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 rounded-2xl flex flex-col items-center gap-2.5 transition-all"
                  style={{
                    border: "2px dashed hsla(270,60%,55%,0.4)",
                    background: "hsla(270,60%,45%,0.04)",
                  }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, hsl(270,60%,45%), hsl(300,55%,35%))" }}>
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold" style={{ color: "hsl(270,60%,40%)" }}>Tap to upload photos</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">JPG, PNG, WEBP • Need exactly 10</p>
                  </div>
                </button>
              </div>
            )}

            {/* Existing trip photos */}
            {!loading && existingPhotos.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Your Trip Photos — tap to select
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {existingPhotos.slice(0, 16).map(p => {
                    const isSelected = selectedExisting.includes(p.id);
                    const isDisabled = !isSelected && totalCount >= REQUIRED_PHOTOS;
                    return (
                      <button key={p.id} onClick={() => toggleExisting(p.id)} disabled={isDisabled}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${isSelected ? "border-primary shadow-lg" : "border-transparent"} ${isDisabled ? "opacity-35" : "hover:opacity-90"}`}>
                        <img src={getPublicUrl(p.storage_path)} alt="" className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/25 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[11px] font-bold shadow">
                              ✓
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={generateVideo}
              disabled={!canGenerate}
              className="btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none rounded-2xl"
              style={canGenerate ? { background: "linear-gradient(135deg, hsl(270,60%,45%), hsl(300,55%,35%))" } : {}}
            >
              <Sparkles className="w-4 h-4" />
              Generate HD Reel with Beats
            </button>

            {/* Info strip */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl"
              style={{ background: "hsla(270,60%,45%,0.07)", border: "1px solid hsla(270,60%,45%,0.18)" }}>
              <Music className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(270,60%,45%)" }} />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <strong style={{ color: "hsl(270,50%,40%)" }}>Synthesized beats</strong> generated in your browser from your chosen style. 10 photos → 30s cinematic video with {TRANSITIONS_CONFIG.length} mixed transitions, Ken Burns, and audio.
              </p>
            </div>
          </div>
        )}

        {/* Generating step */}
        {step === "generating" && (
          <div className="p-8 flex flex-col items-center gap-5">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-border/20" />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-t-transparent border-b-transparent"
                style={{ borderLeftColor: template.accentColor, borderRightColor: template.gradient[1] }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-3 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${template.gradient[0]}, ${template.gradient[template.gradient.length - 1]})` }}>
                <Film className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-center w-full">
              <p className="font-heading text-base mb-1" style={{ color: "hsl(158,45%,10%)" }}>
                Crafting your reel…
              </p>
              <p className="text-xs text-muted-foreground mb-4">{genLabel}</p>
              <div className="w-full h-2.5 rounded-full overflow-hidden mx-auto" style={{ background: "hsla(158,30%,85%,0.4)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${template.gradient[0]}, ${template.accentColor})` }}
                  animate={{ width: `${genProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">{genProgress}% — ~1–3 min depending on device</p>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
              {[
                { icon: "🎵", label: "Live Beats" },
                { icon: "✨", label: "10 Transitions" },
                { icon: "🎬", label: "HD 9:16" },
              ].map(({ icon, label }) => (
                <div key={label} className="glass-panel py-2.5 px-2 rounded-xl text-center">
                  <div className="text-lg mb-0.5">{icon}</div>
                  <p className="text-[10px] font-semibold text-primary">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Done step */}
        {step === "done" && videoUrl && (
          <div className="p-5 space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🎬</div>
              <p className="font-heading text-lg font-bold" style={{ color: "hsl(158,45%,10%)" }}>Your Reel is Ready!</p>
              <p className="text-xs text-muted-foreground">HD video with beats • Preview & download</p>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black mx-auto shadow-2xl" style={{ maxHeight: "52vh", aspectRatio: "9/16", display: "flex" }}>
              <video src={videoUrl} controls autoPlay loop playsInline className="w-full h-full object-contain" style={{ maxHeight: "52vh" }} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStep("upload"); setVideoUrl(null); setGenProgress(0); }}
                className="flex-1 py-3 rounded-xl btn-ghost-glass text-sm">← Redo</button>
              <a href={videoUrl} download={`${destination.replace(/\s/g, "-")}-KroTravel-reel.webm`}
                className="flex-1 py-3.5 rounded-xl btn-primary text-sm font-bold flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, hsl(270,60%,45%), hsl(300,55%,35%))" }}>
                <Download className="w-4 h-4" /> Download
              </a>
            </div>
            <button onClick={onClose} className="w-full py-2 text-xs text-muted-foreground">Close</button>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-6 text-center">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <p className="font-heading text-sm mb-1">Generation Failed</p>
            <p className="text-xs text-muted-foreground mb-4">{error}</p>
            <button onClick={() => { setError(null); setStep("upload"); }} className="btn-primary px-6 py-2 text-sm">Try Again</button>
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default ReelGenerator;
