import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, CheckCircle2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Dimensions internes du canvas (résolution fixe — grande !)
const W = 900;
const H = 320;

function buildGuideImageData(text) {
  const offscreen = document.createElement("canvas");
  offscreen.width = W;
  offscreen.height = H;
  const ctx = offscreen.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  const fontSize = Math.min(H * 0.65, (W * 0.85) / (text.length * 0.52));
  ctx.font = `900 ${fontSize}px Arial Black, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000000";
  ctx.fillText(text, W / 2, H / 2);
  return ctx.getImageData(0, 0, W, H);
}

function pixelIsGuide(imageData, x, y) {
  const xi = Math.round(x);
  const yi = Math.round(y);
  if (xi < 0 || yi < 0 || xi >= W || yi >= H) return false;
  const i = (yi * W + xi) * 4;
  return imageData.data[i] < 128;
}

function generateParticles(count = 32) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 18 + 8,
    delay: Math.random() * 0.4,
    color: ["#a855f7", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#f97316"][Math.floor(Math.random() * 6)],
  }));
}

// Dessine le modèle guide sur le canvas visible
function drawGuide(canvas, text) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, W, H);
  const fontSize = Math.min(H * 0.65, (W * 0.85) / (text.length * 0.52));
  ctx.font = `900 ${fontSize}px Arial Black, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(139, 92, 246, 0.20)";
  ctx.fillText(text, W / 2, H / 2);
}

export default function DrawRevision({ subject }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qIndex, setQIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);
  const [particles, setParticles] = useState([]);

  const drawCanvasRef = useRef(null);
  const guideCanvasRef = useRef(null);
  const guideImageDataRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const onGuideCount = useRef(0);
  const offGuideCount = useRef(0);

  // Charge les questions depuis la BDD
  useEffect(() => {
    (async () => {
      setLoading(true);
      const list = await base44.entities.DrawQuestion.filter({ subject }, "order", 500);
      setQuestions(list || []);
      setLoading(false);
    })();
  }, [subject]);

  const q = questions[qIndex];

  // Initialise les canvas pour la question courante — réinitialise tout
  const init = useCallback(() => {
    if (!q) return;

    // Effacer canvas dessin
    const drawCanvas = drawCanvasRef.current;
    if (drawCanvas) {
      const ctx = drawCanvas.getContext("2d");
      ctx.clearRect(0, 0, W, H);
    }

    // Redessiner le guide sur le canvas guide visible
    drawGuide(guideCanvasRef.current, q.answer);

    // ImageData hors-écran pour la détection pixel
    guideImageDataRef.current = buildGuideImageData(q.answer);

    // Reset compteurs et états
    onGuideCount.current = 0;
    offGuideCount.current = 0;
    setHasDrawn(false);
    setResult(null);
    setShowShimmer(false);
    setParticles([]);
    isDrawing.current = false;
    lastPos.current = null;
  }, [q]);

  // Re-init quand la question change — petit délai pour que le DOM soit rendu
  useEffect(() => {
    if (!q) return;
    const t = setTimeout(init, 80);
    return () => clearTimeout(t);
  }, [qIndex, q, init]);

  // Re-dessine le guide quand le canvas guide est monté
  const guideRefCallback = useCallback((node) => {
    guideCanvasRef.current = node;
    if (node && q) {
      setTimeout(() => drawGuide(node, q.answer), 30);
    }
  }, [q]);

  const getPos = (e) => {
    const canvas = drawCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    if (e.touches && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    if (result) return;
    isDrawing.current = true;
    setHasDrawn(true);
    lastPos.current = getPos(e);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing.current || result) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);
    const prev = lastPos.current;
    if (!prev) { lastPos.current = pos; return; }

    const onGuide = pixelIsGuide(guideImageDataRef.current, pos.x, pos.y);
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = onGuide ? "rgba(109, 40, 217, 0.92)" : "rgba(239, 68, 68, 0.65)";
    ctx.stroke();

    const dx = pos.x - prev.x;
    const dy = pos.y - prev.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.round(dist / 2));
    for (let s = 0; s <= steps; s++) {
      const sx = prev.x + (dx * s) / steps;
      const sy = prev.y + (dy * s) / steps;
      if (pixelIsGuide(guideImageDataRef.current, sx, sy)) onGuideCount.current++;
      else offGuideCount.current++;
    }
    lastPos.current = pos;
  };

  const stopDraw = (e) => {
    e?.preventDefault();
    isDrawing.current = false;
    lastPos.current = null;
  };

  const validate = () => {
    const total = onGuideCount.current + offGuideCount.current;
    if (total === 0) return;
    const pct = Math.round((onGuideCount.current / total) * 100);
    const success = pct >= 55;
    if (success) {
      setScore(s => s + 1);
      setShowShimmer(true);
      setParticles(generateParticles(35));
      setTimeout(() => setShowShimmer(false), 1800);
    }
    setResult({ pct, success });
  };

  const next = () => {
    if (qIndex + 1 >= questions.length) {
      setDone(true);
    } else {
      setQIndex(i => i + 1);
      // Le useEffect [qIndex] s'occupera du init
    }
  };

  const restart = () => {
    setQIndex(0);
    setScore(0);
    setDone(false);
    setResult(null);
    setShowShimmer(false);
    setParticles([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-stone-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Chargement des questions…
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-stone-400 border border-stone-200">
        Aucune question de traçage pour cette matière.<br />
        <span className="text-xs">L'administrateur peut en ajouter depuis l'espace admin.</span>
      </div>
    );
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
        <div className="text-6xl mb-4">{score >= Math.ceil(questions.length * 0.8) ? "🏆" : score >= Math.ceil(questions.length * 0.5) ? "💪" : "📚"}</div>
        <div className="font-display text-4xl font-bold text-stone-900 mb-1">{score} / {questions.length}</div>
        <div className="text-stone-500 text-base mb-8">
          {score === questions.length ? "Parfait ! Maîtrise totale 🎯" : score >= Math.ceil(questions.length * 0.7) ? "Bien joué !" : "Continue à t'entraîner !"}
        </div>
        <button onClick={restart}
          className="inline-flex items-center gap-2 bg-violet-600 text-white font-display font-bold px-8 py-4 rounded-2xl border-b-4 border-violet-800 active:border-b-0 active:translate-y-0.5 transition-all text-lg">
          <RotateCcw className="w-5 h-5" /> Recommencer
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="flex justify-between text-sm font-bold text-stone-400">
        <span>Question {qIndex + 1} / {questions.length}</span>
        <span className="text-violet-600">{score} ✅</span>
      </div>
      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
        <div className="h-full bg-violet-400 rounded-full transition-all" style={{ width: `${(qIndex / questions.length) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={qIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 border-b-4 border-b-stone-300"
        >
          {/* Question */}
          <p className="font-fredoka text-2xl text-stone-800 mb-1 leading-snug">{q?.prompt}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-5">
            ✏️ Trace par-dessus le modèle — reste dans les contours
          </p>

          {/* Zone de dessin — deux canvas superposés */}
          <div className="relative w-full rounded-3xl overflow-hidden border-4 border-violet-200"
            style={{ height: 260, background: "linear-gradient(135deg, #faf8ff 0%, #f5f0ff 100%)", touchAction: "none" }}>

            {/* Canvas guide — toujours visible en dessous */}
            <canvas
              ref={guideRefCallback}
              width={W}
              height={H}
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: "none" }}
            />

            {/* Canvas dessin — par-dessus, capte les events */}
            <canvas
              ref={drawCanvasRef}
              width={W}
              height={H}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              style={{ background: "transparent" }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />

            {/* Shimmer de succès */}
            <AnimatePresence>
              {showShimmer && (
                <motion.div
                  className="absolute inset-0 pointer-events-none z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.6, 0] }}
                    transition={{ duration: 1.5, times: [0, 0.3, 1] }}
                    style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.4), rgba(167,139,250,0.4), rgba(52,211,153,0.4))" }}
                  />
                  <motion.div
                    className="absolute inset-0"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.85) 50%, transparent 70%)" }}
                  />
                  {particles.map(p => (
                    <motion.div
                      key={p.id}
                      className="absolute font-bold select-none"
                      style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size, color: p.color }}
                      initial={{ opacity: 0, scale: 0, y: 0 }}
                      animate={{ opacity: [0, 1, 0], scale: [0, 1.4, 0], y: -40 }}
                      transition={{ duration: 1.2, delay: p.delay, ease: "easeOut" }}
                    >★</motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Résultat */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`mt-4 rounded-2xl px-5 py-4 text-center ${result.success ? "bg-green-50 border-2 border-green-300" : "bg-red-50 border-2 border-red-200"}`}
              >
                <div className={`font-bold text-lg ${result.success ? "text-green-700" : "text-red-700"}`}>
                  {result.success
                    ? `✅ Excellent ! ${result.pct}% dans la zone 🌟`
                    : `❌ ${result.pct}% dans la zone — suis mieux le modèle !`}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Boutons */}
          <div className="flex gap-3 mt-5">
            <button onClick={init}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-stone-100 text-stone-600 font-bold text-sm border border-stone-200 hover:bg-stone-200 transition-all">
              <RotateCcw className="w-4 h-4" /> Effacer
            </button>
            {!result ? (
              <button onClick={validate} disabled={!hasDrawn}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white font-display font-bold px-6 py-3 rounded-2xl border-b-4 border-violet-800 disabled:opacity-40 active:border-b-0 active:translate-y-0.5 transition-all text-lg">
                <CheckCircle2 className="w-5 h-5" /> Valider
              </button>
            ) : (
              <button onClick={next}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white font-display font-bold px-6 py-3 rounded-2xl border-b-4 border-violet-800 active:border-b-0 active:translate-y-0.5 transition-all text-lg">
                {qIndex + 1 < questions.length ? "Question suivante →" : "Voir le résultat"}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}