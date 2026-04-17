import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Eye, EyeOff, ChevronDown } from "lucide-react";

export default function RevisionQuestions({ subject }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState({});

  useEffect(() => {
    (async () => {
      const list = await base44.entities.RevisionQuestion.filter({ subject, type: "mentale" });
      // fallback : récupère aussi toutes si rien
      const all = list.length ? list : await base44.entities.RevisionQuestion.filter({ subject });
      setItems(all);
      setLoading(false);
    })();
  }, [subject]);

  if (loading) return <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>;
  if (items.length === 0) return <div className="bg-white rounded-2xl p-6 text-center text-stone-600">Aucune question de révision.</div>;

  return (
    <div className="space-y-3">
      {items.map((q) => (
        <div key={q.id} className="bg-white rounded-2xl shadow-duo border-b-4 border-blue-200 overflow-hidden">
          <button
            onClick={() => setOpen((o) => ({ ...o, [q.id]: !o[q.id] }))}
            className="w-full text-left px-5 py-4 flex items-start justify-between gap-3"
          >
            <div className="flex-1">
              {q.chapter && <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{q.chapter}</div>}
              <div className="font-bold text-stone-900">{q.question}</div>
            </div>
            <ChevronDown className={`w-5 h-5 text-stone-400 shrink-0 mt-1 transition-transform ${open[q.id] ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {open[q.id] && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-4 border-t border-blue-100 pt-3 bg-blue-50/50">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Réponse
                  </div>
                  <div className="text-stone-800 whitespace-pre-wrap">{q.expected_answer}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}