import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { X, Sparkles } from "lucide-react";

export default function FloatingPopup({ subject = "ALL" }) {
  const [popups, setPopups] = useState([]);
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await base44.entities.Popup.list();
      const filtered = list.filter(
        (p) => p.subject === "ALL" || p.subject === subject
      );
      setPopups(filtered);
    })();
  }, [subject]);

  useEffect(() => {
    if (popups.length === 0) return;
    const show = () => {
      const random = popups[Math.floor(Math.random() * popups.length)];
      setCurrent(random);
      setVisible(true);
      setTimeout(() => setVisible(false), 7000);
    };
    const first = setTimeout(show, 5000);
    const interval = setInterval(show, 30000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [popups]);

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <AnimatePresence>
        {visible && current && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="pointer-events-auto"
          >
            <div className="relative max-w-xs bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 rounded-2xl p-4 shadow-duo-lg border-2 border-yellow-500">
              <button
                onClick={() => setVisible(false)}
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="flex items-start gap-2">
                <div className="text-2xl">{current.emoji || "💡"}</div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-orange-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Le savais-tu ?
                  </div>
                  <div className="font-bold text-sm text-stone-900 mt-0.5 leading-snug">
                    {current.content}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}