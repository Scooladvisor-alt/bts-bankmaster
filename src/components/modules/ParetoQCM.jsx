import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RotateCcw, CheckCircle2, XCircle, Menu, X, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DuoButton from "@/components/ui-duo/DuoButton";
import { useNavigate } from "react-router-dom";
import { saveParetoScore, getParetoScore, getScoreColor, getScoreBgColor } from "@/lib/scoreStorage";
import { trackProgress } from "@/lib/trackProgress";

// Structure officielle CESBF : groupes avec titre + chapitres dans l'ordre
const CESBF_GROUPS = [
  {
    title: "OUVERTURE DE COMPTE",
    prefixes: ["MODULE 1 — Chap 1", "MODULE 1 — Chap 2"],
  },
  {
    title: "SUIVI DES COMPTES BANCAIRES",
    prefixes: [
      "MODULE 2 — Chap 1",
      "MODULE 2 — Chap 2",
      "MODULE 2 — Chap 3",
      "MODULE 2 — Chap 4",
      "MODULE 2 — Chap 5",
    ],
  },
  {
    title: "MISE À DISPOSITION DES MOYENS DE PAIEMENT",
    prefixes: ["MODULE 3 — Chap 1", "MODULE 3 — Chap 2", "MODULE 3 — Chap 3"],
  },
  {
    title: "ÉLABORATION D'UNE SOLUTION D'ÉPARGNE",
    prefixes: [
      "MODULE 4 — Chap 1",
      "MODULE 4 — Chap 2",
      "MODULE 4 — Chap 3",
      "MODULE 4 — Chap 4",
      "MODULE 4 — Chap 5",
      "MODULE 4 — Chap 6",
    ],
  },
  {
    title: "ÉLABORATION D'UNE SOLUTION D'ASSURANCE",
    prefixes: ["MODULE 5 — Chap 1", "MODULE 5 — Chap 2", "MODULE 5 — Chap 3"],
  },
  {
    title: "ÉLABORATION D'UNE SOLUTION DE FINANCEMENT",
    prefixes: ["MODULE 6 — Chap 1", "MODULE 6 — Chap 2", "MODULE 6 — Chap 3"],
  },
  {
    title: "FISCALITÉ",
    prefixes: ["MODULE 7 — Chap 1", "MODULE 7 — Chap 2", "MODULE 7 — Chap 3"],
  },
];

function sortChaptersVOJES(chapters) {
  const getNum = (ch) => {
    const m = ch.match(/chapitre\s+(\d+)/i);
    return m ? parseInt(m[1]) : Infinity;
  };
  // Grouper par nom unique (supprimer doublons), puis trier
  const unique = [...new Set(chapters)];
  return unique.sort((a, b) => {
    const na = getNum(a), nb = getNum(b);
    if (na !== nb) return na - nb;
    return a.localeCompare(b, "fr");
  });
}

// Retourne les groupes CESBF avec les chapitres disponibles dans l'ordre
function buildCESBFGroups(chapters) {
  return CESBF_GROUPS.map(group => ({
    title: group.title,
    chapters: group.prefixes
      .map(prefix => chapters.find(ch => ch.startsWith(prefix)))
      .filter(Boolean),
  })).filter(g => g.chapters.length > 0);
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
      if (subject === "CESBF") {
        setChapters(buildCESBFGroups(raw));
      } else {
        setChapters(sortChaptersVOJES(raw));
      }
      setLoading(false);
    })();
  }, [subject]);

  const selectChapter = (chapter) => {
    const qs = allQuestions.filter(q => q.chapter === chapter);
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

  // Écouter Entrée pour continuer à la question suivante
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && selected !== null && !done) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, done]);

  const q = questions[current];

  const getOptionClass = (i) => {
    const base = "w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-all flex items-start gap-3";
    if (selected === null) {
      return `${base} bg-white border-stone-200 hover:border-stone-800 hover:shadow-sm cursor-pointer`;
    }
    if (i === questions[current].correct_index) {
      return `${base} bg-green-50 border-green-500 text-green-900`;
    }
    if (i === selected) {
      return `${base} bg-red-50 border-red-400 text-red-900`;
    }
    return `${base} bg-white border-stone-100 opacity-35`;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden fixed inset-0" style={{ background: "#fefce8" }}>

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
        <div className="px-4 py-3 border-b border-stone-100 bg-white flex items-center justify-between shrink-0">
          <button
            onClick={() => navigate(`/${subject.toLowerCase()}`)}
            className="flex items-center gap-1.5 font-bold text-stone-600 hover:text-stone-900 transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Retour à {subject}
          </button>
          <button className="md:hidden p-1.5 rounded-lg bg-stone-100 text-stone-600" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chapter list */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {loading ? (
            <div className="flex items-center gap-2 text-stone-400 p-4 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
            </div>
          ) : subject === "CESBF" ? (
            // Groupes CESBF avec titres
            chapters.map((group) => (
              <div key={group.title} className="mb-3">
                <div className="px-2 py-1.5 text-[9px] font-extrabold uppercase tracking-widest text-stone-400 border-b border-stone-100 mb-1">
                  {group.title}
                </div>
                {group.chapters.map((ch) => {
                   const isActive = selectedChapter === ch;
                   const label = ch.replace(/^MODULE\s+\d+\s*[—\-]\s*/i, "");
                   const score = getParetoScore(subject, ch);
                   return (
                     <button
                       key={ch}
                       onClick={() => selectChapter(ch)}
                       className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all leading-snug mb-0.5 flex items-center justify-between gap-2
                         ${isActive
                           ? "bg-yellow-400 text-yellow-900 font-bold shadow-sm"
                           : "text-stone-600 font-medium hover:bg-yellow-50 hover:text-yellow-900"}`}
                     >
                       <span>{label}</span>
                       {score !== null && (
                         <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getScoreBgColor(score)} ${getScoreColor(score)}`}>
                           {score}%
                         </span>
                       )}
                     </button>
                   );
                 })}
              </div>
            ))
          ) : (
            // VOJES : liste plate
            chapters.map((ch) => {
               const isActive = selectedChapter === ch;
               const score = getParetoScore(subject, ch);
               return (
                 <button
                   key={ch}
                   onClick={() => selectChapter(ch)}
                   className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all leading-snug mb-0.5 flex items-center justify-between gap-2
                     ${isActive
                       ? "bg-yellow-400 text-yellow-900 font-bold shadow-sm"
                       : "text-stone-600 font-medium hover:bg-yellow-50 hover:text-yellow-900"}`}
                 >
                   <span>{ch}</span>
                   {score !== null && (
                     <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getScoreBgColor(score)} ${getScoreColor(score)}`}>
                       {score}%
                     </span>
                   )}
                 </button>
               );
             })
          )}
        </nav>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile only) */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-stone-100 bg-white shrink-0">
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

            {/* Empty state — no chapter selected */}
            {!selectedChapter && chapters.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-5">📭</div>
                <div className="font-display text-2xl font-bold text-stone-700 mb-2">Pas encore de questions</div>
                <div className="text-stone-400 text-sm">Les questions Pareto n'ont pas encore été ajoutées pour cette matière.</div>
              </div>
            )}
            {!selectedChapter && chapters.length > 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-5">👈</div>
                <div className="font-display text-2xl font-bold text-stone-700 mb-2">Choisis un chapitre</div>
                <div className="text-stone-400 text-sm">Sélectionne un chapitre dans la barre de gauche</div>
              </div>
            )}

            {/* No questions */}
            {selectedChapter && questions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-4">📭</div>
                <div className="font-display text-xl font-bold text-stone-600 mb-2">Aucune question pour ce chapitre</div>
                <div className="text-stone-400 text-sm">Les questions n'ont pas encore été ajoutées par ton professeur.</div>
              </div>
            )}

            {/* Quiz */}
            {selectedChapter && questions.length > 0 && !done && q && (
              <div>
                {/* Progress */}
                <div className="mb-5">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-yellow-600 mb-2">{selectedChapter}</div>
                  <div className="h-2 bg-yellow-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${((current) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    {/* Question card */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 border-b-4 border-b-stone-300 mb-4">
                      <div className="font-fredoka text-xl leading-snug text-stone-900">{q.question}</div>
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5">
                      {q.options.map((opt, i) => (
                        <button key={i} onClick={() => handleAnswer(i)} className={getOptionClass(i)}>
                          <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold
                            ${selected === null ? "border-stone-300 text-stone-500"
                              : i === q.correct_index ? "border-green-500 bg-green-500 text-white"
                              : i === selected ? "border-red-400 bg-red-400 text-white"
                              : "border-stone-200 text-stone-300"}`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="flex-1 font-fredoka text-base">{opt}</span>
                          {selected !== null && i === q.correct_index && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                          {selected !== null && i === selected && i !== q.correct_index && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                        </button>
                      ))}
                    </div>

                    {/* Feedback */}
                    {selected !== null && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                        {selected === q.correct_index ? (
                          <div className="rounded-2xl p-4 mb-4 border bg-green-50 border-green-200">
                            <div className="font-bold text-sm text-green-700 mb-1">✅ Bonne réponse !</div>
                            {q.explanation && <div className="text-xs text-stone-600 leading-relaxed">{q.explanation}</div>}
                          </div>
                        ) : (
                          <div className="rounded-2xl p-4 mb-4 border bg-red-50 border-red-200">
                            <div className="font-bold text-sm text-red-700 mb-1.5">
                              ❌ Pas tout à fait — la bonne réponse était : <span className="text-green-700">{q.options[q.correct_index]}</span>
                            </div>
                            {q.explanation
                             ? <div className="text-xs text-stone-700 leading-relaxed"><span className="font-semibold">Pourquoi ?</span> {q.explanation}</div>
                             : <div className="text-xs text-stone-700 leading-relaxed">La bonne réponse est <span className="font-bold text-green-700">"{q.options[q.correct_index]}"</span>. Tu as répondu <span className="font-semibold text-red-600">"{q.options[selected]}"</span> — ces deux notions sont souvent confondues. Concentre-toi sur la distinction clé entre les deux propositions pour ne plus te tromper.</div>
                            }
                          </div>
                        )}
                        <DuoButton variant="secondary" onClick={next} className="w-full">
                          {current + 1 < questions.length ? "Question suivante →" : "Voir le résultat"}
                        </DuoButton>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* Results */}
            {done && (() => {
              const percentage = Math.round((score / questions.length) * 100);
              saveParetoScore(subject, selectedChapter, percentage);
              trackProgress({ toolUsed: "pareto", subject, score, totalQuestions: questions.length, chapter: selectedChapter });
              return (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                  <div className="text-6xl mb-4">{score === questions.length ? "🏆" : score >= 4 ? "👍" : score >= 3 ? "💪" : "📚"}</div>
                  <h2 className="font-display text-2xl font-bold mb-1 text-stone-900">{selectedChapter}</h2>
                  <div className="text-stone-500 mb-1">Score : <span className="text-stone-900 font-bold text-3xl">{score}</span> / {questions.length} ({percentage}%)</div>
                  <div className="text-sm text-stone-400 mb-8">{score === questions.length ? "Parfait ! Maîtrise totale 🎯" : score >= 4 ? "Très bien !" : score >= 3 ? "Bien, continue !" : "Révise encore ce chapitre."}</div>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <DuoButton variant="ghost" onClick={restart}><RotateCcw className="w-4 h-4 inline mr-1" /> Recommencer</DuoButton>
                    <DuoButton variant="primary" onClick={() => { setSelectedChapter(null); setDone(false); }}>Autre chapitre</DuoButton>
                  </div>
                </motion.div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}