import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Check, X, RotateCcw, ChevronLeft, Zap, BookOpen } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

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
  { key: "Ouverture de compte", label: "Ouverture" },
  { key: "Suivi des comptes", label: "Suivi" },
  { key: "Moyens de paiement", label: "Paiement" },
  { key: "Épargne", label: "Épargne" },
  { key: "Assurance", label: "Assurance" },
  { key: "Crédit", label: "Crédit" },
  { key: "Fiscalité", label: "Fiscalité" },
];

export default function VraiOuFaux({ subject }) {
  const navigate = useNavigate();
  const { subject: subjectParam } = useParams();

  const [allCards, setAllCards] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [fastMode, setFastMode] = useState(false);

  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState(null); // null | "correct" | "wrong"
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ good: 0, bad: 0 });
  const [done, setDone] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]); // pour résumé mode rapide

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
    resetSession();
  };

  const resetSession = () => {
    setIndex(0);
    setScore({ good: 0, bad: 0 });
    setFlash(null);
    setShowExplanation(false);
    setAnswered(false);
    setDone(false);
    setWrongAnswers([]);
    x.set(0);
  };

  const current = cards[index];

  const answer = (userSaysTrue) => {
    if (answered) return;
    setAnswered(true);
    const correct = userSaysTrue === current.isTrue;

    setFlash(correct ? "correct" : "wrong");
    setScore(s => correct ? { ...s, good: s.good + 1 } : { ...s, bad: s.bad + 1 });

    if (!correct) {
      setWrongAnswers(prev => [...prev, current]);
    }

    if (!correct && !fastMode) {
      // Mode normal : montrer l'explication des mauvaises réponses
      setTimeout(() => setFlash(null), 400);
      setShowExplanation(true);
    } else {
      // Mode rapide OU bonne réponse : passer rapidement
      setTimeout(() => {
        setFlash(null);
        setShowExplanation(false);
        setAnswered(false);
        x.set(0);
        if (index + 1 >= cards.length) setDone(true);
        else setIndex(i => i + 1);
      }, correct ? 500 : 700);
    }
  };

  const nextCard = () => {
    setShowExplanation(false);
    setFlash(null);
    setAnswered(false);
    x.set(0);
    if (index + 1 >= cards.length) setDone(true);
    else setIndex(i => i + 1);
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
    resetSession();
  };

  const progress = cards.length > 0 ? index / cards.length : 0;
  const subjectPath = subjectParam || subject?.toLowerCase();

  // ── TOP BAR (fixe) ──
  const TopBar = (
    <div className="flex items-center gap-2 mb-0 flex-shrink-0">
      {/* Bouton retour */}
      <button
        onClick={() => navigate(`/${subjectPath}`)}
        className="flex items-center gap-1 text-stone-500 hover:text-stone-800 font-bold text-sm bg-white/80 backdrop-blur px-3 py-2 rounded-xl border border-stone-200 whitespace-nowrap flex-shrink-0"
      >
        Retour
      </button>

      {/* Filtres scrollables */}
      <div className="flex-1 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 w-max">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => applyCategory(cat.key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-white text-stone-500 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bouton mode rapide */}
      <button
        onClick={() => { setFastMode(f => !f); resetSession(); }}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all border ${
          fastMode
            ? "bg-amber-400 text-amber-900 border-amber-400"
            : "bg-white text-stone-400 border-stone-200 hover:bg-stone-50"
        }`}
        title={fastMode ? "Mode rapide — passer en mode normal" : "Passer en mode rapide"}
      >
        <Zap className="w-3.5 h-3.5" />
        {fastMode ? "Rapide" : "Rapide"}
      </button>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col gap-4">
      {TopBar}
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-stone-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    </div>
  );

  // ── ÉCRAN DE FIN ──
  if (done) return (
    <div className="flex flex-col gap-4">
      {TopBar}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center py-10 gap-5"
      >
        <div className="text-6xl">{score.good >= score.bad ? "🏆" : "💪"}</div>
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

        {/* Résumé mode rapide — affiche les erreurs avec explications */}
        {fastMode && wrongAnswers.length > 0 && (
          <div className="w-full max-w-lg mt-2">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-red-400" />
              <span className="font-bold text-sm text-stone-700">Tes {wrongAnswers.length} erreur{wrongAnswers.length > 1 ? "s" : ""}</span>
            </div>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {wrongAnswers.map((card, i) => (
                <div key={i} className="bg-red-50 border border-red-100 rounded-2xl p-4">
                  <p className="font-semibold text-stone-800 text-sm leading-snug mb-2">{card.statement}</p>
                  <div className="flex items-start gap-1.5">
                    <span className="text-xs font-bold text-red-500 mt-0.5 flex-shrink-0">
                      {card.isTrue ? "✅ VRAI" : "❌ FAUX"}
                    </span>
                    <p className="text-xs text-stone-600 leading-relaxed">— {card.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-1">
          <button onClick={restart} className="flex items-center gap-2 bg-rose-500 text-white font-display font-bold px-6 py-3.5 rounded-2xl border-b-4 border-rose-700 hover:bg-rose-400 active:translate-y-1 active:border-b-0 transition-all">
            <RotateCcw className="w-4 h-4" /> Rejouer
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="flex flex-col select-none" style={{ minHeight: "calc(100vh - 120px)" }}>

      {/* Barre fixe */}
      {TopBar}

      {cards.length === 0 ? (
        <div className="text-center text-stone-400 p-10 font-bold mt-6">Pas de questions pour cette catégorie.</div>
      ) : (
        <>
          {/* Progress */}
          <div className="mt-4 mb-3">
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

          {/* Card zone — hauteur fixe pour que absolute inset-0 fonctionne */}
          <div className="relative w-full" style={{ height: 340 }}>
            {/* Ghost card derrière */}
            {cards[index + 1] && (
              <div className="absolute inset-x-2 top-3 bottom-3 bg-white rounded-3xl border border-stone-100 shadow-sm opacity-60" style={{ transform: "scale(0.96)" }} />
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
                  animate={{
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    backgroundColor: flash === "wrong"
                      ? ["#ffffff", "#fef2f2", "#ffffff"]
                      : flash === "correct"
                        ? ["#ffffff", "#f0fdf4", "#ffffff"]
                        : "#ffffff",
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 24, backgroundColor: { duration: 0.4 } }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="absolute inset-0 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] border flex flex-col cursor-grab active:cursor-grabbing overflow-hidden"
                  style={{
                    borderColor: flash === "wrong" ? "#fca5a5" : flash === "correct" ? "#86efac" : "#f1f5f9",
                  }}
                >
                  {/* Indicateurs swipe */}
                  <motion.div style={{ opacity: opacityTrue }} className="absolute top-5 right-5 bg-green-500 text-white font-display font-bold text-sm px-4 py-1.5 rounded-xl shadow rotate-6 z-20">
                    ✅ VRAI
                  </motion.div>
                  <motion.div style={{ opacity: opacityFalse }} className="absolute top-5 left-5 bg-red-500 text-white font-display font-bold text-sm px-4 py-1.5 rounded-xl shadow -rotate-6 z-20">
                    ❌ FAUX
                  </motion.div>

                  {!showExplanation ? (
                    /* ── VUE QUESTION ── */
                    <div className="flex flex-col h-full">
                      {/* Chapitre en haut de la carte */}
                      {current.chapter && (
                        <div className="px-6 pt-5 pb-0 text-[10px] font-bold uppercase tracking-widest text-rose-400 text-center">
                          {current.chapter}
                        </div>
                      )}
                      {/* Question centrée verticalement dans l'espace restant */}
                      <div className="flex-1 flex items-center justify-center px-7 py-4">
                        <p className="text-center font-semibold text-stone-800 text-lg leading-relaxed">
                          {current.statement}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* ── VUE EXPLICATION ── */
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center h-full gap-4 px-7 py-6"
                    >
                      <div className="bg-red-100 rounded-2xl px-4 py-2 text-red-600 font-bold text-sm text-center">
                        ❌ Bonne réponse : {current.isTrue ? "VRAI" : "FAUX"}
                      </div>
                      <p className="text-center text-stone-600 text-sm leading-relaxed">
                        {current.explanation}
                      </p>
                      <button
                        onClick={nextCard}
                        className="mt-1 bg-stone-800 text-white font-display font-bold px-6 py-3 rounded-2xl border-b-4 border-stone-900 active:border-b-0 active:translate-y-0.5 transition-all text-sm"
                      >
                        Continuer →
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Boutons fondus en bas — cachés si explication visible */}
          {!showExplanation && (
            <div className="flex gap-3 pt-1 pb-2">
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
          )}
        </>
      )}
    </div>
  );
}