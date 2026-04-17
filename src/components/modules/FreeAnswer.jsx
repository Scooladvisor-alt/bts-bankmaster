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

    // Génère une question sur ce chapitre
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un professeur de BTS Banque. Voici le contenu du cours "${course.title}" pour la matière ${subject} :\n\n${course.content}\n\nPose une question de révision ouverte et précise à l'étudiant sur ce cours. La question doit nécessiter une vraie réflexion et une réponse développée. Pose UNE seule question, directement, sans introduction.`,
    });

    setCurrentQuestion(res);
    setMessages([{ role: "assistant", content: `📖 **${course.title}**\n\n${res}` }]);
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

    const feedback = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un professeur de BTS Banque ultra-pédagogique, bienveillant et dynamique. Tu utilises des métaphores concrètes et des analogies du quotidien pour rendre les concepts accessibles. Tu parles directement à l'étudiant (tutoiement).

Cours de référence (matière ${subject}) — "${course.title}" :
${course.content}

Historique de la conversation :
${history}

Réponse de l'étudiant : "${userMsg}"

Ta mission :
1. Évalue si la réponse est correcte, partielle ou incorrecte par rapport au cours.
2. Donne un feedback très pédagogique avec des métaphores simples (ex: "C'est comme si tu..." ou "Imagine que...").
3. Complète ce qui manque si la réponse est partielle.
4. Encourage et motive (mais sois honnête).
5. Termine en posant UNE nouvelle question sur un autre aspect du même cours pour continuer la révision.

Format : feedback d'abord (2-4 paragraphes), puis une ligne séparatrice "---", puis la nouvelle question.`,
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
    return (
      <div>
        <div className="mb-5">
          <h2 className="font-display text-2xl font-bold text-stone-900">Choisis un thème à réviser</h2>
          <p className="text-stone-500 text-sm mt-1">L'IA te posera une question sur le cours et évaluera ta réponse.</p>
        </div>
        <div className="grid gap-3">
          {courses.map((c, i) => (
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
      </div>
    );
  }

  // Interface conversation
  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[400px]">
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
                {msg.content.split("---").map((part, pi) => (
                  <div key={pi}>
                    {pi === 1 && <div className="border-t border-stone-200 my-3" />}
                    <div className="whitespace-pre-wrap">{part.trim()}</div>
                  </div>
                ))}
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