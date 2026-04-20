import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ChevronRight, RotateCcw, CheckCircle2, XCircle, Menu, X, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DuoButton from "@/components/ui-duo/DuoButton";
import { useNavigate } from "react-router-dom";

// Ordre officiel des chapitres CESBF
const CESBF_ORDER = [
  "MODULE 1",
  "MODULE 2",
  "MODULE 3",
  "MODULE 4",
  "MODULE 5",
  "MODULE 6",
  "MODULE 7",
];

// Ordre détaillé par chapitre dans chaque module CESBF
const CESBF_CHAPTER_ORDER = [
  // MODULE 1 — Ouverture de compte
  "MODULE 1 — Chap 1",
  "MODULE 1 — Chap 2",
  // MODULE 2 — Suivi des comptes
  "MODULE 2 — Chap 1",
  "MODULE 2 — Chap 2",
  "MODULE 2 — Chap 3",
  "MODULE 2 — Chap 4",
  "MODULE 2 — Chap 5",
  // MODULE 3 — Moyens de paiement
  "MODULE 3 — Chap 1",
  "MODULE 3 — Chap 2",
  "MODULE 3 — Chap 3",
  // MODULE 4 — Épargne (chap 1, 2 d'abord, puis 3, 4, 5, 6)
  "MODULE 4 — Chap 1",
  "MODULE 4 — Chap 2",
  "MODULE 4 — Chap 3",
  "MODULE 4 — Chap 4",
  "MODULE 4 — Chap 5",
  "MODULE 4 — Chap 6",
  // MODULE 5 — Assurance
  "MODULE 5 — Chap 1",
  "MODULE 5 — Chap 2",
  "MODULE 5 — Chap 3",
  // MODULE 6 — Financement
  "MODULE 6 — Chap 1",
  "MODULE 6 — Chap 2",
  "MODULE 6 — Chap 3",
  // MODULE 7 — Fiscalité
  "MODULE 7 — Chap 1",
  "MODULE 7 — Chap 2",
  "MODULE 7 — Chap 3",
];

function sortChapters(chapters, subject) {
  if (subject === "CESBF") {
    return [...chapters].sort((a, b) => {
      const ia = CESBF_CHAPTER_ORDER.findIndex(prefix => a.startsWith(prefix));
      const ib = CESBF_CHAPTER_ORDER.findIndex(prefix => b.startsWith(prefix));
      const ra = ia === -1 ? 999 : ia;
      const rb = ib === -1 ? 999 : ib;
      if (ra !== rb) return ra - rb;
      return a.localeCompare(b, "fr");
    });
  }
  // VOGES : tri numérique
  const getNum = (ch) => {
    const m = ch.match(/chapitre\s+(\d+)/i);
    return m ? parseInt(m[1]) : Infinity;
  };
  return [...chapters].sort((a, b) => {
    const na = getNum(a), nb = getNum(b);
    if (na !== nb) return na - nb;
    return a.localeCompare(b, "fr");
  });
}

export default function ParetoQCM({ subject }) {
  const navigate = useNavigate();
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const all = await base44.entities.Question.filter({ subject, mode: "pareto" }, "chapter", 500);
      setAllQuestions(all);
      const raw = [...new Set(all.map(q => q.chapter).filter(Boolean))];
      setChapters(sortChapters(raw, subject));
      setLoading(false);
    })();
  }, [subject]);

  const selectChapter = (chapter) => {
    const qs = allQuestions.filter(q => q.chapter === chapter).slice(0, 5);
    setSelectedChapter(chapter);
    setQuestions(qs);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setSidebarOpen(false);
  };

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[current].correct_index) setScore(s => s + 1);
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  };

  const q = questions[current];

  // Option button classes: white by default, green if correct, orange if wrong
  const getOptionClass = (i) => {
    const base = "w-full text-left px-4 py-3.5 rounded-2xl border-2 font-semibold text-sm transition-all flex items-start gap-3";
    if (selected === null) {
      return `${base} bg-white border-stone-200 hover:border-stone-400 hover:shadow-sm cursor-pointer`;
    }
    if (i === questions[current].correct_index) {
      return `${base} bg-green-50 border-green-500 text-green-900`;
    }
    if (i === selected) {
      return `${base} bg-orange-50 border-orange-400 text-orange-900`;
    }
    return `${base} bg-white border-stone-100 opacity-40`;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden fixed inset-0 bg-gradient-to-b from-yellow-50 to-white">

      {/* ── SIDEBAR ── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed md:relative inset-y-0 left-0 z-40 md:z-auto
        w-72 md:w-72 lg:w-80
        bg-white border-r border-stone-200 shadow-lg
        flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Bouton retour en haut */}
        <div className="px-4 py-3 border-b border-stone-100 bg-yellow-400 flex items-center justify-between shrink-0">
          <button
            onClick={() => navigate(`/${subject.toLowerCase()}`)}
            className="flex items-center gap-1.5 font-bold text-yellow-900 hover:text-yellow-700 transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Retour à {subject}
          </button>
          <button className="md:hidden p-1.5 rounded-lg bg-yellow-300 text-yellow-900" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chapter list */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {loading ? (
            <div className="flex items-center gap-2 text-stone-400 p-4 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
            </div>
          ) : (
            chapters.map((ch) => {
              const isActive = selectedChapter === ch;
              const label = ch.replace(/^MODULE\s+\d+\s*[—\-]\s*/i, "");
              return (
                <button
                  key={ch}
                  onClick={() => selectChapter(ch)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all leading-snug flex items-start gap-2 mb-0.5
                    ${isActive
                      ? "bg-yellow-400 text-yellow-900 shadow-sm"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"}`}
                >
                  <ChevronRight className={`w-3 h-3 shrink-0 mt-0.5 transition-transform ${isActive ? "rotate-90 text-yellow-800" : "text-stone-400"}`} />
                  <span>{label}</span>
                </button>
              );
            })
          )}
        </nav>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile only) */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-stone-200 bg-white shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 text-sm font-bold text-stone-700 bg-stone-100 rounded-xl px-3 py-2"
          >
            <Menu className="w-4 h-4" /> Chapitres
          </button>
          {selectedChapter && (
            <div className="text-xs font-bold text-stone-500 truncate">{selectedChapter}</div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start px-6 py-8">
          <div className="w-full max-w-2xl">

            {/* Empty state */}
            {!selectedChapter && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-5">👈</div>
                <div className="font-display text-2xl font-bold text-stone-700 mb-2">Choisis un chapitre</div>
                <div className="text-stone-400 text-sm">Sélectionne un chapitre dans la barre de gauche</div>
              </div>
            )}

            {/* No questions */}
            {selectedChapter && questions.length === 0 && (
              <div className="text-center text-stone-400 mt-16">Aucune question disponible pour ce chapitre.</div>
            )}

            {/* Quiz */}
            {selectedChapter && questions.length > 0 && !done && q && (
              <div>
                {/* Progress */}
                <div className="mb-5">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-yellow-600 mb-1.5">{selectedChapter}</div>
                  <div className="flex gap-1.5 mb-2">
                    {questions.map((_, i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < current ? "bg-yellow-400" : i === current ? "bg-yellow-300" : "bg-stone-200"}`} />
                    ))}
                  </div>
                  <div className="text-xs text-stone-400 font-bold">Question {current + 1} / {questions.length}</div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    {/* Question card */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 border-b-4 border-b-yellow-300 mb-4">
                      <div className="font-fredoka text-xl leading-snug text-stone-900">{q.question}</div>
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5">
                      {q.options.map((opt, i) => (
                        <button key={i} onClick={() => handleAnswer(i)} className={getOptionClass(i)}>
                          <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold
                            ${selected === null ? "border-stone-300 text-stone-500"
                              : i === q.correct_index ? "border-green-500 bg-green-500 text-white"
                              : i === selected ? "border-orange-400 bg-orange-400 text-white"
                              : "border-stone-200 text-stone-300"}`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="flex-1 font-fredoka text-base">{opt}</span>
                          {selected !== null && i === q.correct_index && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                          {selected !== null && i === selected && i !== q.correct_index && <XCircle className="w-5 h-5 text-orange-400 shrink-0" />}
                        </button>
                      ))}
                    </div>

                    {/* Feedback */}
                    {selected !== null && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                        <div className={`rounded-2xl p-4 mb-4 border ${selected === q.correct_index ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
                          <div className={`font-bold text-sm ${selected === q.correct_index ? "text-green-700" : "text-orange-700"}`}>
                            {selected === q.correct_index ? "✅ Bonne réponse !" : `❌ Mauvaise réponse — Bonne réponse : ${q.options[q.correct_index]}`}
                          </div>
                          {q.explanation && <div className="text-xs text-stone-600 mt-1.5">{q.explanation}</div>}
                        </div>
                        <DuoButton variant="primary" onClick={next} className="w-full">
                          {current + 1 < questions.length ? "Question suivante →" : "Voir le résultat"}
                        </DuoButton>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* Results */}
            {done && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                <div className="text-6xl mb-4">{score === questions.length ? "🏆" : score >= 4 ? "👍" : score >= 3 ? "💪" : "📚"}</div>
                <h2 className="font-display text-2xl font-bold mb-1 text-stone-900">{selectedChapter}</h2>
                <div className="text-stone-500 mb-1">Score : <span className="text-yellow-600 font-bold text-3xl">{score}</span> / {questions.length}</div>
                <div className="text-sm text-stone-400 mb-8">{score === questions.length ? "Parfait ! Maîtrise totale 🎯" : score >= 4 ? "Très bien !" : score >= 3 ? "Bien, continue !" : "Révise encore ce chapitre."}</div>
                <div className="flex gap-3 justify-center flex-wrap">
                  <DuoButton variant="ghost" onClick={restart}><RotateCcw className="w-4 h-4 inline mr-1" /> Recommencer</DuoButton>
                  <DuoButton variant="primary" onClick={() => { setSelectedChapter(null); setDone(false); }}>Autre chapitre</DuoButton>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}