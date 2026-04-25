import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminQuestions from "@/components/admin/AdminQuestions";
import AdminRevision from "@/components/admin/AdminRevision";
import AdminVraiOuFaux from "@/components/admin/AdminVraiOuFaux";
import AdminCourses from "@/components/admin/AdminCourses";
import AdminResources from "@/components/admin/AdminResources";
import AdminAssistant from "@/components/admin/AdminAssistant";
import AdminPopups from "@/components/admin/AdminPopups";
import AdminAmfQuestions from "@/components/admin/AdminAmfQuestions";

const TABS = [
  { key: "pareto",     label: "🎯 QCM Pareto",        Comp: (p) => <AdminQuestions {...p} modeFilter="pareto" /> },
  { key: "jeu",        label: "🎮 QCM Jeu",            Comp: (p) => <AdminQuestions {...p} modeFilter="jeu" /> },
  { key: "infini",     label: "🔥 QCM Infini",         Comp: (p) => <AdminQuestions {...p} modeFilter="infini" /> },
  { key: "revision",   label: "📝 Questions révision", Comp: AdminRevision },
  { key: "vraiofaux",  label: "✅ Vrai ou Faux",        Comp: AdminVraiOuFaux },
  { key: "cours",      label: "📚 Cours",               Comp: AdminCourses },
  { key: "ressources", label: "🔗 Ressources",          Comp: AdminResources },
  { key: "popups",     label: "💬 Pop-ups",             Comp: AdminPopups },
  { key: "assistant",  label: "🤖 Assistant IA",        Comp: AdminAssistant },
  { key: "amf",        label: "🎯 Certif AMF",          Comp: AdminAmfQuestions },
];

export default function Teacher() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("pareto");

  useEffect(() => {
    (async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        base44.auth.redirectToLogin();
        return;
      }
      const user = await base44.auth.me();
      // Autoriser teacher ET admin
      if (user?.role !== "teacher" && user?.role !== "admin") {
        navigate("/");
        return;
      }
      setCurrentUser(user);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Vérification…
      </div>
    );
  }

  const isAdmin = currentUser?.role === "admin";
  const subjectLabel = isAdmin ? null : currentUser?.teacherSubject;
  const tabConfig = TABS.find((t) => t.key === tab);
  const Comp = tabConfig?.Comp;
  const needsSubject = !["popups", "assistant", "amf"].includes(tab);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1 text-sm font-bold text-stone-600">
            <ChevronLeft className="w-4 h-4" /> Accueil
          </Link>
          <div className="font-display text-xl font-bold">
            {isAdmin ? (
              "Espace Professeur (Admin)"
            ) : (
              <>Espace Professeur —{" "}
                <span className={subjectLabel === "VOJES" ? "text-purple-600" : "text-orange-500"}>
                  {subjectLabel}
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => base44.auth.logout("/")}
            className="text-sm font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
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
          📚 {isAdmin
            ? `Vue admin — onglet actif : ${tabConfig?.label}`
            : `Tu gères les contenus de la matière : `}
          {!isAdmin && <strong>{subjectLabel}</strong>}
          {!isAdmin && ` — onglet actif : `}
          {!isAdmin && <strong>{tabConfig?.label}</strong>}
        </div>
        {Comp && <Comp subjectFilter={needsSubject ? subjectLabel : undefined} />}
      </div>
    </div>
  );
}