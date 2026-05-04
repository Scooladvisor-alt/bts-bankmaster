import React, { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, X, Plus, Trash2, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminNotifications() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const panelRef = useRef(null);

  const load = async () => {
    const list = await base44.entities.QuestionLog.list("-created_date", 50);
    setLogs(list || []);
    setUnseenCount((list || []).filter((l) => !l.seen).length);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markAllSeen = async () => {
    const unseen = logs.filter((l) => !l.seen);
    await Promise.all(unseen.map((l) => base44.entities.QuestionLog.update(l.id, { seen: true })));
    setUnseenCount(0);
    setLogs((prev) => prev.map((l) => ({ ...l, seen: true })));
  };

  const clearAll = async () => {
    if (!confirm("Supprimer toutes les notifications ?")) return;
    await Promise.all(logs.map((l) => base44.entities.QuestionLog.delete(l.id)));
    setLogs([]);
    setUnseenCount(0);
  };

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unseenCount > 0) {
      // Mark as seen when opening
      setTimeout(markAllSeen, 1000);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return "à l'instant";
    if (diff < 60) return `il y a ${diff} min`;
    if (diff < 1440) return `il y a ${Math.floor(diff / 60)}h`;
    return `il y a ${Math.floor(diff / 1440)}j`;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-600"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unseenCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unseenCount > 9 ? "9+" : unseenCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-stone-50">
              <div className="font-bold text-stone-800 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Activité des professeurs
                {unseenCount > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{unseenCount} nouveau{unseenCount > 1 ? "x" : ""}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {logs.length > 0 && (
                  <>
                    <button onClick={markAllSeen} title="Tout marquer comme lu" className="p-1.5 text-stone-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                      <CheckCheck className="w-4 h-4" />
                    </button>
                    <button onClick={clearAll} title="Tout supprimer" className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button onClick={() => setOpen(false)} className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-stone-50">
              {logs.length === 0 ? (
                <div className="py-10 text-center text-stone-400 text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Aucune activité récente
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors ${!log.seen ? "bg-blue-50/60" : "bg-white"}`}
                  >
                    <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      log.action === "create" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
                    }`}>
                      {log.action === "create" ? <Plus className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-stone-500 font-bold">{log.authorName || log.authorEmail}</div>
                      <div className="text-sm text-stone-800 leading-snug mt-0.5">
                        {log.action === "create" ? "a ajouté" : "a supprimé"}{" "}
                        <span className="font-semibold">{log.entityType}</span>
                        {log.chapter && <span className="text-stone-500"> · {log.chapter.slice(0, 30)}</span>}
                      </div>
                      {log.questionText && (
                        <div className="text-xs text-stone-400 mt-0.5 truncate italic">"{log.questionText.slice(0, 60)}"</div>
                      )}
                      <div className="text-[10px] text-stone-400 mt-1">{formatTime(log.created_date)}</div>
                    </div>
                    {!log.seen && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}