import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, X, RotateCcw } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";
import { markFlashcard } from "@/lib/localProgress";

export default function Flashcards({ subject }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ known: 0, unknown: 0 });
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await base44.entities.Flashcard.filter({ subject });
      setCards(list.sort(() => Math.random() - 0.5));
      setLoading(false);
    })();
  }, [subject]);

  const current = cards[idx];

  const answer = (known) => {
    markFlashcard(subject, current.id, known);
    setStats((s) => ({ known: s.known + (known ? 1 : 0), unknown: s.unknown + (known ? 0 : 1) }));
    if (idx + 1 >= cards.length) setDone(true);
    else { setIdx(idx + 1); setFlipped(false); }
  };

  const restart = () => { setIdx(0); setFlipped(false); setStats({ known: 0, unknown: 0 }); setDone(false); setCards((c) => [...c].sort(() => Math.random() - 0.5)); };

  if (loading) return <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>;
  if (cards.length === 0) return <div className="bg-white rounded-2xl p-6 text-center text-stone-600">Aucune flashcard.</div>;

  if (done) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center shadow-duo-lg">
        <div className="text-6xl mb-3">🎴</div>
        <h2 className="font-display text-3xl font-bold">Deck terminé !</h2>
        <div className="mt-2 flex justify-center gap-6 text-lg">
          <span className="text-green-600 font-bold">✓ {stats.known}</span>
          <span className="text-red-500 font-bold">✗ {stats.unknown}</span>
        </div>
        <DuoButton variant="primary" className="mt-6" onClick={restart}>
          <RotateCcw className="w-4 h-4 inline mr-2" /> Recommencer
        </DuoButton>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 text-sm font-bold">
        <span className="text-stone-500">{idx + 1} / {cards.length}</span>
        <div className="flex gap-3">
          <span className="text-green-600">✓ {stats.known}</span>
          <span className="text-red-500">✗ {stats.unknown}</span>
        </div>
      </div>

      <div className="perspective-[1200px] mb-5">
        <motion.div
          key={idx}
          onClick={() => setFlipped((f) => !f)}
          className="relative w-full h-72 cursor-pointer"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-3xl p-6 shadow-duo-lg border-b-4 border-purple-800 flex flex-col justify-center items-center text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            {current.chapter && <div className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-2">{current.chapter}</div>}
            <div className="font-display text-2xl font-bold">{current.front}</div>
            <div className="mt-4 text-xs opacity-70">Clique pour retourner</div>
          </div>
          <div
            className="absolute inset-0 bg-white rounded-3xl p-6 shadow-duo-lg border-b-4 border-stone-200 flex flex-col justify-center items-center text-center"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="text-[10px] uppercase tracking-widest font-bold text-purple-600 mb-2">Réponse</div>
            <div className="font-display text-xl font-bold text-stone-900 whitespace-pre-wrap">{current.back}</div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DuoButton variant="danger" onClick={() => answer(false)} className="w-full">
          <X className="w-4 h-4 inline mr-1" /> Je ne sais pas
        </DuoButton>
        <DuoButton variant="primary" onClick={() => answer(true)} className="w-full">
          <Check className="w-4 h-4 inline mr-1" /> Je connais
        </DuoButton>
      </div>
    </div>
  );
}