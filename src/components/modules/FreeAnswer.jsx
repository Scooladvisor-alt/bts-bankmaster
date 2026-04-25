import React, { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Send, RotateCcw, BookOpen, Sparkles, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Extrait le préfixe MODULE depuis un nom de chapitre BDD (ex: "MODULE I — LE COMPTE...")
function getModuleKey(chapterName) {
  const match = chapterName.match(/^(MODULE\s+[IVXLCDM\d]+)/i);
  return match ? match[1].toUpperCase() : "AUTRE";
}

export default function FreeAnswer({ subject }) {
  const [chapters, setChapters] = useState([]); // liste de strings (noms de chapitres)
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    (async () => {
      if (subject === "CESBF") {
        // Récupère directement les chapitres uniques depuis la BDD (questions de révision libre)
        const questions = await base44.entities.RevisionQuestion.filter({ subject: "CESBF" }, null, 500);
        const seen = new Set();
        const ordered = [];
        questions.forEach(q => {
          if (q.chapter && !seen.has(q.chapter)) {
            seen.add(q.chapter);
            ordered.push(q.chapter);
          }
        });
        setChapters(ordered);
      } else {
        // VOJES : chapitres des questions QCM Pareto
        const questions = await base44.entities.Question.filter({ subject: "VOJES", mode: "pareto" }, null, 500);
        const seen = new Set();
        const ordered = [];
        questions.forEach(q => {
          if (q.chapter && !seen.has(q.chapter)) {
            seen.add(q.chapter);
            ordered.push(q.chapter);
          }
        });
        ordered.sort((a, b) => {
          const na = parseInt(a.match(/\d+/)?.[0] || "999");
          const nb = parseInt(b.match(/\d+/)?.[0] || "999");
          return na - nb;
        });
        setChapters(ordered);
      }
      setLoading(false);
    })();
  }, [subject]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const selectChapter = async (chapter) => {
    setSelectedChapter(chapter);
    setMessages([]);
    setAnswer("");
    setLoadingQuestion(true);

    // Récupère les questions de révision du chapitre depuis la BDD
    const allRevQ = await base44.entities.RevisionQuestion.filter({ subject }, null, 500);
    const chapterQ = allRevQ.filter(q => q.chapter === chapter);
    const pool = chapterQ.length > 0 ? chapterQ : allRevQ;
    const picked = pool[Math.floor(Math.random() * pool.length)];

    const questionText = picked ? picked.question : null;

    let firstQ;
    if (questionText) {
      firstQ = questionText;
    } else {
      // Fallback IA si aucune question en BDD
      firstQ = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un professeur expert en BTS Banque, matière ${subject}. 
Pose UNE seule question de révision précise et pertinente sur le chapitre : "${chapter}".
Réponds UNIQUEMENT avec la question, sans introduction ni numérotation.`,
      });
    }

    setMessages([{ role: "assistant", content: firstQ }]);
    setLoadingQuestion(false);
  };

  const sendAnswer = async () => {
    if (!answer.trim() || sending) return;
    const userMsg = answer.trim();
    setAnswer("");
    setSending(true);
    setMessages((m) => [...m, { role: "user", content: userMsg }]);

    const history = messages.map((m) => `${m.role === "user" ? "Étudiant" : "Professeur"}: ${m.content}`).join("\n");

    // Prochaine question depuis la BDD
    const allRevQ = await base44.entities.RevisionQuestion.filter({ subject }, null, 500);
    const chapterQ = allRevQ.filter(q => q.chapter === selectedChapter);
    const pool = chapterQ.length > 0 ? chapterQ : allRevQ;
    const usedQ = messages.filter(m => m.role === "assistant").map(m => m.content);
    const nextPool = pool.filter(q => !usedQ.some(u => u.includes(q.question)));
    const nextQ = nextPool.length > 0
      ? nextPool[Math.floor(Math.random() * nextPool.length)]
      : pool[Math.floor(Math.random() * pool.length)];
    const nextQuestion = nextQ ? nextQ.question : null;

    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt: `T'es le meilleur pote de l'étudiant, et t'es un crack en BTS Banque. Tu parles EXACTEMENT comme un pote IRL — naturel, familier, direct, sans chichis ni langue de bois. Tu tutoies toujours. Matière : ${subject} — Chapitre : "${selectedChapter}"

Historique :
${history}

Ce que l'étudiant vient de dire : "${userMsg}"

---

DÉTECTE D'ABORD ce que c'est :

A) INSULTE / IRRESPECT → Recadre-le cash comme un vrai pote qui se défend, proportionnellement. Ferme, direct.

B) QUESTION / PRÉCISION → Réponds direct, comme si t'expliquais à la cafét. Juste la réponse claire.

C) RÉPONSE À LA QUESTION POSÉE → Évalue :
  - Correct : confirme en une phrase naturelle. Si bonus → à la fin, préfixé de "**Tu aurais pu aussi glisser :**".
  - Partiel : va DIRECT à ce qui manque, répète pas ce qu'il a dit.
  - Incorrect : donne la bonne réponse en 2-3 phrases factuelles.

RÈGLES DE FORME ABSOLUES :
- Commence par le verdict naturel : "Ouais c'est bon ✅", "Presque —", "Nan là c'est pas ça ❌", etc.
- Structure avec des **titres courts en gras** si nécessaire.
- Utilise des listes à puces (- item) pour les énumérations.
- Max 6 lignes de contenu. Sois chirurgical.
- Zéro blabla motivationnel.
${nextQuestion ? `- Termine avec "---" puis pose cette question directement : "${nextQuestion}"` : `- Termine avec "---" puis pose une nouvelle question différente sur le chapitre "${selectedChapter}".`}`,
    });

    setMessages((m) => [...m, { role: "assistant", content: feedback }]);
    setSending(false);
  };

  const reset = () => {
    setSelectedChapter(null);
    setMessages([]);
    setAnswer("");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-stone-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Chargement des thèmes…
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center text-stone-600">
        Aucun chapitre disponible. Ajoute des questions de révision depuis l'espace admin.
      </div>
    );
  }

  // ── Sélection du chapitre ──
  if (!selectedChapter) {
    const accentColor = subject === "CESBF" ? "orange" : "purple";
    const accentClasses = subject === "CESBF"
      ? { badge: "text-orange-600/60", card: "border-orange-200", icon: "bg-orange-100 text-orange-600" }
      : { badge: "text-purple-600/60", card: "border-purple-200", icon: "bg-purple-100 text-purple-600" };

    if (subject === "CESBF") {
      // Grouper dynamiquement par MODULE depuis les noms réels en BDD
      const groupMap = {};
      chapters.forEach(ch => {
        const key = getModuleKey(ch);
        if (!groupMap[key]) groupMap[key] = [];
        groupMap[key].push(ch);
      });
      const groups = Object.entries(groupMap).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));

      return (
        <div>
          <div className="mb-5">
            <h2 className="font-display text-2xl font-bold text-stone-900">Choisis un thème à réviser</h2>
            <p className="text-stone-500 text-sm mt-1">L'IA t'interrogera sur le chapitre choisi avec des questions pertinentes.</p>
          </div>
          <div className="space-y-5">
            {groups.map(([moduleKey, chs]) => (
              <div key={moduleKey}>
                <div className={`text-[9px] font-extrabold uppercase tracking-widest ${accentClasses.badge} px-1 mb-2`}>{moduleKey}</div>
                <div className="grid gap-2">
                  {chs.map((ch, i) => (
                    <motion.button
                      key={ch}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => selectChapter(ch)}
                      className={`bg-white rounded-2xl p-4 shadow-duo border-b-4 ${accentClasses.card} text-left hover:-translate-y-0.5 transition-transform flex items-center gap-3`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${accentClasses.icon} flex items-center justify-center shrink-0`}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-sm text-stone-900">{ch}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // VOJES
    return (
      <div>
        <div className="mb-5">
          <h2 className="font-display text-2xl font-bold text-stone-900">Choisis un thème à réviser</h2>
          <p className="text-stone-500 text-sm mt-1">L'IA t'interrogera sur le chapitre choisi avec des questions pertinentes.</p>
        </div>
        <div className="grid gap-3">
          {chapters.map((ch, i) => (
            <motion.button
              key={ch}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => selectChapter(ch)}
              className={`bg-white rounded-2xl p-4 shadow-duo border-b-4 ${accentClasses.card} text-left hover:-translate-y-0.5 transition-transform flex items-center gap-3`}
            >
              <div className={`w-8 h-8 rounded-lg ${accentClasses.icon} flex items-center justify-center shrink-0`}>
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm text-stone-900">{ch}</div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // ── Interface conversation ──
  return (
    <div className="flex flex-col h-[calc(100vh-160px)] min-h-[500px]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-teal-600">Révision interactive</div>
          <div className="font-display font-bold text-lg">{selectedChapter}</div>
        </div>
        <button onClick={reset} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900 font-bold">
          <RotateCcw className="w-4 h-4" /> Changer
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        {loadingQuestion && (
          <div className="flex items-center gap-2 text-teal-600 text-sm font-bold">
            <Loader2 className="w-4 h-4 animate-spin" /> L'IA prépare une question…
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === "user" ? "bg-teal-500" : "bg-stone-800"}`}>
                {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-teal-500 text-white rounded-tr-sm"
                  : "bg-white border border-stone-200 shadow-sm text-stone-800 rounded-tl-sm"
              }`}>
                {msg.role === "user" ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  msg.content.split("---").map((part, pi) => (
                    <div key={pi}>
                      {pi === 1 && <div className="border-t border-stone-200 my-3" />}
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {part.trim().split("\n").map((line, li) => {
                          if (/^\*\*.+\*\*/.test(line.trim())) {
                            return <div key={li} className="font-bold text-stone-900 mt-2 mb-0.5">{line.replace(/\*\*/g, "")}</div>;
                          }
                          if (/^[-•]\s/.test(line.trim())) {
                            return <div key={li} className="flex gap-1.5 ml-1"><span className="text-stone-400 mt-0.5">·</span><span>{line.replace(/^[-•]\s/, "")}</span></div>;
                          }
                          if (line.trim() === "") return <div key={li} className="h-1.5" />;
                          return <div key={li}>{line}</div>;
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {sending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 text-sm text-stone-500">
              <Sparkles className="w-4 h-4 animate-pulse text-teal-500" /> Analyse en cours…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex gap-2 items-end">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAnswer(); } }}
          disabled={sending || loadingQuestion}
          placeholder="Écris ta réponse… (Entrée pour envoyer)"
          className="flex-1 rounded-2xl border-2 border-teal-200 bg-teal-50/40 px-4 py-3 focus:outline-none focus:border-teal-500 font-medium resize-none text-sm min-h-[52px] max-h-[120px]"
          rows={2}
        />
        <button
          onClick={sendAnswer}
          disabled={!answer.trim() || sending || loadingQuestion}
          className="bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-white rounded-2xl p-3 border-b-4 border-teal-700 active:border-b-0 active:translate-y-1 transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}