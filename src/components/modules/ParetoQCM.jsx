import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2, RotateCcw } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";
import { saveScore } from "@/lib/localProgress";

const BG_CLASSES = ["pareto-bg-1", "pareto-bg-2", "pareto-bg-3", "pareto-bg-4", "pareto-bg-5", "pareto-bg-6"];

export default function ParetoQCM({ subject }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const all = await base44.entities.Question.filter({ subject, mode: "pareto" });
      // max 5 par chapitre
      const byChapter = {};
      all.forEach((q) => {
        const c = q.chapter || "Général";
        byChapter[c] = byChapter[c] || [];
        if (byChapter[c].length < 5) byChapter[c].push(q);
      });
      const flat = Object.values(byChapter).flat();
      setQuestions(flat);
      setLoading(false);
    })();
  }, [subject]);

  const current = questions[idx];
  const bgClass = useMemo(() => BG_CLASSES[idx % BG_CLASSES.length], [idx]);

  const handleAnswer = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === current.correct_index) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      saveScore(subject, "pareto", score + (selected === current.correct_index ? 0 : 0), questions.length);
      setDone(true);
    } else {
      setIdx(idx + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setIdx(0); setSelected(null); setScore(0); setDone(false);
  };

  if (loading) {
    return <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>;
  }

  if (questions.length === 0) {
    return <div className="bg-white rounded-2xl p-6 text-center text-stone-600">Aucune question Pareto pour cette matière. Ajoute-les dans l'admin.</div>;
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="bg-white rounded-3xl p-8 text-center shadow-duo-lg border-b-4 border-stone-200">
        <div className="text-6xl mb-3">{pct >= 80 ? "🎉" : pct >= 50 ? "💪" : "📚"}</div>
        <h2 className="font-display text-3xl font-bold">Terminé !</h2>
        <div className="text-stone-600 mt-2">Score : <span className="font-bold text-primary">{score} / {questions.length}</span> ({pct}%)</div>
        <DuoButton variant="primary" className="mt-6" onClick={restart}>
          <RotateCcw className="w-4 h-4 inline mr-2" /> Recommencer
        </DuoButton>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 text-sm font-bold">
        <span className="text-stone-500">{idx + 1} / {questions.length}</span>
        <span className="text-primary">Score {score}</span>
      </div>
      <div className="h-2 bg-stone-200 rounded-full overflow-hidden mb-5">
        <div className="h-full bg-primary transition-all" style={{ width: `${((idx) / questions.length) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className={`${bgClass} rounded-3xl p-6 md:p-8 shadow-duo-lg border-b-4 border-black/10 min-h-[260px]`}
        >
          {current.chapter && (
            <div className="inline-block bg-white/70 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-stone-700 mb-3">
              {current.chapter}
            </div>
          )}
          <h2 className="font-display text-xl md:text-2xl font-bold text-stone-900 leading-snug">
            {current.question}
          </h2>
          <div className="grid gap-2 mt-6">
            {current.options.map((opt, i) => {
              const isCorrect = i === current.correct_index;
              const isSelected = i === selected;
              const show = selected !== null;
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={selected !== null}
                  className={`text-left rounded-2xl px-4 py-3 border-b-4 font-semibold bg-white flex items-center justify-between transition-all
                    ${show && isCorrect ? "border-green-600 bg-green-50" : ""}
                    ${show && isSelected && !isCorrect ? "border-red-600 bg-red-50" : ""}
                    ${!show ? "border-stone-200 hover:-translate-y-0.5 active:translate-y-0" : "border-stone-200"}
                  `}
                >
                  <span>{opt}</span>
                  {show && isCorrect && <Check className="w-5 h-5 text-green-600" />}
                  {show && isSelected && !isCorrect && <X className="w-5 h-5 text-red-600" />}
                </button>
              );
            })}
          </div>
          {selected !== null && current.explanation && (
            <div className="mt-4 bg-white/80 rounded-xl p-3 text-sm text-stone-700 border-l-4 border-primary">
              💡 {current.explanation}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {selected !== null && (
        <div className="mt-5 flex justify-end">
          <DuoButton variant="primary" onClick={next}>
            {idx + 1 >= questions.length ? "Terminer" : "Suivant"}
          </DuoButton>
        </div>
      )}
    </div>
  );
}