import React, { useEffect, useState } from "react";
import { Loader2, BookOpen, Gamepad2, InfinityIcon, ListChecks, PenLine, Flame } from "lucide-react";

const TOOL_CONFIG = {
  "pareto": { label: "QCM Pareto", icon: BookOpen, color: "bg-green-100 text-green-700" },
  "jeu": { label: "Jeu voiture", icon: Gamepad2, color: "bg-pink-100 text-pink-700" },
  "infini": { label: "QCM Infini", icon: InfinityIcon, color: "bg-red-100 text-red-700" },
  "questions": { label: "Révision", icon: ListChecks, color: "bg-blue-100 text-blue-700" },
  "libre": { label: "Réponse libre", icon: PenLine, color: "bg-teal-100 text-teal-700" },
  "vraiouFaux": { label: "Vrai ou Faux", icon: Flame, color: "bg-rose-100 text-rose-700" },
  "cours": { label: "Cours", icon: BookOpen, color: "bg-emerald-100 text-emerald-700" },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("bts_admin_users");
    const userList = stored ? JSON.parse(stored) : [];
    setUsers(userList);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-stone-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center text-stone-400">Aucun utilisateur</div>
      ) : (
        users.map((user) => {
          const toolConfig = user.lastTool ? TOOL_CONFIG[user.lastTool] : null;
          const ToolIcon = toolConfig?.icon;
          return (
            <div
              key={user.name}
              className="bg-white rounded-2xl p-4 border border-stone-200 hover:shadow-sm transition-shadow"
            >
              <div className="font-bold text-stone-900">{user.name}</div>
              {toolConfig && (
                <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg text-xs font-semibold ${toolConfig.color}`}>
                  {ToolIcon && <ToolIcon className="w-3.5 h-3.5" />}
                  {toolConfig.label}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}