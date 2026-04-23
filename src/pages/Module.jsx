import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Bot } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getLocalUser, updateUserLastTool } from "@/lib/localUser";
import { trackProgress } from "@/lib/trackProgress";
import ModuleShell from "@/components/layout/ModuleShell";
import ParetoQCM from "@/components/modules/ParetoQCM";
import GameQCM from "@/components/modules/GameQCM";
import InfiniteQCM from "@/components/modules/InfiniteQCM";
import RevisionQuestions from "@/components/modules/RevisionQuestions";
import FreeAnswer from "@/components/modules/FreeAnswer";
import Courses from "@/components/modules/Courses";
import Resources from "@/components/modules/Resources";
import AssistantLauncher from "@/components/modules/AssistantLauncher";
import VraiOuFaux from "@/components/modules/VraiOuFaux";
import DrawRevision from "@/components/modules/DrawRevision";

const SUBJECT_LABEL = { vojes: "VOJES", cesbf: "CESBF" };

const MODULES = {
  pareto:     { title: "QCM Pareto",         emoji: "🎯", bg: "bg-gradient-to-b from-yellow-50 to-orange-50",  Comp: ParetoQCM },
  jeu:        { title: "QCM Mode Jeu",       emoji: "🎮", bg: "bg-gradient-to-b from-pink-50 to-sky-50",       Comp: GameQCM },
  infini:     { title: "QCM Infini",         emoji: "🔥", bg: "bg-gradient-to-b from-stone-100 to-red-50",     Comp: InfiniteQCM },
  questions:  { title: "Questions révision", emoji: "📝", bg: "bg-gradient-to-b from-blue-50 to-white",        Comp: RevisionQuestions },
  libre:      { title: "Réponse libre",      emoji: "✍️", bg: "bg-gradient-to-b from-teal-50 to-white",        Comp: FreeAnswer },
  cours:      { title: "Cours",              emoji: "📚", bg: "bg-gradient-to-b from-emerald-50 to-white",     Comp: Courses },
  ressources: { title: "Ressources",         emoji: "🔗", bg: "bg-gradient-to-b from-indigo-50 to-white",      Comp: Resources },
  assistant:  { title: "Assistant",          emoji: "🤖", bg: "bg-gradient-to-b from-stone-100 to-stone-200",  Comp: AssistantLauncher },
  vraiouFaux:   { title: "Vrai ou Faux",       emoji: "🔥", bg: "bg-gradient-to-b from-rose-50 to-orange-50",    Comp: VraiOuFaux },
  dessin:       { title: "Mémo dessin",        emoji: "✏️", bg: "bg-gradient-to-b from-violet-50 to-purple-50",   Comp: DrawRevision },
};

export default function Module() {
  const { subject, method } = useParams();
  const subjectLabel = SUBJECT_LABEL[subject];
  const config = MODULES[method];

  useEffect(() => {
    // Tracker dans localStorage (apprenants anonymes)
    const localUser = getLocalUser();
    if (localUser?.name && method) {
      updateUserLastTool(localUser.name, method);
    }
    // Tracker dans Base44 User (utilisateurs authentifiés)
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) return;
        const me = await base44.auth.me();
        if (!me) return;
        const tools = Array.isArray(me.toolsUsed) ? me.toolsUsed : [];
        if (!tools.includes(method)) {
          await base44.auth.updateMe({ toolsUsed: [...tools, method] });
        }
        // Track l'accès au module (pour les outils non-QCM)
        if (!["pareto", "infini", "jeu"].includes(method)) {
          trackProgress({ toolUsed: method, subject: subjectLabel });
        }
      } catch {}
    })();
  }, [method]);

  if (!subjectLabel || !config) {
    return (
      <div className="p-10 text-center">
        Module introuvable. <Link to="/" className="text-primary underline">Retour</Link>
      </div>
    );
  }

  const Comp = config.Comp;

  // Ces modules gèrent leur propre layout plein écran
  if (method === "pareto" || method === "dessin") {
    return <Comp subject={subjectLabel} />;
  }

  // Modules où le bouton assistant n'est pas utile
  const hideAssistantBtn = ["questions", "libre", "assistant", "dessin"].includes(method);

  return (
    <ModuleShell subject={subjectLabel} title={config.title} emoji={config.emoji} bgClass={config.bg}>
      <Comp subject={subjectLabel} />
      
      {/* Bouton Assistant flottant */}
      {!hideAssistantBtn && (
        <Link
          to={`/${subject}/assistant`}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-stone-800 shadow-lg flex items-center justify-center hover:bg-stone-700 transition-colors border-b-4 border-black/30 active:border-b-0 active:translate-y-1"
          title="Assistant — Pose tes questions"
        >
          <Bot className="w-6 h-6 text-white" />
        </Link>
      )}
    </ModuleShell>
  );
}