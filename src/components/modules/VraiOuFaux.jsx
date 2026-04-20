import React, { useEffect, useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Check, X, RotateCcw, Zap, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── CESBF : mapping chapitre → catégorie ──
const CESBF_CHAPTER_TO_CATEGORY = {
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

const CESBF_CATEGORIES = [
  { key: "all", label: "Tout" },
  { key: "Ouverture de compte", label: "Ouverture" },
  { key: "Suivi des comptes", label: "Suivi" },
  { key: "Moyens de paiement", label: "Paiement" },
  { key: "Épargne", label: "Épargne" },
  { key: "Assurance", label: "Assurance" },
  { key: "Crédit", label: "Crédit" },
  { key: "Fiscalité", label: "Fiscalité" },
];

// ── VOJES : mapping chapitre → catégorie ──
const VOJES_CHAPTER_TO_CATEGORY = {
  "Chapitre 1 — Circuit et agents économiques": "Économie générale",
  "Chapitre 2 — Le financement de l'économie": "Économie générale",
  "Chapitre 3 — Les fonctions de la monnaie et la création monétaire": "Économie générale",
  "Chapitre 4 — Les marchés de capitaux": "Économie générale",
  "Chapitre 5 — La banque centrale et la politique monétaire": "Économie générale",
  "Chapitre 6 — Le système bancaire français et européen": "Système bancaire",
  "Chapitre 7 — La réglementation bancaire prudentielle": "Système bancaire",
  "Chapitre 8 — Les produits et services bancaires": "Système bancaire",
  "Chapitre 9 — La relation client en banque": "Système bancaire",
  "Chapitre 10 — Le crédit aux particuliers": "Crédit & financement",
  "Chapitre 11 — Le crédit aux entreprises": "Crédit & financement",
  "Chapitre 12 — L'épargne et les placements": "Épargne & assurance",
  "Chapitre 13 — L'assurance": "Épargne & assurance",
  "Chapitre 14 — La monnaie et les paiements": "Paiements",
  "Chapitre 15 — La lutte contre le blanchiment (LCB-FT)": "Droit & réglementation",
  "Chapitre 16 — La démarche qualité": "Gestion & stratégie",
  "Chapitre 17 — L'analyse de l'environnement": "Gestion & stratégie",
  "Chapitre 18 — La politique commerciale de la banque": "Gestion & stratégie",
  "Chapitre 19 — L'environnement économique et les indicateurs": "Économie générale",
  "Chapitre 20 — Le contrat de consommation": "Droit & réglementation",
  "Chapitre 21 — Le droit des contrats": "Droit & réglementation",
  "Chapitre 22 — La responsabilité civile et pénale": "Droit & réglementation",
  "Chapitre 23 — Le droit du travail": "Droit & réglementation",
  "Chapitre 24 — Les formes juridiques des entreprises": "Droit & réglementation",
  "Chapitre 25 — La fiscalité des entreprises et des particuliers": "Droit & réglementation",
  "Chapitre 26 — La protection sociale": "Social & emploi",
  "Chapitre 27 — Le marché du travail et l'emploi": "Social & emploi",
  "Chapitre 28 — La mondialisation et les échanges internationaux": "Économie générale",
  "Chapitre 29 — L'intégration européenne": "Économie générale",
  "Chapitre 30 — Le développement durable et la RSE": "Gestion & stratégie",
  "Chapitre 31 — La transformation numérique de la banque": "Numérique & innovation",
};

const VOJES_CATEGORIES = [
  { key: "all", label: "Tout" },
  { key: "Économie générale", label: "Économie" },
  { key: "Système bancaire", label: "Banque" },
  { key: "Crédit & financement", label: "Crédit" },
  { key: "Épargne & assurance", label: "Épargne" },
  { key: "Paiements", label: "Paiements" },
  { key: "Droit & réglementation", label: "Droit" },
  { key: "Gestion & stratégie", label: "Gestion" },
  { key: "Social & emploi", label: "Social" },
  { key: "Numérique & innovation", label: "Numérique" },
];

// Composant carte isolé avec son propre motionValue pour éviter le bug de x partagé
function Card({ card, onAnswer, showExplanation, onNext, flash }) {
  const bgColor = flash === "wrong" ? "#fef2f2" : flash === "correct" ? "#f0fdf4" : "#ffffff";
  const borderColor = flash === "wrong" ? "#fca5a5" : flash === "correct" ? "#86efac" : "#f1f5f9";

  return (
    <motion.div
      style={{ zIndex: 10, backgroundColor: bgColor, borderColor }}
      initial={{ scale: 0.88, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.85, opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="absolute inset-0 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] border flex flex-col overflow-hidden"
    >

      {!showExplanation ? (
        // Vue question
        <div className="flex flex-col h-full">
          {card.chapter && (
            <div className="px-6 pt-5 text-[10px] font-bold uppercase tracking-widest text-rose-400 text-center">
              {card.chapter}
            </div>
          )}
          <div className="flex-1 flex items-center justify-center px-7 py-4">
            <p className="text-center font-semibold text-stone-800 text-lg leading-relaxed">
              {card.statement}
            </p>
          </div>
        </div>
      ) : (
        // Vue explication (mode normal, mauvaise réponse)
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-full gap-4 px-7 py-6"
        >
          <div className="bg-red-100 rounded-2xl px-4 py-2 text-red-600 font-bold text-sm text-center">
            ❌ Bonne réponse : {card.isTrue ? "VRAI" : "FAUX"}
          </div>
          <p className="text-center text-stone-600 text-sm leading-relaxed">
            {card.explanation}
          </p>
          <button
            onClick={onNext}
            className="mt-1 bg-stone-800 text-white font-display font-bold px-6 py-3 rounded-2xl border-b-4 border-stone-900 active:border-b-0 active:translate-y-0.5 transition-all text-sm"
          >
            Continuer →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function VraiOuFaux({ subject }) {
  const isVojes = subject === "VOJES";
  const CHAPTER_TO_CATEGORY = isVojes ? VOJES_CHAPTER_TO_CATEGORY : CESBF_CHAPTER_TO_CATEGORY;
  const CATEGORIES = isVojes ? VOJES_CATEGORIES : CESBF_CATEGORIES;

  const [allCards, setAllCards] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [fastMode, setFastMode] = useState(false);

  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ good: 0, bad: 0 });
  const [done, setDone] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  // Ref pour accéder à l'index courant dans les callbacks sans closure stale
  const indexRef = useRef(0);
  const cardsRef = useRef([]);
  const answeredRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const flashcards = await base44.entities.Flashcard.filter({ subject }, null, 500);
      const vof = flashcards.filter(f =>
        f.back && (f.back.startsWith("VRAI") || f.back.startsWith("FAUX"))
      );
      const mapped = vof.map(f => ({
        statement: f.front,
        isTrue: f.back.startsWith("VRAI"),
        explanation: f.back.replace(/^(VRAI\s*✓?|FAUX\s*✗?)\s*[—\-]\s*/i, ""),
        chapter: f.chapter || "",
        category: CHAPTER_TO_CATEGORY[f.chapter] || "Autre",
      }));
      const shuffled = mapped.sort(() => Math.random() - 0.5);
      setAllCards(shuffled);
      setCards(shuffled);
      cardsRef.current = shuffled;
      setLoading(false);
    })();
  }, [subject]);

  const resetSession = useCallback((newCards) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    indexRef.current = 0;
    answeredRef.current = false;
    setIndex(0);
    setScore({ good: 0, bad: 0 });
    setFlash(null);
    setShowExplanation(false);
    setAnswered(false);
    setDone(false);
    setWrongAnswers([]);
    if (newCards) {
      cardsRef.current = newCards;
      setCards(newCards);
    }
  }, []);

  const applyCategory = (cat) => {
    setSelectedCategory(cat);
    const filtered = cat === "all"
      ? [...allCards]
      : allCards.filter(c => c.category === cat);
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    resetSession(shuffled);
  };

  const goToNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const nextIndex = indexRef.current + 1;
    answeredRef.current = false;
    setAnswered(false);
    setFlash(null);
    setShowExplanation(false);
    if (nextIndex >= cardsRef.current.length) {
      setDone(true);
    } else {
      indexRef.current = nextIndex;
      setIndex(nextIndex);
    }
  }, []);

  const answer = useCallback((userSaysTrue) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    setAnswered(true);

    const currentCard = cardsRef.current[indexRef.current];
    if (!currentCard) return;

    const correct = userSaysTrue === currentCard.isTrue;
    setFlash(correct ? "correct" : "wrong");
    setScore(s => correct ? { ...s, good: s.good + 1 } : { ...s, bad: s.bad + 1 });

    if (!correct) {
      setWrongAnswers(prev => [...prev, currentCard]);
    }

    if (!correct && !fastMode) {
      // Mode normal + mauvaise réponse : montrer explication sur la carte
      timerRef.current = setTimeout(() => setFlash(null), 400);
      setShowExplanation(true);
      // answeredRef reste true, on attend que l'utilisateur clique "Continuer"
    } else {
      // Mode rapide OU bonne réponse : passer auto
      timerRef.current = setTimeout(() => {
        goToNext();
      }, correct ? 500 : 700);
    }
  }, [fastMode, goToNext]);

  const nextCard = useCallback(() => {
    goToNext();
  }, [goToNext]);

  const restart = () => {
    const filtered = selectedCategory === "all"
      ? [...allCards]
      : allCards.filter(c => c.category === selectedCategory);
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    resetSession(shuffled);
  };

  const progress = cards.length > 0 ? index / cards.length : 0;
  const current = cards[index];

  // ── TOP BAR ──
  const TopBar = (
    <div className="flex items-center gap-2 mb-0 flex-shrink-0">
      {/* Filtres scrollables */}
      <div className="flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
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
        onClick={() => {
          const next = !fastMode;
          setFastMode(next);
          resetSession();
        }}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all border ${
          fastMode
            ? "bg-amber-400 text-amber-900 border-amber-400"
            : "bg-white text-stone-400 border-stone-200 hover:bg-stone-50"
        }`}
      >
        <Zap className="w-3.5 h-3.5" />
        Rapide
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

        <button onClick={restart} className="flex items-center gap-2 bg-rose-500 text-white font-display font-bold px-6 py-3.5 rounded-2xl border-b-4 border-rose-700 hover:bg-rose-400 active:translate-y-1 active:border-b-0 transition-all mt-1">
          <RotateCcw className="w-4 h-4" /> Rejouer
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="flex flex-col select-none" style={{ minHeight: "calc(100vh - 120px)" }}>
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
            <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-400 to-orange-400 rounded-full"
                animate={{ width: `${progress * 100}%` }}
                transition={{ type: "spring", stiffness: 120 }}
              />
            </div>
          </div>

          {/* Zone carte — hauteur fixe */}
          <div className="relative w-full" style={{ height: 320 }}>
            {/* Ghost card derrière */}
            {cards[index + 1] && (
              <div
                className="absolute inset-x-3 top-3 bottom-1 bg-white rounded-3xl border border-stone-100 shadow-sm"
                style={{ opacity: 0.5, transform: "scale(0.96)", zIndex: 1 }}
              />
            )}

            <AnimatePresence mode="wait">
              {current && (
                <Card
                  key={`card-${index}`}
                  card={current}
                  onAnswer={answer}
                  showExplanation={showExplanation && answered}
                  onNext={nextCard}
                  flash={flash}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Boutons FAUX / VRAI */}
          {!showExplanation && (
            <div className="flex gap-3 pt-3 pb-2">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => answer(false)}
                disabled={answered}
                className="flex-1 flex items-center justify-center gap-2 py-5 rounded-2xl font-display font-bold text-lg text-red-600 disabled:opacity-40 transition-all"
                style={{
                  background: "linear-gradient(135deg, #fff1f2 0%, #fecaca 100%)",
                  boxShadow: "0 4px 20px rgba(239,68,68,0.18)",
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
                  boxShadow: "0 4px 20px rgba(34,197,94,0.18)",
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