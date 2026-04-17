import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RotateCcw, Heart } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";

export default function GameQCM({ subject }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      let all = await base44.entities.Question.filter({ subject, mode: "jeu" });
      if (all.length === 0) {
        all = await base44.entities.Question.filter({ subject, mode: "pareto" });
      }
      // Garder 3 options maximum pour les 3 chemins
      const mapped = all.map((q) => {
        if (q.options.length <= 3) return q;
        // On prend 3 options en gardant la bonne
        const correct = q.options[q.correct_index];
        const others = q.options.filter((_, i) => i !== q.correct_index).slice(0, 2);
        const newOpts = [correct, ...others].sort(() => Math.random() - 0.5);
        return { ...q, options: newOpts, correct_index: newOpts.indexOf(correct) };
      });
      setQuestions(mapped.sort(() => Math.random() - 0.5));
      setLoading(false);
    })();
  }, [subject]);

  const current = questions[idx];

  const handlePath = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === current.correct_index) {
      setScore((s) => s + 1);
      setTimeout(nextQuestion, 900);
    } else {
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) setTimeout(() => setDone(true), 1200);
        else setTimeout(nextQuestion, 1400);
        return nl;
      });
    }
  };

  const nextQuestion = () => {
    if (idx + 1 >= questions.length) setDone(true);
    else { setIdx(idx + 1); setSelected(null); }
  };

  const restart = () => {
    setIdx(0); setSelected(null); setLives(3); setScore(0); setDone(false);
    setQuestions((qs) => [...qs].sort(() => Math.random() - 0.5));
  };

  if (loading) return <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>;
  if (questions.length === 0) return <div className="bg-white rounded-2xl p-6 text-center text-stone-600">Pas encore de questions en mode jeu.</div>;

  if (done) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center shadow-duo-lg">
        <div className="text-6xl mb-3">{lives > 0 ? "🏆" : "💥"}</div>
        <h2 className="font-display text-3xl font-bold">{lives > 0 ? "Parcours terminé !" : "Game over"}</h2>
        <div className="text-stone-600 mt-2">Score final : <span className="font-bold text-pink-600">{score}</span></div>
        <DuoButton variant="primary" className="mt-6" onClick={restart}>
          <RotateCcw className="w-4 h-4 inline mr-2" /> Rejouer
        </DuoButton>
      </div>
    );
  }

  const pathColors = ["bg-pink-400", "bg-blue-400", "bg-yellow-400"];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} className={`w-5 h-5 ${i < lives ? "fill-red-500 text-red-500" : "text-stone-300"}`} />
          ))}
        </div>
        <div className="text-sm font-bold text-pink-600">Score {score}</div>
      </div>

      <div className="bg-gradient-to-b from-sky-200 via-sky-100 to-green-100 rounded-3xl p-5 relative overflow-hidden border-b-4 border-sky-300" style={{ minHeight: 480 }}>
        {/* Nuages */}
        <div className="absolute top-4 left-4 text-3xl opacity-70">☁️</div>
        <div className="absolute top-8 right-6 text-2xl opacity-70">☁️</div>

        <div className="relative bg-white/90 backdrop-blur rounded-2xl p-4 shadow mb-4">
          {current.chapter && <div className="text-[10px] font-bold uppercase tracking-widest text-pink-600">{current.chapter}</div>}
          <div className="font-display text-lg font-bold leading-snug">{current.question}</div>
        </div>

        {/* Personnage */}
        <div className="flex justify-center my-3">
          <motion.div
            key={idx + "-char"}
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="text-5xl"
          >
            🏃
          </motion.div>
        </div>

        {/* 3 chemins */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {current.options.slice(0, 3).map((opt, i) => {
            const show = selected !== null;
            const isCorrect = i === current.correct_index;
            const isSelected = i === selected;
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePath(i)}
                disabled={selected !== null}
                className={`${pathColors[i]} rounded-2xl p-3 text-white font-bold shadow-duo border-b-4 border-black/15 min-h-[100px] flex flex-col items-center justify-center text-sm text-center
                  ${show && isCorrect ? "ring-4 ring-green-500" : ""}
                  ${show && isSelected && !isCorrect ? "ring-4 ring-red-500 opacity-70" : ""}
                `}
              >
                <div className="text-lg mb-1">⬆️</div>
                <div className="leading-tight">{opt}</div>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 rounded-xl p-3 text-sm font-semibold text-center ${selected === current.correct_index ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {selected === current.correct_index ? "✅ Bien joué !" : `❌ Bonne réponse : ${current.options[current.correct_index]}`}
              {current.explanation && <div className="text-xs font-medium opacity-80 mt-1">{current.explanation}</div>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}