import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AdminQuestions from "@/components/admin/AdminQuestions";
import AdminRevision from "@/components/admin/AdminRevision";
import AdminVraiOuFaux from "@/components/admin/AdminVraiOuFaux";
import AdminCourses from "@/components/admin/AdminCourses";
import AdminResources from "@/components/admin/AdminResources";
import AdminAssistant from "@/components/admin/AdminAssistant";
import AdminPopups from "@/components/admin/AdminPopups";

const TABS = [
  { key: "pareto",    label: "🎯 QCM Pareto",          Comp: (p) => <AdminQuestions {...p} modeFilter="pareto" /> },
  { key: "jeu",       label: "🎮 QCM Jeu",              Comp: (p) => <AdminQuestions {...p} modeFilter="jeu" /> },
  { key: "infini",    label: "🔥 QCM Infini",           Comp: (p) => <AdminQuestions {...p} modeFilter="infini" /> },
  { key: "revision",  label: "📝 Questions révision",   Comp: AdminRevision },
  { key: "libre",     label: "✍️ Réponse libre",         Comp: AdminRevision },
  { key: "vraiofaux", label: "✅ Vrai ou Faux",          Comp: AdminVraiOuFaux },
  { key: "cours",     label: "📚 Cours",                 Comp: AdminCourses },
  { key: "ressources",label: "🔗 Ressources",            Comp: AdminResources },
  { key: "assistant", label: "🤖 Assistant IA",          Comp: AdminAssistant },
  { key: "popups",    label: "💬 Pop-ups",               Comp: AdminPopups },
];

const SUBJECT_LABELS = { vojes: "VOJES", cesbf: "CESBF" };

export default function Teacher() {
  const { subject } = useParams();
  const subjectLabel = SUBJECT_LABELS[subject?.toLowerCase()];
  const [tab, setTab] = useState("questions");

  if (!subjectLabel) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 text-center shadow-duo-lg">
          <div className="text-5xl mb-3">🔒</div>
          <h1 className="font-display text-2xl font-bold">Matière inconnue</h1>
          <Link to="/" className="text-primary underline mt-4 block">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  const tabConfig = TABS.find((t) => t.key === tab);
  const Comp = tabConfig?.Comp;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1 text-sm font-bold text-stone-600">
            <ChevronLeft className="w-4 h-4" /> Accueil
          </Link>
          <div className="font-display text-xl font-bold">
            Espace Professeur — <span className={subject === "vojes" ? "text-purple-600" : "text-orange-500"}>{subjectLabel}</span>
          </div>
          <div className="w-20" />
        </div>
        <div className="max-w-6xl mx-auto px-2 pb-2 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap ${
                tab === t.key ? "bg-primary text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-sm text-blue-700 font-medium">
          📚 Tu gères les contenus de la matière : <strong>{subjectLabel}</strong> — onglet actif : <strong>{tabConfig?.label}</strong>
        </div>
        {Comp && <Comp subjectFilter={subjectLabel} />}
      </div>
    </div>
  );
}