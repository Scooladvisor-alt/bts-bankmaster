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
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentExpectedAnswer, setCurrentExpectedAnswer] = useState(null); // réponse attendue de la question en cours
  const [allChapterQuestions, setAllChapterQuestions] = useState([]); // toutes les questions du chapitre
  const [usedQuestionIds, setUsedQuestionIds] = useState(new Set()); // IDs déjà posés
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
        // VOJES : chapitres depuis les RevisionQuestion (comme CESBF)
        const questions = await base44.entities.RevisionQuestion.filter({ subject: "VOJES" }, null, 500);
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
    setUsedQuestionIds(new Set());
    setCurrentExpectedAnswer(null);
    setLoadingQuestion(true);

    // Charge TOUTES les questions du chapitre depuis la BDD
    const allRevQ = await base44.entities.RevisionQuestion.filter({ subject }, null, 500);
    const chapterQ = allRevQ.filter(q => q.chapter === chapter);
    setAllChapterQuestions(chapterQ);

    if (chapterQ.length === 0) {
      setMessages([{ role: "assistant", content: "Aucune question disponible pour ce chapitre pour l'instant. Reviens plus tard quand les profs auront ajouté du contenu ! 💪" }]);
      setCurrentExpectedAnswer(null);
    } else {
      // Pioche une question aléatoire du chapitre
      const picked = chapterQ[Math.floor(Math.random() * chapterQ.length)];
      setUsedQuestionIds(new Set([picked.id]));
      setCurrentExpectedAnswer(picked.expected_answer || null);
      setMessages([{ role: "assistant", content: picked.question }]);
    }

    setLoadingQuestion(false);
  };

  const sendAnswer = async () => {
    if (!answer.trim() || sending) return;
    const userMsg = answer.trim();
    setAnswer("");
    setSending(true);
    setMessages((m) => [...m, { role: "user", content: userMsg }]);

    const history = messages.map((m) => `${m.role === "user" ? "Étudiant" : "Professeur"}: ${m.content}`).join("\n");
    const lastQuestion = messages.filter(m => m.role === "assistant").slice(-1)[0]?.content || "";

    // Pioche la prochaine question depuis la BDD (en excluant celles déjà posées)
    const remaining = allChapterQuestions.filter(q => !usedQuestionIds.has(q.id));
    let nextQuestion = null;
    let nextExpectedAnswer = null;
    let nextPicked = null;
    const allExhausted = remaining.length === 0 && allChapterQuestions.length > 0;

    if (remaining.length > 0) {
      nextPicked = remaining[Math.floor(Math.random() * remaining.length)];
      nextQuestion = nextPicked.question;
      nextExpectedAnswer = nextPicked.expected_answer || null;
    }

    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt: `T'es le meilleur pote de l'étudiant, et t'es un crack en BTS Banque. Tu parles EXACTEMENT comme un pote IRL — naturel, familier, direct, sans chichis ni langue de bois. Tu tutoies toujours. Tu réponds toujours de manière cohérente avec ce que l'étudiant vient de dire.

Matière : ${subject} — Chapitre : "${selectedChapter}"

HISTORIQUE DE LA CONVERSATION :
${history}

LA QUESTION QUE TU VENAIS DE LUI POSER : "${lastQuestion}"
${currentExpectedAnswer ? `LA RÉPONSE CORRECTE ATTENDUE (pour référence interne seulement, ne la révèle pas avant d'évaluer) : "${currentExpectedAnswer}"` : ""}

CE QUE L'ÉTUDIANT VIENT DE RÉPONDRE : "${userMsg}"

---

ÉTAPE 1 — DÉTECTE ce que c'est :

A) INSULTE / IRRESPECT → Recadre-le CASH et sans pitié, comme un pote qui en a marre. Utilise des phrases du style : "Ferme la guignol ! tu crois c'est comme ça tu vas avoir ton BTS ??" ou "T'as que ça à faire ou quoi ?" ou "T'es vraiment faible pour insulter une IA 😂" ou "Calme toi boloss, t'as un exam qui arrive" ou "C'est ça ton niveau ? Sérieux ?" ou "Wesh redescends, t'as pas le temps de faire le mariole". Sois mordant, taquin, légèrement moqueur — mais recentre TOUJOURS sur le boulot à faire à la fin (une phrase du genre "bon allez, on reprend" ou "focus, t'as un BTS à passer"). Après le recadrage, continue avec la question suivante si il y en a une.

B) QUESTION / DEMANDE DE PRÉCISION → Réponds directement et clairement, comme à la cafét. Sois précis sur le contenu BTS Banque. Réponds à ce qu'il demande VRAIMENT, puis reprends la question posée si besoin.

C) RÉPONSE À LA QUESTION POSÉE → Compare sa réponse à la réponse attendue :
  - Correct (correspond à la réponse attendue) : valide en une phrase naturelle. Si des éléments bonus existent → "**Tu aurais pu aussi glisser :**" à la fin.
  - Partiel (quelques éléments mais incomplet) : va DIRECT sur ce qui manque sans répéter ce qu'il a dit.
  - Incorrect / hors sujet / n'importe quoi → sois direct : "Nan là c'est pas ça ❌" et donne la bonne réponse en 2-3 phrases factuelles.

RÈGLES ABSOLUES :
- Commence par un verdict naturel cohérent avec ce que l'étudiant a dit : "Ouais c'est bon ✅", "Presque —", "Nan là c'est pas ça ❌", etc.
- Max 6 lignes de feedback. Sois chirurgical et précis.
- Zéro blabla motivationnel.
- Utilise des listes à puces (- item) pour les énumérations.
- N'invente JAMAIS de nouvelles questions de toi-même. Utilise UNIQUEMENT les questions fournies.
- Après le feedback :
${allExhausted
  ? `  → Dis-lui qu'il a épuisé toutes les questions disponibles pour le chapitre "${selectedChapter}". Félicite-le et propose-lui de changer de chapitre pour continuer.`
  : nextQuestion
    ? `  → Termine avec "---" puis pose EXACTEMENT cette question sans la modifier : "${nextQuestion}"`
    : `  → Dis-lui qu'il a épuisé toutes les questions disponibles pour ce chapitre. Félicite-le et propose-lui de changer de chapitre.`
}`,
    });

    // Met à jour les questions utilisées
    if (nextPicked) {
      setUsedQuestionIds(prev => new Set([...prev, nextPicked.id]));
      setCurrentExpectedAnswer(nextExpectedAnswer);
    }

    setMessages((m) => [...m, { role: "assistant", content: feedback }]);
    setSending(false);
  };

  const reset = () => {
    setSelectedChapter(null);
    setMessages([]);
    setAnswer("");
    setCurrentExpectedAnswer(null);
    setAllChapterQuestions([]);
    setUsedQuestionIds(new Set());
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