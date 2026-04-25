import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkIsAdmin } from "@/lib/isAdmin";
import { base44 } from "@/api/base44Client";
import { Loader2, ChevronLeft, LogOut, Target, Gamepad2, Flame, FileQuestion, CheckSquare, BookOpen, BookMarked, Link2, MessageSquare, Bot, Pencil, Users, Award } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";
import AdminQuestions from "@/components/admin/AdminQuestions";
import AdminQuestionsChapters from "@/components/admin/AdminQuestionsChapters";
import AdminRevision from "@/components/admin/AdminRevision";
import AdminVraiOuFaux from "@/components/admin/AdminVraiOuFaux";
import AdminPopups from "@/components/admin/AdminPopups";
import AdminCourses from "@/components/admin/AdminCourses";
import AdminResources from "@/components/admin/AdminResources";
import AdminAssistant from "@/components/admin/AdminAssistant";
import AdminDrawQuestions from "@/components/admin/AdminDrawQuestions";
import AdminUsers from "@/components/admin/AdminUsers";
import DebugDataCheck from "@/components/admin/DebugDataCheck";
import AdminAmfQuestions from "@/components/admin/AdminAmfQuestions";

const TABS = [
  { key: "pareto",      label: "QCM Pareto",        icon: Target,       Comp: (p) => <AdminQuestionsChapters {...p} modeFilter="pareto" /> },
  { key: "jeu",         label: "QCM Jeu",            icon: Gamepad2,     Comp: (p) => <AdminQuestionsChapters {...p} modeFilter="jeu" /> },
  { key: "infini",      label: "QCM Infini",         icon: Flame,        Comp: (p) => <AdminQuestionsChapters {...p} modeFilter="infini" /> },
  { key: "revision",    label: "Révision",           icon: FileQuestion, Comp: AdminRevision },
  { key: "vraiofaux",   label: "Vrai ou Faux",       icon: CheckSquare,  Comp: AdminVraiOuFaux },
  { key: "voiefranche", label: "Réponse libre",      icon: BookOpen,     Comp: AdminRevision },
  { key: "cours",       label: "Cours",              icon: BookMarked,   Comp: AdminCourses },
  { key: "ressources",  label: "Ressources",         icon: Link2,        Comp: AdminResources },
  { key: "popups",      label: "Pop-ups",            icon: MessageSquare,Comp: AdminPopups },
  { key: "assistant",   label: "Assistant",          icon: Bot,          Comp: AdminAssistant },
  { key: "memo",        label: "Mémo Dessin",        icon: Pencil,       Comp: AdminDrawQuestions },
  { key: "users",       label: "Utilisateurs",       icon: Users,        Comp: AdminUsers },
  { key: "amf",         label: "Certif AMF",         icon: Award,        Comp: AdminAmfQuestions },
];

const SUBJECTS = ["VOJES", "CESBF"];

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState("pareto");
  const [subjectFilter, setSubjectFilter] = useState("VOJES");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        base44.auth.redirectToLogin();
        return;
      }
      const admin = await checkIsAdmin();
      setIsAdmin(admin);
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md bg-white rounded-3xl p-8 text-center shadow-duo-lg">
          <div className="text-5xl mb-3">🔒</div>
          <h1 className="font-display text-2xl font-bold">Accès réservé</h1>
          <p className="text-stone-600 mt-2 text-sm">Cet espace est réservé aux professeurs / modérateurs (rôle admin).</p>
          <DuoButton variant="primary" className="mt-5" onClick={() => navigate("/")}>Retour à l'accueil</DuoButton>
        </div>
      </div>
    );
  }

  const tabConfig = TABS.find((t) => t.key === tab);
  const Current = tabConfig?.Comp;
  // Teachers tab has no subject filter
  const needsSubject = tab !== "popups" && tab !== "users" && tab !== "amf";

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1 text-sm font-bold text-stone-600">
            <ChevronLeft className="w-4 h-4" /> Accueil
          </Link>
          <div className="font-display text-xl font-bold">Espace Administrateur</div>
          <button
            onClick={() => base44.auth.logout("/")}
            className="text-sm font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
        <div className="max-w-6xl mx-auto px-2 pb-2 flex flex-wrap gap-1">
          {TABS.map((t) => {
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
        <DebugDataCheck />
        {needsSubject && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-bold text-stone-500">Matière :</span>
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubjectFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                  subjectFilter === s
                    ? s === "VOJES" ? "bg-purple-600 text-white border-purple-600" : "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {Current && <Current subjectFilter={needsSubject ? subjectFilter : undefined} />}
      </div>
    </div>
  );
}