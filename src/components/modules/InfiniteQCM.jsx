import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Flame, X, Check } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";
import { saveInfiniRecord, getInfiniRecord } from "@/lib/scoreStorage";
import { saveInfiniRecordDB, loadInfiniRecordDB } from "@/lib/recordStorage";
import { trackProgress } from "@/lib/trackProgress";

export default function InfiniteQCM({ subject }) {
  const [allQuestions, setAllQuestions] = useState([]);
  const [queue, setQueue] = useState([]); // file de questions mélangée
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [over, setOver] = useState(false);
  const [best, setBest] = useState(0);
  const [lastQuestion, setLastQuestion] = useState(null); // question au moment du game over

  useEffect(() => {
    (async () => {
      const [infini, pareto] = await Promise.all([
        base44.entities.Question.filter({ subject, mode: "infini" }, null, 500),
        base44.entities.Question.filter({ subject, mode: "pareto" }, null, 500),
      ]);
      const seen = new Set();
      const merged = [...infini, ...pareto].filter(q => {
        if (seen.has(q.question)) return false;
        seen.add(q.question);
        return true;
      });
      setAllQuestions(merged);
      const shuffled = [...merged].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      if (shuffled.length) setCurrent(shuffled[0]);
      // Charger le record depuis BDD (fusionne avec localStorage)
      const record = await loadInfiniRecordDB(subject);
      setBest(record);
      setLoading(false);
    })();
  }, [subject]);

  // Passe à la suivante — recharge la file si épuisée (boucle infinie)
  const next = (currentQueue) => {
    const q = currentQueue ?? queue;
    if (q.length <= 1) {
      // File épuisée : rebattre toutes les questions
      const reshuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      setQueue(reshuffled);
      setCurrent(reshuffled[0]);
    } else {
      const remaining = q.slice(1);
      setQueue(remaining);
      setCurrent(remaining[0]);
    }
    setSelected(null);
  };

  const handle = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === current.correct_index) {
      const newScore = score + 1;
      setScore(newScore);
      setStreak((s) => s + 1);
      // Met à jour le record en temps réel à chaque bonne réponse
      const newRecord = saveInfiniRecord(subject, newScore);
      setBest(newRecord);
      setTimeout(() => next(null), 700);
    } else {
      const newRecord = saveInfiniRecord(subject, score);
      saveInfiniRecordDB(subject, score, getInfiniRecord(subject));
      trackProgress({ toolUsed: "infini", subject, score, totalQuestions: score + 1 });
      setBest(newRecord);
      setLastQuestion(current); // sauvegarder la question pour l'afficher au game over
      setTimeout(() => setOver(true), 1200);
    }
  };

  const restart = () => {
    const reshuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    setQueue(reshuffled);
    setCurrent(reshuffled[0]);
    setScore(0); setStreak(0); setOver(false); setSelected(null); setBest(getInfiniRecord(subject));
  };

  if (loading) return <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>;
  if (allQuestions.length === 0) return <div className="bg-white rounded-2xl p-6 text-center text-stone-600">Aucune question disponible pour cette matière.</div>;

  if (over) {
    return (
      <div className="bg-white border-2 border-red-200 rounded-3xl p-8 shadow-sm" style={{ fontFamily: "Arial, sans-serif" }}>
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">💀</div>
          <h2 className="text-3xl font-bold text-stone-800">Session terminée</h2>
          <div className="mt-3 text-stone-600">Score final : <span className="font-bold text-2xl text-red-500">{score}</span></div>
          <div className="text-sm text-stone-400 mt-1">Meilleur record : <span className="font-bold text-stone-600">{Math.max(best, score)}</span></div>
        </div>

        {/* Affichage de la question fatale + bonne réponse */}
        {lastQuestion && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-left">
            <div className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">❌ La question qui t'a éliminé</div>
            <p className="font-semibold text-stone-800 text-sm leading-snug mb-3">{lastQuestion.question}</p>
            <div className="text-xs font-bold text-stone-500 mb-1.5">✅ La bonne réponse était :</div>
            <div className="bg-green-100 border border-green-300 rounded-xl px-3 py-2 text-sm font-bold text-green-800">
              {lastQuestion.options[lastQuestion.correct_index]}
            </div>
            {lastQuestion.explanation && (
              <div className="mt-2 text-xs text-stone-500 leading-relaxed italic">{lastQuestion.explanation}</div>
            )}
          </div>
        )}

        <button
          onClick={restart}
          className="w-full bg-red-500 text-white font-bold px-8 py-3 rounded-2xl border-b-4 border-red-700 hover:bg-red-400 active:translate-y-1 active:border-b-0 transition-all"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Stats bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 text-sm font-bold text-red-600">
          <Flame className="w-4 h-4" /> Série {streak}
        </div>
        <div className="flex items-center gap-3 text-sm font-bold text-stone-600">
          <span>Score : <span className="text-red-500 text-lg">{score}</span></span>
          <span className="text-stone-300">|</span>
          <span>🏆 Record : <span className={`text-lg font-bold ${best > 0 ? "text-amber-600" : "text-stone-400"}`}>{best}</span></span>
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white border-2 border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm mb-4">
        {current.chapter && (
          <div className="inline-block bg-red-100 text-red-600 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4">
            {current.chapter}
          </div>
        )}
        <h2 className="text-xl md:text-2xl font-bold text-stone-900 leading-snug">
          {current.question}
        </h2>
      </div>

      {/* Options */}
      <div className="grid gap-3">
        {current.options.map((opt, i) => {
          const show = selected !== null;
          const isCorrect = i === current.correct_index;
          const isSelected = i === selected;
          return (
            <button
              key={i}
              onClick={() => handle(i)}
              disabled={selected !== null}
              className={`w-full text-left rounded-2xl px-5 py-4 text-base font-medium border-2 transition-all flex items-center justify-between gap-3
                ${!show ? "bg-white border-stone-200 hover:border-stone-400 hover:bg-stone-50 cursor-pointer" : ""}
                ${show && isCorrect ? "bg-green-50 border-green-400 text-green-900" : ""}
                ${show && isSelected && !isCorrect ? "bg-red-50 border-red-400 text-red-900" : ""}
                ${show && !isSelected && !isCorrect ? "bg-white border-stone-100 opacity-40" : ""}
              `}
            >
              <span>{opt}</span>
              {show && isCorrect && <Check className="w-5 h-5 text-green-600 shrink-0" />}
              {show && isSelected && !isCorrect && <X className="w-5 h-5 text-red-500 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}