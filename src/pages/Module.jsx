import React from "react";
import { useParams, Link } from "react-router-dom";
import ModuleShell from "@/components/layout/ModuleShell";
import ParetoQCM from "@/components/modules/ParetoQCM";
import GameQCM from "@/components/modules/GameQCM";
import InfiniteQCM from "@/components/modules/InfiniteQCM";
import RevisionQuestions from "@/components/modules/RevisionQuestions";
import FreeAnswer from "@/components/modules/FreeAnswer";
import Flashcards from "@/components/modules/Flashcards";
import Courses from "@/components/modules/Courses";
import Resources from "@/components/modules/Resources";
import AssistantLauncher from "@/components/modules/AssistantLauncher";

const SUBJECT_LABEL = { voges: "VOGES", cesbf: "CESBF" };

const MODULES = {
  pareto:     { title: "QCM Pareto",         emoji: "🎯", bg: "bg-gradient-to-b from-yellow-50 to-orange-50",  Comp: ParetoQCM },
  jeu:        { title: "QCM Mode Jeu",       emoji: "🎮", bg: "bg-gradient-to-b from-pink-50 to-sky-50",       Comp: GameQCM },
  infini:     { title: "QCM Infini",         emoji: "🔥", bg: "bg-gradient-to-b from-stone-100 to-red-50",     Comp: InfiniteQCM },
  questions:  { title: "Questions révision", emoji: "📝", bg: "bg-gradient-to-b from-blue-50 to-white",        Comp: RevisionQuestions },
  libre:      { title: "Réponse libre",      emoji: "✍️", bg: "bg-gradient-to-b from-teal-50 to-white",        Comp: FreeAnswer },
  flashcards: { title: "Flashcards",         emoji: "🎴", bg: "bg-gradient-to-b from-purple-50 to-white",      Comp: Flashcards },
  cours:      { title: "Cours",              emoji: "📚", bg: "bg-gradient-to-b from-emerald-50 to-white",     Comp: Courses },
  ressources: { title: "Ressources",         emoji: "🔗", bg: "bg-gradient-to-b from-indigo-50 to-white",      Comp: Resources },
  assistant:  { title: "Assistant",          emoji: "🤖", bg: "bg-gradient-to-b from-stone-100 to-stone-200",  Comp: AssistantLauncher },
};

export default function Module() {
  const { subject, method } = useParams();
  const subjectLabel = SUBJECT_LABEL[subject];
  const config = MODULES[method];

  if (!subjectLabel || !config) {
    return (
      <div className="p-10 text-center">
        Module introuvable. <Link to="/" className="text-primary underline">Retour</Link>
      </div>
    );
  }

  const Comp = config.Comp;
  return (
    <ModuleShell subject={subjectLabel} title={config.title} emoji={config.emoji} bgClass={config.bg}>
      <Comp subject={subjectLabel} />
    </ModuleShell>
  );
}