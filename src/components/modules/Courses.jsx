import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Courses({ subject }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    (async () => {
      const list = await base44.entities.Course.filter({ subject }, "order");
      // Méthodologie en premier, puis le reste
      const sorted = [
        ...list.filter(c => c.title?.toLowerCase().includes("méthodologie")),
        ...list.filter(c => !c.title?.toLowerCase().includes("méthodologie")),
      ];
      setCourses(sorted);
      if (sorted[0]) setOpenId(sorted[0].id);
      setLoading(false);
    })();
  }, [subject]);

  if (loading) return <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>;
  if (courses.length === 0) return <div className="bg-white rounded-2xl p-6 text-center text-stone-600">Aucun cours publié.</div>;

  return (
    <div className="space-y-3">
      {courses.map((c) => (
        <div key={c.id} className="bg-white rounded-2xl shadow-duo border-b-4 border-emerald-200 overflow-hidden">
          <button
            onClick={() => setOpenId(openId === c.id ? null : c.id)}
            className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-display font-bold text-stone-900">{c.title}</div>
            </div>
            <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${openId === c.id ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {openId === c.id && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 pt-2 prose prose-stone max-w-none prose-sm">
                  <ReactMarkdown>{c.content}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}