import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, GraduationCap, Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ADMIN_EMAIL = "antownin@gmail.com";
const ADMIN_PASSWORD = "cerise77";

export default function RoleModal({ onClose }) {
  const [step, setStep] = useState("choose"); // "choose" | "admin-login" | "teacher-login"
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    setError("");
    if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    onClose();
    navigate("/admin");
  };

  const handleTeacherLogin = async () => {
    setError(""); setLoading(true);
    try {
      const teachers = await base44.entities.Teacher.filter({ email: email.trim().toLowerCase() });
      if (teachers.length === 0) {
        setError("Aucun espace professeur trouvé pour cet email.");
        setLoading(false);
        return;
      }
      const t = teachers[0];
      // Verify password
      if (t.password && t.password !== password) {
        setError("Mot de passe incorrect.");
        setLoading(false);
        return;
      }
      onClose();
      navigate(`/teacher/${t.subject.toLowerCase()}`);
    } catch {
      setError("Erreur lors de la vérification.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-bold">Espace réservé</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
        </div>

        {step === "choose" && (
          <div className="space-y-3">
            <p className="text-stone-500 text-sm mb-4">Quel est ton rôle ?</p>
            <button
              onClick={() => setStep("teacher-login")}
              className="w-full flex items-center gap-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-2xl p-4 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-stone-900">Je suis professeur</div>
                <div className="text-xs text-stone-500">Accéder à ma matière</div>
              </div>
            </button>
            <button
              onClick={() => setStep("admin-login")}
              className="w-full flex items-center gap-3 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-2xl p-4 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-stone-900">Je suis administrateur</div>
                <div className="text-xs text-stone-500">Gestion complète de la plateforme</div>
              </div>
            </button>
          </div>
        )}

        {step === "admin-login" && (
          <div className="space-y-3">
            <button onClick={() => { setStep("choose"); setError(""); setEmail(""); setPassword(""); }} className="text-xs text-stone-500 hover:underline mb-2">← Retour</button>
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">Email administrateur</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                className="w-full border-2 border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                  placeholder="••••••••"
                  className="w-full border-2 border-stone-200 rounded-xl px-3 py-2 pr-9 text-sm focus:outline-none focus:border-purple-400"
                />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-2 top-2 text-stone-400">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              onClick={handleAdminLogin}
              className="w-full bg-purple-600 text-white font-bold rounded-xl py-2.5 hover:bg-purple-700 transition-colors"
            >
              Connexion Admin
            </button>
          </div>
        )}

        {step === "teacher-login" && (
          <div className="space-y-3">
            <button onClick={() => { setStep("choose"); setError(""); setEmail(""); setPassword(""); }} className="text-xs text-stone-500 hover:underline mb-2">← Retour</button>
            <p className="text-sm text-stone-500">Entre tes identifiants professeur.</p>
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">Ton email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prof@exemple.com"
                className="w-full border-2 border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTeacherLogin()}
                  placeholder="••••••••"
                  className="w-full border-2 border-stone-200 rounded-xl px-3 py-2 pr-9 text-sm focus:outline-none focus:border-blue-400"
                />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-2 top-2 text-stone-400">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              onClick={handleTeacherLogin}
              disabled={loading}
              className="w-full bg-blue-500 text-white font-bold rounded-xl py-2.5 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Accéder à mon espace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}