import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ChevronRight, RotateCcw, CheckCircle2, XCircle, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DuoButton from "@/components/ui-duo/DuoButton";

export default function ParetoQCM({ subject }) {
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
      const chapterList = [...new Set(all.map(q => q.chapter).filter(Boolean))].sort();
      setChapters(chapterList);
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

  if (loading) return (
    <div className="flex items-center gap-2 text-stone-500 p-8">
      <Loader2 className="w-5 h-5 animate-spin" /> Chargement…
    </div>
  );

  const q = questions[current];
  const optionColors = ["bg-amber-50 border-amber-200", "bg-blue-50 border-blue-200", "bg-pink-50 border-pink-200", "bg-emerald-50 border-emerald-200"];

  return (
    <div className="flex h-full min-h-[500px] relative">
      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative top-0 left-0 h-full z-30 md:z-auto
        w-64 md:w-56 shrink-0
        bg-white border-r border-stone-200 rounded-l-2xl overflow-y-auto
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `} style={{ maxHeight: "80vh" }}>
        <div className="p-3 sticky top-0 bg-white border-b border-stone-100 flex items-center justify-between">
          <div className="font-display font-bold text-sm text-stone-700">Chapitres</div>
          <button className="md:hidden p-1" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>
        <nav className="p-2 space-y-1">
          {chapters.map((ch) => (
            <button
              key={ch}
              onClick={() => selectChapter(ch)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all leading-tight flex items-center gap-1.5
                ${selectedChapter === ch
                  ? "bg-yellow-400 text-yellow-900 shadow-sm"
                  : "text-stone-600 hover:bg-stone-100"}`}
            >
              <ChevronRight className={`w-3 h-3 shrink-0 transition-transform ${selectedChapter === ch ? "rotate-90" : ""}`} />
              {ch}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 p-4 md:pl-6">
        {/* Mobile: toggle sidebar */}
        <button
          className="md:hidden flex items-center gap-2 text-sm font-bold text-stone-600 mb-4 bg-white rounded-xl px-3 py-2 shadow-sm border border-stone-200"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-4 h-4" /> Choisir un chapitre
        </button>

        {!selectedChapter && (
          <div className="flex flex-col items-center justify-center h-64 text-center text-stone-400">
            <div className="text-5xl mb-4">👈</div>
            <div className="font-display text-xl font-bold text-stone-600">Choisis un chapitre</div>
            <div className="text-sm mt-1">Sélectionne un chapitre dans la liste à gauche</div>
          </div>
        )}

        {selectedChapter && questions.length === 0 && (
          <div className="text-center text-stone-500 mt-12">Aucune question disponible pour ce chapitre.</div>
        )}

        {selectedChapter && questions.length > 0 && !done && q && (
          <div>
            <div className="mb-4">
              <div className="text-xs font-bold uppercase tracking-widest text-yellow-600 mb-1">{selectedChapter}</div>
              <div className="flex items-center gap-2 mb-3">
                {questions.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < current ? "bg-yellow-400" : i === current ? "bg-yellow-300" : "bg-stone-200"}`} />
                ))}
              </div>
              <div className="text-xs text-stone-400 font-bold">{current + 1} / {questions.length}</div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-white rounded-2xl p-5 shadow-duo border-b-4 border-yellow-200 mb-4">
                  <div className="font-display font-bold text-lg leading-snug">{q.question}</div>
                </div>

                <div className="space-y-2">
                  {q.options.map((opt, i) => {
                    let cls = `w-full text-left px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all flex items-start gap-3 ${optionColors[i]}`;
                    if (selected !== null) {
                      if (i === q.correct_index) cls += " border-green-500 bg-green-50";
                      else if (i === selected) cls += " border-red-400 bg-red-50";
                      else cls += " opacity-50";
                    } else {
                      cls += " hover:scale-[1.01] cursor-pointer";
                    }
                    return (
                      <button key={i} onClick={() => handleAnswer(i)} className={cls}>
                        <span className="w-6 h-6 rounded-full bg-white border-2 border-current flex items-center justify-center text-xs shrink-0 mt-0.5">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {selected !== null && i === q.correct_index && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                        {selected !== null && i === selected && i !== q.correct_index && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {selected !== null && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                    <div className={`rounded-2xl p-4 mb-3 ${selected === q.correct_index ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                      <div className={`font-bold text-sm ${selected === q.correct_index ? "text-green-700" : "text-red-700"}`}>
                        {selected === q.correct_index ? "✅ Bonne réponse !" : `❌ Mauvaise réponse. La bonne réponse était : ${q.options[q.correct_index]}`}
                      </div>
                      {q.explanation && <div className="text-xs text-stone-600 mt-1">{q.explanation}</div>}
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

        {done && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <div className="text-6xl mb-4">{score === questions.length ? "🏆" : score >= questions.length / 2 ? "👍" : "💪"}</div>
            <h2 className="font-display text-3xl font-bold mb-2">{selectedChapter}</h2>
            <div className="text-stone-600 mb-1">Score : <span className="text-yellow-600 font-bold text-2xl">{score} / {questions.length}</span></div>
            <div className="text-sm text-stone-400 mb-6">{score === questions.length ? "Parfait ! Maîtrise totale 🎯" : score >= 4 ? "Très bien !" : score >= 3 ? "Bien, continue !" : "Révise encore ce chapitre."}</div>
            <div className="flex gap-3 justify-center flex-wrap">
              <DuoButton variant="ghost" onClick={restart}><RotateCcw className="w-4 h-4 inline mr-1" /> Recommencer</DuoButton>
              <DuoButton variant="primary" onClick={() => { setSelectedChapter(null); setDone(false); setSidebarOpen(true); }}>Autre chapitre</DuoButton>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}