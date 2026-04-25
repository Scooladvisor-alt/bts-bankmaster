import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminQuestions from "@/components/admin/AdminQuestions";
import AdminQuestionsChapters from "@/components/admin/AdminQuestionsChapters";
import AdminRevision from "@/components/admin/AdminRevision";
import AdminVraiOuFaux from "@/components/admin/AdminVraiOuFaux";
import AdminCourses from "@/components/admin/AdminCourses";
import AdminResources from "@/components/admin/AdminResources";
import AdminAssistant from "@/components/admin/AdminAssistant";
import AdminPopups from "@/components/admin/AdminPopups";
import AdminDrawQuestions from "@/components/admin/AdminDrawQuestions";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminAmfQuestions from "@/components/admin/AdminAmfQuestions";
import { Target, Gamepad2, Flame, FileQuestion, CheckSquare, BookOpen, BookMarked, Link2, MessageSquare, Bot, Pencil, Users, Award } from "lucide-react";

const TABS = [
  { key: "pareto",      label: "QCM Pareto",        icon: Target,        Comp: (p) => <AdminQuestionsChapters {...p} modeFilter="pareto" /> },
  { key: "jeu",         label: "QCM Jeu",            icon: Gamepad2,      Comp: (p) => <AdminQuestionsChapters {...p} modeFilter="jeu" /> },
  { key: "infini",      label: "QCM Infini",         icon: Flame,         Comp: (p) => <AdminQuestionsChapters {...p} modeFilter="infini" /> },
  { key: "revision",    label: "Révision",           icon: FileQuestion,  Comp: AdminRevision },
  { key: "vraiofaux",   label: "Vrai ou Faux",       icon: CheckSquare,   Comp: AdminVraiOuFaux },
  { key: "voiefranche", label: "Réponse libre",      icon: BookOpen,      Comp: AdminRevision },
  { key: "cours",       label: "Cours",              icon: BookMarked,    Comp: AdminCourses },
  { key: "ressources",  label: "Ressources",         icon: Link2,         Comp: AdminResources },
  { key: "popups",      label: "Pop-ups",            icon: MessageSquare, Comp: AdminPopups },
  { key: "assistant",   label: "Assistant",          icon: Bot,           Comp: AdminAssistant },
  { key: "memo",        label: "Mémo Dessin",        icon: Pencil,        Comp: AdminDrawQuestions },
  { key: "users",       label: "Utilisateurs",       icon: Users,         Comp: AdminUsers },
  { key: "amf",         label: "Certif AMF",         icon: Award,         Comp: AdminAmfQuestions },
];

export default function Teacher() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("pareto");
  const [adminSubject, setAdminSubject] = useState("VOJES");

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
  const teacherSubject = isAdmin ? null : currentUser?.teacherSubject;
  const subjectLabel = isAdmin ? adminSubject : teacherSubject;
  // Les profs ne voient pas l'onglet "Utilisateurs" (réservé admin)
  const visibleTabs = isAdmin ? TABS : TABS.filter((t) => t.key !== "users");
  const tabConfig = visibleTabs.find((t) => t.key === tab) || visibleTabs[0];
  const Comp = tabConfig?.Comp;
  const needsSubject = !["popups", "assistant", "amf", "users"].includes(tab);

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
        <div className="max-w-6xl mx-auto px-2 pb-2 grid grid-cols-7 md:grid-cols-13 gap-1">
          {visibleTabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                title={t.label}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl text-[10px] font-bold transition-all ${
                  active ? "bg-primary text-white shadow-sm" : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate w-full text-center leading-tight">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Filtre matière — visible pour admin ET prof, mais admin peut changer */}
        {needsSubject && (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-bold text-stone-500">Matière :</span>
            {["VOJES", "CESBF"].map((s) => (
              <button
                key={s}
                disabled={!isAdmin}
                onClick={() => isAdmin && setAdminSubject(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                  subjectLabel === s
                    ? s === "VOJES" ? "bg-purple-600 text-white border-purple-600" : "bg-orange-500 text-white border-orange-500"
                    : isAdmin ? "bg-white text-stone-600 border-stone-200 hover:border-stone-400 cursor-pointer" : "bg-white text-stone-400 border-stone-200 cursor-not-allowed opacity-60"
                }`}
              >
                {s}
              </button>
            ))}
            {!isAdmin && <span className="text-xs text-stone-400 italic">matière fixée par votre profil</span>}
          </div>
        )}
        {Comp && <Comp subjectFilter={needsSubject ? subjectLabel : undefined} />}
      </div>
    </div>
  );
}