import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function DebugDataCheck() {
  const [data, setData] = useState({
    questions: 0,
    questionsJeu: 0,
    questionsInfini: 0,
    questionsPareto: 0,
    flashcards: 0,
    revisionQuestions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await base44.entities.Question.list(null, 1000);
        const jeu = await base44.entities.Question.filter({ mode: "jeu" }, null, 1000);
        const infini = await base44.entities.Question.filter({ mode: "infini" }, null, 1000);
        const pareto = await base44.entities.Question.filter({ mode: "pareto" }, null, 1000);
        const flash = await base44.entities.Flashcard.list(null, 1000);
        const revision = await base44.entities.RevisionQuestion.list(null, 1000);

        setData({
          questions: all.length,
          questionsJeu: jeu.length,
          questionsInfini: infini.length,
          questionsPareto: pareto.length,
          flashcards: flash.length,
          revisionQuestions: revision.length,
        });
      } catch (e) {
        console.error("Debug check error:", e);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-4 text-stone-400">Vérification des données...</div>;

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
      <div className="font-bold text-blue-900 mb-3">📊 Vérification des données</div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Questions totales: <span className="font-bold">{data.questions}</span></div>
        <div>  - Mode Jeu: <span className="font-bold text-orange-600">{data.questionsJeu}</span></div>
        <div>  - Mode Infini: <span className="font-bold text-purple-600">{data.questionsInfini}</span></div>
        <div>  - Mode Pareto: <span className="font-bold text-green-600">{data.questionsPareto}</span></div>
        <div>Flashcards: <span className="font-bold text-pink-600">{data.flashcards}</span></div>
        <div>Questions révision: <span className="font-bold text-cyan-600">{data.revisionQuestions}</span></div>
      </div>
    </div>
  );
}