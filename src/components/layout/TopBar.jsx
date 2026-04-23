import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { LogIn, LogOut, User, ChevronDown, BarChart2, GraduationCap, Shield } from "lucide-react";

export default function TopBar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (authed) {
          const me = await base44.auth.me();
          setUser(me);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) return null;

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  return (
    <div className="absolute top-4 right-4 z-20" ref={ref}>
      {!user ? (
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 bg-white/90 backdrop-blur border border-stone-200 shadow-sm rounded-full px-4 py-2 text-sm font-bold text-stone-700 hover:bg-white transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Se connecter
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 bg-white/90 backdrop-blur border border-stone-200 shadow-sm rounded-full pl-2 pr-4 py-1.5 text-sm font-bold text-stone-700 hover:bg-white transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="max-w-[120px] truncate">{user.full_name?.split(" ")[0] || user.email}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      )}

      {open && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
          {!user ? (
            <>
              <button
                onClick={() => { base44.auth.redirectToLogin(window.location.href); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors border-b border-stone-100"
              >
                <span className="text-lg">🔵</span> Se connecter avec Google
              </button>
              <button
                onClick={() => { base44.auth.redirectToLogin(window.location.href); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <span className="text-lg">📧</span> Se connecter par email
              </button>
            </>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-stone-100">
                <div className="font-bold text-stone-900 text-sm truncate">{user.full_name || user.email}</div>
                <div className="text-xs text-stone-400 truncate">{user.email}</div>
                <RoleBadge role={user.role} subject={user.teacherSubject} />
              </div>

              <Link
                to="/mon-progres"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <BarChart2 className="w-4 h-4 text-blue-500" /> Ma progression
              </Link>

              {isTeacherOrAdmin && (
                <Link
                  to="/teacher"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <GraduationCap className="w-4 h-4 text-purple-500" /> Espace Professeur
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <Shield className="w-4 h-4 text-red-500" /> Administration
                </Link>
              )}

              <button
                onClick={() => { base44.auth.logout("/"); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-stone-100"
              >
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role, subject }) {
  const config = {
    admin:   { label: "Admin",      color: "bg-red-100 text-red-700" },
    teacher: { label: `Prof ${subject || ""}`, color: "bg-purple-100 text-purple-700" },
    student: { label: "Élève",      color: "bg-blue-100 text-blue-700" },
    user:    { label: "Utilisateur",color: "bg-stone-100 text-stone-600" },
  };
  const c = config[role] || config["user"];
  return (
    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.color}`}>{c.label}</span>
  );
}