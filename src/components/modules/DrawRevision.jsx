import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, CheckCircle2 } from "lucide-react";

const QUESTIONS = {
  VOJES: [
    { prompt: "Coefficient de réserves obligatoires en abrégé", answer: "RRR" },
    { prompt: "Institution qui fixe les taux directeurs de la zone euro", answer: "BCE" },
    { prompt: "Lutte Contre le Blanchiment et le Financement du Terrorisme", answer: "LCB-FT" },
    { prompt: "Ratio de solvabilité imposé par Bâle III (en %)", answer: "8%" },
    { prompt: "Autorité de Contrôle Prudentiel et de Résolution", answer: "ACPR" },
  ],
  CESBF: [
    { prompt: "Taux annuel effectif global — abréviation", answer: "TAEG" },
    { prompt: "Durée légale de rétractation pour un crédit conso (en jours)", answer: "14" },
    { prompt: "Plan d'Épargne en Actions — sigle", answer: "PEA" },
    { prompt: "Plan d'Épargne Retraite — abréviation", answer: "PER" },
    { prompt: "Nombre de jours du délai de réflexion pour un crédit immobilier", answer: "10" },
  ],
};

// Dimensions internes du canvas (résolution fixe)
const W = 600;
const H = 180;

// Dessine le texte guide sur un canvas hors-écran, retourne son ImageData
function buildGuideImageData(text) {
  const offscreen = document.createElement("canvas");
  offscreen.width = W;
  offscreen.height = H;
  const ctx = offscreen.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Taille de police adaptée à la longueur du texte
  const fontSize = Math.min(H * 0.72, (W * 0.88) / (text.length * 0.58));
  ctx.font = `900 ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // On remplit avec du noir opaque pour la détection (hors-écran)
  ctx.fillStyle = "#000000";
  ctx.fillText(text, W / 2, H / 2);

  return ctx.getImageData(0, 0, W, H);
}

// Vérifie si le pixel (x,y) est "noir" dans l'ImageData du guide
function pixelIsGuide(imageData, x, y) {
  const xi = Math.round(x);
  const yi = Math.round(y);
  if (xi < 0 || yi < 0 || xi >= W || yi >= H) return false;
  const i = (yi * W + xi) * 4;
  // Pixel noir = R faible (fond blanc = R=255)
  return imageData.data[i] < 128;
}

export default function DrawRevision({ subject }) {
  const questions = QUESTIONS[subject] || [];
  const [qIndex, setQIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null); // null | { pct, success }
  const [hasDrawn, setHasDrawn] = useState(false);

  // Canvas dessin (visible)
  const drawCanvasRef = useRef(null);
  // Canvas guide (visible, en dessous via position absolute)
  const guideCanvasRef = useRef(null);
  // ImageData hors-écran pour la détection
  const guideImageDataRef = useRef(null);

  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const onGuideCount = useRef(0);
  const offGuideCount = useRef(0);

  const q = questions[qIndex];

  // Initialise / réinitialise le canvas guide et le canvas dessin
  const init = () => {
    if (!q) return;

    // Canvas dessin — effacer complètement (transparent)
    const drawCanvas = drawCanvasRef.current;
    if (drawCanvas) {
      const ctx = drawCanvas.getContext("2d");
      ctx.clearRect(0, 0, W, H);
    }

    // Canvas guide — dessiner le texte en transparent
    const guideCanvas = guideCanvasRef.current;
    if (guideCanvas) {
      const ctx = guideCanvas.getContext("2d");
      ctx.clearRect(0, 0, W, H);
      const fontSize = Math.min(H * 0.72, (W * 0.88) / (q.answer.length * 0.58));
      ctx.font = `900 ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(139, 92, 246, 0.15)"; // violet très transparent
      ctx.fillText(q.answer, W / 2, H / 2);
    }

    // ImageData hors-écran pour la détection pixel
    guideImageDataRef.current = buildGuideImageData(q.answer);

    // Reset compteurs
    onGuideCount.current = 0;
    offGuideCount.current = 0;
    setHasDrawn(false);
    setResult(null);
    isDrawing.current = false;
    lastPos.current = null;
  };

  useEffect(() => {
    // Petit délai pour que le DOM soit rendu
    const t = setTimeout(init, 60);
    return () => clearTimeout(t);
  }, [qIndex]);

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
    if (result) return; // désactivé après validation
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

    // Vérifier si la position actuelle est sur le guide
    const onGuide = pixelIsGuide(guideImageDataRef.current, pos.x, pos.y);

    // Dessiner le segment
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = onGuide ? "rgba(109, 40, 217, 0.9)" : "rgba(239, 68, 68, 0.7)";
    ctx.stroke();

    // Compter les points pour le score
    // On échantillonne tous les ~2px le long du segment
    const dx = pos.x - prev.x;
    const dy = pos.y - prev.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.round(dist / 2));
    for (let s = 0; s <= steps; s++) {
      const sx = prev.x + (dx * s) / steps;
      const sy = prev.y + (dy * s) / steps;
      if (pixelIsGuide(guideImageDataRef.current, sx, sy)) {
        onGuideCount.current++;
      } else {
        offGuideCount.current++;
      }
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
    if (success) setScore(s => s + 1);
    setResult({ pct, success });
  };

  const next = () => {
    if (qIndex + 1 >= questions.length) {
      setDone(true);
    } else {
      setQIndex(i => i + 1);
    }
  };

  const restart = () => {
    setQIndex(0);
    setScore(0);
    setDone(false);
    setResult(null);
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
        <div className="text-5xl mb-3">{score >= 4 ? "🏆" : score >= 2 ? "💪" : "📚"}</div>
        <div className="font-display text-3xl font-bold text-stone-900 mb-1">{score} / {questions.length}</div>
        <div className="text-stone-500 text-sm mb-6">
          {score === questions.length ? "Parfait !" : score >= 3 ? "Bien joué !" : "Continue à t'entraîner !"}
        </div>
        <button onClick={restart}
          className="inline-flex items-center gap-2 bg-violet-600 text-white font-display font-bold px-6 py-3 rounded-2xl border-b-4 border-violet-800 active:border-b-0 active:translate-y-0.5 transition-all">
          <RotateCcw className="w-4 h-4" /> Recommencer
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="flex justify-between text-xs font-bold text-stone-400">
        <span>Question {qIndex + 1} / {questions.length}</span>
        <span className="text-violet-600">{score} ✅</span>
      </div>
      <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
        <div className="h-full bg-violet-400 rounded-full transition-all" style={{ width: `${(qIndex / questions.length) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={qIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 border-b-4 border-b-stone-300">

          {/* Question */}
          <p className="font-fredoka text-lg text-stone-800 mb-1 leading-snug">{q.prompt}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-4">
            ✏️ Trace par-dessus le modèle — reste dans les contours
          </p>

          {/* Zone de dessin : deux canvas superposés */}
          <div className="relative w-full rounded-2xl overflow-hidden border-2 border-violet-200"
            style={{ height: 120, background: "#faf8ff", touchAction: "none" }}>

            {/* Canvas guide (en dessous) */}
            <canvas
              ref={guideCanvasRef}
              width={W}
              height={H}
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: "none" }}
            />

            {/* Canvas dessin (par-dessus, capte les events) */}
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
          </div>

          {/* Résultat inline */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`mt-3 rounded-xl px-4 py-3 text-center ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                <div className={`font-bold text-sm ${result.success ? "text-green-700" : "text-red-700"}`}>
                  {result.success ? `✅ Bien tracé ! (${result.pct}% dans la zone)` : `❌ ${result.pct}% dans la zone — essaie de mieux suivre le modèle`}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Boutons */}
          <div className="flex gap-2 mt-4">
            <button onClick={init}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-100 text-stone-600 font-bold text-xs border border-stone-200 hover:bg-stone-200 transition-all">
              <RotateCcw className="w-3.5 h-3.5" /> Effacer
            </button>
            {!result ? (
              <button onClick={validate} disabled={!hasDrawn}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white font-display font-bold px-4 py-2.5 rounded-2xl border-b-4 border-violet-800 disabled:opacity-40 active:border-b-0 active:translate-y-0.5 transition-all">
                <CheckCircle2 className="w-4 h-4" /> Valider
              </button>
            ) : (
              <button onClick={next}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white font-display font-bold px-4 py-2.5 rounded-2xl border-b-4 border-violet-800 active:border-b-0 active:translate-y-0.5 transition-all">
                {qIndex + 1 < questions.length ? "Question suivante →" : "Voir le résultat"}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}