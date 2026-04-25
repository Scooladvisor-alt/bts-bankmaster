import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, BookOpen, Gamepad2, ListChecks, PenLine, Flame, Shield, GraduationCap, User } from "lucide-react";

const TOOL_CONFIG = {
  pareto:     { label: "QCM Pareto",    color: "bg-green-100 text-green-700" },
  jeu:        { label: "Jeu voiture",   color: "bg-pink-100 text-pink-700" },
  infini:     { label: "QCM Infini",    color: "bg-red-100 text-red-700" },
  questions:  { label: "Révision",      color: "bg-blue-100 text-blue-700" },
  libre:      { label: "Réponse libre", color: "bg-teal-100 text-teal-700" },
  vraiouFaux: { label: "Vrai ou Faux",  color: "bg-rose-100 text-rose-700" },
  cours:      { label: "Cours",         color: "bg-emerald-100 text-emerald-700" },
  amf:        { label: "Certif AMF",    color: "bg-blue-100 text-blue-800" },
  connexion:  { label: "Connexion",     color: "bg-stone-100 text-stone-500" },
  ressources: { label: "Ressources",    color: "bg-indigo-100 text-indigo-700" },
  assistant:  { label: "Assistant",     color: "bg-slate-100 text-slate-700" },
};

const ROLE_CONFIG = {
  admin:   { label: "Admin",      icon: Shield,         color: "bg-red-100 text-red-700" },
  teacher: { label: "Professeur", icon: GraduationCap,  color: "bg-purple-100 text-purple-700" },
  user:    { label: "Élève",      icon: User,           color: "bg-stone-100 text-stone-600" },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.User.list(null, 200);
      setUsers(list || []);
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
      {users.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center text-stone-400">Aucun utilisateur</div>
      ) : (
        users.map((user) => {
          const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG["user"];
          const RoleIcon = roleConf.icon;
          const tools = Array.isArray(user.toolsUsed) ? user.toolsUsed : [];

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
                    {user.role === "teacher" && user.teacherSubject && (
                      <span className="ml-1 px-1.5 py-0.5 rounded bg-white/60 text-[11px]">{user.teacherSubject}</span>
                    )}
                  </div>
                </div>

                {/* Contrôles rôle */}
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
                  {(user.role === "teacher") && (
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
              </div>

              {/* Badges outils utilisés */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tools.length === 0 ? (
                  <span className="text-xs text-stone-400 italic">Aucun outil utilisé</span>
                ) : (
                  tools.map((tool) => {
                    const conf = TOOL_CONFIG[tool];
                    return conf ? (
                      <span key={tool} className={`text-xs px-2 py-0.5 rounded-full font-semibold ${conf.color}`}>{conf.label}</span>
                    ) : (
                      <span key={tool} className="text-xs px-2 py-0.5 rounded-full font-semibold bg-stone-100 text-stone-600">{tool}</span>
                    );
                  })
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}