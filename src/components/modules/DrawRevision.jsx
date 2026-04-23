import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, CheckCircle2, ChevronRight } from "lucide-react";

// Questions par matière — le texte à tracer
const QUESTIONS = {
  VOJES: [
    { prompt: "Comment s'appelle le coefficient de réserves obligatoires en abrégé ?", answer: "RRR" },
    { prompt: "Quelle institution fixe les taux directeurs de la zone euro ?", answer: "BCE" },
    { prompt: "Abréviation de la Lutte Contre le Blanchiment et le Financement du Terrorisme", answer: "LCB-FT" },
    { prompt: "Ratio de solvabilité imposé par Bâle III (en %)", answer: "8%" },
    { prompt: "Sigle de l'Autorité de Contrôle Prudentiel et de Résolution", answer: "ACPR" },
  ],
  CESBF: [
    { prompt: "Taux annuel effectif global — abréviation", answer: "TAEG" },
    { prompt: "Durée légale de rétractation pour un crédit conso (jours)", answer: "14" },
    { prompt: "Sigle du Plan d'Épargne en Actions", answer: "PEA" },
    { prompt: "Abréviation du Plan d'Épargne Retraite", answer: "PER" },
    { prompt: "Nombre de garants maximum pour un cautionnement solidaire", answer: "2" },
  ],
};

// Dessiner le texte guide sur le canvas (semi-transparent)
function drawGuide(ctx, text, W, H) {
  ctx.clearRect(0, 0, W, H);
  // Fond blanc
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Texte guide transparent
  const fontSize = Math.min(H * 0.55, W / (text.length * 0.65));
  ctx.font = `900 ${fontSize}px 'Fredoka', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(130, 100, 220, 0.18)";
  ctx.fillText(text, W / 2, H / 2);

  // Ligne guide centrale
  ctx.strokeStyle = "rgba(130,100,220,0.08)";
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(W * 0.1, H / 2);
  ctx.lineTo(W * 0.9, H / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Récupérer les pixels du guide pour la détection
  const imageData = ctx.getImageData(0, 0, W, H);
  return imageData;
}

// Vérifie si un pixel appartient au texte guide (canal alpha > seuil)
function isOnGuide(guideData, x, y, W) {
  // On utilise l'opacité — le fond blanc est alpha=255 partout
  // Le texte guide a une couleur différente du blanc : R<200 ou G<200 ou B<200
  const i = (Math.round(y) * W + Math.round(x)) * 4;
  const r = guideData.data[i];
  const g = guideData.data[i + 1];
  const b = guideData.data[i + 2];
  // Si le pixel est significativement coloré (pas blanc pur)
  return r < 235 || g < 235 || b < 235;
}

export default function DrawRevision({ subject }) {
  const questions = QUESTIONS[subject] || [];
  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState("question"); // question | draw | result
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const canvasRef = useRef(null);
  const guideDataRef = useRef(null);
  const lastPos = useRef(null);
  const onGuidePixels = useRef(0);
  const offGuidePixels = useRef(0);

  const W = 340;
  const H = 120;

  const q = questions[qIndex];

  // Initialiser le canvas avec le guide
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !q) return;
    const ctx = canvas.getContext("2d");
    guideDataRef.current = drawGuide(ctx, q.answer, W, H);
    onGuidePixels.current = 0;
    offGuidePixels.current = 0;
    setHasDrawn(false);
    lastPos.current = null;
  }, [q]);

  useEffect(() => {
    if (phase === "draw") {
      setTimeout(initCanvas, 50);
    }
  }, [phase, initCanvas]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    if (e.touches) {
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
    setDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    const prev = lastPos.current;

    // Vérifier si on est sur le guide
    const onGuide = guideDataRef.current ? isOnGuide(guideDataRef.current, pos.x, pos.y, W) : false;

    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (onGuide) {
      ctx.strokeStyle = "rgba(100, 60, 200, 0.85)";
      onGuidePixels.current++;
    } else {
      ctx.strokeStyle = "rgba(239, 68, 68, 0.55)";
      offGuidePixels.current++;
    }
    ctx.stroke();

    lastPos.current = pos;
  };

  const stopDraw = (e) => {
    e?.preventDefault();
    setDrawing(false);
    lastPos.current = null;
  };

  const validate = () => {
    const total = onGuidePixels.current + offGuidePixels.current;
    if (total === 0) return;
    const pct = total > 0 ? Math.round((onGuidePixels.current / total) * 100) : 0;
    const success = pct >= 50;
    if (success) setScore(s => s + 1);
    setPhase("result");
  };

  const next = () => {
    if (qIndex + 1 >= questions.length) {
      setDone(true);
    } else {
      setQIndex(i => i + 1);
      setPhase("question");
    }
  };

  const restart = () => {
    setQIndex(0);
    setPhase("question");
    setScore(0);
    setDone(false);
  };

  const total = onGuidePixels.current + offGuidePixels.current;
  const pct = total > 0 ? Math.round((onGuidePixels.current / total) * 100) : 0;
  const success = pct >= 50;

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
        <div className="text-5xl mb-3">{score >= 4 ? "🏆" : score >= 2 ? "💪" : "📚"}</div>
        <div className="font-display text-2xl font-bold text-stone-900 mb-1">
          {score} / {questions.length}
        </div>
        <div className="text-stone-500 text-sm mb-6">
          {score === questions.length ? "Parfait !" : score >= 3 ? "Bien joué !" : "Continue à t'entraîner !"}
        </div>
        <button onClick={restart}
          className="flex items-center gap-2 mx-auto bg-violet-600 text-white font-display font-bold px-6 py-3 rounded-2xl border-b-4 border-violet-800 active:border-b-0 active:translate-y-0.5 transition-all">
          <RotateCcw className="w-4 h-4" /> Recommencer
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="flex justify-between text-xs font-bold text-stone-400 mb-1">
        <span>Question {qIndex + 1} / {questions.length}</span>
        <span className="text-violet-600">{score} ✅</span>
      </div>
      <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-violet-400 rounded-full transition-all" style={{ width: `${(qIndex / questions.length) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        {phase === "question" && (
          <motion.div key="q" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 border-b-4 border-b-stone-300">
            <div className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-2">✏️ Mémorise et trace</div>
            <p className="font-fredoka text-lg leading-snug text-stone-800 mb-4">{q.prompt}</p>
            <div className="bg-violet-50 rounded-xl px-4 py-3 text-center border border-violet-200">
              <div className="text-xs text-violet-400 font-bold mb-1">Réponse à tracer</div>
              <div className="font-display text-3xl font-bold text-violet-700">{q.answer}</div>
            </div>
            <button onClick={() => setPhase("draw")}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-display font-bold px-4 py-3 rounded-2xl border-b-4 border-violet-800 active:border-b-0 active:translate-y-0.5 transition-all">
              <ChevronRight className="w-4 h-4" /> J'ai mémorisé — à moi de tracer !
            </button>
          </motion.div>
        )}

        {phase === "draw" && (
          <motion.div key="draw" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 border-b-4 border-b-stone-300">
            <div className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-1">✏️ Trace par-dessus le modèle</div>
            <p className="text-xs text-stone-400 mb-3">Reste dans les contours — rouge = hors zone</p>

            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={W}
                height={H}
                className="border-2 border-violet-200 rounded-2xl cursor-crosshair touch-none"
                style={{ width: "100%", maxWidth: W, height: "auto", background: "#fff" }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={initCanvas}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-600 font-bold text-xs border border-stone-200 hover:bg-stone-200 transition-all">
                <RotateCcw className="w-3.5 h-3.5" /> Effacer
              </button>
              <button onClick={validate} disabled={!hasDrawn}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white font-display font-bold px-4 py-2.5 rounded-2xl border-b-4 border-violet-800 disabled:opacity-40 active:border-b-0 active:translate-y-0.5 transition-all">
                <CheckCircle2 className="w-4 h-4" /> Valider mon tracé
              </button>
            </div>
          </motion.div>
        )}

        {phase === "result" && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 border-b-4 border-b-stone-300">
            <div className={`rounded-2xl p-4 mb-4 text-center ${success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <div className="text-2xl mb-1">{success ? "✅" : "❌"}</div>
              <div className={`font-bold text-sm ${success ? "text-green-700" : "text-red-700"}`}>
                {success ? `Bien tracé ! ${pct}% dans la zone` : `${pct}% dans la zone — réessaie !`}
              </div>
              <div className="text-xs text-stone-500 mt-1">Réponse : <span className="font-bold text-stone-800">{q.answer}</span></div>
            </div>
            <button onClick={next}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-display font-bold px-4 py-3 rounded-2xl border-b-4 border-violet-800 active:border-b-0 active:translate-y-0.5 transition-all">
              {qIndex + 1 < questions.length ? "Question suivante →" : "Voir le résultat"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}