import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Flame, X, Check } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";
import { saveBestInfini, getProgress } from "@/lib/localProgress";

export default function InfiniteQCM({ subject }) {
  const [pool, setPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [over, setOver] = useState(false);
  const [best, setBest] = useState(0);

  useEffect(() => {
    (async () => {
      const [infini, pareto] = await Promise.all([
        base44.entities.Question.filter({ subject, mode: "infini" }),
        base44.entities.Question.filter({ subject, mode: "pareto" }),
      ]);
      // Dédoublonner par question text
      const seen = new Set();
      const merged = [...infini, ...pareto].filter(q => {
        if (seen.has(q.question)) return false;
        seen.add(q.question);
        return true;
      });
      setPool(merged);
      if (merged.length) setCurrent(merged[Math.floor(Math.random() * merged.length)]);
      setBest(getProgress(subject).bestInfini || 0);
      setLoading(false);
    })();
  }, [subject]);

  const next = () => {
    if (pool.length === 0) return;
    setCurrent(pool[Math.floor(Math.random() * pool.length)]);
    setSelected(null);
  };

  const handle = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === current.correct_index) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      setTimeout(next, 700);
    } else {
      saveBestInfini(subject, score);
      setTimeout(() => setOver(true), 1200);
    }
  };

  const restart = () => {
    setScore(0); setStreak(0); setOver(false); setBest(getProgress(subject).bestInfini || 0); next();
  };

  if (loading) return <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>;
  if (pool.length === 0) return <div className="bg-white rounded-2xl p-6 text-center text-stone-600">Aucune question disponible pour cette matière.</div>;

  if (over) {
    return (
      <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-3xl p-8 text-center shadow-duo-lg">
        <div className="text-6xl mb-2">💀</div>
        <h2 className="font-display text-3xl font-bold">Hardcore terminé</h2>
        <div className="mt-2">Score : <span className="font-bold text-2xl">{score}</span></div>
        <div className="text-sm opacity-90 mt-1">Record : {Math.max(best, score)}</div>
        <DuoButton variant="secondary" className="mt-6" onClick={restart}>Réessayer</DuoButton>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="bg-red-500 text-white rounded-full px-4 py-1 text-sm font-bold flex items-center gap-1">
          <Flame className="w-4 h-4" /> Série {streak}
        </div>
        <div className="text-sm font-bold"><span className="text-red-500">{score}</span> / record {best}</div>
      </div>

      <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-3xl p-6 shadow-duo-lg border-b-4 border-black">
        {current.chapter && (
          <div className="inline-block bg-red-500 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-3">
            {current.chapter}
          </div>
        )}
        <h2 className="font-fredoka text-xl md:text-2xl leading-snug font-medium">
          {current.question}
        </h2>
        <div className="grid gap-2 mt-5">
          {current.options.map((opt, i) => {
            const show = selected !== null;
            const isCorrect = i === current.correct_index;
            const isSelected = i === selected;
            return (
              <button
                key={i}
                onClick={() => handle(i)}
                disabled={selected !== null}
                className={`text-left rounded-2xl px-4 py-3 font-fredoka text-base bg-stone-700 border-b-4 border-black/40 flex items-center justify-between
                  ${show && isCorrect ? "bg-green-600 border-green-800" : ""}
                  ${show && isSelected && !isCorrect ? "bg-red-600 border-red-800" : ""}
                `}
              >
                <span>{opt}</span>
                {show && isCorrect && <Check className="w-5 h-5" />}
                {show && isSelected && !isCorrect && <X className="w-5 h-5" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}