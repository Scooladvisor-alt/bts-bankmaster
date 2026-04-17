import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkIsAdmin } from "@/lib/isAdmin";
import { base44 } from "@/api/base44Client";
import { Loader2, ChevronLeft, LogOut } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";
import AdminQuestions from "@/components/admin/AdminQuestions";
import AdminRevision from "@/components/admin/AdminRevision";
import AdminFlashcards from "@/components/admin/AdminFlashcards";
import AdminPopups from "@/components/admin/AdminPopups";
import AdminCourses from "@/components/admin/AdminCourses";
import AdminResources from "@/components/admin/AdminResources";
import AdminAssistant from "@/components/admin/AdminAssistant";

const TABS = [
  { key: "questions", label: "QCM", Comp: AdminQuestions },
  { key: "revision", label: "Questions révision", Comp: AdminRevision },
  { key: "flashcards", label: "Flashcards", Comp: AdminFlashcards },
  { key: "popups", label: "Pop-ups", Comp: AdminPopups },
  { key: "courses", label: "Cours", Comp: AdminCourses },
  { key: "resources", label: "Ressources", Comp: AdminResources },
  { key: "assistant", label: "Assistant", Comp: AdminAssistant },
];

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState("questions");
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

  const Current = TABS.find((t) => t.key === tab)?.Comp;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1 text-sm font-bold text-stone-600">
            <ChevronLeft className="w-4 h-4" /> Accueil
          </Link>
          <div className="font-display text-xl font-bold">Espace Professeur</div>
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
        {Current && <Current />}
      </div>
    </div>
  );
}