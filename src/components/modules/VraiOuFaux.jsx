import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Check, X, RotateCcw } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

// Mapping chapitre → catégorie affichée
const CHAPTER_TO_CATEGORY = {
  "Ouverture de compte — Droit au compte & Inclusion bancaire": "Ouverture de compte",
  "Ouverture de compte — Convention, médiation & mobilité": "Ouverture de compte",
  "Suivi des comptes — Agios débiteurs": "Suivi des comptes",
  "Suivi des comptes — Blanchiment & LCB-FT": "Suivi des comptes",
  "Suivi des comptes — Événements exceptionnels (saisies, décès)": "Suivi des comptes",
  "Suivi des comptes — Risque débiteur & clôture": "Suivi des comptes",
  "Moyens de paiement — Espèces, virement, prélèvement": "Moyens de paiement",
  "Moyens de paiement — Chèque & carte bancaire": "Moyens de paiement",
  "Moyens de paiement — Nouvelles technologies & international": "Moyens de paiement",
  "Épargne bancaire — Livrets réglementés": "Épargne",
  "Épargne bancaire — PEL, CEL & épargne à terme": "Épargne",
  "Épargne non bancaire — Assurance-vie": "Épargne",
  "Épargne non bancaire — PER & instruments financiers": "Épargne",
  "Assurance — Marché & vie du contrat": "Assurance",
  "Assurance — Produits IARD & prévoyance": "Assurance",
  "Crédit — Montage de dossier & analyse du risque": "Crédit",
  "Crédit — Types de crédits & réglementation": "Crédit",
  "Crédit — Vie du contrat de prêt": "Crédit",
  "Fiscalité — Impôt sur le revenu & prélèvements sociaux": "Fiscalité",
  "Fiscalité patrimoniale — Succession, donation & IFI": "Fiscalité",
};

const CATEGORIES = [
  { key: "all", label: "Tout" },
  { key: "Ouverture de compte", label: "Ouverture de compte" },
  { key: "Suivi des comptes", label: "Suivi des comptes" },
  { key: "Moyens de paiement", label: "Moyens de paiement" },
  { key: "Épargne", label: "Épargne" },
  { key: "Assurance", label: "Assurance" },
  { key: "Crédit", label: "Crédit" },
  { key: "Fiscalité", label: "Fiscalité" },
];

export default function VraiOuFaux({ subject }) {
  const [allCards, setAllCards] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ good: 0, bad: 0 });
  const [done, setDone] = useState(false);
  const [answered, setAnswered] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const opacityTrue = useTransform(x, [30, 100], [0, 1]);
  const opacityFalse = useTransform(x, [-100, -30], [1, 0]);

  useEffect(() => {
    (async () => {
      const flashcards = await base44.entities.Flashcard.filter({ subject }, null, 500);
      const vof = flashcards.filter(f =>
        f.back && (f.back.startsWith("VRAI") || f.back.startsWith("FAUX"))
      );
      const mapped = vof.map(f => ({
        statement: f.front,
        isTrue: f.back.startsWith("VRAI"),
        explanation: f.back.replace(/^(VRAI ✓|FAUX ✗)\s*[—\-]\s*/i, ""),
        chapter: f.chapter || "",
        category: CHAPTER_TO_CATEGORY[f.chapter] || "Autre",
      }));
      const shuffled = mapped.sort(() => Math.random() - 0.5);
      setAllCards(shuffled);
      setCards(shuffled);
      setLoading(false);
    })();
  }, [subject]);

  const applyCategory = (cat) => {
    setSelectedCategory(cat);
    const filtered = cat === "all"
      ? [...allCards]
      : allCards.filter(c => c.category === cat);
    setCards(filtered.sort(() => Math.random() - 0.5));
    setIndex(0);
    setScore({ good: 0, bad: 0 });
    setResult(null);
    setAnswered(false);
    setDone(false);
    x.set(0);
  };

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
      if (index + 1 >= cards.length) setDone(true);
      else setIndex(i => i + 1);
    }, 1600);
  };

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 90) answer(true);
    else if (info.offset.x < -90) answer(false);
    else x.set(0);
  };

  const restart = () => {
    const filtered = selectedCategory === "all"
      ? [...allCards]
      : allCards.filter(c => c.category === selectedCategory);
    setCards(filtered.sort(() => Math.random() - 0.5));
    setIndex(0);
    setScore({ good: 0, bad: 0 });
    setResult(null);
    setAnswered(false);
    setDone(false);
    x.set(0);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-stone-400">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );

  if (done) return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center py-16 gap-6"
    >
      <div className="text-7xl">{score.good >= score.bad ? "🏆" : "💪"}</div>
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-stone-900">Session terminée !</h2>
        <p className="text-stone-400 text-sm mt-1">{cards.length} cartes · {selectedCategory === "all" ? "Tout" : selectedCategory}</p>
      </div>
      <div className="flex gap-4">
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl px-8 py-4 text-center">
          <div className="text-4xl font-bold text-green-600">{score.good}</div>
          <div className="text-xs font-bold text-green-400 mt-1">VRAIS</div>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-8 py-4 text-center">
          <div className="text-4xl font-bold text-red-500">{score.bad}</div>
          <div className="text-xs font-bold text-red-400 mt-1">FAUX</div>
        </div>
      </div>
      <div className="font-display font-bold text-2xl text-stone-600">
        {Math.round((score.good / cards.length) * 100)} %
      </div>
      <div className="flex gap-3">
        <button
          onClick={restart}
          className="flex items-center gap-2 bg-rose-500 text-white font-display font-bold px-6 py-3.5 rounded-2xl border-b-4 border-rose-700 hover:bg-rose-400 active:translate-y-1 active:border-b-0 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Rejouer
        </button>
        <button
          onClick={() => applyCategory("all")}
          className="flex items-center gap-2 bg-stone-100 text-stone-700 font-display font-bold px-6 py-3.5 rounded-2xl border-b-4 border-stone-300 hover:bg-stone-200 active:translate-y-1 active:border-b-0 transition-all"
        >
          Changer de thème
        </button>
      </div>
    </motion.div>
  );

  const progress = cards.length > 0 ? index / cards.length : 0;

  return (
    <div className="flex flex-col select-none" style={{ minHeight: "calc(100vh - 160px)" }}>

      {/* Filtres catégorie — discrets en haut */}
      <div className="mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex gap-1.5 w-max">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => applyCategory(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="text-center text-stone-400 p-10 font-bold">Pas de questions pour cette catégorie.</div>
      ) : (
        <>
          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-bold text-stone-400 mb-1.5">
              <span className="text-green-500">{score.good} ✅</span>
              <span>{index + 1} / {cards.length}</span>
              <span className="text-red-400">❌ {score.bad}</span>
            </div>
            <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-400 to-orange-400 rounded-full"
                animate={{ width: `${progress * 100}%` }}
                transition={{ type: "spring", stiffness: 120 }}
              />
            </div>
          </div>

          {/* Card zone */}
          <div className="flex-1 relative flex items-center justify-center py-4">
            {cards[index + 1] && (
              <div className="absolute inset-x-2 top-6 bottom-6 bg-white rounded-3xl border border-stone-100 shadow-sm opacity-60 scale-[0.96]" />
            )}

            <AnimatePresence mode="wait">
              {current && (
                <motion.div
                  key={index}
                  style={{ x, rotate, zIndex: 10 }}
                  drag={!answered ? "x" : false}
                  dragConstraints={{ left: -300, right: 300 }}
                  dragElastic={0.7}
                  onDragEnd={handleDragEnd}
                  initial={{ scale: 0.88, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 24 }}
                  className="absolute inset-0 bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] border border-stone-100 flex flex-col cursor-grab active:cursor-grabbing overflow-hidden"
                >
                  <motion.div style={{ opacity: opacityTrue }} className="absolute top-6 right-6 bg-green-500 text-white font-display font-bold text-sm px-4 py-1.5 rounded-xl shadow rotate-6">
                    ✅ VRAI
                  </motion.div>
                  <motion.div style={{ opacity: opacityFalse }} className="absolute top-6 left-6 bg-red-500 text-white font-display font-bold text-sm px-4 py-1.5 rounded-xl shadow -rotate-6">
                    ❌ FAUX
                  </motion.div>

                  <div className="flex-1 flex flex-col items-center justify-center px-7 py-10">
                    {current.chapter && (
                      <div className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-5 text-center">
                        {current.chapter}
                      </div>
                    )}
                    <p className="text-center font-semibold text-stone-800 text-lg leading-relaxed">
                      {current.statement}
                    </p>
                  </div>

                  <AnimatePresence>
                    {result && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute inset-0 rounded-3xl flex flex-col items-center justify-center gap-3 ${result === "correct" ? "bg-green-500/93" : "bg-red-500/93"}`}
                      >
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }} className="text-6xl">
                          {result === "correct" ? "✅" : "❌"}
                        </motion.div>
                        <div className="font-display font-bold text-white text-2xl">
                          {result === "correct" ? "Correct !" : "Raté !"}
                        </div>
                        <div className="text-white/90 text-sm px-8 text-center leading-relaxed">
                          {current.explanation}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Boutons fondus en bas */}
          <div className="flex gap-3 pt-2 pb-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => answer(false)}
              disabled={answered}
              className="flex-1 flex items-center justify-center gap-2 py-5 rounded-2xl font-display font-bold text-lg text-red-600 disabled:opacity-40 transition-all"
              style={{
                background: "linear-gradient(135deg, #fff1f2 0%, #fecaca 100%)",
                boxShadow: "0 4px 20px rgba(239,68,68,0.18), inset 0 1px 0 rgba(255,255,255,0.8)",
                border: "1.5px solid rgba(252,165,165,0.6)"
              }}
            >
              <X className="w-6 h-6" /> FAUX
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => answer(true)}
              disabled={answered}
              className="flex-1 flex items-center justify-center gap-2 py-5 rounded-2xl font-display font-bold text-lg text-green-600 disabled:opacity-40 transition-all"
              style={{
                background: "linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)",
                boxShadow: "0 4px 20px rgba(34,197,94,0.18), inset 0 1px 0 rgba(255,255,255,0.8)",
                border: "1.5px solid rgba(134,239,172,0.6)"
              }}
            >
              <Check className="w-6 h-6" /> VRAI
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}