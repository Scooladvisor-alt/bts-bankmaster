import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, Loader2, Trophy, Flame, Target, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const TOOL_LABELS = {
  pareto:     "QCM Pareto",
  jeu:        "Jeu voiture",
  infini:     "QCM Infini",
  questions:  "Questions révision",
  libre:      "Réponse libre",
  vraiouFaux: "Vrai ou Faux",
  cours:      "Cours",
  ressources: "Ressources",
  assistant:  "Assistant IA",
  connexion:  "Connexion",
};

const TOOL_COLORS = {
  pareto:     "bg-yellow-100 text-yellow-800",
  jeu:        "bg-pink-100 text-pink-800",
  infini:     "bg-red-100 text-red-800",
  questions:  "bg-blue-100 text-blue-800",
  libre:      "bg-teal-100 text-teal-800",
  vraiouFaux: "bg-rose-100 text-rose-800",
  cours:      "bg-emerald-100 text-emerald-800",
  ressources: "bg-indigo-100 text-indigo-800",
  assistant:  "bg-stone-100 text-stone-700",
  connexion:  "bg-gray-100 text-gray-700",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function MyProgress() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterTool, setFilterTool] = useState("all");

  useEffect(() => {
    (async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      const me = await base44.auth.me();
      setUser(me);
      const data = await base44.entities.StudentProgress.filter({ userId: me.id }, "-sessionDate", 200);
      setSessions(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = sessions.filter((s) => {
    if (filterSubject !== "all" && s.subject !== filterSubject) return false;
    if (filterTool !== "all" && s.toolUsed !== filterTool) return false;
    return true;
  });

  // Stats
  const totalSessions = filtered.length;
  const withScore = filtered.filter((s) => s.score !== null && s.totalQuestions);
  const avgScore = withScore.length
    ? Math.round(withScore.reduce((acc, s) => acc + (s.score / s.totalQuestions) * 100, 0) / withScore.length)
    : null;
  const vojesSessions = sessions.filter((s) => s.subject === "VOJES").length;
  const cesbfSessions = sessions.filter((s) => s.subject === "CESBF").length;

  // Badges
  const badges = [];
  if (sessions.length >= 1) badges.push({ icon: "🎯", label: "Premier pas !" });
  if (sessions.filter(s => s.toolUsed === "pareto").length >= 10) badges.push({ icon: "🔥", label: "10 QCM Pareto" });
  if (sessions.filter(s => s.toolUsed === "infini").length >= 5) badges.push({ icon: "♾️", label: "5 sessions Infini" });
  if (sessions.filter(s => s.subject === "VOJES").length >= 20) badges.push({ icon: "📊", label: "Expert VOJES" });
  if (sessions.filter(s => s.subject === "CESBF").length >= 20) badges.push({ icon: "🏦", label: "Expert CESBF" });
  if (avgScore >= 80) badges.push({ icon: "🏆", label: "Score moyen ≥ 80%" });

  const usedTools = [...new Set(sessions.map((s) => s.toolUsed).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-20">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-bold text-sm mb-6">
          <ChevronLeft className="w-4 h-4" /> Accueil
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-stone-900 mb-6">Ma progression</h1>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Sessions", value: totalSessions, icon: Flame, color: "bg-orange-50 border-orange-200" },
              { label: "Score moyen", value: avgScore !== null ? `${avgScore}%` : "—", icon: Target, color: "bg-green-50 border-green-200" },
              { label: "VOJES", value: vojesSessions, icon: BookOpen, color: "bg-purple-50 border-purple-200" },
              { label: "CESBF", value: cesbfSessions, icon: Trophy, color: "bg-orange-50 border-orange-200" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={`rounded-2xl p-4 border ${color}`}>
                <Icon className="w-5 h-5 text-stone-500 mb-1" />
                <div className="font-display text-3xl font-bold text-stone-900">{value}</div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Badges obtenus</div>
              <div className="flex flex-wrap gap-2">
                {badges.map((b) => (
                  <div key={b.label} className="bg-yellow-100 border border-yellow-300 rounded-full px-3 py-1.5 text-sm font-bold text-yellow-800 flex items-center gap-1.5">
                    {b.icon} {b.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filtres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["all", "VOJES", "CESBF"].map((s) => (
              <button key={s} onClick={() => setFilterSubject(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${filterSubject === s ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"}`}>
                {s === "all" ? "Toutes matières" : s}
              </button>
            ))}
            <div className="w-px bg-stone-200 self-stretch mx-1" />
            {["all", ...usedTools].map((t) => (
              <button key={t} onClick={() => setFilterTool(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${filterTool === t ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"}`}>
                {t === "all" ? "Tous outils" : (TOOL_LABELS[t] || t)}
              </button>
            ))}
          </div>

          {/* Tableau */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <div className="text-5xl mb-3">📭</div>
              <div className="font-bold">Aucune session pour l'instant</div>
              <div className="text-sm mt-1">Lance un QCM pour commencer à tracker ta progression !</div>
              <Link to="/" className="inline-block mt-4 bg-primary text-white font-bold px-6 py-3 rounded-2xl text-sm">Commencer →</Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-stone-500">
                  <tr>
                    <th className="text-left px-4 py-2 font-bold uppercase text-[10px] tracking-widest">Date</th>
                    <th className="text-left px-4 py-2 font-bold uppercase text-[10px] tracking-widest">Outil</th>
                    <th className="text-left px-4 py-2 font-bold uppercase text-[10px] tracking-widest">Matière</th>
                    <th className="text-left px-4 py-2 font-bold uppercase text-[10px] tracking-widest">Chapitre</th>
                    <th className="text-left px-4 py-2 font-bold uppercase text-[10px] tracking-widest">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-t border-stone-100 hover:bg-stone-50">
                      <td className="px-4 py-2.5 text-stone-500 text-xs whitespace-nowrap">{formatDate(s.sessionDate || s.created_date)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${TOOL_COLORS[s.toolUsed] || "bg-stone-100 text-stone-600"}`}>
                          {TOOL_LABELS[s.toolUsed] || s.toolUsed}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {s.subject ? (
                          <span className={`text-xs font-bold ${s.subject === "VOJES" ? "text-purple-700" : "text-orange-600"}`}>{s.subject}</span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-stone-500 text-xs max-w-[160px] truncate">{s.chapter || "—"}</td>
                      <td className="px-4 py-2.5 font-bold text-stone-900">
                        {s.score !== null && s.totalQuestions
                          ? `${s.score}/${s.totalQuestions} (${Math.round(s.score / s.totalQuestions * 100)}%)`
                          : s.score !== null ? s.score : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}