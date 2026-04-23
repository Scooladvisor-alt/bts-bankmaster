import React, { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Send, RotateCcw, BookOpen, ChevronDown, Sparkles, Bot, User } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";
import { motion, AnimatePresence } from "framer-motion";

export default function FreeAnswer({ subject }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [messages, setMessages] = useState([]); // [{role, content}]
  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    (async () => {
      const list = await base44.entities.Course.filter({ subject }, "order");
      setCourses(list);
      setLoading(false);
    })();
  }, [subject]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const selectChapter = async (course) => {
    setSelectedChapter(course);
    setMessages([]);
    setAnswer("");
    setCurrentQuestion(null);
    setLoadingQuestion(true);

    // Cherche uniquement dans les questions de révision existantes
    const allRevQuestions = await base44.entities.RevisionQuestion.filter({ subject });
    // Filtre par correspondance avec le titre du cours
    const chapterQuestions = allRevQuestions.filter(q =>
      q.chapter && course.title &&
      (course.title.toLowerCase().includes(q.chapter.split(" - ").slice(1).join(" - ").toLowerCase()) ||
       q.chapter.toLowerCase().includes(course.title.toLowerCase().replace(/chapitre \d+ - /i, "")))
    );
    const pool = chapterQuestions.length > 0 ? chapterQuestions : allRevQuestions;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const questionText = picked ? picked.question : "Aucune question de révision disponible pour ce chapitre.";

    setCurrentQuestion(questionText);
    setMessages([{ role: "assistant", content: `📖 **${course.title}**\n\n${questionText}` }]);
    setLoadingQuestion(false);
  };

  const sendAnswer = async () => {
    if (!answer.trim() || sending) return;
    const userMsg = answer.trim();
    setAnswer("");
    setSending(true);
    setMessages((m) => [...m, { role: "user", content: userMsg }]);

    const course = selectedChapter;
    const history = messages.map((m) => `${m.role === "user" ? "Étudiant" : "Professeur"}: ${m.content}`).join("\n");

    // Cherche une nouvelle question de révision différente
    const allRevQuestions = await base44.entities.RevisionQuestion.filter({ subject });
    const usedQuestions = messages.filter(m => m.role === "assistant").map(m => m.content);
    const available = allRevQuestions.filter(q =>
      q.chapter && course.title &&
      (course.title.toLowerCase().includes(q.chapter.split(" - ").slice(1).join(" - ").toLowerCase()) ||
       q.chapter.toLowerCase().includes(course.title.toLowerCase().replace(/chapitre \d+ - /i, "")))
    ).filter(q => !usedQuestions.some(u => u.includes(q.question)));
    const pool = available.length > 0 ? available : allRevQuestions.filter(q => !usedQuestions.some(u => u.includes(q.question)));
    const nextQ = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
    const nextQuestion = nextQ ? nextQ.question : null;

    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt: `T'es le meilleur pote de l'étudiant, et t'es un crack en BTS Banque. Tu parles EXACTEMENT comme un pote IRL — naturel, familier, direct, sans chichis ni langue de bois. Tu tutoies toujours. Matière : ${subject} — Chapitre : "${course.title}"

Historique :
${history}

Ce que l'étudiant vient de dire : "${userMsg}"

---

DÉTECTE D'ABORD ce que c'est :

A) INSULTE / IRRESPECT → Recadre-le cash comme un vrai pote qui se défend, proportionnellement. Ferme, direct, pas de violence gratuite mais pas de faiblesse non plus.

B) QUESTION / PRÉCISION → Réponds direct, comme si t'expliquais à la cafét. Pas de verdict, juste la réponse claire et humaine.

C) RÉPONSE À LA QUESTION POSÉE → Évalue :
  - Correct : sa réponse couvre l'essentiel → confirme en une phrase naturelle. Si y'a des trucs bonus pas demandés → à la toute fin, préfixé de "**Tu aurais pu aussi glisser :**". JAMAIS dans les manques.
  - Partiel : y'a du bon mais il manque un truc clé → va DIRECT à ce qui manque, répète pas ce qu'il a dit.
  - Incorrect : c'est à côté → donne la bonne réponse en 2-3 phrases factuelles.

RÈGLES DE FORME ABSOLUES :
- Commence par le verdict naturel : "Ouais c'est bon ✅", "Presque —", "Nan là c'est pas ça ❌", etc.
- Structure ta réponse avec des **titres courts en gras** quand c'est nécessaire (ex: **Ce qui manque :**, **À retenir :**, **La réponse :**). C'est obligatoire pour que ce soit lisible.
- Utilise des listes à puces (- item) pour les énumérations.
- Max 6 lignes de contenu. Tranche. Sois chirurgical.
- Zéro blabla motivationnel, zéro "bien essayé". Parle VRAI.
- NE DEMANDE JAMAIS à l'étudiant d'écrire une méthode, un plan ou une structure — tu es dans une révision par questions/réponses, pas dans un exercice de rédaction.
- Une métaphore de pote si ça aide vraiment à comprendre.
${nextQuestion ? `- Termine avec "---" puis pose cette question directement : "${nextQuestion}"` : "- Dis-lui qu'on a fait le tour du chapitre, façon pote."}`,
    });

    setMessages((m) => [...m, { role: "assistant", content: feedback }]);
    setSending(false);
  };

  const reset = () => {
    setSelectedChapter(null);
    setCurrentQuestion(null);
    setMessages([]);
    setAnswer("");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-stone-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Chargement des cours…
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center text-stone-600">
        Aucun cours disponible. Ajoute-les depuis l'admin.
      </div>
    );
  }

  // Sélection du chapitre
  if (!selectedChapter) {
    // Structure CESBF avec groupes
    const CESBF_GROUPS = [
      { title: "OUVERTURE DE COMPTE", chapters: ["Chap 1 : Procéder à l'ouverture de compte", "Chap 2 : Mettre en place des produits et services liés au compte"] },
      { title: "SUIVI DES COMPTES BANCAIRES", chapters: ["Chap 1 : Comprendre les opérations au débit et au crédit (agios)", "Chap 2 : Prévenir et gérer les risques de blanchiment", "Chap 3 : Gérer les événements exceptionnels sur le compte", "Chap 4 : Gérer le risque débiteur", "Chap 5 : Gérer la clôture de compte"] },
      { title: "MISE À DISPOSITION DES MOYENS DE PAIEMENT", chapters: ["Chap 1 : Identifier les différents moyens de paiement", "Chap 2 : Proposer et gérer l'équipement en chéquier et carte bancaire", "Chap 3 : Adapter les moyens de paiement à la situation du client"] },
      { title: "ÉLABORATION D'UNE SOLUTION D'ÉPARGNE", chapters: ["Chap 1 & 2 : Épargne bancaire disponible et logement", "Chap 3 : Épargne non bancaire (Assurance-vie & PER)", "Chap 4, 5, 6 : Instruments financiers et marchés"] },
      { title: "ÉLABORATION D'UNE SOLUTION D'ASSURANCE", chapters: ["Chap 1 & 2 : Marché et vie d'un contrat d'assurance", "Chap 3 : Identifier les produits d'assurance adaptés"] },
      { title: "ÉLABORATION D'UNE SOLUTION DE FINANCEMENT", chapters: ["Chap 1 : Monter un dossier de crédit", "Chap 2 : Identifier les types de crédits adaptés", "Chap 3 : Suivre la vie d'un contrat de prêt"] },
    ];

    const orderedCourses = subject === "CESBF" 
      ? CESBF_GROUPS.map(group => ({
          title: group.title,
          chapters: group.chapters.map(chapterName => 
            courses.find(c => c.title?.includes(chapterName.split(" : ")[0]) || c.title?.includes(chapterName))
          ).filter(Boolean),
        })).filter(g => g.chapters.length > 0)
      : null;

    return (
      <div>
        <div className="mb-5">
          <h2 className="font-display text-2xl font-bold text-stone-900">Choisis un thème à réviser</h2>
          <p className="text-stone-500 text-sm mt-1">L'IA te posera une question sur le cours et évaluera ta réponse.</p>
        </div>

        {/* CESBF : structure par groupe */}
        {subject === "CESBF" && orderedCourses ? (
          <div className="space-y-5">
            {orderedCourses.map((group) => (
              <div key={group.title}>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-orange-600/60 px-1 mb-2">{group.title}</div>
                <div className="grid gap-2">
                  {group.chapters.map((c, i) => (
                    <motion.button
                      key={c.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => selectChapter(c)}
                      className="bg-white rounded-2xl p-4 shadow-duo border-b-4 border-orange-200 text-left hover:-translate-y-0.5 transition-transform flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-stone-900">{c.title}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* VOJES : simple list */
          <div className="grid gap-3">
            {[
              ...courses.filter(c => c.title?.toLowerCase().includes("méthodologie pratique")),
              ...courses.filter(c => c.title?.toLowerCase().includes("méthodologie") && !c.title?.toLowerCase().includes("méthodologie pratique")),
              ...courses.filter(c => !c.title?.toLowerCase().includes("méthodologie")),
            ].filter((c, idx, arr) => arr.findIndex(x => x.id === c.id) === idx).map((c, i) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => selectChapter(c)}
                className="bg-white rounded-2xl p-5 shadow-duo border-b-4 border-teal-200 text-left hover:-translate-y-0.5 transition-transform flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">{c.title}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{subject}</div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Interface conversation
  return (
    <div className="flex flex-col h-[calc(100vh-160px)] min-h-[500px]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-teal-600">Révision interactive</div>
          <div className="font-display font-bold text-lg">{selectedChapter.title}</div>
        </div>
        <button onClick={reset} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900 font-bold">
          <RotateCcw className="w-4 h-4" /> Changer
        </button>
      </div>

      {/* Zone messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        {loadingQuestion && (
          <div className="flex items-center gap-2 text-teal-600 text-sm font-bold">
            <Loader2 className="w-4 h-4 animate-spin" /> Ton professeur prépare une question…
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
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-teal-500 text-white rounded-tr-sm"
                    : "bg-white border border-stone-200 shadow-sm text-stone-800 rounded-tl-sm"
                }`}
              >
                {msg.role === "user" ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  msg.content.split("---").map((part, pi) => (
                    <div key={pi}>
                      {pi === 1 && <div className="border-t border-stone-200 my-3" />}
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {part.trim().split("\n").map((line, li) => {
                          // Titre en gras **texte**
                          if (/^\*\*.+\*\*/.test(line.trim())) {
                            return <div key={li} className="font-bold text-stone-900 mt-2 mb-0.5">{line.replace(/\*\*/g, "")}</div>;
                          }
                          // Puce
                          if (/^[-•]\s/.test(line.trim())) {
                            return <div key={li} className="flex gap-1.5 ml-1"><span className="text-stone-400 mt-0.5">·</span><span>{line.replace(/^[-•]\s/, "")}</span></div>;
                          }
                          // Ligne vide
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

      {/* Zone saisie */}
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