import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Trash2, CheckCheck, RefreshCw } from "lucide-react";

const ACTION_CONFIG = {
  create: { label: "a ajouté",    bg: "bg-green-100", text: "text-green-700", icon: "➕" },
  delete: { label: "a supprimé",  bg: "bg-red-100",   text: "text-red-700",   icon: "🗑️" },
};

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 60000);
  if (diff < 1) return "à l'instant";
  if (diff < 60) return `il y a ${diff} min`;
  if (diff < 1440) return `il y a ${Math.floor(diff / 60)}h`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function AdminActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unseenCount, setUnseenCount] = useState(0);

  const load = async () => {
    setLoading(true);
    const list = await base44.entities.QuestionLog.list("-created_date", 200);
    setLogs(list || []);
    setUnseenCount((list || []).filter((l) => !l.seen).length);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markAllSeen = async () => {
    const unseen = logs.filter((l) => !l.seen);
    await Promise.all(unseen.map((l) => base44.entities.QuestionLog.update(l.id, { seen: true })));
    setUnseenCount(0);
    setLogs((prev) => prev.map((l) => ({ ...l, seen: true })));
  };

  const clearAll = async () => {
    if (!confirm("Supprimer tout le journal d'activité ?")) return;
    await Promise.all(logs.map((l) => base44.entities.QuestionLog.delete(l.id)));
    setLogs([]);
    setUnseenCount(0);
  };

  if (loading) {
    return <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-xl font-bold text-stone-900">Journal d'activité des professeurs</h2>
          <p className="text-xs text-stone-400 mt-0.5">{logs.length} action(s) enregistrée(s)</p>
        </div>
        <div className="flex items-center gap-2">
          {unseenCount > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
              {unseenCount} nouvelle{unseenCount > 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={load}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {logs.length > 0 && (
            <>
              <button
                onClick={markAllSeen}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Tout marquer lu
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Tout supprimer
              </button>
            </>
          )}
        </div>
      </div>

      {/* Liste */}
      {logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <div className="text-5xl mb-3">📋</div>
          <div className="font-bold text-stone-600 mb-1">Aucune activité enregistrée</div>
          <div className="text-sm text-stone-400">Les actions des professeurs (ajout/suppression de questions) apparaîtront ici.</div>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const conf = ACTION_CONFIG[log.action] || ACTION_CONFIG.create;
            return (
              <div
                key={log.id}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                  !log.seen
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-stone-200 hover:border-stone-300"
                }`}
              >
                {/* Icône action */}
                <div className={`w-10 h-10 rounded-xl ${conf.bg} flex items-center justify-center text-lg shrink-0`}>
                  {conf.icon}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-stone-900 text-sm">
                      {log.authorName || log.authorEmail || "Inconnu"}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${conf.bg} ${conf.text}`}>
                      {conf.label}
                    </span>
                    <span className="text-sm font-semibold text-stone-700">{log.entityType}</span>
                    {log.subject && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.subject === "VOJES" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"
                      }`}>
                        {log.subject}
                      </span>
                    )}
                  </div>
                  {log.chapter && (
                    <div className="text-xs text-stone-500 mt-0.5 font-medium">📂 {log.chapter}</div>
                  )}
                  {log.questionText && (
                    <div className="text-xs text-stone-400 mt-1 italic truncate">
                      "{log.questionText.slice(0, 100)}{log.questionText.length > 100 ? "…" : ""}"
                    </div>
                  )}
                  <div className="text-[10px] text-stone-400 mt-1.5">{formatTime(log.created_date)}</div>
                </div>

                {/* Indicateur non lu */}
                {!log.seen && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}