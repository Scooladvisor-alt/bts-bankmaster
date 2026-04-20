import React, { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Flame, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VraiOuFaux({ subject }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null); // "correct" | "wrong" | null
  const [score, setScore] = useState({ good: 0, bad: 0 });
  const [done, setDone] = useState(false);
  const [dragX, setDragX] = useState(0);
  const dragStartRef = useRef(null);

  useEffect(() => {
    (async () => {
      // On récupère des questions QCM et on génère des affirmations vrai/faux
      const qs = await base44.entities.Question.filter({ subject, mode: "pareto" }, null, 200);
      // Pour chaque question, on crée une affirmation : soit la bonne réponse (VRAI), soit une mauvaise (FAUX)
      const generated = [];
      qs.forEach((q) => {
        if (!q.question || !q.options || q.correct_index === undefined) return;
        const correctOpt = q.options[q.correct_index];
        const wrongOpts = q.options.filter((_, i) => i !== q.correct_index);

        // Carte VRAI : "La réponse à [question] est [bonne réponse]"
        generated.push({
          statement: `"${correctOpt}" est la bonne réponse à : ${q.question}`,
          isTrue: true,
          explanation: q.explanation || `Correct : ${correctOpt}`,
        });

        // Carte FAUX : utilise une mauvaise réponse
        if (wrongOpts[0]) {
          generated.push({
            statement: `"${wrongOpts[0]}" est la bonne réponse à : ${q.question}`,
            isTrue: false,
            explanation: q.explanation || `Faux ! La bonne réponse est : ${correctOpt}`,
          });
        }
      });

      // Mélange
      const shuffled = generated.sort(() => Math.random() - 0.5).slice(0, 30);
      setCards(shuffled);
      setLoading(false);
    })();
  }, [subject]);

  const current = cards[index];

  const answer = (userSaysTrue) => {
    if (result !== null) return;
    const correct = userSaysTrue === current.isTrue;
    setResult(correct ? "correct" : "wrong");
    setScore((s) => correct ? { ...s, good: s.good + 1 } : { ...s, bad: s.bad + 1 });

    setTimeout(() => {
      setResult(null);
      setDragX(0);
      if (index + 1 >= cards.length) {
        setDone(true);
      } else {
        setIndex((i) => i + 1);
      }
    }, 1200);
  };

  const restart = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setIndex(0);
    setScore({ good: 0, bad: 0 });
    setResult(null);
    setDone(false);
    setDragX(0);
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-stone-500 p-10">
      <Loader2 className="w-5 h-5 animate-spin" /> Chargement…
    </div>
  );

  if (cards.length === 0) return (
    <div className="text-center text-stone-500 p-10">Pas de questions disponibles.</div>
  );

  if (done) return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
      <div className="text-7xl mb-5">{score.good >= score.bad ? "🏆" : "💪"}</div>
      <h2 className="font-display text-3xl font-bold mb-2">Terminé !</h2>
      <div className="flex justify-center gap-6 mt-4 mb-8">
        <div className="bg-green-100 text-green-700 rounded-2xl px-6 py-3 text-center">
          <div className="text-3xl font-bold">{score.good}</div>
          <div className="text-sm font-bold">✅ Vrais</div>
        </div>
        <div className="bg-red-100 text-red-700 rounded-2xl px-6 py-3 text-center">
          <div className="text-3xl font-bold">{score.bad}</div>
          <div className="text-sm font-bold">❌ Faux</div>
        </div>
      </div>
      <button
        onClick={restart}
        className="bg-rose-500 text-white font-display font-bold text-lg px-8 py-3 rounded-2xl border-b-4 border-rose-700 hover:bg-rose-400 active:border-b-0 active:translate-y-1 transition-all"
      >
        🔥 Rejouer
      </button>
    </motion.div>
  );

  const progress = index / cards.length;
  const tiltDeg = dragX * 0.08;
  const showVrai = dragX > 40;
  const showFaux = dragX < -40;

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      {/* Score & progress */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between text-xs font-bold text-stone-500 mb-1">
          <span>✅ {score.good}</span>
          <span>{index + 1} / {cards.length}</span>
          <span>❌ {score.bad}</span>
        </div>
        <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
          <div className="h-full bg-rose-400 rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      {/* Card stack */}
      <div className="relative w-full max-w-sm h-72 flex items-center justify-center">
        {/* Ghost card derrière */}
        {cards[index + 1] && (
          <div className="absolute inset-0 bg-white rounded-3xl shadow-md border border-stone-100 scale-95 opacity-50" />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            style={{ rotate: tiltDeg, x: dragX }}
            drag="x"
            dragConstraints={{ left: -200, right: 200 }}
            onDrag={(_, info) => setDragX(info.offset.x)}
            onDragEnd={(_, info) => {
              if (info.offset.x > 80) answer(true);
              else if (info.offset.x < -80) answer(false);
              else setDragX(0);
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, x: dragX, rotate: tiltDeg }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="absolute inset-0 bg-white rounded-3xl shadow-duo-lg border-2 border-stone-200 p-6 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {/* Indicateur de swipe */}
            <div className={`absolute top-4 left-4 bg-green-500 text-white font-bold text-lg px-3 py-1 rounded-xl transition-opacity ${showVrai ? "opacity-100" : "opacity-0"}`}>
              VRAI ✅
            </div>
            <div className={`absolute top-4 right-4 bg-red-500 text-white font-bold text-lg px-3 py-1 rounded-xl transition-opacity ${showFaux ? "opacity-100" : "opacity-0"}`}>
              FAUX ❌
            </div>

            <Flame className="w-8 h-8 text-rose-400 mb-3" />
            <p className="text-center font-semibold text-stone-800 text-sm leading-relaxed">{current.statement}</p>
          </motion.div>
        </AnimatePresence>

        {/* Feedback overlay */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 rounded-3xl flex flex-col items-center justify-center z-10 ${result === "correct" ? "bg-green-400/90" : "bg-red-400/90"}`}
            >
              <div className="text-5xl mb-2">{result === "correct" ? "✅" : "❌"}</div>
              <div className="text-white font-display font-bold text-xl">{result === "correct" ? "Correct !" : "Raté !"}</div>
              <div className="text-white/90 text-xs mt-2 px-6 text-center">{current.explanation}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Boutons */}
      <div className="flex gap-4 w-full max-w-sm">
        <button
          onClick={() => answer(false)}
          className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-display font-bold text-lg py-4 rounded-2xl border-b-4 border-red-300 active:border-b-0 active:translate-y-1 transition-all"
        >
          <X className="w-6 h-6" /> FAUX
        </button>
        <button
          onClick={() => answer(true)}
          className="flex-1 flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-display font-bold text-lg py-4 rounded-2xl border-b-4 border-green-300 active:border-b-0 active:translate-y-1 transition-all"
        >
          <Check className="w-6 h-6" /> VRAI
        </button>
      </div>

      <p className="text-xs text-stone-400 font-bold">👈 Glisse à gauche = FAUX &nbsp;|&nbsp; Glisse à droite = VRAI 👉</p>
    </div>
  );
}