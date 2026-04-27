import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Lock, CheckCircle2, XCircle, RotateCcw, Trophy, Star, TrendingUp, ShieldCheck, BarChart2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import InspecteurAmf from "@/components/admin/InspecteurAmf";
import { trackProgress } from "@/lib/trackProgress";
import { saveAmfProgressDB, loadAmfProgressDB } from "@/lib/recordStorage";

const THEME_EMOJIS = {
  1: "🏛️", 2: "⚖️", 3: "🕵️", 4: "🚫",
  5: "📞", 6: "🤝", 7: "📈", 8: "🧺",
  9: "🏛️", 10: "🔗", 11: "🔀", 12: "🌍",
};

const PASS_THRESHOLD = 0.8; // 80%

function useAmfProgress() {
  const key = "amf_progress";
  const loadLocal = () => { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } };
  const save = (data) => {
    localStorage.setItem(key, JSON.stringify(data));
    saveAmfProgressDB(data); // sauvegarde silencieuse en BDD
  };
  return { loadLocal, save };
}

// ── Quiz screen for a single theme ──────────────────────────────────────────
function ThemeQuiz({ theme, questions, onComplete, onBack }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[current];
  const pct = Math.round((current / questions.length) * 100);

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correct_index) setScore(s => s + 1);
  };

  const next = () => {
    if (current + 1 >= questions.length) { setDone(true); return; }
    setCurrent(c => c + 1);
    setSelected(null);
  };

  useEffect(() => {
    const fn = (e) => { if (e.key === "Enter" && selected !== null && !done) next(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [selected, done, current]);

  if (done) {
    const passed = score / questions.length >= PASS_THRESHOLD;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-7xl mb-4">{passed ? "🏆" : "💪"}</div>
        <h2 className="font-fredoka text-3xl font-bold mb-2 text-stone-900">
          {passed ? "Balise validée !" : "Pas encore…"}
        </h2>
        <div className="text-lg text-stone-600 mb-1">
          Score : <span className="font-bold text-stone-900">{score} / {questions.length}</span>
          {" "}({Math.round(score / questions.length * 100)}%)
        </div>
        <div className="text-sm text-stone-400 mb-8">
          {passed ? "Tu as atteint les 80% requis 🎯" : `Il faut 80% pour valider. Réessaie !`}
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <button onClick={() => onComplete(passed)}
            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-2xl border-b-4 border-blue-800 active:border-b-0 active:translate-y-0.5 transition-all">
            {passed ? "Continuer →" : "Retour au parcours"}
          </button>
          <button onClick={() => { setCurrent(0); setSelected(null); setScore(0); setDone(false); }}
            className="bg-white border-2 border-stone-200 text-stone-700 font-bold px-6 py-3 rounded-2xl hover:bg-stone-50 transition-all flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Recommencer
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
          <ChevronLeft className="w-5 h-5 text-stone-600" />
        </button>
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-0.5">
            {THEME_EMOJIS[theme.theme_number]} Thème {theme.theme_number}
          </div>
          <div className="text-sm font-bold text-stone-700 truncate">{theme.theme_label}</div>
        </div>
        <div className="text-sm font-bold text-stone-500">{current + 1}/{questions.length}</div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-blue-100 rounded-full overflow-hidden mb-8">
        <motion.div className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          {/* Question */}
          <div className="mb-10">
            <p className="font-nunito font-semibold text-xl md:text-2xl leading-relaxed text-stone-900">{q.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              let cls = "w-full text-left px-4 py-4 rounded-2xl border-2 transition-all flex items-start gap-3 ";
              if (selected === null) cls += "bg-white border-stone-200 hover:border-blue-400 hover:shadow-sm cursor-pointer";
              else if (i === q.correct_index) cls += "bg-green-50 border-green-500 text-green-900";
              else if (i === selected) cls += "bg-red-50 border-red-400 text-red-900";
              else cls += "bg-white border-stone-100 opacity-35";

              return (
                <button key={i} onClick={() => handleAnswer(i)} className={cls}>
                  <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm shrink-0 font-bold
                    ${selected === null ? "border-stone-300 text-stone-500"
                      : i === q.correct_index ? "border-green-500 bg-green-500 text-white"
                      : i === selected ? "border-red-400 bg-red-400 text-white"
                      : "border-stone-200 text-stone-300"}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 font-nunito text-base leading-snug">{opt}</span>
                  {selected !== null && i === q.correct_index && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                  {selected !== null && i === selected && i !== q.correct_index && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {selected !== null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
              {selected === q.correct_index
                ? <div className="rounded-2xl p-4 mb-4 bg-green-50 border border-green-200">
                    <div className="font-bold text-sm text-green-700 mb-1">✅ Bonne réponse !</div>
                    {q.explanation && <div className="text-xs text-stone-600 leading-relaxed">{q.explanation}</div>}
                  </div>
                : <div className="rounded-2xl p-4 mb-4 bg-red-50 border border-red-200">
                    <div className="font-bold text-sm text-red-700 mb-1.5">❌ Pas tout à fait — bonne réponse : <span className="text-green-700">{q.options[q.correct_index]}</span></div>
                    {q.explanation && <div className="text-xs text-stone-700 leading-relaxed">{q.explanation}</div>}
                  </div>
              }
              <button onClick={next}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl border-b-4 border-blue-800 active:border-b-0 active:translate-y-0.5 transition-all">
                {current + 1 < questions.length ? "Question suivante →" : "Voir le résultat"}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Path node ────────────────────────────────────────────────────────────────
function PathNode({ theme, index, unlocked, passed, onSelect }) {
  const isLeft = index % 2 === 0;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className={`flex ${isLeft ? "justify-start pl-4 md:pl-16" : "justify-end pr-4 md:pr-16"} mb-2`}>
      <button
        onClick={() => unlocked && onSelect(theme)}
        disabled={!unlocked}
        className={`relative flex flex-col items-center gap-2 group transition-transform ${unlocked ? "hover:-translate-y-1 cursor-pointer" : "cursor-not-allowed opacity-60"}`}
      >
        {/* Circle node */}
        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center shadow-lg border-4 transition-all
          ${passed ? "bg-gradient-to-br from-blue-500 to-blue-700 border-blue-800 text-white"
            : unlocked ? "bg-white border-blue-300 text-stone-700 group-hover:border-blue-500"
            : "bg-stone-100 border-stone-200 text-stone-400"}`}>
          {passed ? <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" /> : unlocked ? <span className="text-2xl">{THEME_EMOJIS[theme.theme_number]}</span> : <Lock className="w-5 h-5" />}
          <span className="text-[10px] font-bold mt-0.5">T{theme.theme_number}</span>
        </div>
        {/* Label */}
        <div className={`text-[11px] font-bold text-center max-w-[90px] leading-tight
          ${passed ? "text-blue-700" : unlocked ? "text-stone-700" : "text-stone-400"}`}>
          {theme.theme_label}
        </div>
        {passed && <div className="text-[10px] text-green-600 font-bold">✓ Validé</div>}
      </button>
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AmfRevision() {
  const [allQuestions, setAllQuestions] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState(null);
  const [progress, setProgress] = useState({});
  const [showInspecteur, setShowInspecteur] = useState(false);
  const { loadLocal, save } = useAmfProgress();

  useEffect(() => {
    // Charge d'abord le local, puis fusionne avec la BDD
    setProgress(loadLocal());
    loadAmfProgressDB().then(merged => setProgress(merged));
    // Tracker la visite du module AMF
    trackProgress({ toolUsed: "amf", subject: "CESBF" });
    (async () => {
      const qs = await base44.entities.AmfQuestion.list("theme_number", 200);
      setAllQuestions(qs);
      // Build unique themes in order
      const seen = new Set();
      const t = [];
      qs.forEach(q => {
        if (!seen.has(q.theme_number)) {
          seen.add(q.theme_number);
          t.push({ theme_number: q.theme_number, theme_label: q.theme_label });
        }
      });
      t.sort((a, b) => a.theme_number - b.theme_number);
      setThemes(t);
      setLoading(false);
    })();
  }, []);

  const handleComplete = (passed) => {
    if (passed) {
      const updated = { ...progress, [activeTheme.theme_number]: true };
      setProgress(updated);
      save(updated);
    }
    setActiveTheme(null);
  };

  const isUnlocked = (t) => t.theme_number === 1 || progress[t.theme_number - 1] === true;

  if (activeTheme) {
    const qs = allQuestions.filter(q => q.theme_number === activeTheme.theme_number)
      .sort(() => Math.random() - 0.5);
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <ThemeQuiz
          theme={activeTheme}
          questions={qs}
          onComplete={handleComplete}
          onBack={() => setActiveTheme(null)}
        />
      </div>
    );
  }

  const allPassed = themes.length > 0 && themes.every(t => progress[t.theme_number]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-red-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-blue-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/cesbf" className="p-2 rounded-xl hover:bg-blue-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </Link>
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-600">Certification AMF</div>
            <h1 className="font-fredoka text-xl font-bold text-stone-900">Parcours AMF — Méthode Survie Paretomaxing</h1>
          </div>
          <div className="text-2xl">🇫🇷</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Intro banner + bouton Inspecteur */}
        <div className="flex gap-3 mb-8 items-stretch">
          <div className="flex-1 bg-gradient-to-r from-blue-600 via-white to-red-500 p-0.5 rounded-3xl shadow-lg">
            <div className="bg-white rounded-[22px] px-5 py-4 h-full">
              <div className="flex items-center gap-3">
                <div className="text-4xl">🎯</div>
                <div>
                  <div className="font-fredoka text-lg font-bold text-stone-900">Méthode Pareto — 80/20</div>
                  <div className="text-xs text-stone-500 leading-relaxed mt-0.5">
                    Les 12 thèmes clés de la certification AMF - version express. Valide chaque balise avec 80% de bonnes réponses pour avancer.
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
        {showInspecteur && <InspecteurAmf onClose={() => setShowInspecteur(false)} />}

        {/* Progress summary */}
        {themes.length > 0 && (
          <div className="flex items-center gap-3 mb-8 bg-blue-50 rounded-2xl px-4 py-3">
            <Trophy className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-sm font-bold text-blue-800">
              {Object.values(progress).filter(Boolean).length} / {themes.length} balises validées
            </div>
            <div className="flex-1 h-2 bg-blue-200 rounded-full overflow-hidden ml-2">
              <div className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${(Object.values(progress).filter(Boolean).length / themes.length) * 100}%` }} />
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20 text-stone-400 gap-2">
            <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
            Chargement du parcours…
          </div>
        )}

        {!loading && themes.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <div className="font-fredoka text-xl font-bold text-stone-600 mb-2">Parcours en cours de chargement</div>
            <div className="text-stone-400 text-sm">Les questions AMF seront bientôt disponibles.</div>
          </div>
        )}

        {/* Path */}
        {!loading && themes.length > 0 && (
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-1/2 top-10 bottom-10 w-1 bg-blue-100 -translate-x-1/2 -z-0" />
            <div className="relative z-10 space-y-6">
              {themes.map((t, i) => (
                <PathNode
                  key={t.theme_number}
                  theme={t}
                  index={i}
                  unlocked={isUnlocked(t)}
                  passed={!!progress[t.theme_number]}
                  onSelect={setActiveTheme}
                />
              ))}
            </div>
          </div>
        )}

        {allPassed && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="mt-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl p-6 text-center shadow-xl">
            <div className="text-5xl mb-3">🏆</div>
            <div className="font-fredoka text-2xl font-bold text-white mb-1">Parcours AMF terminé !</div>
            <div className="text-yellow-100 text-sm">Tu as validé les 12 thèmes. Tu es prêt(e) pour l'examen !</div>
          </motion.div>
        )}
      </div>

      {/* Widgets flottants — Mode Inspecteur + Trading Desk */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={() => setShowInspecteur(true)}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl shadow-lg hover:scale-105 transition-transform bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600"
          title="Mode Inspecteur AMF"
        >
          <ShieldCheck className="w-4 h-4 text-yellow-400 shrink-0" />
          <div className="text-left">
            <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-wide leading-none">Inspecteur</div>
            <div className="text-[9px] text-slate-400 mt-0.5">Conforme / Sanction</div>
          </div>
        </button>
        <Link
          to="/cesbf/amf/trading"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl shadow-lg hover:scale-105 transition-transform border"
          style={{ background: "linear-gradient(135deg, #052e16 0%, #14532d 100%)", borderColor: "#166534" }}
          title="Trading Desk — Daily Challenge"
        >
          <BarChart2 className="w-4 h-4 text-green-400 shrink-0" />
          <div className="text-left">
            <div className="text-[10px] font-bold text-green-400 uppercase tracking-wide leading-none">Trading Desk</div>
            <div className="text-[9px] text-green-700 mt-0.5">Daily · BTS Coins</div>
          </div>
        </Link>
      </div>
    </div>
  );
}