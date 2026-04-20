import React, { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Check, X, RotateCcw } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

export default function VraiOuFaux({ subject }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ good: 0, bad: 0 });
  const [done, setDone] = useState(false);
  const [answered, setAnswered] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacityTrue = useTransform(x, [30, 100], [0, 1]);
  const opacityFalse = useTransform(x, [-100, -30], [1, 0]);
  const cardOpacity = useTransform(x, [-250, 0, 250], [0.4, 1, 0.4]);

  useEffect(() => {
    (async () => {
      // Charger les flashcards Vrai/Faux
      const flashcards = await base44.entities.Flashcard.filter({ subject }, null, 500);
      const vof = flashcards.filter(f =>
        f.back && (f.back.startsWith("VRAI") || f.back.startsWith("FAUX"))
      );
      const mapped = vof.map(f => ({
        statement: f.front,
        isTrue: f.back.startsWith("VRAI"),
        explanation: f.back.replace(/^(VRAI ✓|FAUX ✗)\s*[—\-]\s*/i, ""),
        chapter: f.chapter || "",
      }));
      const shuffled = mapped.sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setLoading(false);
    })();
  }, [subject]);

  const current = cards[index];

  const answer = (userSaysTrue) => {
    if (answered) return;
    setAnswered(true);
    const correct = userSaysTrue === current.isTrue;
    setResult(correct ? "correct" : "wrong");
    setScore(s => correct ? { ...s, good: s.good + 1 } : { ...s, bad: s.bad + 1 });

    setTimeout(() => {
      x.set(0);
      setResult(null);
      setAnswered(false);
      if (index + 1 >= cards.length) {
        setDone(true);
      } else {
        setIndex(i => i + 1);
      }
    }, 1600);
  };

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 90) answer(true);
    else if (info.offset.x < -90) answer(false);
    else x.set(0);
  };

  const restart = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setIndex(0);
    setScore({ good: 0, bad: 0 });
    setResult(null);
    setAnswered(false);
    setDone(false);
    x.set(0);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-400">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="font-bold text-sm">Chargement des cartes…</span>
    </div>
  );

  if (cards.length === 0) return (
    <div className="text-center text-stone-400 p-10 font-bold">Pas de questions Vrai/Faux disponibles.</div>
  );

  if (done) return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center py-12 gap-6 select-none"
    >
      <div className="text-7xl">{score.good >= score.bad ? "🏆" : "💪"}</div>
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-stone-900">Session terminée !</h2>
        <p className="text-stone-500 text-sm mt-1">{cards.length} cartes passées en revue</p>
      </div>
      <div className="flex gap-4">
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl px-8 py-4 text-center">
          <div className="text-4xl font-bold text-green-600">{score.good}</div>
          <div className="text-xs font-bold text-green-500 mt-1">✅ VRAIS</div>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-8 py-4 text-center">
          <div className="text-4xl font-bold text-red-500">{score.bad}</div>
          <div className="text-xs font-bold text-red-400 mt-1">❌ FAUX</div>
        </div>
      </div>
      <div className="text-2xl font-display font-bold text-stone-600">
        {Math.round((score.good / cards.length) * 100)} % de réussite
      </div>
      <button
        onClick={restart}
        className="flex items-center gap-2 bg-rose-500 text-white font-display font-bold text-base px-8 py-3.5 rounded-2xl border-b-4 border-rose-700 hover:bg-rose-400 active:border-b-0 active:translate-y-1 transition-all shadow-lg"
      >
        <RotateCcw className="w-5 h-5" /> Rejouer
      </button>
    </motion.div>
  );

  const progress = index / cards.length;

  return (
    <div className="flex flex-col items-center gap-5 select-none pb-6">

      {/* Barre de progression */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between text-xs font-bold text-stone-400 mb-2">
          <span className="text-green-500">✅ {score.good}</span>
          <span className="text-stone-500">{index + 1} / {cards.length}</span>
          <span className="text-red-400">❌ {score.bad}</span>
        </div>
        <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-400 to-orange-400 rounded-full"
            style={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 120 }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="flex items-center gap-6 text-xs font-bold text-stone-400">
        <span className="flex items-center gap-1"><X className="w-3.5 h-3.5 text-red-400" /> FAUX — glisse à gauche</span>
        <span className="flex items-center gap-1">VRAI — glisse à droite <Check className="w-3.5 h-3.5 text-green-500" /></span>
      </div>

      {/* Zone des cartes */}
      <div className="relative w-full max-w-sm" style={{ height: 380 }}>

        {/* Carte fantôme derrière */}
        {cards[index + 1] && (
          <motion.div
            className="absolute inset-x-2 inset-y-3 bg-white rounded-3xl border border-stone-100 shadow-sm"
            style={{ zIndex: 0 }}
          />
        )}

        <AnimatePresence mode="wait">
          {!done && current && (
            <motion.div
              key={index}
              style={{ x, rotate, opacity: cardOpacity, zIndex: 10 }}
              drag={!answered ? "x" : false}
              dragConstraints={{ left: -300, right: 300 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.75, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="absolute inset-0 bg-white rounded-3xl border-2 border-stone-100 shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-6 flex flex-col cursor-grab active:cursor-grabbing overflow-hidden"
            >
              {/* Label VRAI (droite) */}
              <motion.div
                style={{ opacity: opacityTrue }}
                className="absolute top-5 right-5 bg-green-500 text-white font-display font-bold text-sm px-3 py-1.5 rounded-xl shadow-md rotate-12"
              >
                ✅ VRAI
              </motion.div>

              {/* Label FAUX (gauche) */}
              <motion.div
                style={{ opacity: opacityFalse }}
                className="absolute top-5 left-5 bg-red-500 text-white font-display font-bold text-sm px-3 py-1.5 rounded-xl shadow-md -rotate-12"
              >
                ❌ FAUX
              </motion.div>

              {/* Chapitre */}
              {current.chapter && (
                <div className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-3 text-center">
                  {current.chapter}
                </div>
              )}

              {/* Affirmation */}
              <div className="flex-1 flex items-center justify-center">
                <p className="text-center font-semibold text-stone-800 text-[15px] leading-relaxed">
                  {current.statement}
                </p>
              </div>

              {/* Hint swipe en bas */}
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-stone-100">
                <span className="text-xs text-stone-300 font-bold">← FAUX</span>
                <span className="text-xs text-stone-200">⬡</span>
                <span className="text-xs text-stone-300 font-bold">VRAI →</span>
              </div>

              {/* Feedback overlay */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 rounded-3xl flex flex-col items-center justify-center gap-3 backdrop-blur-sm ${result === "correct" ? "bg-green-500/92" : "bg-red-500/92"}`}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="text-6xl"
                    >
                      {result === "correct" ? "✅" : "❌"}
                    </motion.div>
                    <div className="font-display font-bold text-white text-2xl">
                      {result === "correct" ? "Correct !" : "Raté !"}
                    </div>
                    <div className="text-white/90 text-xs px-8 text-center leading-relaxed font-medium">
                      {current.explanation}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Boutons FAUX / VRAI */}
      <div className="flex gap-3 w-full max-w-sm">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => answer(false)}
          disabled={answered}
          className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-display font-bold text-base py-4 rounded-2xl border-2 border-red-200 border-b-4 border-b-red-300 active:border-b-2 active:translate-y-0.5 transition-all disabled:opacity-40"
        >
          <X className="w-5 h-5" /> FAUX
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => answer(true)}
          disabled={answered}
          className="flex-1 flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-600 font-display font-bold text-base py-4 rounded-2xl border-2 border-green-200 border-b-4 border-b-green-300 active:border-b-2 active:translate-y-0.5 transition-all disabled:opacity-40"
        >
          <Check className="w-5 h-5" /> VRAI
        </motion.button>
      </div>
    </div>
  );
}