import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { LogIn, LogOut, User, ChevronDown, GraduationCap, Shield } from "lucide-react";

export default function NavAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (authed) setUser(await base44.auth.me());
      } catch {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) return <div className="w-28 h-9 rounded-full bg-stone-100 animate-pulse" />;

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  return (
    <div className="relative" ref={ref}>
      {!user ? (
        <button
          onClick={() => base44.auth.redirectToLogin(window.location.href)}
          className="flex items-center gap-2 bg-primary text-white font-bold text-sm px-4 py-2.5 rounded-full shadow hover:bg-green-500 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Se connecter
        </button>
      ) : (
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-full pl-2 pr-3 py-1.5 text-sm font-bold text-stone-700 hover:bg-stone-200 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="max-w-[100px] truncate">{user.full_name?.split(" ")[0] || user.email}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      )}

      {open && user && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-stone-100">
            <div className="font-bold text-stone-900 text-sm truncate">{user.full_name || user.email}</div>
            <div className="text-xs text-stone-400 truncate">{user.email}</div>
          </div>
          {isTeacherOrAdmin && (
            <Link to="/teacher" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors">
              <GraduationCap className="w-4 h-4 text-purple-500" /> Espace Professeur
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors">
              <Shield className="w-4 h-4 text-red-500" /> Administration
            </Link>
          )}
          <button
            onClick={() => { base44.auth.logout("/"); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-stone-100"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}