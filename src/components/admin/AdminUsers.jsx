import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Shield, GraduationCap, User, Star } from "lucide-react";
import FelicitationModal from "@/components/admin/FelicitationModal";

// Couleurs par outil + matière
const TOOL_LABEL = {
  pareto:     "QCM Pareto",
  jeu:        "Jeu voiture",
  infini:     "QCM Infini",
  questions:  "Révision",
  libre:      "Réponse libre",
  vraiouFaux: "Vrai ou Faux",
  cours:      "Cours",
  amf:        "Certif AMF",
  certifamf:  "Certif AMF",
  "certif-amf": "Certif AMF",
  connexion:  "Connexion",
  ressources: "Ressources",
  assistant:  "Assistant",
  memo:       "Mémo Dessin",
};

// Couleur selon matière : VOJES = violet, CESBF = orange, sans matière = gris
// Retourne { bg, text, border } pour un affichage coloré distinct
function getToolBadgeStyle(tool, subject) {
  if (tool === "connexion") return "bg-stone-100 text-stone-500 border border-stone-200";
  if (tool === "amf" || tool === "certifamf" || tool === "certif-amf") return "bg-blue-100 text-blue-800 border border-blue-300";
  if (subject === "VOJES") return "bg-purple-100 text-purple-800 border border-purple-300";
  if (subject === "CESBF") return "bg-orange-100 text-orange-800 border border-orange-300";
  return "bg-stone-100 text-stone-600 border border-stone-200";
}

// Icône matière
function subjectDot(subject) {
  if (subject === "VOJES") return <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-1" />;
  if (subject === "CESBF") return <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1" />;
  return null;
}

const ROLE_CONFIG = {
  admin:   { label: "Admin",      icon: Shield,         color: "bg-red-100 text-red-700" },
  teacher: { label: "Professeur", icon: GraduationCap,  color: "bg-purple-100 text-purple-700" },
  user:    { label: "Élève",      icon: User,           color: "bg-stone-100 text-stone-600" },
};

// Badge prof CESBF = orange, prof VOJES = violet
function getTeacherBadgeColor(subject) {
  if (subject === "CESBF") return "bg-orange-100 text-orange-700";
  if (subject === "VOJES") return "bg-purple-100 text-purple-700";
  return "bg-purple-100 text-purple-700";
}

export default function AdminUsers({ readOnly = false }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [felicitationTarget, setFelicitationTarget] = useState(null);
  // Map userId → list of { tool, subject }
  const [userToolSubjects, setUserToolSubjects] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setCurrentUser(me);
      let list = [];
      if (me?.role === "admin") {
        list = await base44.entities.User.list(null, 200);
      } else {
        const res = await base44.functions.invoke("listAllUsers", {});
        list = res?.data?.users || [];
      }
      setUsers(list);

      // Charger les StudentProgress pour avoir outil + matière par user
      try {
        const progList = await base44.entities.StudentProgress.list("-sessionDate", 2000);
        // Construire map userId → Set de "tool|subject"
        const map = {};
        (progList || []).forEach((p) => {
          if (!p.userId || !p.toolUsed) return;
          if (!map[p.userId]) map[p.userId] = [];
          const key = `${p.toolUsed}|${p.subject || ""}`;
          if (!map[p.userId].find(e => e.key === key)) {
            map[p.userId].push({ key, tool: p.toolUsed, subject: p.subject || null });
          }
        });
        setUserToolSubjects(map);
      } catch {}
    } catch {
      setUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateRole = async (user, field, value) => {
    setSaving(user.id);
    await base44.entities.User.update(user.id, { [field]: value });
    setSaving(null);
    load();
  };

  if (loading) {
    return <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>;
  }

  return (
    <div className="space-y-3">
      {felicitationTarget && currentUser && (
        <FelicitationModal
          targetUser={felicitationTarget}
          senderUser={currentUser}
          onClose={() => setFelicitationTarget(null)}
        />
      )}

      {users.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center text-stone-400">Aucun utilisateur</div>
      ) : (
        users.map((user) => {
          const isTeacher = user.role === "teacher";
          const isEleve = !user.role || user.role === "user";

          // Badge rôle : prof CESBF = orange, prof VOJES = violet, admin = rouge
          let roleConf;
          if (user.role === "admin") {
            roleConf = ROLE_CONFIG["admin"];
          } else if (isTeacher) {
            const teacherColor = getTeacherBadgeColor(user.teacherSubject);
            roleConf = { label: "Professeur", icon: GraduationCap, color: teacherColor };
          } else {
            roleConf = ROLE_CONFIG["user"];
          }
          const RoleIcon = roleConf.icon;

          // Badges outils avec matière
          const toolSubjects = userToolSubjects[user.id] || [];
          // Fallback: si pas de StudentProgress, utiliser toolsUsed sans matière
          const fallbackTools = Array.isArray(user.toolsUsed) ? user.toolsUsed : [];

          return (
            <div key={user.id} className="bg-white rounded-2xl p-4 border border-stone-200 hover:shadow-sm transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                {/* Info utilisateur */}
                <div>
                  <div className="font-bold text-stone-900">{user.full_name || "—"}</div>
                  <div className="text-xs text-stone-400">{user.email}</div>

                  {/* Badge rôle */}
                  <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg text-xs font-semibold ${roleConf.color}`}>
                    <RoleIcon className="w-3.5 h-3.5" />
                    {roleConf.label}
                    {isTeacher && user.teacherSubject && (
                      <span className="ml-1 px-1.5 py-0.5 rounded bg-white/60 text-[11px] font-bold">{user.teacherSubject}</span>
                    )}
                  </div>

                  {/* Bouton félicitations (élèves uniquement) */}
                  {isEleve && (
                    <div className="mt-2">
                      <button
                        onClick={() => setFelicitationTarget(user)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-700 text-xs font-bold transition-all"
                      >
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        Envoyer des félicitations
                      </button>
                    </div>
                  )}
                </div>

                {/* Contrôles rôle */}
                {!readOnly && (
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-stone-500 w-16">Rôle</label>
                      <select
                        className="flex-1 rounded-lg border border-stone-200 text-xs px-2 py-1.5 focus:outline-none focus:border-primary"
                        value={user.role || "user"}
                        onChange={(e) => updateRole(user, "role", e.target.value)}
                        disabled={saving === user.id}
                      >
                        <option value="user">Élève</option>
                        <option value="teacher">Professeur</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    {isTeacher && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-stone-500 w-16">Matière</label>
                        <select
                          className="flex-1 rounded-lg border border-stone-200 text-xs px-2 py-1.5 focus:outline-none focus:border-primary"
                          value={user.teacherSubject || ""}
                          onChange={(e) => updateRole(user, "teacherSubject", e.target.value)}
                          disabled={saving === user.id}
                        >
                          <option value="">— Choisir —</option>
                          <option value="VOJES">VOJES</option>
                          <option value="CESBF">CESBF</option>
                        </select>
                      </div>
                    )}
                    {saving === user.id && <div className="text-xs text-stone-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Enregistrement…</div>}
                  </div>
                )}
              </div>

              {/* Badges outils utilisés avec matière + couleur */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {toolSubjects.length > 0 ? (
                  toolSubjects.map(({ key, tool, subject: toolSub }) => {
                    const label = TOOL_LABEL[tool] || tool;
                    const style = getToolBadgeStyle(tool, toolSub);
                    return (
                      <span key={key} className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold ${style}`}>
                        {subjectDot(toolSub)}
                        {label}
                      </span>
                    );
                  })
                ) : fallbackTools.length > 0 ? (
                  fallbackTools.map((t) => {
                    const label = TOOL_LABEL[t] || t;
                    const style = getToolBadgeStyle(t, null);
                    return (
                      <span key={t} className={`text-xs px-2 py-0.5 rounded-full font-semibold ${style}`}>{label}</span>
                    );
                  })
                ) : (
                  <span className="text-xs text-stone-400 italic">Aucun outil utilisé</span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}